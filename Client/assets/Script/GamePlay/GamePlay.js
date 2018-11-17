import machina from 'machina';
import Event from '../Event';
import CakeCtrl from './CakeCtrl';
import {
    getRandomInt
} from '../Utils';
import GameUI from './GameUI';
import Constants, { COUNT_DOWN } from '../Constants'
import SDK from '../SDK';
import Cakes from './Cakes';
import BubbleLayerCtrl from './BubbleLayerCtrl';
// import seedrandom from 'seedrandom';

/**
 * 游戏控制器
 */
cc.Class({
    extends: cc.Component,

    properties: {
        scene: {
            type: cc.Node,
            default: null,
        },
        background: {
            type: cc.Node,
            default: null,
        },
        ui: {
            type: GameUI,
            default: null
        },
        cakePrefabList: {
            type: cc.Prefab,
            default: [],
        },
        bubbleCtrl: {
            type: BubbleLayerCtrl,
            default: null,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        const self = this;
        this._gameFSM = new machina.Fsm({
            initialize: function (opts) {
                this._gamePlay = self;
                this._node = this._gamePlay.node;
                this._ui = this._gamePlay.ui;
            },

            namespace: 'game-play',

            initialState: 'init',

            states: {
                // 初始状态：注册事件，加载资源
                init: {
                    _onEnter: function () {
                        cc.log('init _onEnter');
                        // 初始化游戏
                        cc.director.getCollisionManager().enabled = true;
                        this._node.on(Event.GAME_OVER, this._onGameOver, this);
                        this._node.on(Event.SHARE_SUCCESSFULLY, this._onShareSuccessfully, this);
                        this._node.on(Event.SHARE_FAILED, this._onShareFailed, this);
                        this._node.on(Event.HOME, this._onHome, this);
                        this._node.on(Event.REPLAY, this._onReplay, this);
                        this._node.on(Event.CAPTURE, this._onCapture, this);
                        this._cakes = Object.assign({}, Cakes);
                        // 加载资源
                        const resArr = [];
                        Object.keys(this._cakes).forEach((key) => {
                            const cake = this._cakes[key];
                            resArr.push(cake.prefab);
                            resArr.push(cake.bombPrefab);
                        });
                        cc.loader.loadResDir('Res', (err) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            // 初始化对象池
                            Object.keys(this._cakes).forEach((key) => {
                                const cake = this._cakes[key];
                                const { prefab, bombPrefab, bombPoolClass } = cake;
                                cake.pool = this._newNodePool(cc.loader.getRes(prefab));
                                cake.bombPool = this._newNodePool(cc.loader.getRes(bombPrefab), bombPoolClass);
                            });
                            // 初始话 UI
                            this._ui.init();
                            setTimeout(() => {
                                this.transition('prepare');
                            }, 100);
                        });
                    },
                },
                // 准备状态：倒计时
                prepare: {
                    _onEnter: function () {
                        // 请求开始游戏
                        SDK.startGame()
                            .then(result => {
                                const { id, cakeList } = result;
                                this._id = id;
                                this._cakeList = cakeList;
                                this._cakeIndex = 0;
                                this._taps = [];
                                this._score = {
                                    value: 0,
                                    cakes: {
                                        A: 0,
                                        B: 0,
                                        C: 0,
                                        D: 0,
                                    },
                                };
                                this._ui.prepare(this._score.value, Constants.GAME_PLAY_TIME);
                                this._ui.showCountDown();
                                setTimeout(() => {
                                    this.transition('play');
                                }, COUNT_DOWN * 1000);
                            })
                            .catch(console.error);
                    },
                },
                // 游戏状态：
                play: {
                    _onEnter: function () {
                        cc.director.resume();
                        this._ui.startGame();
                        this._gamePlay.bubbleCtrl.spawnBubbles();
                        this._spawnTimer = this._startSpawn();
                        setTimeout(() => {
                            this.transition('over');
                        }, Constants.GAME_PLAY_TIME * 1000);
                        const bg = cc.loader.getRes('Res/Audio/GameBG');
                        cc.audioEngine.play(bg, true, 1);
                    },
                    _onExit: function () {
                        clearInterval(this._spawnTimer);
                        cc.director.pause();
                    },
                },
                // 等待分享状态
                overForShare: {
                    _onEnter: function () {
                        this._ui.gameOverForShare();
                    },
                    gameOver: function () {
                        this.transition('over');
                    },
                    shareSuccessfully: function () {
                        SDK.toast('分享成功');
                        this.transition('prepareAfterShare');
                    },
                    shareFailed: function() {
                        SDK.toast('分享失败');
                        this.transition('over');
                    },
                },
                // 分享后的准备状态
                prepareAfterShare: {
                    _onEnter: function () {
                        this._ui.prepare(this._score.value, Constants.SHARED_TIME);
                        this._ui.showCountDown();
                        setTimeout(() => {
                            this.transition('playAfterShare');
                        }, COUNT_DOWN * 1000);
                    },
                },
                // 分享后的游戏状态
                playAfterShare: {
                    _onEnter: function () {
                        cc.director.resume();
                        this._ui.startGame();
                        this._spawnTimer = this._startSpawn();
                        setTimeout(() => {
                            this.transition('over');
                        }, Constants.SHARED_TIME * 1000);
                    },
                    _onExit: function () {
                        cc.director.pause();
                        clearInterval(this._spawnTimer);
                    }
                },
                // 结束状态
                over: {
                    _onEnter: function () {
                        this._ui.gameOver(this._score.value);
                        SDK.endGame(this._id, this._score.value, this._score.cakes, this._taps)
                            .then(() => {

                            })
                            .catch(error => {
                                console.error(error);
                            });
                    },
                    home: function () {
                        cc.director.loadScene('mainmenu');
                    },
                    replay: function () {
                        const cakes = this._gamePlay.scene.getComponentsInChildren(CakeCtrl);
                        cakes.forEach(cake => {
                            const { id } = cake;
                            const { pool } = this._cakes[id];
                            this._putCake(cake.node, pool);
                        });
                        this.transition('prepare');
                    },
                    capture: function () {
                        this._ui.showAndCapture(this._score);
                    }
                },
            },

            _newNodePool(prefab, clazz = null) {
                const pool = new cc.NodePool(clazz);
                for (let i = 0; i < 20; i++) {
                    const node = cc.instantiate(prefab);
                    pool.put(node);
                }
                return pool;
            },

            _startSpawn: function () {
                return setInterval(() => {
                    const cake = this._spawnCake();
                    this._gamePlay.scene.addChild(cake);
                    const halfWidth = this._node.width * 0.5 - 50;
                    const x = getRandomInt(-halfWidth, halfWidth);
                    const y = this._node.height * 0.5;
                    cake.position = cc.v2(x, y);
                    const cakeCtrl = cake.getComponent(CakeCtrl);
                    cakeCtrl.index = this._cakeIndex++;
                    cakeCtrl.speed = getRandomInt(-Constants.MAX_FALL_SPEED, -Constants.MIN_FALL_SPEED);
                }, Constants.SPAWN_RATE * 1000);
            },

            _spawnCake() {
                // const weights = [];
                // Object.keys(this._cakes).forEach((key) => {
                //     const { weight } = this._cakes[key];
                //     for (let i = 0; i < weight; i++) {
                //         weights.push(key);
                //     }
                // });
                // const random = getRandomInt(0, weights.length);
                // const key = weights[random];
                const key = this._cakeList[this._cakeIndex];
                const cake = this._cakes[key];
                const { prefab, pool } = cake;
                let cakeNode = pool.get();
                if (cakeNode === null) {
                    cakeNode = cc.instantiate(cc.loader.getRes(prefab));
                }
                cakeNode.on(Event.CAKE_COLLIDE_GROUND, this._onCakeCollideGround, this);
                cakeNode.on(Event.CAKE_ON_TAP, this._onCakeTap, this);
                return cakeNode;
            },

            _putCake(cake, pool) {
                cake.off(Event.CAKE_COLLIDE_GROUND, this._onCakeCollideGround, this);
                cake.off(Event.CAKE_ON_TAP, this._onCakeTap, this);
                pool.put(cake);
            },

            _getBomb(bombPool, bombPrefab) {
                let bomb = bombPool.get();
                if (bomb === null) {
                    bomb = cc.instantiate(cc.loader.getRes(bombPrefab));
                }
                setTimeout(() => {
                    bombPool.put(bomb);
                }, 700);
                return bomb;
            },

            _onCakeCollideGround(detail) {
                const { cake, id } = detail;
                const { pool } = this._cakes[id];
                this._putCake(cake, pool);
                // TODO 动画，音效
                
            },
        
            _onCakeTap(detail) {
                const { cake, id, index } = detail;
                cc.log(`on cake tap: ${id}, ${index}`);
                const { score, pool, bombPool, bombPrefab, bombAudio } = this._cakes[id];
                // 爆炸动画
                const bomb = this._getBomb(bombPool, bombPrefab);
                this._gamePlay.background.addChild(bomb);
                bomb.position = cake.position;
                // 回收蛋糕节点
                this._putCake(cake, pool);
                // 计算得分
                this._score.cakes[id] += 1;
                this._score.value += score;
                this._gamePlay.ui.updateScore(this._score.value);
                this._taps.push(index);
                // 播放音效
                const audio = cc.loader.getRes(bombAudio);
                cc.audioEngine.play(audio, false, 1);
            },
        
            _onGameOver() {
                this.handle('gameOver');
            },
        
            _onShareSuccessfully() {
                this.handle('shareSuccessfully');
            },

            _onShareFailed() {
                this.handle('shareFailed');
            },
        
            _onHome() {
                this.handle('home');
            },
        
            _onReplay() {
                this.handle('replay');
            },

            _onCapture() {
                this.handle('capture');
            },
        });
    },

    onDestroy() {
        cc.audioEngine.stopAll();
    },
});
