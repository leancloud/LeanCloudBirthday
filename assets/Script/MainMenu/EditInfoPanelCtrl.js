import SDK from '../SDK';

let AV = null;

if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME) {
    AV = require('leancloud-storage/dist/av-weapp-min.js');
} else {
    AV = require('leancloud-storage');
}

cc.Class({
    extends: cc.Component,

    properties: {
        nameEditBox: {
            type: cc.EditBox,
            default: null,
        },
        regionEditBox: {
            type: cc.EditBox,
            default: null,
        },
        addressEditBox: {
            type: cc.EditBox,
            default: null,
        },
        mobileEditBox: {
            type: cc.EditBox,
            default: null,
        },
        accountEditBox: {
            type: cc.EditBox,
            default: null,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onEnable() {
        // 每次打开重新获取
        SDK.getMyInfo()
            .then(userInfo => {
                if (userInfo === null) {
                    this._userInfo = new AV.Object('UserInfo');
                } else {
                    this._userInfo = userInfo;
                    // 更新界面
                    this.nameEditBox.string = this._userInfo.get('name');
                    this.regionEditBox.string = this._userInfo.get('region');
                    this.addressEditBox.string = this._userInfo.get('address');
                    this.mobileEditBox.string = this._userInfo.get('mobile');
                    this.accountEditBox.string = this._userInfo.get('account');
                }
            });
    },

    onSubmitBtnClicked() {
        let name = this.nameEditBox.string;
        if (name === null || name.trim().length === 0) {
            SDK.toast('请输入您的名字');
            return;
        }
        let region = this.regionEditBox.string;
        if (region === null || region.trim().length === 0) {
            SDK.toast('请输入您所在的地区');
            return;
        }
        let address = this.addressEditBox.string;
        if (address === null || address.trim().length === 0) {
            SDK.toast('请输入您的详细地址');
            return;
        }
        let mobile = this.mobileEditBox.string;
        if (mobile === null || mobile.trim().length === 0) {
            SDK.toast('请输入您的手机号码');
            return;
        }
        let account = this.accountEditBox.string;
        this._userInfo.set('name', name);
        this._userInfo.set('region', region);
        this._userInfo.set('address', address);
        this._userInfo.set('mobile', mobile);
        this._userInfo.set('account', account);
        SDK.saveInfo(this._userInfo)
            .then(() => {
                SDK.toast('保存成功！');
                this.node.active = false;
            })
            .catch(err => {
                SDK.toast('保存失败，请稍后重试');
            });
    },

    onCloseBtnClicked() {
        this.node.active = false;
    }
});
