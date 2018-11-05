import SDK from '../SDK';

cc.Class({
    extends: cc.Component,

    properties: {
        dialog: {
            type: cc.Node,
            default: null,
        },
        avatarSprite: {
            type: cc.Sprite,
            default: null,
        },
        nameLabel: {
            type: cc.Label,
            default: null,
        },
        scoreLabel: {
            type: cc.Label,
            default: null,
        },
        cake1Label: {
            type: cc.Label,
            default: null,
        },
        cake2Label: {
            type: cc.Label,
            default: null,
        },
        cake3Label: {
            type: cc.Label,
            default: null,
        },
        bombLabel: {
            type: cc.Label,
            default: null
        },
    },

    showAndCapture(score) {
        const user = SDK.myself();
        this.nameLabel.string = user.get('nickName');
        this.scoreLabel.string = `本局得分：${score.value}分`;
        const { cakes } = score;
        this.bombLabel.string = `x ${cakes.BOMB}个`;
        this.cake1Label.string = `x ${cakes.CAKE1}个`;
        this.cake2Label.string = `x ${cakes.CAKE2}个`;
        this.cake3Label.string = `x ${cakes.CAKE3}个`;
        // 加载头像
        cc.loader.load({
            url: user.get('avatarUrl'),
            type: 'png',
        }, (err, tex) => {
            this.avatarSprite.spriteFrame = new cc.SpriteFrame(tex);
            setTimeout(() => {
                const x = (this.node.width - this.dialog.width) / 2;
                const y = this.dialog.y + (this.node.height - this.dialog.height) / 2;
                const { width, height } = this.dialog;
                SDK.capture(x, y, width, height)
                    .then(() => {
                        SDK.toast('截屏保存成功', 'success');
                    }).catch(error => {
                        SDK.toast(`截屏保存失败: ${error.message}`);
                    });
            }, 300);
        });
    },

    onCloseBtnClicked() {
        this.node.active = false;
    }
});
