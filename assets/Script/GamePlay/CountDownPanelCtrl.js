import { COUNT_DOWN } from '../Constants'; 

cc.Class({
    extends: cc.Component,

    properties: {
        numberAtlas: {
            type: cc.SpriteAtlas,
            default: null,
        },
        numberSprite: {
            type: cc.Sprite,
            default: null,
        },
    },

    show() {
        this.node.active = true;
        let c = COUNT_DOWN;
        this._updateSpriteFrame(`${c}`);
        const _interval = setInterval(() => {
            c--;
            if (c === 0) {
                clearInterval(_interval);
                this.node.active = false;
            } else {
                this._updateSpriteFrame(`${c}`);
            }
        }, 1000);
    },

    _updateSpriteFrame(frame) {
        this.numberSprite.spriteFrame = this.numberAtlas.getSpriteFrame(frame);
    }
});
