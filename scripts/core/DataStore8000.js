cc.Class({
    extends: require('DataStorev2'),

    properties: {
        isSortingPayline: false,
    },

    formatData(playSession) {
        const { TABLE_FORMAT } = this.node.config;
        this.node.gSlotDataStore.playSession = playSession;

        let { matrix, freeGameMatrix, normalGameMatrix, bonusGameMatrix, payLines } = playSession;

        let tableFormat = TABLE_FORMAT;
        playSession = this._mapNewKeys(playSession);
        if (matrix) {
            playSession.matrix = this.node.gSlotDataStore.convertSlotMatrix(matrix, tableFormat);
        } else if (freeGameMatrix) {
            playSession.matrix = this.node.gSlotDataStore.convertSlotMatrix(freeGameMatrix, tableFormat);
        } else if (normalGameMatrix) {
            playSession.matrix = this.node.gSlotDataStore.convertSlotMatrix(normalGameMatrix, tableFormat);
        } else if (bonusGameMatrix) {
            playSession.bonusGameMatrix = bonusGameMatrix;
        }

        if (payLines) {
            payLines = this.node.gSlotDataStore.convertPayLine(payLines);
            if (this.isSortingPayline) {
                payLines = payLines.sort((a, b) => {
                    return Number(b.totalWinAmount) - Number(a.totalWinAmount);
                });
            }
        }

        this.node.gSlotDataStore.playSession = playSession;
        cc.warn("%c data-update ", "color: red", this.node.gSlotDataStore.playSession);
        return playSession;
    },

});