/**
 * 游戏规则面板控制器
 */
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // UI Events

    onCloseBtnClicked() {
        this.node.destroy();
    }
});
