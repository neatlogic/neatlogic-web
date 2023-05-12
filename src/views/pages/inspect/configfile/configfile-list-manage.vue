<template>
  <div>
    <TsContain>
      <template v-slot:topRight>
        <TsRow>
          <Col :span="12">
            <TsFormDatePicker
              v-model="searchValue.timeRange"
              :placeholder="$t('term.inspect.latestchangetime')"
              type="datetimerange"
              format="yyyy-MM-dd HH:mm:ss"
              valueType="format"
              border="border"
              @change="searchFileList()"
            ></TsFormDatePicker>
          </Col>
          <Col :span="12">
            <InputSearcher
              v-model="searchValue.keyword"
              :placeholder="$t('term.inspect.searchplaceholder')"
              @change="searchFileList()"
            ></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <template v-slot:content>
        <div>
          <TsTable
            v-bind="configFileData"
            :theadList="theadList"
            :loading="loadingShow"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
          >
            <template v-slot:path="{ row }">
              <span class="file-name text-href overflow" @click="gotoFileDetail(row)">
                {{ reversePath(row.path) }}
              </span>
            </template>
            <template v-slot:resourceIp="{ row }">
              <span>
                <span>{{ row.resourceIp }}</span>
                <span v-if="row.resourcePort">:{{ row.resourcePort }}</span>
              </span>
            </template>
            <template v-slot:inspectTime="{ row }">
              <span v-if="row.inspectTime">{{ getTime(row.inspectTime) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}{{ $t('page.before') }}</span>
              <span v-else>-</span>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li v-auth="'INSPECT_CONFIG_FILE_MODIFY'" class="tsfont-file-single" @click="clearFile(row)">{{ $t('term.inspect.clearfile') }}</li>
                  <li v-if="row.versionCount && row.versionCount > 1" class="tsfont-compare" @click="compareFile(row)">{{ $t('page.compare') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
    <ClearFileDialog
      v-if="isShowClear"
      :pathConfig="pathConfig"
      @close="closeClear"
    ></ClearFileDialog>
    <ComparisonDetail
      v-if="isShowComparison"
      :pathId="pathConfig.id"
      :comparisonIdList="comparisonIdList"
      @close="closeComparison()"
    ></ComparisonDetail>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    ClearFileDialog: resolve => require(['./components/clear-file-dialog.vue'], resolve),
    ComparisonDetail: resolve => require(['./components/comparison-dialog'], resolve)
    
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      searchValue: {
        timeRange: [],
        keyword: ''
      },
      searchParam: {},
      configFileData: {},
      theadList: [
        {
          title: this.$t('page.filename'),
          key: 'path'
        },
        {
          title: this.$t('term.inspect.assetip'),
          key: 'resourceIp'
        },
        {
          title: this.$t('term.inspect.assetname'),
          key: 'resourceName'
        },
       
        {
          title: this.$t('term.inspect.assettype'),
          key: 'resourceTypeLabel'
        },
        {
          title: this.$t('term.inspect.latestchangetime'),
          key: 'inspectTime'
        },
        {
          key: 'action'
        }
      ],
      isShowClear: false,
      pathConfig: {},
      isShowComparison: false,
      comparisonIdList: []
    };
  },
  beforeCreate() {},
  created() {
    //最近变更时间：时间范围，精确到秒，默认选择七天前-当前时间
    let prevTime = this.$utils.getDateByFormat(new Date().getTime() - 7 * 24 * 3600 * 1000);
    let currentTime = this.$utils.getDateByFormat(new Date().getTime());
    this.searchValue.timeRange = [prevTime, currentTime];
  },
  beforeMount() {},
  mounted() {
    this.searchFileList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchFileList() {
      this.loadingShow = true;
      this.$api.inspect.configfile.searchFileList(Object.assign({}, this.searchValue, this.searchParam)).then(res => {
        if (res && res.Status == 'OK') {
          this.configFileData = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getTime(time) {
      return Date.parse(new Date()) - time;
    },
    changeCurrent(currentPage) {
      this.searchParam.currentPage = currentPage;
      this.searchFileList();
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchFileList();
    },
    gotoFileDetail(row) {
      this.$router.push({
        path: '/configfile-detail',
        query: {
          id: row.id,
          resourceId: row.resourceId
        }
      });
    },
    clearFile(row) {
      this.pathConfig = row;
      this.isShowClear = true;
    },
    closeClear(refresh) {
      this.isShowClear = false;
      if (refresh) {
        this.searchFileList();
      }
    },
    async compareFile(row) {
      this.pathConfig = row;
      await this.getVersionFileList();
      this.isShowComparison = true;
    },
    getVersionFileList() {
      //文件变更记录列表
      return this.$api.inspect.configfile.getVersionFileList({ pathId: this.pathConfig.id }).then(res => {
        if (res && res.Status == 'OK') {
          if (res.Return.tbodyList && res.Return.tbodyList.length > 1) {
            this.comparisonIdList.push(res.Return.tbodyList[0].id, res.Return.tbodyList[1].id);
          }
        }
      });
    },
    closeComparison() {
      this.comparisonIdList = [];
      this.isShowComparison = false;
    }
  },
  filter: {},
  computed: {
    reversePath() {
      return path => {
        return path.split('').reverse().join('');
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.file-name {
  display: inline-block;
  width: 300px;
  direction: rtl;
  unicode-bidi: bidi-override;
}
</style>
