Vue.component("cc-tiled-layer", {
  dependencies: ["packages://inspector/share/blend.js"],
  template:
    '\n    <cc-array-prop :target.sync="target.materials"></cc-array-prop>\n\n  ',
  props: {
    target: { twoWay: true, type: Object },
    multi: { twoWay: true, type: Boolean },
  },
});
