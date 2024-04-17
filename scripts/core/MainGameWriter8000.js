cc.Class({
    extends: require('SlotGameWriter'),

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