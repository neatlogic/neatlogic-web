<template>
  <TsDialog v-bind="dialogSetting" @on-close="closeDialog" @on-cancel="closeDialog">
    <template v-slot>
      <div class="network-dialog-wrapper">
        <span
          v-for="(item) in networkList"
          :key="item.id"
          class="networkip-mask-list border-color bg-op radius-sm mb-xs"
        >
          {{ item.networkIp }} / {{ item.mask }}
        </span>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {},
  directives: {},
  props: {
    networkList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      dialogSetting: {
        title: '查看更多网段IP/子网掩码',
        type: 'modal',
        width: 'small',
        isShow: true,
        hasFooter: false,
        maskClose: true
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
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
.network-dialog-wrapper {
  display: flex;
  flex-wrap: wrap;
  .networkip-mask-list {
    border: 1px solid;
    padding: 6px;
    margin-right: 10px;
    margin-bottom: 10px;
    white-space: nowrap;
  }
}
</style>
