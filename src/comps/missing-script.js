Vue.component("cc-missing-script", {
  template:
    '\n    <ui-prop\n      name="Script"\n      tooltip="{{T(\'INSPECTOR.component.script\')}}"\n      readonly="true"\n      style="padding-top: 8px;"\n    >\n      <ui-asset\n        type="cc.Script"\n        droppable="asset"\n        v-value="target.__scriptAsset.value.uuid"\n        class="flex-1"\n      ></ui-asset>\n    </ui-prop>\n    <div :style="cssBlock">\n      {{message()}}\n    </div>\n  ',
  data: () => ({
    cssBlock: {
      color: "#aa0",
      backgroundColor: "#333",
      border: "1px solid #666",
      borderRadius: "3px",
      margin: "10px",
      padding: "10px",
    },
  }),
  props: { target: { twoWay: true, type: Object } },
  methods: {
    T: Editor.T,
    message() {
      let t = this.target.compiled.value
        ? "COMPONENT.missing_scirpt.error_compiled"
        : "COMPONENT.missing_scirpt.error_not_compiled";
      return Editor.T(t);
    },
  },
});
