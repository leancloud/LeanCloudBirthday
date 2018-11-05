import Event from '../Event';

/**
 * 蛋糕类
 */
cc.Class({
    extends: cc.Component,

    properties: {
        id: '',
        speed: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTap.bind(this));
    },

    update(dt) {
        if (super.paused)
            return;
        const delta = this.speed * dt;
        this.node.y += delta;
    },

    onCollisionEnter(other, self) {
        this.node.emit(Event.CAKE_COLLIDE_GROUND, {
            cake: this.node,
            id: this.id,
        });
    },

    _onTap() {
        this.node.emit(Event.CAKE_ON_TAP, {
            cake: this.node,
            id: this.id,
        });
    }
});
