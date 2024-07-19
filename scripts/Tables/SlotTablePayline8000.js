cc.Class({
    extends: require('SlotTablePaylinev2'),

    properties: {
        winLineFramePrefabName: 'WinlineFrame',
    },

    onLoad() {
        this._super();
        this.node.on("SET_UP_PAYLINE_AT_REEL", this.setUpPaylineAtReel, this);
        this.node.on("SHOW_INTRO_SYMBOLS", this.showIntroSymbols, this);
        this.exendInit();
    },

    exendInit() {
        this.usingObj = [];
        this.paylinesMatrix = [];
        this.scatterHolderNode = [];
        this.bonusHolderNode = [];
        this.wildHolderNode = [];
        this.jackpotHolderNode = [];
    },

    setUpPaylineAtReel(col, payLines) {
        this.node.curentConfig = this.node.config.STATS[this.node.mode];
        this.paylineHolderNode.active = true;
        this.payLineNormals = payLines;
        this.paylinesMatrix[col] = [];

        this.node.reels[col].showSymbols.forEach((symbol, row) => {
            const paylineSymbol = this.createPaylineSymbol(this.node.reels[col], symbol.symbol, col, row);
            const winLineFrame = this.createWinLineFrame(col, row, this.node.reels[col]);
            const payline = { symbol, paylineSymbol, winLineFrame };
            symbol.emit("INIT_FOR_PAYLINE", paylineSymbol.isSymbolAnimated);
            this.paylinesMatrix[col][row] = payline;
            paylineSymbol.isSpecialSymbol = true;
            if (symbol.symbol == "A") {
                this.scatterHolderNode.push(payline);
            } else if (symbol.symbol == "R") {
                this.bonusHolderNode.push(payline);
            } else if (symbol.symbol == "K") {
                this.wildHolderNode.push(payline);
            } else if (symbol.symbol == "JP") {
                this.jackpotHolderNode.push(payline);
            } else {
                paylineSymbol.isSpecialSymbol = false;
            }

            if (paylineSymbol.isSpecialSymbol) {
                this.playSpecialSymbolAppear(payline);
            }
        });
    },

    setupPaylines(matrix, payLines) {
        this.node.curentConfig = this.node.config.STATS[this.node.mode];
        this.paylineHolderNode.active = true;
        this.payLineNormals = payLines;
        this.paylinesMatrix = [];
        this.scatterHolderNode = [];
        this.wildHolderNode = [];

        for (let col = 0; col < this.node.reels.length; ++col) {
            this.paylinesMatrix[col] = [];
            for (let row = 0; row < this.node.reels[col].showSymbols.length; ++row) {
                const symbol = this.node.reels[col].showSymbols[row];
                const paylineSymbol = this.createPaylineSymbol(this.node.reels[col], symbol.symbol, col, row);
                const winLineFrame = this.createWinLineFrame(col, row, this.node.reels[col]);
                const payline = { symbol, paylineSymbol, winLineFrame };
                symbol.emit("INIT_FOR_PAYLINE", paylineSymbol.isSymbolAnimated);
                this.paylinesMatrix[col][row] = payline;
                if (symbol.symbol == "A") {
                    this.scatterHolderNode.push(payline);
                } else if (symbol.symbol == "R") {
                    this.bonusHolderNode.push(payline);
                } else if (symbol.symbol == "K") {
                    this.wildHolderNode.push(payline);
                } else if (symbol.symbol == "JP") {
                    this.jackpotHolderNode.push(payline);
                }
            }
        }
    },

    createPaylineSymbol(reel, symbol, col, row, parentNode = null) {
        if (!this.node.poolFactory) {
            cc.warn('Do not having pool factory');
            return this._super(reel, symbol, col, row, parentNode);
        }
        let paylineSymbol = this.node.poolFactory.getObject(this.symbolSpinePrefabName);
        paylineSymbol.active = true;
        paylineSymbol.parent = parentNode || this.paylineHolderNode;
        paylineSymbol.x = this.getXPosition(col);
        paylineSymbol.y = ((reel.showNumber / 2 - row - 0.5)) * this.node.config.SYMBOL_HEIGHT;
        paylineSymbol.changeToSymbol(symbol);
        paylineSymbol.disableHighlight();
        this.usingObj.push(paylineSymbol);
        return paylineSymbol;
    },

    createWinLineFrame(col, row, reel, isWinLineFront = false) {
        if (!this.node.poolFactory) {
            cc.warn('Do not having pool factory');
            return null;
        }
        const prefabName = this.winLineFramePrefabName;
        let winLineFrame = this.node.poolFactory.getObject(prefabName);
        if (winLineFrame) {
            winLineFrame.active = false;
            winLineFrame.parent = isWinLineFront ? this.winLineFrameFrontHolder : this.winLineFrameHolder;
            winLineFrame.x = this.getXPosition(col);
            winLineFrame.y = ((reel.showNumber / 2 - row - 0.5)) * this.node.config.SYMBOL_HEIGHT;
            winLineFrame.animationClip = winLineFrame.getComponent(cc.Animation);
            this.usingObj.push(winLineFrame);
        }
        return winLineFrame;
    },

    blinkNormalPaylinePerline({payLineID, payLineWinNumbers}) {
        let payline = this.node.config.PAY_LINE_MATRIX[payLineID];
        for (let paylinePos = 0; paylinePos < payLineWinNumbers; ++paylinePos) {
            const row = payline[paylinePos];
            const col = paylinePos;
            const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];
            symbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
            paylineSymbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
        }
    },

    blinkNormalPaylineAllline({symbolId, symbolCount}) {
        for (let col = 0; col < symbolCount; col++) {
            for (let row = 0; row < this.paylinesMatrix[col].length; row++) {
                const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];
                if (symbol.symbol == symbolId || symbol.symbol == "K") {
                    symbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
                    paylineSymbol.blinkHighlight(this.node.curentConfig.BLINK_DURATION, this.node.curentConfig.BLINKS);
                }
            }
        }
    },

    showNormalPaylinePerline({payLineID, payLineWinNumbers}) {
        this.disableHighlightNormalPaylines();
        let payline = this.node.config.PAY_LINE_MATRIX[payLineID];
        if (payline && payline.length > 0 && this.paylinesMatrix && this.paylinesMatrix.length > 0) {
            for (let paylinePos = 0; paylinePos < payLineWinNumbers; ++paylinePos) {
                const row = payline[paylinePos];
                const col = paylinePos;
                const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];
                symbol.enableHighlight();
                paylineSymbol.enableHighlight();
                paylineSymbol.playAnimation();

            }
        }
    },
    
    showNormalPaylineAllLine({symbolId, symbolCount}) {
        this.disableHighlightNormalPaylines();
        for (let col = 0; col < symbolCount; col++) {
            for (let row = 0; row < this.paylinesMatrix[col].length; row++) {
                const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];
                if (symbol.symbol == symbolId || symbol.symbol == "K") {
                    symbol.enableHighlight();
                    paylineSymbol.enableHighlight();
                    paylineSymbol.playAnimation();
                }
            }
        }
    },

    disableHighlightNormalPaylines() {
        for (let col = 0; col < this.paylinesMatrix.length; ++col) {
            for (let row = 0; row < this.paylinesMatrix[col].length; ++row) {
                const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];
                symbol.disableHighlight();
                paylineSymbol.disableHighlight();
            }
        }
    },

    playSpecialSymbolAppear(payline) {
        const { symbol, paylineSymbol } = payline;
        if (symbol && paylineSymbol && paylineSymbol.isSymbolAnimated) {
            symbol.enableHighlight();
            symbol.playAnimation();
            paylineSymbol.enableHighlight();
            paylineSymbol.playSpecialSymbolAppear();
        }
    },

    clearPaylines() {
        for (let i = 0; i < this.usingObj.length; i++) {
            let removedObj = this.usingObj[i];
            removedObj.stopAllActions();
            this.node.poolFactory.removeObject(removedObj);
        }
        this.usingObj = [];
        this._super();
    },

    showIntroSymbols() {
        for (let col = 0; col < this.paylinesMatrix.length; ++col) {
            for (let row = 0; row < this.paylinesMatrix[col].length; ++row) {
                const { symbol, paylineSymbol } = this.paylinesMatrix[col][row];
                if (symbol && paylineSymbol) {
                    symbol.enableHighlight();
                    paylineSymbol.enableHighlight();
                    paylineSymbol.playAnimation();
                }
            }
        }
    },
});