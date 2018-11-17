import SDK from '../SDK';
/**
 * 游戏规则面板控制器
 */
cc.Class({
    extends: cc.Component,

    properties: {
        ruleText: {
            type: cc.RichText,
            default: null,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        SDK.getRule()
            .then((rule) => {
                console.log(rule);
                this.ruleText.string = rule.get('content');
            })
            .catch(console.error);
    },

    // UI Events

    onCloseBtnClicked() {
        this.node.destroy();
    }
});
