
<template>
  <div>
    <Poptip
      placement="bottom-start"
      width="396"
    >
      <span class="cursor-pointer">
        <CommonStatus v-if="versionVo.statusVo" :statusValue="versionVo.statusVo.value" :statusName="versionVo.statusVo.text"></CommonStatus>
        <span v-if="versionVo.status=='passed'" class="top-title">{{ $t('page.versions') }}{{ versionVo.version }}</span>
        <span v-else class="top-title">{{ versionVo.title }}</span>
        <i class="tsfont-down"></i>
      </span>
      <div slot="content" class="version-main">
        <div v-if="currentVersion" class="version-list">
          <div class="version-title text-title fz10">
            {{ $t('page.curversions') }}
          </div>
          <div class="currentVersion-content border-color radius-sm cursor-pointer card-hover-shadow" @click="getVersion(currentVersion)">
            <div class="version-content-top">
              <div class="title">{{ $t('page.versions') }}{{ currentVersion.version }}</div>
              <div class="version-status">
                <CommonStatus v-if="currentVersion.statusVo" :statusValue="currentVersion.statusVo.value" :statusName="currentVersion.statusVo.text"></CommonStatus>
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
            v-model="id"
            v-bind="notPassedConfig"
            :padding="false"
            classname="overvivew-main"
            :boxShadow="false"
            border
            @updatePage="currentPage=>{getVersionList(currentPage,'notPassed')}"
          >
            <template slot-scope="{ row }">
              <div class="version-content cursor-pointer" @click="getVersion(row)">
                <div class="version-content-top">
                  <div v-if="row.title" class="title">{{ row.title }}</div>
                  <div class="version-status">
                    <CommonStatus v-if="row.statusVo" :statusValue="row.statusVo.value" :statusName="row.statusVo.text"></CommonStatus>
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
            v-model="id"
            v-bind="historicalConfig"
            :padding="false"
            classname="overvivew-main"
            :boxShadow="false"
            border
            @updatePage="currentPage=>{getVersionList(currentPage,'passed')}"
          >
            <template slot-scope="{ row }">
              <div class="version-content cursor-pointer" @click="getVersion(row)">
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
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard'], resolve)
  },
  filters: {
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    },
    versionVo: {
      type: Object, 
      default: () => {}
    },
    currentVersion: {
      type: Object, 
      default: () => {}
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
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
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
        scriptId: this.id,
        status: status,
        currentPage: currentPage,
        pageSize: this.pageSize
      };
      this.$api.autoexec.script.getVersionList(data).then(res => {
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
    getVersion(item) {
      if (item.id == this.versionVo.id) {
        return;
      }
      let id = item.id;
      this.$emit('updateVersion', item.status, item.id);
    }
  },
  computed: {},
  watch: {}
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
