<template>
  <div class="config-info-box">
    <ul class="bg-op padding-lg radius-lg mb-md ul-box">
      <li
        v-for="(item, index) in appInfoList"
        :key="index"
        class="li-box pb-nm pr-nm"
        :class="item.name == 'description' ? 'value-width' : ''"
      >
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
  components: {
  },
  props: {
    appSystemId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      appInfoList: [
        {
          text: this.$t('term.deploy.abbreviation'),
          value: '-',
          name: 'abbrName'
        },
        {
          text: this.$t('page.name'),
          value: '-',
          name: 'name'
        },
        {
          text: this.$t('term.deploy.displaysystemname'),
          value: '-',
          name: 'systemDisplayName'
        },
        {
          text: this.$t('term.deploy.useofstate'),
          value: '-',
          name: 'state'
        },
        {
          text: this.$t('page.responsibleperson'),
          value: '-',
          name: 'owner'
        },
        {
          text: this.$t('term.autoexec.maintenanceperiod'),
          value: '-',
          name: 'maintenance_window'
        },
        {
          text: this.$t('page.memo'),
          value: '-',
          name: 'description'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getInfo();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getInfo() {
      this.$api.deploy.applicationConfig.getAppInfo({appSystemId: this.appSystemId}).then((res) => {
        if (res.Status == 'OK') {
          let systemInfo = {};
          let appSystemInfo = res.Return.appSystemInfo;
          let attrEntityDataList = Object.values(appSystemInfo.attrEntityData);
          attrEntityDataList && attrEntityDataList.forEach((item) => {
            systemInfo[item.name] = item.actualValueList;
          });
          this.appInfoList.forEach((item) => {
            if (item && systemInfo.hasOwnProperty(item.name)) {
              item.value = systemInfo[item.name] ? (systemInfo[item.name] instanceof Array ? systemInfo[item.name].join(',') : (systemInfo[item.name] || '-')) : '-';
            }
          });
        }
      });
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
