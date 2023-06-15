<template>
  <div class="version-main">
    <div class="version-top pb-nm">
      <div class="tsfont-plus text-action" @click="addVersion">{{ $t('page.versions') }}</div>
      <div class="search-box">
        <TimeSelect
          v-model="searchParam.startTimeRange"
          border="border"
          transfer
          class="pr-sm time-select"
          @change="searchVersion(1)"
        ></TimeSelect>
        <InputSearcher v-model="searchParam.keyword" border="border" @change="searchVersion(1)"></InputSearcher>
      </div>
    </div>
    <div v-if="versionData">
      <TsTable
        v-model="selectVersionValue"
        :theadList="theadList"
        v-bind="versionData"
        keyName="version"
        @changeCurrent="searchVersion"
        @getSelected="(value,selectItem)=>{getSelectedVersion(selectItem)}"
      >
        <template slot="isFreeze" slot-scope="{row}">
          <TsFormSwitch
            v-model="row.isFreeze"
            :disabled="true"
          ></TsFormSwitch>
        </template>
        <template slot="envList" slot-scope="{row}">
          <div v-if="row.envList && row.envList.length > 0">
            <CommonStatus
              v-for="(item, index) in row.envList"
              :key="index"
              :statusValue="statusObj[item.status]?statusObj[item.status]:'running'"
              :statusName="item.envName"
              class="pr-xs"
              type="block"
            ></CommonStatus>
          </div>
          <div v-else>-</div>
        </template>
      </TsTable>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TimeSelect: resolve => require(['@/resources/components/TimeSelect/TimeSelect.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: {
    params: Object
  },
  data() {
    return {
      searchParam: {
        startTimeRange: null,
        keyword: ''
      },
      versionData: null,
      selectVersionValue: null,
      theadList: [
        {
          key: 'selection',
          multiple: false
        },
        {
          title: this.$t('page.versions'),
          key: 'version'
        },
        {
          title: this.$t('page.createtime'),
          type: 'time',
          key: 'fcd'
        },
        {
          title: this.$t('term.deploy.sealplate'),
          key: 'isFreeze'
        },
       
        {
          title: this.$t('page.environment'),
          key: 'envList'
        } 
      ],
      statusObj: {
        released: 'released',
        compileFailed: 'compileFailed',
        releaseFailed: 'releaseFailed'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchVersion();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchVersion(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.deploy.version.searchVersion(this.searchParam).then((res) => {
        if (res.Status == 'OK') {
          this.versionData = res.Return;
        }
      });
    },
    getSelectedVersion(selectItem) {
      this.$emit('getSelectedVersion', selectItem[0]);
    },
    addVersion() {
      this.$emit('addVersion');
    }
  },
  filter: {},
  computed: {},
  watch: {
    params: {
      handler(val) {
        if (val) {
          if (val.appSystemId) {
            this.$set(this.searchParam, 'appSystemIdList', [val.appSystemId]);
          }
          if (val.appModuleId) {
            this.$set(this.searchParam, 'appModuleIdList', [val.appModuleId]);
          }
          if (val.version) {
            this.selectVersionValue = [val.version];
          }
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.version-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .search-box {
    display: inline-flex;
    .time-select {
      width: 200px;
    }
  }
}
</style>
