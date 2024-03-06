<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot>
      <JsonViewer
        v-if="data"
        copyable
        :value="data"
        theme="bg"
      ></JsonViewer>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.close') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    JsonViewer: resolve => require(['vue-json-viewer'], resolve)
  },
  props: {
    data: { type: Object }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        title: '详细信息',
        width: 'medium',
        isShow: true
      }
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
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.bg {
  background: transparent !important;
}
/deep/.jv-code {
  padding: 0px !important;
}
/deep/.top {
  vertical-align: top !important;
}
</style>
