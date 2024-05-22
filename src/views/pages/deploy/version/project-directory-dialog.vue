<template>
  <div>
    <TsDialog
      type="slider"
      width="large"
      :isShow="true"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div class="action-group">
          <span class="action-item">{{ $t('term.deploy.projectdirectory') }}</span>
          <span v-show="params && params.moduleName" class="action-item text-tip">{{ params.moduleName }}</span>
        </div>
      </template>
      <template v-slot>
        <div>
          <VersionProduct :params="handleParams(params)" :has-bg="false" :hasAllAuth="hasAllAuth"></VersionProduct>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 工程目录
  components: {
    VersionProduct: () => import('./build-no/version-product')
  },
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    hasAllAuth: {
      // 是否拥有版本&制品管理权限
      type: Boolean,
      default: false
    }
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
  methods: {
    closeDialog() {
      this.$emit('close');
    },
    handleParams(projectDirectoryParams) {
      let params = this.$utils.deepClone(projectDirectoryParams);
      if (params) {
        delete params.moduleName;
        params.resourceType = 'workspace';
      }
      return params;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
