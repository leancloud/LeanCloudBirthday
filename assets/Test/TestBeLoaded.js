cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        console.log('TestBeLoaded onload');
    },

    start () {
        console.log('TestBeLoaded start');
    },

    onEnable() {
        console.log('TestBeLoaded onEnable');
    }

    // update (dt) {},
});
