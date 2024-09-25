cc.Class({
    extends: require('DataStorev2'),

    properties: {
        isSortingPayline: false,
    },

    formatData(playSession) {
        const { TABLE_FORMAT } = this.node.config;
        this.node.gSlotDataStore.playSession = playSession;

        let { matrix, freeGameMatrix, normalGameMatrix, bonusGameMatrix, payLines, jackpot } = playSession;

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

        if (jackpot) playSession.jackpot = this.covertJackpot(jackpot);
        this.node.gSlotDataStore.playSession = playSession;
        cc.warn("%c data-update ", "color: red", this.node.gSlotDataStore.playSession);

        const { LOCAL_TEST } = this.node.config;
        if (LOCAL_TEST) {
            cc.warn('LocalMode - skip playSession!');
            playSession = this.getFakeData();
        }
        return playSession;
    },

    getFakeData() {
        let fakePlaySession = {
            matrix: '2,3,4,5,6,7,K,2,3,4,5,6,7,K,2',
        };
        return fakePlaySession;
    },


    covertJackpot(jackpot) {
        const jpInfo = jackpot[jackpot.length - 1].split(';');
        const jpType = jpInfo[0].split('_')[2];
        const jpValue = Number(jpInfo[1]);
        return { jpType, jpValue };
    }
});