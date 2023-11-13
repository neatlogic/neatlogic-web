<template>
  <div>
    <TsDialog
      type="slider"
      width="large"
      :isShow="true"
      :hasFooter="false"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div class="action-group">
          <span>{{ title }}</span>
          <span v-show="envParams && envParams.buildNo">-build{{ envParams.buildNo }}</span>
          <CommonStatus
            class="action-item"
            :statusValue="statusValue == 'pending' ? 'waitCompile' : statusValue"
            :statusName="statusName"
            type="block"
          ></CommonStatus>
        </div>
      </template>
      <template v-slot>
        <div>
          <Tabs
            v-model="tabValue"
            class="block-tabs"
            :animated="false"
          >
            <TabPane
              v-for="(item, index) in tabList"
              :key="index"
              :label="item.text"
              :name="item.value"
            >
              <VersionProduct v-if="tabValue == item.value" :params="handleParams(envParams)" :hasAllAuth="hasAllAuth"></VersionProduct>
            </TabPane>
          </Tabs>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    VersionProduct: resolve => require(['./build-no/version-product'], resolve)
  },
  props: {
    envParams: {
      type: Object,
      default: () => {}
    },
    statusName: {
      type: String,
      default: ''
    },
    statusValue: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    hasAllAuth: {
      // 是否拥有版本&制品管理&环境权限
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tabValue: '',
      tabList: []
    };
  },
  beforeCreate() {},
  created() {
    this.searchData();
  },
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
    searchData() {
      let {type, isMirror} = this.envParams;
      if (type) {
        let params = {
          type: type,
          isMirror // 环境才可能有环境制品
        };
        this.$api.deploy.version.getTypeList(params).then((res) => {
          if (res && res.Status == 'OK') {
            this.tabList = res.Return || [];
            this.tabValue = res.Return ? res.Return[0].value : '';
          }
        });
      }
    },
    handleParams(params) {
      let envParams = this.$utils.deepClone(params);
      if (envParams) {
        delete envParams.type; // 删除多余的参数
        envParams.resourceType = this.tabValue;
        if (this.tabValue && this.tabValue.includes('mirror') || envParams.buildNo === undefined) {
          // 镜像制品不需要buildNo
          delete envParams.buildNo;
        }
        if (envParams.isMirror === undefined) {
          delete envParams.isMirror;
        }
      }
      return envParams;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
