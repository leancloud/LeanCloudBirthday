import Event from '../Event';
import SDK from '../SDK';

cc.Class({
    extends: cc.Component,

    onCancelBtnClicked () {
        this.node.active = false;
        this.node.dispatchEvent(new cc.Event.EventCustom(Event.GAME_OVER, true));
    },

    onShareBtnClicked() {
        this.node.active = false;
        SDK.share()
            .then(() => {
                // 分享成功
                this.node.dispatchEvent(new cc.Event.EventCustom(Event.SHARE_SUCCESSFULLY, true));
            }).catch(error => {
                // 分享失败
                this.node.dispatchEvent(new cc.Event.EventCustom(Event.SHARE_FAILED, true));
            });
    },
});
