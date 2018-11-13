var AV = require('leanengine');
var _ = require('lodash');
const md5 = require('blueimp-md5');
const seedrandom = require('seedrandom');

const Game = AV.Object.extend('Game');

// 蛋糕种类数量
const CAKE_CATEGORY_COUNT = 4;
// 每局游戏最大时长
const MAX_GAME_DURATION = 20;
// 生成蛋糕频率：个 / s
const SPAWN_CAKE_SPEED = 0.1;
// 蛋糕分数
const CAKE_SCORES = [-2, 1, 3, 5];

/**
 * 请求游戏开始
 */
AV.Cloud.define('startGame', request => {
  return new Promise((resolve, reject) => {
    const { currentUser } = request;
    if (currentUser === undefined) {
      reject(new Error('no user'));
    }
    const game = new Game();
    game.set('user', currentUser);
    // 保存开始时间，用于检测
    game.set('startTimestamp', Date.now())
    // 生成随机种子
    const seed = seedrandom(Date.now()).int32();
    game.set('seed', seed);
    game.save()
      .then(() => {
        // 下发游戏 id 和随机种子
        resolve({
          id: game.objectId,
          seed,
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
    // 游戏 id，分数，每种蛋糕点击数量的数组，时间戳，签名，蛋糕点击序列
    // 0：炸弹；1：1 分蛋糕；2：3 分蛋糕；3：5 分蛋糕
    const { id, score, counts, timestamp, signature, taps } = request;
    if (_.isUndefined(id) || _.isUndefined(score) || 
        _.isUndefined(counts) || _.isUndefined(timestamp) ||
        _.isUndefined(signature) || _.isUndefined(taps)) {
          // TODO 拉黑

          reject(new Error('arguments error'));
    }
    if (_.isUndefined(currentUser)) {
      // User 非法
      reject(new Error('no user'));
    }
    const query = new AV.Query('Game');
    query.get(id)
      .then(game => {
        Promise.all([checkScore(counts, score), 
          checkSignature(id, score, timestamp, signature), 
          checkMaxScore(seed, score)])
          .then(() => {
            // 提交分数
            scoreInLeaderBoard = calcScoreInLeaderBoard(score);
            AV.Leaderboard.updateStatistics(currentUser, {
                'score': scoreInLeaderBoard
            }).then(statistics => {
                resolve();
                // 更新 Game 信息
                game.set('endTimestamp', Date.now());
                game.set('score', score);
                game.save();
                // TODO 保存日志

            }).catch(error => {
                console.error(error);
                reject(error);
            });
          })
          .catch(error => {
            console.error(error);
            reject(error);
          });
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
});

/**
 * 检测签名
 * @param {*} counts 每种蛋糕点击数量的数组
 * @param {*} score 总分
 */
function checkScore(counts, score) {
  return new Promise((resolve, reject) => {
    if (!_.isArray(counts)) {
      reject(new TypeError('counts is not an array'));
    }
    if (counts.length !== CAKE_CATEGORY_COUNT) {
      reject(new TypeError(`counts length is ${counts.length}`));
    }
    // 计算分数
    let calcScore = 0;
    _.forEach(counts, (val, index) => {
      calcScore += val * CAKE_SCORES[index];
    });
    if (calcScore !== score) {
      reject(new Error('check score failed'));
    }
    resolve();
  });
}

/**
 * 检测签名
 * @param {*} id 游戏记录 id
 * @param {*} score 游戏分数
 * @param {*} timestamp 提交时间戳
 * @param {*} signature 签名
 */
function checkSignature(id, score, timestamp, signature) {
  return new Promise((resolve, reject) => {
    if (!_.isNumber(score)) {
      reject(new TypeError('score is not a number'));
    }
    if (!_.isNumber(timestamp)) {
      reject(new TypeError('timestamp is not a number'));
    }
    const str = `${id}${score}${timestamp}`;
    const calcSignature = md5(str);
    if (calcSignature !== signature) {
      reject(new Error('check siganture failed'));
    }
    resolve();
  });
}

/**
 * 检测分数是否在合理范围
 * @param {*} seed 随机种子
 * @param {*} score 当前分数
 */
function checkMaxScore(seed, score) {
  return new Promise((resolve, reject) => {
    if (!_.isNumber(seed)) {
      reject(new TypeError('seed is not a number'));
    }
    if (!_.isNumber(score)) {
      reject(new TypeError('score is not a number'));
    }
    const count = Math.ceil(MAX_GAME_DURATION / SPAWN_CAKE_SPEED);
    let maxScore = 0;
    for (let i = 0; i < count; i++) {
      const index = seedrandom(seed).int32() % CAKE_CATEGORY_COUNT;
      maxScore += CAKE_SCORES[index];
    }
    if (score > maxScore) {
      reject(new Error('check max score error'));
    }
    resolve();
  });
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