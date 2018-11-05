import SDK from '../SDK';

/**
 * 主菜单
 */
cc.Class({
    extends: cc.Component,

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        
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
