cc.Class({
    extends: cc.Component,
    properties: {
        particles: [cc.ParticleSystem],
    },

    onLoad() {
        this.node.on('RESET_PARTICLE', this.resetParticle, this);
        this.node.on('STOP_PARTICLE', this.stopParticle, this);
        this.node.on('HIDE_PARTICLE', this.hideParticle, this);
        this.node.on('PLAY_ANIMATIONS', this.playAnimations, this);
        this.node.on('STOP_ANIMATIONS', this.stopAnimations, this);

        if (!this.particles || this.particles.length == 0) {
            this.particles = this.node.getComponentsInChildren(cc.ParticleSystem);
            this._animations = this.node.getComponentsInChildren(cc.Animation);
        }
    },

    resetParticle() {
        this.particles.forEach(particle => {
            particle.node.opacity = 255;
            particle.resetSystem();
        });
    },

    stopParticle() {
        this.particles.forEach(particle => particle.stopSystem());
    },

    hideParticle() {
        this.particles.forEach(particle => {
            particle.node.opacity = 0;
            particle.stopSystem();
        });
    },

    playAnimations() {
        this._animations && this._animations.forEach(anim => anim.play());
    },

    stopAnimations() {
        this._animations && this._animations.forEach(anim => anim.stop());
    },

    update() {
        if (this.node.active && this.node.activeInHierarchy && this._animations.length > 0) {
            this.particles.forEach(particle => particle._applySpriteFrame(null));
        }
    },
});
