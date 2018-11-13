import {
    formatDateStr   
} from '../Utils';

cc.Class({
    extends: cc.Component,

    properties: {
        rankLabel: {
            type: cc.Label,
            default: null,
        },
        rankSprite: {
            type: cc.Sprite,
            default: null,
        },
        rankAtlas: {
            type: cc.SpriteAtlas,
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
        timeLabel: {
            type: cc.Label,
            default: null
        },
        index: 0,
    },

    updateData(ranking) {
        const {
            rank,
            value,
            user,
        } = ranking;
        this.index = rank;
        this._updateRank(rank);
        if (user) {
            this._updateName(rank, user.get('nickName'));
            this._updateScore(rank, value);
            const avatarUrl = user.get('avatarUrl');
            this._updateAvatar(avatarUrl);
        }
    },

    _updateAvatar(avatarUrl) {
        if (avatarUrl) {
            cc.loader.load({
                url: avatarUrl,
                type: 'png',
            }, (err, tex) => {
                this.avatarSprite.spriteFrame = new cc.SpriteFrame(tex);
            });
        }
    },

    _updateName(rank, nickName) {
        if (rank < 3) {
            this.nameLabel.node.color = cc.color(255, 89, 39);
        } else {
            this.nameLabel.node.color = cc.color(0, 0, 0);
        }
        this.nameLabel.string = `${nickName}`;
    },

    _updateScore(rank, value) {
        if (value < 0) {
            this.scoreLabel.string = '暂未上榜';
            this.timeLabel.string = '';
            return;
        }
        if (rank < 3) {
            this.scoreLabel.node.color = cc.color(255, 89, 39);
        } else {
            this.scoreLabel.node.color = cc.color(0, 0, 0);
        }
        const valueStr = `${value}`;
        const scoreLength = valueStr.length - 13;
        const subValue = valueStr.substring(0, scoreLength);
        const score = parseInt(subValue);
        this.scoreLabel.string = `${score}分`;
        const timestampStr = valueStr.substring(scoreLength);
        const timestamp = 10000000000000 - parseInt(timestampStr);
        const date = new Date(timestamp);
        const monthStr = formatDateStr(date.getMonth() + 1);
        const dayStr = formatDateStr(date.getDate());
        const hourStr = formatDateStr(date.getHours());
        const minuteStr = formatDateStr(date.getMinutes());
        this.timeLabel.string = `${monthStr}月${dayStr}日 ${hourStr}:${minuteStr}`;
    },

    _updateRank(rank) {
        if (rank < 0) {
            this._setRankLabel(-1);
            return;
        }
        switch (rank) {
            case 0:
                this._setRankSprite('gold');
            break;
            case 1:
                this._setRankSprite('silver');
            break;
            case 2:
                this._setRankSprite('copper');
            break;
            default:
                this._setRankLabel(rank);
            break;
        }
    },

    _setRankSprite(spriteFrame) {
        this.rankSprite.spriteFrame = this.rankAtlas.getSpriteFrame(spriteFrame);
        this.rankSprite.node.active = true;
        this.rankLabel.node.active = false;
    },

    _setRankLabel(rank) {
        this.rankLabel.string = this.getRankStr(rank);
        this.rankSprite.node.active = false;
        this.rankLabel.node.active = true;
    },

    getRankStr(rank) {
        if (rank < 0)
            return `${rank}`;
        if (rank < 9)
            return `0${rank + 1}`
        return `${rank + 1}`;
    }
});
