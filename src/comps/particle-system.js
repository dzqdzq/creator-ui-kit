import t from "fire-fs";
import e from "fire-path";
import a from "plist";
Vue.component("cc-particle-system", {
  dependencies: ["packages://inspector/share/blend.js"],
  template:
    '\n    <ui-prop\n      v-prop="target.preview"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.playOnLoad"\n      :multi-values="multi"\n      tooltip="{{T(\'COMPONENT.particle_system.playOnLoad\')}}"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.autoRemoveOnFinish"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.file"\n      :multi-values="multi"\n    ></ui-prop>\n\n    <ui-prop name="Custom" tooltip="{{T(\'COMPONENT.particle_system.custom\')}}">\n        <ui-checkbox class="flex-1"\n          v-value="target.custom.value"\n          v-values="target.custom.values"\n          :multi-values="_checkCustomMulti(target.custom, multi)"\n          @change="onCustomChange"\n        >\n        </ui-checkbox>\n        <ui-button v-show="target.custom.value && target.file.value.uuid"\n          :title="T(\'COMPONENT.particle.sync_tips\')"\n          v-disabled="multi"\n          @confirm="applyPlistData"\n        >\n          {{T(\'COMPONENT.particle.sync\')}}\n        </ui-button>\n        <ui-button v-show="target.custom.value"\n          :title="T(\'COMPONENT.particle.export_title\')"\n          v-disabled="multi"\n          @confirm="saveCustomData"\n        >\n          {{T(\'COMPONENT.particle.export\')}}\n        </ui-button>\n    </ui-prop>\n\n    <template v-if="_checkCustomShow(target.custom, multi)">\n      <ui-prop\n        v-prop="target.spriteFrame"\n        :multi-values="multi"\n        tooltip="{{T(\'COMPONENT.particle_system.spriteFrame\')}}"\n      ></ui-prop>\n      <ui-prop\n        v-prop="target.duration"\n        :multi-values="multi"\n        tooltip="{{T(\'COMPONENT.particle_system.duration\')}}"\n      ></ui-prop>\n      <ui-prop\n        v-prop="target.emissionRate"\n        :multi-values="multi"\n        tooltip="{{T(\'COMPONENT.particle_system.emissionRate\')}}"\n      ></ui-prop>\n      <ui-prop\n        :name="target.life.name"\n        tooltip="{{T(\'COMPONENT.particle_system.life\')}}"\n      >\n        <ui-num-input class="flex-1"\n          v-value="target.life.value"\n          v-values="target.life.values"\n          :multi-values="_updateMultiValues(target.life, multi)"\n        ></ui-num-input>\n        <ui-num-input class="flex-1"\n          v-value="target.lifeVar.value"\n          v-values="target.lifeVar.values"\n          :multi-values="_updateMultiValues(target.lifeVar, multi)"\n        ></ui-num-input>\n      </ui-prop>\n      <ui-prop\n        v-prop="target.totalParticles"\n        :multi-values="multi"\n        tooltip="{{T(\'COMPONENT.particle_system.totalParticles\')}}"\n      ></ui-prop>\n      <ui-prop\n        v-prop="target.startColor"\n        :multi-values="multi"\n        tooltip="{{T(\'COMPONENT.particle_system.startColor\')}}"\n      ></ui-prop>\n      <ui-prop indent=1\n        v-prop="target.startColorVar"\n        :multi-values="multi"\n        tooltip="{{T(\'COMPONENT.particle_system.startColorVar\')}}"\n      ></ui-prop>\n      <ui-prop\n        v-prop="target.endColor"\n        :multi-values="multi"\n        tooltip="{{T(\'COMPONENT.particle_system.endColor\')}}"\n      ></ui-prop>\n      <ui-prop indent=1\n        v-prop="target.endColorVar"\n        :multi-values="multi"\n        tooltip="{{T(\'COMPONENT.particle_system.endColorVar\')}}"\n      ></ui-prop>\n\n      <ui-prop\n        :name="target.angle.name"\n        tooltip="{{T(\'COMPONENT.particle_system.angle\')}}"\n      >\n        <ui-num-input class="flex-1"\n          v-value="target.angle.value"\n          v-values="target.angle.values"\n          :multi-values="_updateMultiValues(target.angle, multi)"\n        ></ui-num-input>\n        <ui-num-input class="flex-1"\n          v-value="target.angleVar.value"\n          v-values="target.angleVar.values"\n          :multi-values="_updateMultiValues(target.angleVar, multi)"\n        ></ui-num-input>\n      </ui-prop>\n\n      <ui-prop\n        :name="target.startSize.name"\n        tooltip="{{T(\'COMPONENT.particle_system.startSize\')}}"\n      >\n        <ui-num-input class="flex-1"\n          v-value="target.startSize.value"\n          v-values="target.startSize.values"\n          :multi-values="_updateMultiValues(target.startSize, multi)"\n        ></ui-num-input>\n        <ui-num-input class="flex-1"\n          v-value="target.startSizeVar.value"\n          v-values="target.startSizeVar.values"\n          :multi-values="_updateMultiValues(target.startSizeVar, multi)"\n        ></ui-num-input>\n      </ui-prop>\n\n      <ui-prop :name="target.endSize.name" tooltip="{{T(\'COMPONENT.particle_system.endSize\')}}">\n        <ui-num-input class="flex-1"\n          v-value="target.endSize.value"\n          v-values="target.endSize.values"\n          :multi-values="_updateMultiValues(target.endSize, multi)"\n        ></ui-num-input>\n        <ui-num-input class="flex-1"\n          v-value="target.endSizeVar.value"\n          v-values="target.endSizeVar.values"\n          :multi-values="_updateMultiValues(target.endSizeVar, multi)"\n        ></ui-num-input>\n      </ui-prop>\n\n      <ui-prop :name="target.startSpin.name" tooltip="{{T(\'COMPONENT.particle_system.startSpin\')}}">\n        <ui-num-input class="flex-1"\n          v-value="target.startSpin.value"\n          v-values="target.startSpin.values"\n          :multi-values="_updateMultiValues(target.startSpin, multi)"\n        ></ui-num-input>\n        <ui-num-input class="flex-1"\n          v-value="target.startSpinVar.value"\n          v-values="target.startSpinVar.values"\n          :multi-values="_updateMultiValues(target.startSpinVar, multi)"\n        ></ui-num-input>\n      </ui-prop>\n\n      <ui-prop :name="target.endSpin.name" tooltip="{{T(\'COMPONENT.particle_system.endSpin\')}}">\n        <ui-num-input class="flex-1"\n          v-value="target.endSpin.value"\n          v-values="target.endSpin.values"\n          :multi-values="_updateMultiValues(target.endSpin, multi)"\n        ></ui-num-input>\n        <ui-num-input class="flex-1"\n          v-value="target.endSpinVar.value"\n          v-values="target.endSpinVar.values"\n          :multi-values="_updateMultiValues(target.endSpinVar, multi)"\n        ></ui-num-input>\n      </ui-prop>\n\n      <ui-prop\n        v-prop="target.posVar"\n        :multi-values="multi"\n        tooltip="{{T(\'COMPONENT.particle_system.posVar\')}}"\n      ></ui-prop>\n\n      <ui-prop\n        v-prop="target.positionType"\n        :multi-values="multi"\n        tooltip="{{T(\'COMPONENT.particle_system.positionType\')}}"\n      ></ui-prop>\n      <ui-prop\n        v-prop="target.emitterMode"\n        :multi-values="multi"\n        tooltip="{{T(\'COMPONENT.particle_system.emitterMode\')}}"\n      ></ui-prop>\n\n      <div v-if="isGravityMode(target.emitterMode, multi)">\n        <ui-prop indent=1\n          v-prop="target.gravity"\n          tooltip="{{T(\'COMPONENT.particle_system.gravity\')}}"\n        ></ui-prop>\n\n        <ui-prop indent=1\n          :name="target.speed.name"\n          tooltip="{{T(\'COMPONENT.particle_system.speed\')}}"\n        >\n          <ui-num-input class="flex-1"\n            v-value="target.speed.value"\n            v-values="target.speed.values"\n            :multi-values="_updateMultiValues(target.speed, multi)"\n          ></ui-num-input>\n          <ui-num-input class="flex-1"\n            v-value="target.speedVar.value"\n            v-values="target.speedVar.values"\n            :multi-values="_updateMultiValues(target.speedVar, multi)"\n          ></ui-num-input>\n        </ui-prop>\n\n        <ui-prop indent=1\n          :name="target.tangentialAccel.name"\n          tooltip="{{T(\'COMPONENT.particle_system.tangentialAccel\')}}"\n        >\n          <ui-num-input class="flex-1"\n            v-value="target.tangentialAccel.value"\n            v-values="target.tangentialAccel.values"\n            :multi-values="_updateMultiValues(target.tangentialAccel, multi)"\n          ></ui-num-input>\n          <ui-num-input class="flex-1"\n            v-value="target.tangentialAccelVar.value"\n            v-values="target.tangentialAccelVar.values"\n            :multi-values="_updateMultiValues(target.tangentialAccelVar, multi)"\n          ></ui-num-input>\n        </ui-prop>\n\n        <ui-prop indent=1\n          :name="target.radialAccel.name"\n          tooltip="{{T(\'COMPONENT.particle_system.radialAccel\')}}"\n        >\n          <ui-num-input class="flex-1"\n            v-value="target.radialAccel.value"\n            v-values="target.radialAccel.values"\n            :multi-values="_updateMultiValues(target.radialAccel, multi)"\n          ></ui-num-input>\n          <ui-num-input class="flex-1"\n            v-value="target.radialAccelVar.value"\n            v-values="target.radialAccelVar.values"\n            :multi-values="_updateMultiValues(target.radialAccelVar, multi)"\n          ></ui-num-input>\n        </ui-prop>\n\n        <ui-prop indent=1\n          v-prop="target.rotationIsDir"\n          :multi-values="multi"\n          tooltip="{{T(\'COMPONENT.particle_system.rotationIsDir\')}}"\n        ></ui-prop>\n      </div>\n      <div v-if="isRadiusMode(target.emitterMode, multi)">\n        <ui-prop indent=1\n          :name="target.startRadius.name"\n          tooltip="{{T(\'COMPONENT.particle_system.startRadius\')}}"\n        >\n          <ui-num-input class="flex-1"\n            v-value="target.startRadius.value"\n            v-values="target.startRadius.values"\n            :multi-values="_updateMultiValues(target.startRadius, multi)"\n          ></ui-num-input>\n          <ui-num-input class="flex-1"\n            v-value="target.startRadiusVar.value"\n            v-values="target.startRadiusVar.values"\n            :multi-values="_updateMultiValues(target.startRadiusVar, multi)"\n          ></ui-num-input>\n        </ui-prop>\n\n        <ui-prop indent=1\n          :name="target.endRadius.name"\n          tooltip="{{T(\'COMPONENT.particle_system.endRadius\')}}"\n        >\n          <ui-num-input class="flex-1"\n            v-value="target.endRadius.value"\n            v-values="target.endRadius.values"\n            :multi-values="_updateMultiValues(target.ednRadius, multi)"\n          ></ui-num-input>\n          <ui-num-input class="flex-1"\n            v-value="target.endRadiusVar.value"\n            v-values="target.endRadiusVar.values"\n            :multi-values="_updateMultiValues(target.endRadiusVar, multi)"\n          ></ui-num-input>\n        </ui-prop>\n\n        <ui-prop indent=1\n          :name="target.rotatePerS.name"\n          tooltip="{{T(\'COMPONENT.particle_system.rotatePerS\')}}"\n        >\n          <ui-num-input class="flex-1"\n            v-value="target.rotatePerS.value"\n            v-values="target.rotatePerS.values"\n            :multi-values="_updateMultiValues(target.rotatePerS, multi)"\n          ></ui-num-input>\n          <ui-num-input class="flex-1"\n            v-value="target.rotatePerSVar.value"\n            v-values="target.rotatePerSVar.values"\n            :multi-values="_updateMultiValues(target.rotatePerSVar, multi)"\n          ></ui-num-input>\n        </ui-prop>\n      </div>\n\n      <cc-blend-section :target.sync="target"></cc-blend-section>\n    </template>\n  ',
  props: { target: { twoWay: true, type: Object }, multi: { type: Boolean } },
  methods: {
    T: Editor.T,
    isGravityMode: (t, e) =>
      e ? t.values.every((t) => t === 0) : t.value === 0,
    isRadiusMode: (t, e) =>
      e ? t.values.every((t) => t === 1) : t.value === 1,
    onCustomChange(t) {
      Editor.Ipc.sendToPanel("scene", "scene:set-property", {
        id: this.target.uuid.value,
        path: "spriteFrame",
        type: "cc.SpriteFrame",
        value: { uuid: this.target.spriteFrame.value.uuid },
        isSubProp: false,
      });
    },
    saveCustomData() {
      Editor.Ipc.sendToPanel(
        "scene",
        "scene:export-particle-plist",
        this.target.uuid.value
      );
    },
    applyPlistData() {
      let e = this.target;

      if (e.custom.value) {
        cc.assetManager.loadAny(e.file.value.uuid, (i, u) => {
          if (i) {
            Editor.error(i);
            return undefined;
          }
          try {
            let i = a.parse(t.readFileSync(u.nativeUrl, "utf8"));
            this._applyPlistData(i, e.uuid.value);
          } catch (t) {
            Editor.error(t);
          }
        });
      }
    },
    _getValue(t, e) {
      if (t === undefined) {
        return e;
      }
    },
    _applyPlistData(t, a) {
      let i = {};
      i.totalParticles = this._getValue(t.maxParticles, 150);
      i.angle = this._getValue(t.angle, 90);
      i.angleVar = this._getValue(t.angleVariance, 20);
      i.duration = this._getValue(t.duration, -1);

      i.srcBlendFactor = this._getValue(t.blendFuncSource, cc.macro.SRC_ALPHA);

      i.dstBlendFactor = this._getValue(
        t.blendFuncDestination,
        cc.macro.ONE_MINUS_SRC_ALPHA
      );

      let u;
      let n = parseFloat(255 * this._getValue(t.startColorRed, 0));
      let l = parseFloat(255 * this._getValue(t.startColorGreen, 0));
      let r = parseFloat(255 * this._getValue(t.startColorBlue, 0));
      let s = parseFloat(255 * this._getValue(t.startColorAlpha, 0));
      i.startColor = new cc.Color(n, l, r, s);
      n = parseFloat(255 * this._getValue(t.startColorVarianceRed, 0));
      l = parseFloat(255 * this._getValue(t.startColorVarianceGreen, 0));
      r = parseFloat(255 * this._getValue(t.startColorVarianceBlue, 0));
      s = parseFloat(255 * this._getValue(t.startColorVarianceAlpha, 0));
      i.startColorVar = new cc.Color(n, l, r, s);
      n = parseFloat(255 * this._getValue(t.finishColorRed, 0));
      l = parseFloat(255 * this._getValue(t.finishColorGreen, 0));
      r = parseFloat(255 * this._getValue(t.finishColorBlue, 0));
      s = parseFloat(255 * this._getValue(t.finishColorAlpha, 0));
      i.endColor = new cc.Color(n, l, r, s);
      n = parseFloat(255 * this._getValue(t.finishColorVarianceRed, 0));
      l = parseFloat(255 * this._getValue(t.finishColorVarianceGreen, 0));
      r = parseFloat(255 * this._getValue(t.finishColorVarianceBlue, 0));
      s = parseFloat(255 * this._getValue(t.finishColorVarianceAlpha, 0));
      i.endColorVar = new cc.Color(n, l, r, s);
      i.startSize = this._getValue(t.startParticleSize, 0);
      i.startSizeVar = this._getValue(t.startParticleSizeVariance, 0);
      i.endSize = this._getValue(t.finishParticleSize, 0);
      i.endSizeVar = this._getValue(t.finishParticleSizeVariance, 0);

      i.posVar = {
        x: this._getValue(t.sourcePositionVariancex, 0),
        y: this._getValue(t.sourcePositionVariancey, 0),
      };

      i.startSpin = this._getValue(t.rotationStart, 0);
      i.startSpinVar = this._getValue(t.rotationStartVariance, 0);
      i.endSpin = this._getValue(t.rotationEnd, 0);
      i.endSpinVar = this._getValue(t.rotationEndVariance, 0);
      i.emitterMode = this._getValue(t.emitterType, 0);

      i.gravity = {
        x: this._getValue(t.gravityx, 0),
        y: this._getValue(t.gravityy, 0),
      };

      i.speed = this._getValue(t.speed, 0);
      i.speedVar = this._getValue(t.speedVariance, 0);
      i.radialAccel = this._getValue(t.radialAcceleration, 0);
      i.radialAccelVar = this._getValue(t.radialAccelVariance, 0);
      i.tangentialAccel = this._getValue(t.tangentialAcceleration, 0);
      i.tangentialAccelVar = this._getValue(t.tangentialAccelVariance, 0);
      i.startRadius = this._getValue(t.maxRadius, 0);
      i.startRadiusVar = this._getValue(t.maxRadiusVariance, 0);
      i.endRadius = this._getValue(t.minRadius, 0);
      i.endRadiusVar = this._getValue(t.minRadiusVariance, 0);
      i.rotatePerS = this._getValue(t.rotatePerSecond, 0);
      i.rotatePerSVar = this._getValue(t.rotatePerSecondVariance, 0);
      i.rotationIsDir = this._getValue(t.rotationIsDir, "");
      i.life = this._getValue(t.particleLifespan, 0);
      i.lifeVar = this._getValue(t.particleLifespanVariance, 0);

      if (t.emissionRate) {
        i.emissionRate = t.emissionRate;
      } else {
        i.emissionRate = Math.min(i.totalParticles / i.life, Number.MAX_VALUE);
      }

      if (t.spriteFrameUuid) {
        u = t.spriteFrameUuid;
      } else if (t.textureFileName) {
        let a = this.target.file.value.uuid;
        let i = Editor.assetdb.remote.uuidToFspath(a);
        let n = e.parse(t.textureFileName);
        let l = e.join(e.dirname(i), n.name);
        e.extname(l) || ".png";
        let r = e.join(l, n.name);

        if (!(u = Editor.assetdb.remote.fspathToUuid(r))) {
          Editor.warn('Apply Plist Data Warn: Can not find texture "%s"', l);
        }
      }

      if (u) {
        Editor.Ipc.sendToPanel("scene", "scene:set-property", {
          id: a,
          path: "spriteFrame",
          type: "cc.SpriteFrame",
          value: { uuid: u },
          isSubProp: false,
        });
      }

      Editor.Ipc.sendToPanel("scene", "scene:set-property", {
        id: this.target.uuid.value,
        path: "",
        type: "cc.ParticleSystem",
        value: i,
        isSubProp: false,
      });
    },
    _checkCustomMulti: (t, e) => !!e && !t.values.every((t) => !!t),
    _checkCustomShow: (t, e) => (e ? t.values.every((t) => !!t) : !!t.value),
    _updateMultiValues(t, e) {
      if (!e) {
        return false;
      }
      const t_values = t.values;
      const [i] = t_values;
      return !t_values.every((t) => t === i);
    },
  },
});
