const { formatMoney, tweenMoney } = require('utils');
const { reverseEasing } = require('globalAnimationLibrary');

cc.Class({
    extends: require('WinEffectv2'),

    properties:{
        animation: sp.Skeleton,
        bigWinDuration: 8,
        megaWinDuration: 2,
        superWinDuration: 2,
    },

    onLoad(){
        this._super();
    },

    initValue() {
        this.canFinish = false;
        this.winInfo.scale = 1;
        this.currentValue = 0;
        this.currentTitle = BIG_WIN_TYPE.BIG_WIN;
        this.label.string = '';
        this.megaWinAmount = this.content.currentBetData * this.megaRate;
        this.superWinAmount = this.content.currentBetData * this.superRate;
        const { bigWinConfig, currentBetData } = this.content;
        if (bigWinConfig) {
            const listConfig = bigWinConfig ? bigWinConfig.split(',') : [];
            if (listConfig.length) {
                this.megaWinAmount = currentBetData * listConfig[BIG_WIN_TYPE.MEGA_WIN];
                this.superWinAmount = currentBetData * listConfig[BIG_WIN_TYPE.SUPER_WIN];
            }
        }

        this.animDuration = this.superWinDuration;
        this.isUpdating = true;
        this.speedUp = false;
        this.bindQuickShow();
    },

    enter() {
        const { gameSpeed, modeTurbo } = this.node.gSlotDataStore;
        const isF2R = gameSpeed === this.node.config.GAME_SPEED.INSTANTLY;
        const isFastEffect = modeTurbo || isF2R;

        this.node.stopAllActions();
        isFastEffect ? this.showFastEffectWin() : this.showEffectWin();
        this.node.fullDisplay = !isFastEffect;
    },

    showEffectWin() {
        this.animation.node.active = true;
        this.winInfo.opacity = 255;

        this.isShowNormalEffect = true;
        if (this.overlayNode) {
            this.overlayNode.active = true;
        }

        this.winInfo.opacity = 255;

        const scaleTime = 0.2;
        this.winAmount.stopAllActions();

        cc.tween(this.winAmount)
            .repeatForever(
                cc.tween(this.winAmount)
                    .to(scaleTime, { scale: 1.2 })
                    .to(scaleTime, { scale: 1 }))
            .start();

        this.initValue();
        this.startParticle();
        this.startUpdateWinAmount();
    },

    showFastEffectWin() {  // turbo
        this.animation.node.active = false;
        if (this.isShowFastEffect) return;

        this.isShowFastEffect = true;
        this.winInfo.opacity = 0;
        if (this.overlayNode) {
            this.overlayNode.active = false;
        }

        this.startParticle();

        this._fastEffectAction && this._fastEffectAction.stop();
        this._fastEffectAction = cc.tween(this.node)
            .delay(1)
            .call(() => {
                // this.callback && this.callback();
                // this.callback = null;
                this.stopParticle();
            })
            .delay(2)
            .call(() => {
                this.callback && this.callback();
                this.callback = null;
                this.exit();
            })
            .start();
    },

    startUpdateWinAmount() {
        if (this.canFinish) return;

        const winAmount = this.content.winAmount;
        let animDuration = this.bigWinDuration;

        this.playSoundStart();
        const speedUpEasing = t => t * t;
        this._tweenMoney && this._tweenMoney.stop();
        this._tweenMoney = tweenMoney(this.label, animDuration - 1, winAmount, {
            gap: 3,
            easing: speedUpEasing,
            onComplete: () => {
                this.stopCountSound();
                this.stopParticle();
            }
        }).delay(1)
            .call(() => {
                this.skippable = false;
                this._tweenMoney = null;
                this.finish();
            })
            .start();
    },

    playSoundStart() {
        if (this.node.soundPlayer) {
            this.node.soundPlayer.pauseMusic();
            // this.node.soundPlayer.playSFXBigwin(this.bigWinNumber);
            this.node.soundPlayer.playSoundId('sfxCounting', true);
        }
    },

    playSoundEnd() {
        if (this.node.soundPlayer) {
            this.node.soundPlayer.stopSFXId('sfxBigWin');
            this.node.soundPlayer.playSFXId('sfxBigWinEnd');
        }
    },

    stopCountSound() {
        if (this.node.soundPlayer) {
            this.node.soundPlayer.stopSFXId('sfxCounting');
            this.node.soundPlayer.playSFXId('sfxCountingEnd');
        }
    },

    startParticle() {
        // [this.coinsEffect, this.coinsEffect2].forEach(effect => {
        //     effect.opacity = 1;
        //     effect.emit('PLAY_ANIMATIONS');
        //     effect.emit('RESET_PARTICLE');
        //     cc.tween(effect)
        //         .to(0.2, { opacity: 255 })
        //         .start();
        // });
    },

    stopParticle() {
        // this.coinsEffect.emit('STOP_PARTICLE');
        // this.coinsEffect2.emit('STOP_PARTICLE');
    },

    finish() {
        this.isUpdating = false;
        this.label.string = formatMoney(this.content.winAmount);

        this.node.stopAllActions();
        cc.tween(this.node)
            .delay(this.hideTime)
            .call(() => {
                this.tweenLabel = cc.tween(this.label.node)
                    .to(0.5, { opacity: 0 })
                    .call(() => {
                        this.tweenLabel = null;
                    })
                    .start();
            })
            .delay(this.delayShowTime / 2)
            .call(() => {
                if (this.node.soundPlayer) {
                    this.node.soundPlayer.stopAllAudio();
                    this.node.soundPlayer.playMainBGM();
                }

                this.isSkipped = false;
                this.label.string = '';
                this.label.node.opacity = 255;
                this.exit();
            })
            .start();
    },

    onClick() {
        if (!this.isUpdating || this.speedUp || this.canFinish || !this.skippable) return;

        this.canFinish = true;
        this.speedUp = true;
        const scaleTime = 0.13;
        if (this.currentTween) {
            this.currentTween.stop();
            this.currentTween = null;
        }

        cc.tween(this.winAmount)
            .to(scaleTime, { scale: 1.2 })
            .to(scaleTime, { scale: 1 })
            .start();

        this.playSoundEnd();
        this.stopCountSound();
        this.stopParticle();

        this._tweenMoney && this._tweenMoney.stop();
        this._tweenMoney = tweenMoney(this.label, 1, this.content.winAmount, {
            onComplete: () => {
                this.finish();
                this._tweenMoney = null;
            }
        })
    },

    update() {},
});