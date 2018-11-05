import SDK from '../SDK';

/**
 * 主菜单
 */
cc.Class({
    extends: cc.Component,

    properties: {
        startNode: {
            type: cc.Node,
            default: null,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 根据获取用户信息情况，确定是否覆盖
        const x = (this.node.width - this.startNode.width) / 2;
        const y =  (this.node.height - this.startNode.height) / 2 - this.startNode.y;
        const { width, height } = this.startNode;
        const xr = x / this.node.width;
        const yr = y / this.node.height;
        const wr = width / this.node.width;
        const hr = height / this.node.height;
        console.log(`rate: ${xr}, ${yr}, ${wr}, ${hr}`)

        SDK.getMyUserInfo()
            .then()
            .catch(() => {
                SDK.authorize(xr, yr, wr, hr)
                    .then(() => {
                        cc.director.loadScene('gameplay');
                    })
                    .catch(console.error);
            });
    },

    // UI Events

    onStartBtnClicked() {
        cc.director.loadScene('gameplay');
    },

    onLeaderBoardBtnClicked() {
        cc.loader.loadRes('Prefabs/LeaderBoardPanel', (err, prefab) => {
            const leaderBoardPanel = cc.instantiate(prefab);
            this.node.addChild(leaderBoardPanel);
            leaderBoardPanel.position = cc.Vec2.ZERO;
        });
    },

    onRuleBtnClicked() {
        cc.loader.loadRes('Prefabs/RulePanel', (err, prefab) => {
            const rulePanel = cc.instantiate(prefab);
            this.node.addChild(rulePanel);
            rulePanel.position = cc.Vec2.ZERO;
        });
    },
});
