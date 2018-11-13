import Event from "../Event";

cc.Class({
    extends: cc.Component,

    properties: {
        // 缩放
        scale: 1,
        // 上升速度
        speed: 100,
    },

    // LIFE-CYCLE CALLBACKS:

    start () {
        this.node.scale = this.scale;
    },

    update (dt) {
        const delta = this.speed * dt;
        this.node.y += delta;
    },

    onCollisionEnter(other, self) {
        if (other.node.group === 'bubble_top') {
            this.node.parent.emit(Event.BUBBLE_ARRIVE_TOP, {
                node: this.node,
            });
        }
    },
});
