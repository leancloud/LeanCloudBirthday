import Event from '../Event';
import BubbleCtrl from './BubbleCtrl';
import {
    getRandomInt
} from '../Utils';

cc.Class({
    extends: cc.Component,

    properties: {
        bubblePool: {
            type: cc.NodePool,
            default: null,
        },
        bubblePrefab: {
            type: cc.Prefab,
            default: null
        },
        bubbleCount: 10,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on(Event.BUBBLE_ARRIVE_TOP, this.onBubbleArriveTop.bind(this));
        this.bubblePool = new cc.NodePool();
        for (let i = 0; i < 10; i++) {
            const bubble = cc.instantiate(this.bubblePrefab);
            this.bubblePool.put(bubble);
        }
    },

    spawnBubbles() {
        this.schedule(() => {
            const bubble = this.getBubble();
            this.node.addChild(bubble);
            // 设置位置
            const halfWidth = this.node.width * 0.5;
            const x = getRandomInt(-halfWidth, halfWidth);
            const y = -this.node.height * 0.5;
            bubble.position = cc.v2(x, y);
            const bubbleCtrl = bubble.getComponent(BubbleCtrl);
            // 设置大小和速度
            const scale = Math.random() + 0.5;
            const speed = Math.random() * 200 + 100;
            bubbleCtrl.scale = scale;
            bubbleCtrl.speed = speed;
        }, 1);
    },

    getBubble() {
        if (this.bubblePool.size() > 0) {
            return this.bubblePool.get();
        }
        const bubble = cc.instantiate(this.bubblePrefab);
        return bubble;
    },

    onBubbleArriveTop(detail) {
        const {
            node,
        } = detail
        this.bubblePool.put(node);
    }
});
