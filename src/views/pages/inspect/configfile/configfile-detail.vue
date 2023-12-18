<template>
  <div>
    <TsContain siderPosition="right" :siderWidth="200" :isSiderHide="isSiderHideHistory">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>
          <TsFormSelect
            v-model="pathId"
            v-bind="selectConfig"
            @on-change="
              val => {
                changeFile(val);
              }
            "
          ></TsFormSelect>
        </span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span v-if="versionDataConfig.tbodyList && versionDataConfig.tbodyList.length > 1" class="action-item  tsfont-compare" @click="compareFile">{{ $t('page.compare') }}</span>
          <span class="action-item tsfont-history" @click="openHistory">{{ $t('page.hisversions') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <div class="list-main pl-nm">
          <Tabs class="block-tabs2" :animated="false">
            <TabPane :label="$t('term.inspect.changerecord')" name="changeRecord">
              <div class="list-content">
                <template v-if="versionDataConfig.tbodyList && versionDataConfig.tbodyList.length > 0">
                  <div
                    v-for="(item, index) in versionDataConfig.tbodyList"
                    :key="index"
                    class="version-list text-action radius-sm"
                    :class="versionId == item.id ? 'tsbg-block' : ''"
                    @click="selectVersionFile(item)"
                  >
                    {{ item.inspectTime | formatDate }}
                  </div>
                  <div v-if="versionDataConfig.currentPage < versionDataConfig.pageCount" class="text-href pt-sm pl-nm" @click="nextPage('version')">{{ $t('page.viewmore') }}</div>
                </template>
                <NoData v-else></NoData>
              </div>
            </TabPane>
            <TabPane :label="$t('term.inspect.scanhistory')" name="scanHistory">
              <div class="list-content pl-nm">
                <template v-if="historyDataConfig.tbodyList && historyDataConfig.tbodyList.length > 0">
                  <div v-for="(item, index) in historyDataConfig.tbodyList" :key="index" class="pb-nm">
                    <div class="list-time">
                      <span v-if="item.versionId" class="version-tip bg-warning"></span>
                      {{ item.inspectTime | formatDate }}
                    </div>
                  </div>
                  <div v-if="historyDataConfig.currentPage < historyDataConfig.pageCount" class="text-href" @click="nextPage('history')">{{ $t('page.viewmore') }}</div>
                </template>
                <NoData v-else></NoData>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </template>
      <template v-slot:content>
        <div class="file-content bg-block radius-lg padding">
          <div v-for="(item, index) in lineList" :key="index">
            <div v-html="item.content"></div>
          </div>
        </div>
      </template>
    </TsContain>
    <ComparisonDetail
      v-if="isShowComparison"
      :pathId="pathId"
      :comparisonIdList="comparisonIdList"
      @close="isShowComparison = false"
    ></ComparisonDetail>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ComparisonDetail: resolve => require(['./components/comparison-dialog'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {},
  data() {
    return {
      pathId: null,
      resourceId: null,
      lineList: [],
      isSiderHideHistory: true,
      historyDataConfig: {},
      versionDataConfig: [],
      isShowComparison: false,
      comparisonIdList: [],
      versionIdList: [],
      selectConfig: {
        dynamicUrl: '/api/rest/inspect/configfile/resource/file/list',
        params: { resourceId: null },
        rootName: 'tbodyList',
        textName: 'path',
        valueName: 'id',
        transfer: true,
        search: true,
        isSquare: false,
        clearable: false,
        border: 'none',
        validateList: ['required']
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query) {
      if (this.$route.query.resourceId) {
        this.resourceId = parseInt(this.$route.query.resourceId);
        this.selectConfig.params.resourceId = this.resourceId;
      }
      if (this.$route.query.id) {
        this.pathId = parseInt(this.$route.query.id);
        this.getVersionData({ pathId: this.pathId });
      }
      if (this.$route.query.newVersionId && this.$route.query.oldVersionId) {
        this.comparisonIdList.push(this.$route.query.newVersionId, this.$route.query.oldVersionId);
      }
      if (this.$route.query.isShowComparison) {
        this.isShowComparison = true;
      }
    }
  },
  beforeMount() {},
  mounted() {
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      this.getVersionFileList(1);
      this.getHistoryFileList(1);
    },
    getVersionData(params) {
      this.$api.inspect.configfile.getVersionData(params).then(res => {
        if (res && res.Status == 'OK') {
          this.lineList = res.Return.lineList;
        }
      });
    },
    compareFile() {
      this.comparisonIdList = this.versionIdList;
      this.isShowComparison = true;
    },
    openHistory() {
      this.isSiderHideHistory = !this.isSiderHideHistory;
    },
    getVersionFileList(currentPage) {
      //文件变更记录列表
      this.$api.inspect.configfile.getVersionFileList({ pathId: this.pathId, currentPage: currentPage }).then(res => {
        if (res && res.Status == 'OK') {
          if (res.Return.currentPage == 1) {
            this.versionDataConfig = res.Return;
            this.versionId = this.versionDataConfig.tbodyList.length ? this.versionDataConfig.tbodyList[0].id : null;
            if (this.versionDataConfig.tbodyList && this.versionDataConfig.tbodyList.length > 1) {
              this.versionIdList.push(this.versionDataConfig.tbodyList[0].id, this.versionDataConfig.tbodyList[1].id);
            }
          } else if (res.Return.currentPage > 1) {
            this.versionDataConfig.tbodyList.push(...res.Return.tbodyList);
            this.$set(this.versionDataConfig, 'currentPage', res.Return.currentPage);
          }
        }
      });
    },
    getHistoryFileList(currentPage) {
      //文件扫描历史列表
      this.$api.inspect.configfile.getHistoryFileList({ pathId: this.pathId, currentPage: currentPage }).then(res => {
        if (res && res.Status == 'OK') {
          if (res.Return.currentPage == 1) {
            this.historyDataConfig = res.Return;
          } else if (res.Return.currentPage > 1) {
            this.historyDataConfig.tbodyList.push(...res.Return.tbodyList);
            this.$set(this.historyDataConfig, 'currentPage', res.Return.currentPage);
          }
        }
      });
    },
    nextPage(type) {
      if (type === 'version') {
        if (this.versionDataConfig.currentPage < this.versionDataConfig.pageCount) {
          this.getVersionFileList(this.versionDataConfig.currentPage + 1);
        }
      } else if (type === 'history') {
        if (this.historyDataConfig.currentPage < this.historyDataConfig.pageCount) {
          this.getHistoryFileList(this.historyDataConfig.currentPage + 1);
        }
      }
    },
    selectVersionFile(item) {
      this.versionId = item.id;
      this.getVersionData({ versionId: item.id });
    },
    changeFile(val) {
      this.getVersionData({ pathId: val });
      this.initData();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.file-content {
  position: relative;
  height: calc(100vh - 116px);
  line-height: 24px;
  overflow: auto;
}
.list-main {
  width: 200px;
  .list-content {
    position: relative;
    height: calc(100vh - 116px - 60px);
    overflow: auto;
  }
  .list-time {
    position: relative;
    .version-tip {
      position: absolute;
      left: -12px;
      top: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  }
  .version-list {
    padding: 0 16px;
    line-height: 32px;
  }
}
</style>
