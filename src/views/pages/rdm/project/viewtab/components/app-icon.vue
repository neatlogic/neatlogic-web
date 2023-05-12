<template>
  <div
    class="app-icon"
    :style="{
      background: app.color
    }"
  >
    {{ app.type.toUpperCase() }}
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    app: { type: Object }
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
  color:#fff;
  padding: 0px 3px 0px 3px;
  border-radius: 3px;
  display: inline-block;
  font-size: 12px !important;
  transform: scale(0.75);
}
</style>
