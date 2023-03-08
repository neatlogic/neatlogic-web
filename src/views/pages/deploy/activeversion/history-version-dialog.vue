<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Tabs
            class="block-tabs"
            :animated="false"
            @on-click="changeTabValue"
          >
            <TabPane
              v-for="tab in envList"
              :key="tab.envId"
              :label="tab.envName"
              :name="tab.envName +'_' +tab.envId"
            >
              <div class="padding version-main">
                <Loading :loadingShow="loadingShow" type="fix"></Loading>
                <div v-if="versionList.length">
                  <Timeline>
                    <TimelineItem
                      v-for="(item,index) in versionList"
                      :key="index"
                      class="list"
                    >
                      <div slot="dot" class="histiry-dot bg-op"></div>
                      <span>
                        <span class="pr-nm text-href" @click="gotoVersion(item)">{{ item.newVersion }}</span>
                        <span class="pr-nm">{{ item.fcd | formatDate }}</span>
                        <span v-if="item.direction === 'rollback'" class="text-warning">
                          {{ $t('term.deploy.versionrollback', {oldversion: item.oldVersion, newversion: item.newVersion}) }}
                        </span>
                      </span>
                    </TimelineItem>
                  </Timeline>
                </div>
                <NoData v-else></NoData>
              </div>
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
    
  },
  props: {
    title: {
      type: String,
      default() {
        return this.$t('page.hisversions');
      }
    },
    appSystemId: Number,
    appModuleId: Number,
    envList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogConfig: {
        type: 'slider',
        title: this.$t('page.hisversions'),
        titleDes: this.title,
        isShow: true,
        hasFooter: false,
        maskClose: true
      },
      loadingShow: true,
      versionList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.envList.length) {
      this.envId = this.envList[0].envId;
      this.getHistoryVersionList();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getHistoryVersionList() {
      if (!this.appSystemId || !this.appModuleId || !this.envId) {
        return;
      }
      this.loadingShow = true;
      this.$api.deploy.activeversion.getHistoryVersionList({
        appSystemId: this.appSystemId,
        appModuleId: this.appModuleId,
        envId: this.envId
      }).then(res => {
        if (res.Status == 'OK') {
          this.versionList = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changeTabValue(name) {
      this.envId = parseInt(name.split('_')[1]); 
      this.getHistoryVersionList();
    },
    gotoVersion(item) {
      let title = this.title + '/' + item.newVersion;
      window.open(HOME + '/deploy.html#/version-detail?versionId=' + item.newVersionId + '&envId=' + this.envId + '&title=' + title, '_blank');
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@primary-grey){
  .version-main {
    position: relative;
    height: calc(100vh - 130px);
    padding-top: 32px;
    overflow: auto;
    .histiry-dot{
      width: 8px;
      height:8px;
      border-radius: 50%;
      border: 2px solid @primary-grey;
      margin: 0 auto;
    }
    /deep/ .ivu-timeline-item {
      padding-bottom: 30px;
    }
    /deep/ .ivu-timeline-item-head {
      background: transparent !important;
       margin-top: 8px;
    }
    /deep/ .ivu-timeline-item-tail {
      border-left: 2px solid  @primary-grey !important;
      top: 8px !important;
    }
  }
}

html {
  .theme(@default-primary-grey);
  &.theme-dark {
    .theme(@dark-primary-grey);
  }
}
</style>
