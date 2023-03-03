<template>
  <div class="colorCenter dashboardList">
    <ColorPicker
      v-for="(j, i) in config.value"
      :key="i"
      v-model="config.value[i]"
      :colors="colors"
    />
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {config: Object},
  data() {
    return {
      colors: ['#311B92', '#512DA8', '#673AB7', '#9575CD', '#D1C4E9']
    };
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
  methods: {
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>

/deep/.ivu-input-wrapper {
  cursor: pointer;
}
/deep/.ivu-input-icon {
  display: none;
}
/deep/.ivu-input {
  border: 0px solid #e5e5e5;
  padding: 0;
  height: initial;
  cursor: pointer;
  border-radius: 0 !important;
}
/deep/.ivu-color-picker-color div,
/deep/.ivu-color-picker-color {
  width: 32px;
  height: 32px;
  border-radius: 0px;
}
</style>
