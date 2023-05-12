<template>
  <div>
    <Alert v-if="!$utils.isEmpty(serviceData) && (serviceData.configExpired) && !$utils.isEmpty(serviceData.configExpiredReason)" type="warning" show-icon>
      <div>
        <span class="text-danger">{{ $t('term.autoexec.servicehasexpired') }}</span>
        <div class="mt-sm">{{ $t('page.reason') }}：</div>
        <div
          v-for="(item, index) in serviceData.configExpiredReason.reasonList"
          :key="index"
          class="mt-sm text-href"
          @click.stop="tocatalogManagePage(item.key)"
        >
          {{ item.description }}
        </div>
      </div>
    </Alert>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    serviceData: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String, // 可选 openNewWindow || location
      default: 'openNewWindow'
    }
  },
  data() {
    return {
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
    tocatalogManagePage(key) {
      if (this.type == 'openNewWindow') {
        // 跳转到目录管理页面，定位到具体失效的作业参数
        window.open(HOME + '/autoexec.html#/catalog-manage?id=' + this.serviceData.id + '&key=' + key, '_blank');
      } else {
        this.$emit('click', key);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
