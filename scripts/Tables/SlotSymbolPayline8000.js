const { convertAssetArrayToObject } = require('slotUtils');
cc.Class({
    extends: require('SlotSymbolPaylinev2'),

    onLoad() {
        this._super();
        this.assets = convertAssetArrayToObject(this.symbols);
    },

});