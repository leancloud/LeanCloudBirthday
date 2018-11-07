import LeaderBoardItemCtrl from './LeaderBoardItemCtrl';
import SDK from '../SDK';

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: {
            type: cc.ScrollView,
            default: null
        },
        totalCount: 50,
        spawnCount: 10,
        itemHeight: 160,
        totalHeight: 400,
        myLeaderBoardItemCtrl: {
            type: LeaderBoardItemCtrl,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onEnable() {
        // 每次打开刷新
        this._content = this.scrollView.content;
        this._items = [];
        this._updateTimer = 0;
        this._updateInterval = 0.2;
        this._lastContentPosY = 0;

        this._content.removeAllChildren();
        
        cc.loader.loadRes('Prefabs/LeaderBoardItem', (err, prefab) => {
            SDK.getRankings()
                .then(rankings => {
                    // rankings 为前 50 的排名结果
                    this._rankings = rankings;
                    this.totalCount = rankings.length;
                    this._content.height = this.totalCount * this.itemHeight;
                    this.spawnCount = Math.min(10, this.totalCount);
                    console.log(`${this.totalCount}, ${this._content.height}, ${this.spawnCount}`);
                    for (let i = 0; i < this.spawnCount; i++) {
                        let item = cc.instantiate(prefab);
                        this._content.addChild(item);
                        item.setPosition(0, -this.itemHeight * (0.5 + i));
                        // 更新数据
                        const itemCtrl = item.getComponent(LeaderBoardItemCtrl);
                        itemCtrl.updateData(rankings[i]);
                        this._items.push(item);
                    }
                });
            SDK.getMyRanking()
                .then(myRanking => {
                    if (myRanking) {
                        this.myLeaderBoardItemCtrl.updateData(myRanking);
                    } else {
                        // 暂未上榜
                        const noRanking = {
                            rank: -1,
                            value: -1,
                            user: SDK.myself(),
                        };
                        this.myLeaderBoardItemCtrl.updateData(noRanking);
                    }
                });
        });
    },

    update(dt) {
        this._updateTimer += dt;
        if (this._updateTimer < this._updateInterval)
            return;
        this._updateTimer = 0;
        let items = this._items;
        let isDown = this._content.y < this._lastContentPosY;
        let offset = this.itemHeight * items.length;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const viewPos = this.getPositionInView(item);
            if (isDown) {
                if (viewPos.y < -this.totalHeight && item.y + offset < 0) {
                    cc.log('move up');
                    item.y = item.y + offset;
                    const itemCtrl = item.getComponent(LeaderBoardItemCtrl);
                    const index = itemCtrl.index - items.length;
                    itemCtrl.updateData(this._rankings[index]);
                }
            } else {
                if (viewPos.y > this.totalHeight && item.y - offset > -this._content.height) {
                    cc.log('move down');
                    item.y = item.y - offset;
                    const itemCtrl = item.getComponent(LeaderBoardItemCtrl);
                    const index = itemCtrl.index + items.length;
                    itemCtrl.updateData(this._rankings[index]);
                }
            }
        }
        this._lastContentPosY = this._content.y;
    },

    getPositionInView(item) {
        const worldPos = item.parent.convertToWorldSpaceAR(item.position);
        const viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },

    // UI Events

    onEditInfoBtnClicked() {
        cc.loader.loadRes('Prefabs/EditInfoPanel', (err, prefab) => {
            const editInfoPanel = cc.instantiate(prefab);
            this.node.parent.addChild(editInfoPanel);
            editInfoPanel.position = cc.Vec2.ZERO;
        });
    },

    onCloseBtnClicked() {
        this.node.active = false;
    }
});
