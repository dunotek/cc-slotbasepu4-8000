const BoneAttachment8000 = cc.Class({
    name: 'BoneAttachment8000',
    properties: {
        boneName: "",
        target: { type: cc.Node, default: null, tooltip: 'target must child of spine' },
        isLockScale: true,
        isLockRotation: true,
        isLockSkew: true,
    },
});

cc.Class({
    extends: cc.Component,
    properties: {
        bones: [BoneAttachment8000],
    },
    editor: { requireComponent: sp.Skeleton, disallowMultiple: true, executeInEditMode: true },

    onLoad() {
        this._spine = this.node.getComponent(sp.Skeleton);
        if (this._spine) {
            this.bones.forEach(attach => {
                let bone = this._spine.findBone(attach.boneName);
                if (bone) {
                    attach.bone = bone;

                    attach.target.x = attach.bone.worldX;
                    attach.target.y = attach.bone.worldY;
                }
            });
            // Editor.log('bones', this._spine._skeleton.data.bones.map(b => { return b.name }));
        }
    },

    update() {
        if (CC_EDITOR) return;

        if (this.node.active && this.node.activeInHierarchy) {
            this.bones.forEach(attach => this.updateAttachment(attach));
        }
    },

    updateAttachment(attach) {
        if (!attach || !attach.bone || !attach.target) return;

        attach.target.x = attach.bone.worldX;
        attach.target.y = attach.bone.worldY;

        if (!attach.isLockScale) {
            attach.target.scaleX = attach.bone.scaleX;
            attach.target.scaleY = attach.bone.scaleY;
        }

        if (!attach.isLockSkew) {
            attach.target.skewX = attach.bone.shearX;
            attach.target.skewY = attach.bone.shearY;
        }

        if (!attach.isLockRotation && attach.target.angle != -attach.bone.rotation) {
            attach.target.angle = -attach.bone.rotation;
        }
    }
});
