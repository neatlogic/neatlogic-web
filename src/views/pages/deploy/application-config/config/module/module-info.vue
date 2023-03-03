<template>
  <div class="config-info-box">
    <div v-if="isShowTitle" class="pb-sm">模块信息</div>
    <ul class="bg-op padding-lg radius-lg mb-md ul-box">
      <li v-for="(item, index) in moduleInfoList" :key="index" class="li-box pb-nm pr-nm">
        <span class="text-grey pb-xs">{{ item.text }}</span>
        <Tooltip
          placement="top"
          theme="light"
          transfer
          :max-width="400"
          class="tooltip-box"
        >
          <div class="value-width overflow">{{ item.value }}</div>
          <div slot="content">
            <p>{{ item.value }}</p>
          </div>
        </Tooltip>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    appSystemId: {
      type: Number,
      default: null
    },
    appModuleId: {
      type: Number,
      default: null
    },
    isShowTitle: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      moduleInfoList: [
        {
          name: 'abbrName',
          text: '简称',
          value: '-'
        },
        {
          name: 'name',
          text: '名称',
          value: '-'
        },
        {
          name: 'state',
          text: '使用状态',
          value: '-'
        },
        {
          name: 'owner',
          text: '负责人',
          value: '-'
        },
        {
          name: 'maintenance_window',
          text: '维护期',
          value: '-'
        },
        {
          name: 'description',
          text: '备注',
          value: '-'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getModuleInfo();
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
    getModuleInfo() {
      this.$api.deploy.applicationConfig.getModuleInfo({appSystemId: this.appSystemId, appModuleId: this.appModuleId}).then((res) => {
        if (res && res.Status == 'OK') {
          let appModuleInfo = res.Return ? res.Return.appModuleInfo : {};
          this.handleModuleInfo(appModuleInfo);
        }
      });
    },
    handleModuleInfo(appModuleInfo) {
      if (appModuleInfo) {
        let attrEntityDataList = appModuleInfo.attrEntityData ? Object.values(appModuleInfo.attrEntityData) : [];
        let moduleInfo = {};
        attrEntityDataList && attrEntityDataList.forEach((item) => {
          moduleInfo[item.name] = item.actualValueList;
        });
        this.moduleInfoList.forEach((item) => {
          if (item && moduleInfo.hasOwnProperty(item.name)) {
            item.value = moduleInfo[item.name] ? (moduleInfo[item.name] instanceof Array ? moduleInfo[item.name].join(',') : (moduleInfo[item.name] || '-')) : '-';
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.config-info-box {
  width: 100%;
  .ul-box {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }
  .li-box {
    display: flex;
    flex-direction: column;
    width: 32%;
  }
   .value-width {
    width: 100%;
  }
   .tooltip-box {
    /deep/ &.ivu-tooltip,
    /deep/ .ivu-tooltip-rel {
      max-width: 100%;
      width: 100%;
    }
  }
}
</style>
