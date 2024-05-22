
<template>
  <div>
    <Poptip
      placement="bottom-start"
      width="396"
    >
      <span class="cursor-pointer">
        <CommonStatus v-if="specifyVersion.status" :statusValue="adjustStatusValue(specifyVersion.status, specifyVersion.isActive)" :statusName="getStatusText(specifyVersion.status, specifyVersion.isActive)"></CommonStatus>
        <span v-if="specifyVersion.status=='passed'" class="top-title">{{ $t('page.versions') }}{{ specifyVersion.version }}</span>
        <span v-else class="top-title">{{ specifyVersion.name }}</span>
        <i class="tsfont-down"></i>
      </span>
      <div slot="content" class="version-main">
        <div v-if="currentVersion" class="version-list">
          <div class="version-title text-title fz10">
            {{ $t('page.curversions') }}
          </div>
          <div class="currentVersion-content border-color radius-sm cursor-pointer card-hover-shadow" @click="switchVersion(currentVersion)">
            <div class="version-content-top">
              <div class="title">{{ $t('page.versions') }}{{ currentVersion.version }}</div>
              <div class="version-status">
                <CommonStatus v-if="currentVersion.status" :statusValue="adjustStatusValue(currentVersion.status, currentVersion.isActive)" :statusName="getStatusText(currentVersion.status, currentVersion.isActive)"></CommonStatus>
              </div>
            </div>
            <div class="text-tip fz10">
              <span class="user overflow">
                <UserCard v-bind="currentVersion.lcuVo" hideAvatar></UserCard>
              </span>
              <span class="time">{{ currentVersion.lcd | formatDate }}</span>
            </div>
          </div>
        </div>
        <div v-if="notPassedConfig.tbodyList.length > 0" class="version-list">
          <div class="version-title text-title fz10">{{ $t('page.unapprovedversion') }}</div>
          <TsCard
            v-model="combopId"
            v-bind="notPassedConfig"
            :padding="false"
            classname="overvivew-main"
            :boxShadow="false"
            border
            @updatePage="currentPage=>{getVersionList(currentPage,'notPassed')}"
          >
            <template slot-scope="{ row }">
              <div class="version-content cursor-pointer" @click="switchVersion(row)">
                <div class="version-content-top">
                  <div v-if="row.name" class="title">{{ row.name }}</div>
                  <div class="version-status">
                    <CommonStatus v-if="row.status" :statusValue="adjustStatusValue(row.status, row.isActive)" :statusName="getStatusText(row.status, row.isActive)"></CommonStatus>
                  </div>
                </div>
                <div class="text-tip fz10">
                  <span class="user overflow">
                    <UserCard v-bind="row.lcuVo" hideAvatar></UserCard>
                  </span>
                  <span class="time">{{ row.lcd | formatDate }}</span>
                </div>
              </div>
            </template>
          </TsCard>
        </div>
        <div v-if="historicalConfig.tbodyList.length > 0" class="version-list">
          <div class="version-title text-title fz10">{{ $t('page.hisversions') }}</div>
          <TsCard
            v-model="combopId"
            v-bind="historicalConfig"
            :padding="false"
            classname="overvivew-main"
            :boxShadow="false"
            border
            @updatePage="currentPage=>{getVersionList(currentPage,'passed')}"
          >
            <template slot-scope="{ row }">
              <div class="version-content cursor-pointer" @click="switchVersion(row)">
                <div class="version-content-top">
                  <div>{{ $t('page.versions') }}{{ row.version }}</div>
                </div>
                <div class="text-tip fz10">
                  <span class="user overflow">
                    <UserCard v-bind="row.lcuVo" hideAvatar></UserCard>
                  </span>
                  <span class="time">{{ row.lcd | formatDate }}</span>
                </div>
              </div>
            </template>
          </TsCard>
        </div>
      </div>
    </poptip>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    TsCard: () => import('@/resources/components/TsCard/TsCard')
  },
  filters: {
  },
  props: {
    combopId: {
      type: [String, Number],
      default: null
    },
    specifyVersion: {
      type: Object,
      default: () => {}
    },
    currentVersionId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      pageSize: 3,
      notPassedConfig: {
        sm: 24,
        md: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        tbodyList: []
      },
      historicalConfig: {
        sm: 24,
        md: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        tbodyList: []
      },
      currentVersion: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.currentVersionId) {
      if (this.currentVersionId == this.specifyVersion.id) {
        this.currentVersion = this.specifyVersion;
      } else {
        this.getActiveVersionById(this.currentVersionId);
      }
    }
    this.getVersionList(1, 'notPassed');
    this.getVersionList(1, 'passed');
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getVersionList(currentPage, status) {
      let data = {
        combopId: this.combopId,
        status: status,
        currentPage: currentPage,
        pageSize: this.pageSize
      };
      this.$api.autoexec.action.getActionVersionList(data).then(res => {
        if (res.Status == 'OK') {
          let config = res.Return;
          if (status == 'notPassed') {
            Object.assign(this.notPassedConfig, config);
          } else if (status == 'passed') {
            Object.assign(this.historicalConfig, config);
          }
        }
      });
    },
    switchVersion(item) {
      if (item.id == this.specifyVersion.id) {
        return;
      }
      let id = item.id;
      this.$emit('switchVersion', this.combopId, item.status, item.id);
    },
    getActiveVersionById(versionId) {
      this.$api.autoexec.action.getActionVersion({id: versionId}).then(res => {
        if (res.Status == 'OK') {
          this.currentVersion = res.Return;
        }
      });
    },
    adjustStatusValue(status, isActive) {
      if (status == 'draft') {
        return status;
      } else if (status == 'submitted') {
        return status;
      } else if (status == 'passed') {
        if (isActive == 1) {
          return 'current';
        } else {
          return 'history';
        }
      } else if (status == 'rejected') {
        return status;
      }
      return '';
    },
    getStatusText(status, isActive) {
      if (status == 'draft') {
        return this.$t('page.draft');
      } else if (status == 'submitted') {
        return this.$t('page.submitted');
      } else if (status == 'passed') {
        if (isActive == 1) {
          return this.$t('page.enable');
        } else {
          return this.$t('page.history');
        }
      } else if (status == 'rejected') {
        return this.$t('page.rejected');
      }
      return '';
    }
  },
  computed: {},
  watch: {
    specifyVersion: {
      handler() {
        this.getVersionList(1, 'notPassed');
        this.getVersionList(1, 'passed');
      },
      deep: true
    },
    currentVersionId: {
      handler() {
        if (this.currentVersionId == this.specifyVersion.id) {
          this.currentVersion = this.specifyVersion;
        } else {
          this.getActiveVersionById(this.currentVersionId);
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
.top-title{
  padding: 0 4px;
}
.version-main{
  width: 100%;
  max-height: 320px;
  padding: 0px 4px;
  overflow-x: hidden;
  .currentVersion-content {
    border: 1px solid;
    padding: 10px;
  }
  .version-list{
    padding-bottom: 16px;
    .version-title{
      padding-bottom: 10px;
    }
    .version-content {
      padding: 0px 4px 10px;
    }
  }
  .time{
    padding-left: 4px;
  }
  /deep/ .usercard{
    font-size: 12px !important;
  }
  .version-content-top{
    display: flex;
    justify-content: flex-start;
    white-space: nowrap;
    align-items: center;
    padding-bottom: 6px;
    .title{
      padding-right: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  /deep/ .tscard-body{
    min-height: auto;
  }
  /deep/ .tscard-li{
    padding: 3px 6px !important;
  }
}
/deep/ .ivu-poptip-rel{
  top: -1px
}
</style>
