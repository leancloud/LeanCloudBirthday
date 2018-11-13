import {
    padding
} from '../Utils';
import Event from '../Event';
import GameOverPanelCtrl from './GameOverPanelCtrl';
import CountDownPanelCtrl from './CountDownPanelCtrl';
import ShareCapturePanelCtrl from './ShareCapturePanelCtrl';
import GameOverForSharePanelCtrl from './GameOverForSharePanelCtrl';
import LeaderBoardPanelCtrl from '../MainMenu/LeaderBoardPanelCtrl';

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: {
            type: cc.Label,
            default: null,
        },
        timeLabel: {
            type: cc.Label,
            default: null,
        },
        panelContainer: {
            type: cc.Node,
            default: null,
        },
        countDownPanelCtrl: {
            type: CountDownPanelCtrl,
            default: null,
        },
        loading: {
            type: cc.Node,
            default: null,
        },
    },

    init() {
        this._gameOverSharePanel = this._addChild('Prefabs/GameOverForSharePanel');
        this._gameOverPanel = this._addChild('Prefabs/GameOverPanel');
        this._leaderBoardPanel = this._addChild('Prefabs/LeaderBoardPanel');
        this._capturePanel = this._addChild('Prefabs/ShareCapturePanel');
    },

    _addChild(res) {
        const prefab = cc.loader.getRes(res);
        const child = cc.instantiate(prefab);
        this.panelContainer.addChild(child);
        child.position = cc.Vec2.ZERO;
        return child;
    },

    onLoad() {
        this.node.on(Event.LEADER_BOARD, this._onLeaderBorader, this);
    },

    showCountDown() {
        this.countDownPanelCtrl.show();
    },

    prepare(score, time) {
        this._time = time;
        this.timeLabel.string = this.getTime();
        this.scoreLabel.string = `得分: ${score}`;
        this._gameOverSharePanel.active = false;
        this._gameOverPanel.active = false;
        this._leaderBoardPanel.active = false;
        this._capturePanel.active = false;
        this.loading.active = false;
    },

    startGame() {
        if (this._timer) {
            this.unschedule(this._timer);
        }
        this._timer = () => {
            this._time--;
            this._updateTime();
        };
        this.schedule(this._timer, 1, this._time);
    },

    gameOverForShare() {
        this._time = 0;
        this._updateTime();
        this._gameOverSharePanel.active = true;
    },

    gameOver(score) {
        this._time = 0;
        this._updateTime();
        this._gameOverPanel.active = true;
        // TODO 显示分数
        const gameOverPanelCtrl = this._gameOverPanel.getComponent(GameOverPanelCtrl);
        gameOverPanelCtrl.show(score);
    },

    showAndCapture(score) {
        this._capturePanel.active = true;
        const capturePanelCtrl = this._capturePanel.getComponent(ShareCapturePanelCtrl);
        capturePanelCtrl.showAndCapture(score);
    },

    _updateTime() {
        this.timeLabel.string = this.getTime();
    },

    updateScore(score) {
        this.scoreLabel.string = `得分: ${score}`;
    },

    getTime() {
        if (this._time < 60) {
            if (this._time < 0) {
                return '00:00';
            }
            return `00:${padding(this._time, 2)}`;
        } else {
            const minute = Math.floor(this._time / 60);
            const second = this._time % 60;
            return `${padding(minute, 2)}:${padding(second, 2)}`;
        }
    },

    _onLeaderBorader() {
        this._leaderBoardPanel.active = true;
    },
});
