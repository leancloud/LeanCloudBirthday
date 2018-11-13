import Event from '../Event';
import SDK from '../SDK';

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: {
            type: cc.Label,
            default: null,
        },

    },

    show(score) {
        this.node.active = true;
        this.scoreLabel.string = `${score}`;
    },

    onReplayBtnClicked() {
        this.node.active = false;
        this.node.dispatchEvent(new cc.Event.EventCustom(Event.REPLAY, true));
    },

    onRecommendBtnClicked() {
        SDK.share();
    },

    onSaveSharePicBtnClicked() {
        this.node.dispatchEvent(new cc.Event.EventCustom(Event.CAPTURE, true));
    },

    onHomeBtnClicked() {
        this.node.active = false;
        this.node.dispatchEvent(new cc.Event.EventCustom(Event.HOME, true));
    },

    onLeaderBoardBtnClicked() {
        this.node.dispatchEvent(new cc.Event.EventCustom(Event.LEADER_BOARD, true));
    },
});
