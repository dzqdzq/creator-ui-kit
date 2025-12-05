Vue.component("cc-sprite", {
  dependencies: ["packages://inspector/share/blend.js"],
  template:
    '\n    <ui-prop\n      style="padding-top: 8px"\n      name="Atlas"\n      tooltip="{{T(\'COMPONENT.sprite.atlas\')}}"\n    >\n      <ui-asset class="flex-1"\n        type="sprite-atlas"\n        v-value="target._atlas.value.uuid"\n        v-values="atlasUuids"\n        :multi-values="atlasMulti"\n      ></ui-asset>\n      <ui-button\n        class="blue tiny"\n        tooltip="{{T(\'COMPONENT.sprite.select_tooltip\')}}"\n        @confirm="selectAtlas"\n      >\n        {{T(\'COMPONENT.sprite.select_button\')}}\n      </ui-button>\n    </ui-prop>\n\n    <ui-prop\n      style="padding-top: 8px"\n      name="Sprite Frame"\n      tooltip="{{T(\'COMPONENT.sprite.sprite_frame\')}}"\n    >\n      <ui-asset class="flex-1"\n        type="sprite-frame"\n        v-value="target.spriteFrame.value.uuid"\n        v-values="spriteUuids"\n        :multi-values="spriteMulti"\n      ></ui-asset>\n      <ui-button\n        class="blue tiny"\n        tooltip="{{T(\'COMPONENT.sprite.edit_tooltip\')}}"\n        @confirm="editSprite"\n      >\n        {{T(\'COMPONENT.sprite.edit_button\')}}\n      </ui-button>\n    </ui-prop>\n\n    <ui-prop \n      v-prop="target.type"\n      :multi-values="multi"\n    ></ui-prop>\n\n    <div v-if="isFilledType()">\n      <ui-prop indent=1 \n        v-prop="target.fillType"\n        :multi-values="multi"\n      ></ui-prop>\n      <ui-prop indent=1 \n        v-prop="target.fillCenter"\n        v-disabled="!isRadialFilled()"\n        :multi-values="multi"\n      ></ui-prop>\n      <ui-prop indent=1 \n        v-prop="target.fillStart"  \n        :multi-values="multi"\n      ></ui-prop>\n      <ui-prop indent=1\n        v-prop="target.fillRange"\n        :multi-values="multi"\n      ></ui-prop>\n    </div>\n\n    <ui-prop\n      v-prop="target.sizeMode"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop v-if="allowTrim()"\n      v-prop="target.trim"\n      :multi-values="multi"\n    ></ui-prop>\n\n    <cc-blend-section :target.sync="target"></cc-blend-section>\n    <cc-array-prop :target.sync="target.materials"></cc-array-prop>\n\n  ',
  props: {
    target: { twoWay: true, type: Object },
    multi: { twoWay: true, type: Boolean },
  },
  data: () => ({
    atlasUuid: "",
    atlasUuids: "",
    atlasMulti: false,
    spriteUuid: "",
    spriteUuids: "",
    spriteMulti: false,
  }),
  created() {
    if (this.target) {
      this._updateAtlas();
      this._updateSprite();
    }
  },
  watch: {
    target() {
      this._updateAtlas();
      this._updateSprite();
    },
  },
  methods: {
    T: Editor.T,
    selectAtlas() {
      Editor.Ipc.sendToPanel("assets", "change-filter", "t:sprite-atlas");
    },
    editSprite() {
      Editor.Panel.open("sprite-editor", {
        uuid: this.target.spriteFrame.value.uuid,
      });
    },
    allowTrim() {
      return this.target.type.value === cc.Sprite.Type.SIMPLE;
    },
    isFilledType() {
      return this.target.type.value === cc.Sprite.Type.FILLED;
    },
    isRadialFilled() {
      return this.target.fillType.value === cc.Sprite.FillType.RADIAL;
    },
    _updateAtlas() {
      if (!this.target) {
        this.atlasUuid = "";
        this.atlasUuids = "";
        this.atlasMulti = false;
        return undefined;
      }
      this.atlasUuid = this.target._atlas.value.uuid;

      this.atlasUuids = this.target._atlas.values.map((t) => t.uuid);

      const t = this.atlasUuids[0];
      this.atlasMulti = !this.atlasUuids.every((i, e) => e === 0 || i === t);
    },
    _updateSprite() {
      if (!this.target) {
        this.spriteUuid = "";
        this.spriteUuids = "";
        this.spriteMulti = false;
        return undefined;
      }
      this.spriteUuid = this.target.spriteFrame.value.uuid;

      this.spriteUuids = this.target.spriteFrame.values.map((t) => t.uuid);

      const t = this.spriteUuids[0];
      this.spriteMulti = !this.spriteUuids.every((i, e) => e === 0 || i === t);
    },
  },
});
