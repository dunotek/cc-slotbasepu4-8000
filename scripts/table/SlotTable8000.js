cc.Class({
    extends: require('SlotTablev2'),

    showAnimIntro() {
        this.isShowAnimIntro = true;
        let matrix = this.getBeautyMatrixRandom();
        for (let col = 0; col < this.tableFormat.length; ++col) {
            const reel = this.node.reels[col];
            for (let row = 0; row < this.tableFormat[col]; ++row) {
                if (reel) {
                    const symbol = reel.showSymbols[row];
                    if (symbol) {
                        let symbolName = matrix[col][row];
                        symbol.changeToSymbol(symbolName);
                    }
                }
            }
        }
        this.node.emit("SETUP_PAYLINES", null, null);
        this.node.emit("SHOW_INTRO_SYMBOLS", matrix);
    },

    hideAnimIntro() {
        if (!this.isShowAnimIntro) return;
        this.isShowAnimIntro = false;
        this.node.emit('CLEAR_PAYLINES');
    },

    checkStopSpinningCallback(matrix, callback) {
        this.setUpPaylineAtReel();
        this._super(matrix, callback);
    },

    setUpPaylineAtReel() {
        const { playSession } = this.node.gSlotDataStore;
        if (playSession) {
            const { payLines } = playSession;
            this.node.emit('SET_UP_PAYLINE_AT_REEL', this.stopSpinningCallbackCount, payLines);
        }
    },
});