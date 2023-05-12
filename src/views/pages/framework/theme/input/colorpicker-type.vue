<template>
  <div>
    <ColorPicker v-model="config.value" :colors="colors" />
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {config: [Object, String]},
  data() {
    return {
      colors: ['#311B92', '#512DA8', '#673AB7', '#9575CD', '#D1C4E9']
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {

  },
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
  watch: {
  }
};
</script>
<style lang="less" scoped>
/deep/ .ivu-color-picker-confirm-color-editable {
  top: 4px;
}
</style>
