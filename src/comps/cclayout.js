Vue.component("cc-layout", {
  template:
    '\n    <ui-prop\n      v-prop="target.type"\n      :multi-values="multi"\n    ></ui-prop>\n    <ui-prop\n      v-prop="target.resizeMode"\n      :multi-values="multi"\n    ></ui-prop>\n\n    <div>\n      <ui-prop\n        v-prop="target.cellSize"\n        :multi-values="multi"\n        v-show="_isShowCellSize()"\n      ></ui-prop>\n      <ui-prop\n        v-prop="target.startAxis"\n        :multi-values="multi"\n        v-show="_isGridLayout()"\n      ></ui-prop>\n      <ui-prop name="Padding"\n        v-show="_isPaddingEnabled()"\n      >\n        <div slot="child" class="layout vertical">\n          <ui-prop name="Left" type="number" indent=1\n            v-value="target.paddingLeft.value"\n            v-values="target.paddingLeft.values"\n            :multi-values="multi"\n            v-show="_isPaddingHorizontalEnabled()"\n          ></ui-prop>\n          <ui-prop name="Right" type="number" indent=1\n            v-value="target.paddingRight.value"\n            v-values="target.paddingRight.values"\n            :multi-values="multi"\n            v-show="_isPaddingHorizontalEnabled()"\n          ></ui-prop>\n          <ui-prop name="Top" type="number" indent=1\n            v-value="target.paddingTop.value"\n            v-values="target.paddingTop.values"\n            :multi-values="multi"\n            v-show="_isPaddingVerticalEnabled()"\n          ></ui-prop>\n          <ui-prop name="Bottom" type="number" indent=1\n            v-value="target.paddingBottom.value"\n            v-values="target.paddingBottom.values"\n            :multi-values="multi"\n            v-show="_isPaddingVerticalEnabled()"\n          ></ui-prop>\n        </div>\n      </div>\n      <ui-prop\n        v-prop="target.spacingX"\n        v-show="_isAllowHorizontalLayout()"\n        :multi-values="multi"\n      ></ui-prop>\n      <ui-prop\n        v-prop="target.spacingY"\n        v-show="_isAllowVerticalLayout()"\n        :multi-values="multi"\n      ></ui-prop>\n      <ui-prop\n        v-prop="target.verticalDirection"\n        v-show="_isAllowVerticalLayout()"\n        :multi-values="multi"\n      ></ui-prop>\n      <ui-prop\n        v-prop="target.horizontalDirection"\n        v-show="_isAllowHorizontalLayout()"\n        :multi-values="multi"\n      ></ui-prop>\n    </div>\n    <ui-prop\n      v-prop="target.affectedByScale"\n      :multi-values="multi"  \n    ></ui-prop>\n  ',
  props: { target: { twoWay: true, type: Object }, multi: { type: Boolean } },
  methods: {
    T: Editor.T,
    _checkValues: (t, e, i) => t.every((t) => (i ? t == e : t != e)),
    _isPaddingEnabled() {
      const t = this.target.type;
      const e = this.target;

      if (this.multi) {
        if (
          !!(
            !this._checkValues(t.values, 0, true) ||
            !this._checkValues(e.values, 1, true)
          )
        ) {
          this._checkValues(t.values, 0, false);
          return false;
        }
      }

      if (
        !(this.target.type.value === 0 && this.target.resizeMode.value === 1)
      ) {
        return this.target.type.value !== 0;
      }
    },
    _isPaddingHorizontalEnabled() {
      return this.multi
        ? this._checkValues(this.target.type.values, 2, false)
        : this.target.type.value !== 2;
    },
    _isPaddingVerticalEnabled() {
      return this.multi
        ? this._checkValues(this.target.type.values, 1, false)
        : this.target.type.value !== 1;
    },
    _isAllowHorizontalLayout() {
      const t = this.target.type;

      if (this.multi) {
        if (!this._checkValues(t.values, 1, true)) {
          return this._checkValues(t.values, 3, true);
        }
      }

      if (!(t.value === 1)) {
        return t.value === 3;
      }
    },
    _isAllowVerticalLayout() {
      const t = this.target.type;

      if (this.multi) {
        if (!this._checkValues(t.values, 2, true)) {
          return this._checkValues(t.values, 3, true);
        }
      }

      if (!(this.target.type.value === 2)) {
        return this.target.type.value === 3;
      }
    },
    _isGridLayout() {
      return this.multi
        ? this._checkValues(this.target.type.values, 3, true)
        : this.target.type.value === 3;
    },
    _isShowCellSize() {
      if (this.multi) {
        return !(
          !this._checkValues(this.target.type.values, 3, true) ||
          !this._checkValues(this.target.resizeMode.values, 2, true)
        );
      }

      if (this.target.type.value === 3) {
        return this.target.resizeMode.value === 2;
      }
    },
  },
});
