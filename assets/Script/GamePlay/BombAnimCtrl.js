cc.Class({
    extends: cc.Component,

    properties: {
        anim: {
            type: cc.Animation,
            default: null,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    reuse() {
        cc.log('bomb reuse');
        this.anim.play();
    },
});
