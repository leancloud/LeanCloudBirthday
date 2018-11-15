var AV = require('leanengine');
var _ = require('lodash');
const md5 = require('blueimp-md5');
const seedrandom = require('seedrandom');
const Promise = require('bluebird')

const Game = AV.Object.extend('Game');

// 蛋糕种类数量
const CAKE_CATEGORY_COUNT = 4;
// 每局游戏最大时长
const MAX_GAME_DURATION = 20;
// 生成蛋糕频率：个 / s
const SPAWN_CAKE_SPEED = 0.1;
// 蛋糕分数
CAKE_SCORES = {
  A: -2,
  B: 1,
  C: 3,
  D: 5,
};
CAKE_KEYS = [ 'A', 'B', 'C', 'D' ];
// 允许最大作弊值
const MAX_CHEAT_COUNT = 10;

/**
 * 请求游戏开始
 */
AV.Cloud.define('startGame', request => {
  return new Promise((resolve, reject) => {
    const { currentUser } = request;
    if (currentUser === undefined) {
      reject(new Error('no user'));
    }
    // 根据用户作弊次数，觉得是否允许其玩游戏
    const cheat = currentUser.get('cheat');
    if (cheat > MAX_CHEAT_COUNT) {
      throw new Error('you are forbidden');
    }
    const game = new Game();
    game.set('user', currentUser);
    // 保存开始时间，用于检测
    game.set('startTimestamp', Date.now())
    // 生成随机种子
    const seed = seedrandom(Date.now()).int32();
    game.set('seed', seed);
    // 生成蛋糕序列
    const cakeList = spawnCakeList(MAX_GAME_DURATION, SPAWN_CAKE_SPEED, seed);
    game.set('cakeList', cakeList);
    game.save()
      .then((g) => {
        // 下发游戏 id 和随机种子
        resolve({
          id: g.id,
          cakeList,
        });
      })
      .catch(error => {
        reject(error);
      })
  });
});

/**
 * 请求游戏结束
 */
AV.Cloud.define('endGame', request => {
  return new Promise((resolve, reject) => {
    const { currentUser, params } = request;
    if (_.isUndefined(currentUser)) {
      // User 非法
      reject(new Error('no user'));
    }
    // 游戏 id，分数，每种蛋糕点击数量的数组，时间戳，签名，蛋糕点击序列
    // 0：炸弹；1：1 分蛋糕；2：3 分蛋糕；3：5 分蛋糕
    const { id, score, counts, timestamp, signature, taps } = params;
    if (_.isUndefined(id) || _.isUndefined(score) || 
        _.isUndefined(counts) || _.isUndefined(timestamp) ||
        _.isUndefined(signature) || _.isUndefined(taps)) {
          // 标记作弊用户
          markUser(currentUser);
          reject(new Error('arguments error'));
    }
    console.log(id);
    console.log(score);
    console.log(counts);
    console.log(timestamp);
    console.log(signature);
    console.log(taps);
    if (!checkScore(counts, score)) {
      markUser(currentUser);
      throw new Error('arguments error');
    }
    if (!checkSignature(id, score, timestamp, signature)) {
      markUser(currentUser);
      throw new Error('arguments error');
    }
    const query = new AV.Query('Game');
    query.get(id)
      .then(game => {
        // 判断时间是否在合理范围内
        const startTime = game.get('startTime');
        endTime = Date.now();
        if (endTime - startTime > MAX_GAME_DURATION * 3) {
          // 超过每局游戏时长的 3 倍，认为非法
          markUser(currentUser);
          throw new Error('long time');
        }
        const cakeList = game.get('cakeList');
        if (!checkScoreByCakeList(cakeList, taps, score)) {
          markUser(currentUser);
          throw new Error('arguments error');
        }
        // 提交分数
        scoreInLeaderBoard = calcScoreInLeaderBoard(score);
        AV.Leaderboard.updateStatistics(currentUser, {
            'score': scoreInLeaderBoard
        }).then(statistics => {
            resolve();
            // 更新 Game 信息
            game.set('endTimestamp', endTime);
            game.set('score', score);
            game.set('player', currentUser);
            game.set('taps', taps);
            game.save();
        }).catch(error => {
            console.error(error);
            reject(error);
        });
      })
      .catch(error => {
        console.error(error);
        // 找不到对应比赛记录，则认为作弊并标记用户
        markUser(currentUser);
        throw error;
      });
  });
});

/**
 * 标记用户作弊
 * @param {*} user 用户
 */
function markUser(user) {
  let cheat = user.get('cheat') ? user.get('cheat') : 0;
  console.log(`cheat: ${cheat}`);
  cheat += 1;
  user.set('cheat', cheat);
  user.save();
}

/**
 * 检测签名
 * @param {*} counts 每种蛋糕点击数量的数组
 * @param {*} score 总分
 */
function checkScore(counts, score) {
  if (!_.isObject(counts)) {
    return false;
  }
  // 计算分数
  let calcScore = 0;
  _.forEach(counts, (val, k) => {
    calcScore += val * CAKE_SCORES[k];
  });
  return calcScore === score;
}

function checkScoreByCakeList(cakeList, taps, score) {
  if (!_.isArray(taps)) {
    return false;
  }
  let calcScore = 0;
  _.forEach(taps, (val) => {
    const cakeId = cakeList[val];
    calcScore += CAKE_SCORES[cakeId];
  });
  return calcScore === score;
}

/**
 * 检测签名
 * @param {*} id 游戏记录 id
 * @param {*} score 游戏分数
 * @param {*} timestamp 提交时间戳
 * @param {*} signature 签名
 */
function checkSignature(id, score, timestamp, signature) {
  if (!_.isNumber(score)) {
    return false;
  }
  if (!_.isNumber(timestamp)) {
    return false;
  }
  const str = `${id}${score}${timestamp}`;
  const calcSignature = md5(str);
  return calcSignature === signature;
}

/**
 * 计算排行榜中的分数，通过时间戳标记「相同分数」先达到的更靠前
 * @param {*} score 实际分数
 */
function calcScoreInLeaderBoard(score) {
  const now = (new Date()).getTime();
  const scoreInLeaderBoard = parseInt(`${score}${10000000000000 - now}`);
  return scoreInLeaderBoard;
}

/**
 * 生成蛋糕序列
 * @param {*} duration 游戏时长
 * @param {*} rate 生成频率
 * @param {*} seed 随机种子
 */
function spawnCakeList(duration, rate, seed) {
  const count = Math.ceil(duration / rate);
  const rng = new Math.seedrandom(seed);
  cakes = [];
  for (let i = 0; i < count; i++) {
    const index = Math.abs(rng.int32()) % CAKE_KEYS.length;
    const key = CAKE_KEYS[index];
    cakes.push(key);
  }
  return cakes;
}