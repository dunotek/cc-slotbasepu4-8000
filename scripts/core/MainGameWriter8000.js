cc.Class({
    extends: require('SlotGameWriter'),

    makeScriptResultReceive() {
        const { matrix, jpInfo } = this.node.gSlotDataStore.playSession;

        let listScript = [];

        if (jpInfo) {
            listScript.push({
                command: "_pauseUpdateJP"
            });
        }

        listScript.push({
            command: "_resultReceive",
            data: matrix,
        });

        listScript.push({
            command: "_showResult",
            data: matrix,
        });

        return listScript;
    },

    makeScriptGameFinish() {
        const { winAmountPS } = this.node.gSlotDataStore.playSession;
        const listScript = [];
        listScript.push({
            command: "_resumeWallet",
        });
        listScript.push({
            command: "_updateWallet",
        });

        if (this.node.mainDirector.trialMode && winAmountPS) {
            listScript.push({
                command: '_updateTrialWallet',
                data: winAmountPS,
            });
        }
        return listScript;
    }
});