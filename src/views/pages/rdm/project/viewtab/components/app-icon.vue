<template>
  <div class="app-icon" :style="'background:' + (app ? app.color : appColor) + ';' + (size == 'small' ? 'padding:0px 6px' : '')">
    <span v-if="size === 'normal'">{{ app ? app.type.toUpperCase() : appType && appType.toUpperCase() }}</span>
    <span v-else>{{ app ? app.type.toUpperCase().substr(0, 1) : appType && appType.toUpperCase().substr(0, 1) }}</span>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    size: { type: String, default: 'normal' },
    app: { type: Object },
    appType: { type: String },
    appColor: { type: String }
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.app-icon {
  color: #fff;
  padding: 0px 3px 0px 3px;
  border-radius: 3px;
  display: inline-block;
  font-size: 12px !important;
  transform: scale(0.75);
  line-height: 18px;
}
</style>
