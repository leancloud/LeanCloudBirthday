import Constants from './Constants';

let AV = null;

if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME) {
    AV = require('leancloud-storage/dist/av-weapp-min.js');
} else {
    AV = require('leancloud-storage');
}

const SDK = {
    init() {
        const APP_ID = 'nb4egfMaDOj6jzqRhBuWpk5m-gzGzoHsz';
        const APP_KEY = 'zJ4aUsCraV6eBE6dGHWYE57z';
        AV.init({
            appId: APP_ID,
            appKey: APP_KEY
        });
    },

    authorize(xr, yr, wr, hr) {
        return new Promise((resolve, reject) => {
            if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME) {
                const {
                    windowWidth,
                    windowHeight,
                } = wx.getSystemInfoSync();
                const x = xr * windowWidth;
                const y = yr * windowHeight;
                const width = wr * windowWidth;
                const height = hr * windowHeight;
                const btn = wx.createUserInfoButton({
                    text: '',
                    style: {
                        left: x,
                        top: y,
                        width,
                        height,
                        lineHeight: height,
                        backgroundColor: '#ffffff00',
                        color: '#0094F4',
                        textAlign: 'center',
                        fontSize: 16,
                        borderRadius: 4,
                        'justify-content': 'center',
                    }
                });
                btn.onTap((res) => {
                    const { userInfo } = res;
                    if (userInfo) {
                        console.log('授权成功');
                        const user = AV.User.current();
                        user.set(userInfo);
                        user.save()
                            .then(() => {
                                btn.destroy();
                                resolve();
                            })
                            .catch((error) => {
                                console.error(error);
                                reject(error);
                            });
                    } else {
                        console.log('授权失败');
                        reject(new Error('授权失败'));
                    }
                });
            } else {
                resolve();
            }
        });
    },

    myself() {
        return AV.User.current();
    },

    getMyInfo() {
        return new Promise((resolve, reject) => {
            if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME) {
                AV.User.current().fetch({
                    include: ['info'],
                }).then(user => {
                    if (user.get('info')) {
                        resolve(user.get('info'));
                    } else {
                        const userInfo = new AV.Object('UserInfo');
                        resolve(userInfo);
                    }
                }).catch(error => {
                    console.error(error);
                    reject(error);
                });
            } else {
                resolve(null);
            }
        });
    },

    getMyUserInfo() {
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                success: ({ userInfo }) => {
                    // 更新当前用户的信息
                    const user = AV.User.current();
                    user.set(userInfo).save()
                        .then(() => {
                            resolve();
                        }).catch((error) => {
                            reject(error);
                        });
                },
                fail: (res) => {
                    reject(new Error(res.errMsg))
                },
            });
        });
    },

    saveInfo(userInfo) {
        return new Promise((resolve, reject) => {
            if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME) {
                const myself = AV.User.current();
                myself.set('info', userInfo);
                myself.save().then(() => {
                    resolve()
                }, (err) => {
                    console.error(err);
                    reject(err);
                });
            } else {
                resolve();
            }
        });
    },

    login() {
        return new Promise((resolve, reject) => {
            // 微信登录
            if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME) {
                AV.User.loginWithWeapp().then(user => {
                    resolve();
                }).catch(error => {
                    console.error(error);
                    reject(error);
                });
            } else {
                resolve();
            }
        });
    },

    submitScore(score) {
        // 向排行榜提交分数
        return new Promise((resolve, reject) => {
            const now = (new Date()).getTime();
            const scoreInLeaderBoard = parseInt(`${score}${10000000000000 - now}`);
            console.log(`score: ${scoreInLeaderBoard}`);
            if (AV.User.current()) {
                AV.Leaderboard.updateStatistics(AV.User.current(), {
                    'score' : scoreInLeaderBoard
                }).then(statistics => {
                    resolve();
                }).catch(error => {
                    console.error(error);
                    reject(error);
                });
            }
        });
    },

    getRankings(callback) {
        // 获取前 50 名玩家
        return new Promise((resolve, reject) => {
            const leaderboard = AV.Leaderboard.createWithoutData('score');
            leaderboard.getResults({
                limit: 50,
                skip: 0,
                selectUserKeys: ['nickName', 'avatarUrl'],
            }).then(rankings => {
                resolve(rankings)
            }).catch(error => {
                console.error(error);
                reject(error);
            });
        });
    },

    getMyRanking(callback) {
        // 获取自己的成绩
        return new Promise((resolve, reject) => {
            if (AV.User.current()) {
                const leaderboard = AV.Leaderboard.createWithoutData('score');
                leaderboard.getResultsAroundUser({
                    limit: 1,
                    selectUserKeys: ['nickName', 'avatarUrl'],
                }).then((rankings) => {
                    if (rankings.length === 1) {
                        const myRanking = rankings[0];
                        resolve(myRanking);
                    } else {
                        // 暂未排名
                        resolve(null);
                    }
                }).catch(error => {
                    console.error(error);
                    reject(error);
                });
            } else {
                resolve(null);
            }
        });
    },

    share() {
        return new Promise((resolve, reject) => {
            if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME) {
                wx.shareAppMessage({
                    title: Constants.SHARE_TITLE,
                    imageUrl: Constants.SHARE_IMAGE_URL,
                    success: function(res){
                        resolve();
                    },
                    fail: function(res){
                        reject(new Error(res.errMsg));
                    }
                });
            } else {
                resolve();
            }
        });
    },

    capture(x, y, width, height) {
        console.log(`${x}, ${y}, ${width}, ${height}`);
        return new Promise((resolve, reject) => {
            if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME) {
                let tempFilePath = canvas.toTempFilePathSync({
                    x,
                    y,
                    width,
                    height,
                    destWidth: width * 2,
                    destHeight: height * 2,
                });
                wx.saveImageToPhotosAlbum({
                    filePath: tempFilePath,
                    success: () => {
                        console.log('save success');
                        resolve();
                    },
                    fail: (res) => {
                        console.log('save fail');
                        reject(res.errMsg);
                    }
                });
            } else {
                resolve();
            }
        });
    },

    toast(title, icon = 'none') {
        console.log(title);
        if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME) {
            wx.showToast({
                title,
                icon,
            });
        }
    },

    showLoading(title) {
        if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME) {
            wx.showLoading({
                title,
            });
        }
    },

    hideLoading() {
        if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME) {
            wx.hideLoading();
        }
    }
};

export default SDK;