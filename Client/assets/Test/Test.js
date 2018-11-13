cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.loader.loadRes('Prefabs/HelloWorld', (err, prefab) => {
            const node = cc.instantiate(prefab);
            this.node.addChild(node);
            console.log('add done');
            node.position = cc.Vec2.ZERO;
        });
    },

    start () {

    },

    // update (dt) {},
});
