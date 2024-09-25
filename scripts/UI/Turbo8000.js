cc.Class({
    extends: require('Turbo'),

    properties: {
        turboOn: cc.Node,
        turboOff: cc.Node,
    },

    // turnOnTurbo() {
    //     if (this.node.soundPlayer && !this.firstLoad)
    //         this.node.soundPlayer.playSFXId('sfxTurboOn');

    //     this.turboOff.active = false;
    //     this.turboOn.active = true;
    //     this.button.getComponent(cc.Toggle).isChecked = true;
       
    //     this.turboToggle()
    // },

    // turnOffTurbo() {
    //     if (this.node.soundPlayer && !this.firstLoad)
    //         this.node.soundPlayer.playSFXId('sfxTurboOff');
        
    //     this.turboOff.active = true;
    //     this.turboOn.active = false;
    //     this.button.getComponent(cc.Toggle).isChecked = false;
       
    //     this.turboToggle()
    // },

    // turboToggle() {
    //     const isCheck = this.button.getComponent(cc.Toggle).isChecked;
    //     this.setValueTurboConfig(isCheck);
    //     this.node.emit('TURBO_TOGGLE', isCheck);
    // },
});
