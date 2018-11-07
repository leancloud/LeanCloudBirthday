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
        // 检查是否获取到了微信 UserInfo
        const userInfo = SDK.myInfo();
        console.log(`nickname: ${userInfo}`);
        if (userInfo === undefined) {
            // 如果没有微信 UserInfo，则创建按钮覆盖开始按钮，在点击开始后，先获取，再开始游戏
            const { xr, yr, wr, hr } = this._calcStartNodeBox();
            SDK.tryCreateUserInfoButton(xr, yr, wr, hr, 
                () => {
                    console.log('callback mainmenu');
                    // 当用户点击获取到了用户信息
                    cc.director.loadScene('gameplay');
                });
        }
    },

    // UI Events

    onStartBtnClicked() {
        // 检查是否获取到了微信 UserInfo
        const userInfo = SDK.myInfo();
        if (userInfo) {
            cc.director.loadScene('gameplay');
        } else {
            // 补一下：如果是新版中没有用户信息，但是却点击到了开始按钮，则取消操作，重新生成遮挡（理论上不会发生）
            const { xr, yr, wr, hr } = this._calcStartNodeBox();
            SDK.tryCreateUserInfoButton(xr, yr, wr, hr, () => {
                cc.error(new Error('new version with no user info click the button'));
                // 当用户点击获取到了用户信息
                cc.director.loadScene('gameplay');
            }, () => {
                SDK.deprecateAuthorize()
                    .then(() => {
                        cc.director.loadScene('gameplay');
                    })
                    .catch((error) => {
                        SDK.openSetting();
                    });
            });
        }
    },

    _calcStartNodeBox() {
        const x = (this.node.width - this.startNode.width) / 2;
        const y =  (this.node.height - this.startNode.height) / 2 - this.startNode.y;
        const { width, height } = this.startNode;
        const xr = x / this.node.width;
        const yr = y / this.node.height;
        const wr = width / this.node.width;
        const hr = height / this.node.height;
        console.log(`rate: ${xr}, ${yr}, ${wr}, ${hr}`)
        return {
            xr, yr, wr, hr,
        }
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
