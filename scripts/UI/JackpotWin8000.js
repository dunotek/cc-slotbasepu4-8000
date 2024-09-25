const { formatMoney, tweenMoney } = require('utils');
const { reverseEasing } = require('globalAnimationLibrary');

cc.Class({
    extends: require('JackpotWinv2'),
    properties:{

    },

    enter() {
        //this.playSoundStart();
        this.label.string = '';
        this.label.node.active = true;
        this.layout.opacity = 0;
        this.node.opacity = 255;

        const delayShow = 0.5;
        const delayCounting = 2.7;

        cc.tween(this.node)
            .delay(delayShow)
            .call(() => {
                this.startParticle();
                this.initValue();
            })
            .delay(delayCounting)
            .call(() => this.startUpdateWinAmount())
            .start();

        cc.tween(this.layout)
            .to(0.5, { opacity: 200 })
            .start();
    },

    startParticle() {
        // [this.coinsEffect, this.coinsEffect2].forEach(effect => {
        //     effect.opacity = 0;
        //     effect.emit('PLAY_ANIMATIONS');
        //     effect.emit('RESET_PARTICLE');
        //     cc.tween(effect)
        //         .delay(0.1)
        //         .to(0.1, { opacity: 255 })
        //         .start();
        // });
    },

    stopParticle() {
        // this.coinsEffect.emit('STOP_PARTICLE');
        // this.coinsEffect2.emit('STOP_PARTICLE');
    },

    playSoundStart() {
        // if (this.node.soundPlayer) {
        //     this.node.soundPlayer.pauseMusic();
        //     this.node.soundPlayer.playSFXId('sfxJackpot');
        // }
    },

    playSoundEnd() {
        if (this.node.soundPlayer) {
            this.node.soundPlayer.stopSFXId('sfxJackpot');
            this.node.soundPlayer.playSFXId('sfxJackpotEnd');
        }
    },

    stopCountSound() {
        if (this.node.soundPlayer) {
            this.node.soundPlayer.stopSFXId('sfxCounting');
            this.node.soundPlayer.playSFXId('sfxCountingEnd');
        }
    },

    startUpdateWinAmount() {
        // if (this.node.soundPlayer) {
        //     this.node.soundPlayer.playSoundId('sfxCounting', true);
        // }

        const speedUpEasing = t => t * t; // constant accelerated
        const countingTime = this.animDuration - 1;
        this._tweenMoney && this._tweenMoney.stop();
        this._tweenMoney = tweenMoney(this.label, countingTime, this.content.winAmount, {
            gap: 3,
            easing: speedUpEasing,
            onComplete: () => {
                this.stopParticle();
                this.stopCountSound();
            }
        }).delay(1)
            .call(() => {
                if (this.node.gSlotDataStore && this.node.gSlotDataStore.isAutoSpin) {
                    this.skippable = false;
                    this._tweenMoney = null;
                    this.finish();
                }
            })
            .start();
    },

    onClick() {
        if (!this.isUpdating || this.speedUp) return;
        if (!this.skippable) return;

        this.speedUp = true;
        this.winAmount.stopAllActions();
        this.playSoundEnd();
        this.stopParticle();
        this.stopCountSound();

        this._tweenMoney && this._tweenMoney.stop();
        this._tweenMoney = tweenMoney(this.label, 1, this.content.winAmount, {
            onComplete: () => {
                this.finish();
                this._tweenMoney = null;
            }
        })
    },

    finish() {
        this.isUpdating = false;
        this.label.string = formatMoney(this.content.winAmount);

        cc.tween(this.node)
            .delay(this.delayShowTime)
            .call(() => {
                this.label.string = '';
                this.label.node.active = false;
                // this.jackpotSpine.setAnimation(0, 'Disappear', false);
                cc.tween(this.node)
                    .to(0.5, { opacity: 0 })
                    .start();
            })
            .delay(this.hideTime)
            .call(() => {
                if (this.node.soundPlayer) {
                    this.node.soundPlayer.stopAllAudio();
                    this.node.soundPlayer.playMainBGM();
                }
                this.exit(); // exit cutscene
            })
            .start();
    },

    exit() {
        this.node.stopAllActions();
        this._tweenMoney && this._tweenMoney.stop();
        this._super();
    },

    update() {},
});