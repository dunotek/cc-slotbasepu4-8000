cc.Class({
    extends: require('Director'),

    properties: {
        isRunLocal: false,
    },

    start() {
        this._super();
        this.node.gSlotDataStore.isRunLocal = this.isRunLocal;
    },
});