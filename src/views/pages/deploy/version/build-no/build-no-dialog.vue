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
          <span class="action-item">{{ title }}</span>
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
              <VersionProduct v-if="tabValue == item.value" :params="handleBuildNoParams()" :hasAllAuth="hasAllAuth"></VersionProduct>
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
    VersionProduct: resolve => require(['./version-product'], resolve)
  },
  props: {
    buildNoParams: {
      type: Object,
      default: function() {
        return {};
      }
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
      // 是否拥有版本&制品管理权限
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
      let {type} = this.buildNoParams;
      if (type) {
        let params = {
          type: type
        };
        this.$api.deploy.version.getTypeList(params).then((res) => {
          if (res && res.Status == 'OK') {
            this.tabList = res.Return || [];
            this.tabValue = res.Return ? res.Return[0].value : '';
          }
        });
      }
    },
    handleBuildNoParams() {
      let params = this.$utils.deepClone(this.buildNoParams);
      if (params) {
        delete params.type;
        params.resourceType = this.tabValue;
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
