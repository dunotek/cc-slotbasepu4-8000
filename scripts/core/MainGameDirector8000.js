cc.Class({
    extends: require('SlotGameDirector'),

    extendInit() {
        this.listScriptAsync = [];
        this.guiMgr = this.node.mainDirector.guiMgr;
    },

    switchToTrial() {
        this.resetAsyncScript();
        this._super();
    },

    fastToResultClick() {
        this._super();
        this.resetAsyncScript();
    },

    skipAllEffects() {
        this.resetAsyncScript();
        this._super();
    },

    resetAsyncScript() {
        if (!this.listScriptAsync || !this.listScriptAsync.length) return;
        this.isResetAsyncScript = true;
        while (this.listScriptAsync.length > 0) {
            const command = this.listScriptAsync.shift();
            if (command) {
                const { callback, isSkippable, name } = command;
                if (!isSkippable) {
                    if (name) cc.log(this.name + ' run resetAsyncScript: ', name);
                    callback && callback(true);
                }
            }
        }
        this.isResetAsyncScript = false;
    },

    _runAsyncScript(script) {
        this.executeNextScript(script);
        this.runAsyncScript();
    },

    runAsyncScript() {
        if (this.isResetAsyncScript) return;
        const command = this.listScriptAsync.shift();
        if (command) {
            const { callback, name } = command;
            if (name) cc.log(this.name + ' run AsyncScript: ', name);
            callback && callback();
        }
    },

    _showResult(script) {
        this.hasPayline = true;
        this._super(script);
    },

    _blinkAllPaylines(script) {
        if (this.canStoreAsyncScript()) {
            const callback = () => {
                this.table.emit("BLINK_ALL_NORMAL_PAYLINES", this.runAsyncScript.bind(this));
            };
            this.storeAsyncScript(script, { callback, name: "_blinkAllPaylines", isSkippable: true });
        } else {
            this.table.emit("BLINK_ALL_NORMAL_PAYLINES", this.executeNextScript.bind(this, script));
        }
    },

    _showNormalPayline(script) {
        if (this.canStoreAsyncScript()) {
            const callback = () => {
                this.node.mainDirector.onIngameEvent("SHOW_NORMAL_PAYLINE");
                this.table.emit("SHOW_ALL_NORMAL_PAYLINES");
                this.runAsyncScript();
                this.node.mainDirector.onIngameEvent("ON_SHOW_NORMAL_PAYLINE");
            };
            this.storeAsyncScript(script, { callback, name: "_showNormalPayline", isSkippable: true });
        } else {
            this.table.emit("SHOW_ALL_NORMAL_PAYLINES");
            this.executeNextScript(script);
        }
    },

    _updateWinningAmount(script, { winAmount, time }) {
        if (this.canStoreAsyncScript()) {
            const callback = () => {
                this.winAmount.emit("UPDATE_WIN_AMOUNT", { value: winAmount, time });
                this.runAsyncScript();
            };
            this.storeAsyncScript(script, { callback, name: "_updateWinningAmount", isSkippable: false });
        } else {
            this.winAmount.emit("UPDATE_WIN_AMOUNT", { value: winAmount, time });
            this.executeNextScript(script);
        }
    },

    _showCutscene(script, { name, content }) {
        if (this.canStoreAsyncScript() && name !== 'DialogMessage') {
            const callback = () => {
                if (this.node.mainDirector) {
                    this.node.mainDirector.showCutscene(name, content, () => {
                        this.runAsyncScript();
                    });
                }
            };
            this.storeAsyncScript(script, { callback, name: "_showCutscene", isSkippable: true });
        } else {
            this._super(script, { name, content });
        }
    },
});