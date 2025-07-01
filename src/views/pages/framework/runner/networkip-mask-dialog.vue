<template>
  <TsDialog v-bind="dialogSetting" @on-close="closeDialog" @on-cancel="closeDialog">
    <template v-slot>
      <div class="network-dialog-wrapper">
        <TsRow :gutter="10">
          <template v-for="(item) in networkList">
            <Col
              :key="item.id"
              :span="8"
            >
              <div class="networkip-mask-list border-color bg-op radius-sm text-center overflow" :title="getNetworkIpMask(item)">
                {{ getNetworkIpMask(item) }}
              </div>
            </Col>
          </template>  
        </TsRow>
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
        width: 'medium',
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
  computed: {
    getNetworkIpMask() {
      return (item) => {
        return item.networkIp + ' / ' + item.mask;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
.network-dialog-wrapper {
  .networkip-mask-list {
    border: 1px solid;
    padding: 6px;
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>
