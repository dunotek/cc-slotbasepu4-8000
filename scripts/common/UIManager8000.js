cc.Class({
    extends: require('GameModeBasic'),

    onLoad() {
        this.node.guiMgr = this;
        this._super();
    },

});
