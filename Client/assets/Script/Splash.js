import SDK from './SDK';

cc.Class({
    extends: cc.Component,

    // LIFE-CYCLE CALLBACKS:
    properties: {
        tipsLabel: {
            type: cc.Label,
            default: null,
        }
    },

    onLoad () {
        cc.debug.setDisplayStats(false);

        SDK.showLoading('正在初始化...');
        SDK.init();
        SDK.login()
            .then(() => {
                SDK.hideLoading();
                cc.director.loadScene('mainmenu');
            })
            .catch(error => {
                SDK.hideLoading();
                this.tipsLabel.string = JSON.stringify(error);
                SDK.toast(error.errMsg);
            });
    },
});
