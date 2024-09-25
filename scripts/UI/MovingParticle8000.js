cc.Class({
    extends: cc.Component,

    properties: {
        particleMovingPrefabName: 'ProjectTileScatter',
        particleExplodingPrefabName: 'ImpactFreeSpin',
        destination: cc.Node,
      
        sfxParticleMoving: 'sfxParticleFly',
        sfxParticleExplosion: 'sfxMoreFree',
        sfxParticleHit: 'PARTICLE_HIT',
    },

    onLoad() {
        this._vfxProjectileUsing = [];
        this.poolFactory = this.node.poolFactory;

        //event
        this.node.on('MOVE_PARTICLES', this.moveParticleList, this);
        this.node.on('PLAY_EXPLOSION', this.playExplosion, this);
        this.node.on('RESET_PARTICLES', this.resetParticles, this);

        this.explosionDuration = 0.8;
        this.particleMoving = 0.5;
        this.delayExplosion = this.particleMoving - 0.05;
        this.delayShowResult = 0.25;
    },

    moveParticleList(listPos, callback) {
        if (this.node.soundPlayer && this.sfxParticleMoving) this.node.soundPlayer.playSFXId(this.sfxParticleMoving);
        listPos.forEach(pos => this.moveParticle(pos, this.particleMoving));

        cc.tween(this.node)
            .delay(this.delayExplosion)
            .call(() => {
                this.playExplosion();
            })
            .delay(this.delayShowResult)
            .call(() => {
                callback && callback();
            })
            .start();
    },

    playExplosion() {
        const explodingParticle = this.poolFactory.getObject(this.particleExplodingPrefabName);
        if (explodingParticle) {
            explodingParticle.parent = this.node;
            explodingParticle.active = true;
            explodingParticle.position = this.destination.position;

            explodingParticle.emit('RESET_PARTICLE');
            explodingParticle.getComponent(cc.Animation).play();

            cc.tween(this.node)
                .delay(this.explosionDuration)
                .call(() => {
                    explodingParticle.emit('STOP_PARTICLE');
                    this.poolFactory.removeObject(explodingParticle);
                })
                .start();
        }
    },

    moveParticle(fromPos, movingTime) {
        const movingParticle = this.poolFactory.getObject(this.particleMovingPrefabName);
        if (movingParticle) {
            movingParticle.parent = this.node;
            movingParticle.active = true;
            movingParticle.opacity = 255;
            movingParticle.setPosition(fromPos);
            movingParticle.emit('RESET_PARTICLE');

            this._vfxProjectileUsing.push(movingParticle);
            let bezierCurve = this.randomBezier(movingParticle.position, this.destination.position, movingTime);

            movingParticle.stopAllActions();
            cc.tween(movingParticle)
                .sequence(
                    bezierCurve,
                    cc.tween()
                        .call(() => {
                            if (this.soundPlayer && this.sfxParticleHit) this.soundPlayer.playSfx(this.sfxParticleHit);
                            movingParticle.emit('STOP_PARTICLE');
                            movingParticle.tweenFade = cc.tween(movingParticle)
                                .to(0.2, { opacity: 0 })
                                .start();
                        })
                        .delay(1)
                        .call(() => {
                            this.poolFactory.removeObject(movingParticle);
                            this._vfxProjectileUsing.shift();
                        })
                )
                .start();
        }
    },

    resetParticles() {
        this._vfxProjectileUsing.forEach(obj => {
            obj.emit('STOP_PARTICLE');
            obj.stopAllActions();
        });
        this.node.stopAllActions();

        this._vfxProjectileUsing = [];
    },

    randomBezier(obj, target, time) {
        const distanceX = Math.abs(obj.x - target.x);
        let curvePoint1 = cc.v2(Math.random() * distanceX + Math.min(target.x, obj.x), obj.y);
        return cc.bezierTo(time, [obj, curvePoint1, target]);
    },
});
