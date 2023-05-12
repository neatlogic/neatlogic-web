<template>
  <div>
    <Poptip placement="bottom-start" transfer>
      <span class="tsfont-layer">{{ $t('term.deploy.hierarchyswitching') }}</span>
      <div slot="content">
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <Alert show-icon>
          <div class="status-alert">
            <span class="pr-sm"><span class="status-icon bg-warning mr-xs"></span>{{ $t('term.deploy.existdisablephase') }}</span>
            <span><span class="status-icon bg-info mr-xs"></span>{{ $t('term.deploy.existheavyloadphase') }}</span>
          </div>
        </Alert>
        <div v-if="appConfig" class="app-main">
          <div class="pb-sm">
            <span
              v-if="appConfig.appModuleList && appConfig.appModuleList.length > 0"
              class="text-action"
              :class="appConfig.isShow?'tsfont-down':'tsfont-right'"
              @click="toggleShow(appConfig)"
            ></span>
            <span class="text-action" @click="gotoPage()">
              <span>{{ appConfig.abbrName }}</span>
              <span v-if="appConfig.name">[{{ appConfig.name }}]</span>
            </span>
          </div>
          <div v-if="appConfig.appModuleList && appConfig.appModuleList.length > 0" class="pl-sm">
            <div v-show="appConfig.isShow">
              <div v-for="(m,mindex) in appConfig.appModuleList" :key="mindex">
                <div class="pb-sm">
                  <span
                    v-if="m.envList && m.envList.length > 0"
                    class="text-action"
                    :class="m.isShow?'tsfont-down':'tsfont-right'"
                    @click="toggleShow(m)"
                  ></span>
                  <span v-else class="pl-nm"></span>
                  <span>
                    <span v-if="m.hasOwnProperty('isActive') && !m.isActive" class="status-icon bg-warning mr-xs"></span>
                    <span v-if="m.hasOwnProperty('override') && m.override" class="status-icon bg-info mr-xs"></span>
                  </span>
                  <span class="text-action" @click="gotoPage(m.id)">
                    <span>{{ m.abbrName }}</span>
                    <span v-if="m.name">[{{ m.name }}]</span>
                  </span>
                </div>
                <div v-show="m.isShow">
                  <div v-if="m.envList && m.envList.length > 0">
                    <div v-for="(e,eindex) in m.envList" :key="eindex" class="env-list pb-sm">
                      <span class="env-status">
                        <span v-if="e.hasOwnProperty('isActive') && !e.isActive" class="status-icon bg-warning mr-xs"></span>
                        <span v-if="e.hasOwnProperty('override') && e.override" class="status-icon bg-info mr-xs"></span>
                      </span>
                      <span v-if="e.name" class="text-action" @click="gotoPage(m.id, e.id)">{{ e.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Poptip>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    appSystemId: Number
  },
  data() {
    return {
      appConfig: null,
      loadingShow: true
    };
  },
  beforeCreate() {},
  created() {
    this.getTree();
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
    getTree() {
      this.$api.deploy.applicationConfig.getAppAppmoduleEnvTree({ appSystemId: this.appSystemId }).then(res => {
        if (res && res.Status == 'OK') {
          this.appConfig = res.Return;
          this.$set(this.appConfig, 'isShow', true);
          if (this.appConfig.appModuleList && this.appConfig.appModuleList.length > 0) {
            this.appConfig.appModuleList.forEach(item => {
              this.$set(item, 'isShow', true);
              if (item.envList && item.envList.length > 0) {
                item.envList.forEach(e => {
                  this.$set(e, 'isShow', true);
                });
              }
            });
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    toggleShow(config) {
      this.$set(config, 'isShow', !config.isShow);
    },
    gotoPage(appModuleId, envId) {
      let params = 'appSystemId=' + this.appSystemId;
      if (appModuleId) {
        params = params + '&appModuleId=' + appModuleId;
      }
      if (envId) {
        params = params + '&envId=' + envId;
      }
      window.open(HOME + `/deploy.html#/application-config-pipeline-detail?` + params, '_blank');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.app-main {
  max-height: 300px;
  overflow-y: auto;
}
.status-alert {
  display: flex;
}
.status-icon {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 6px;
}
.env-list {
  position: relative;
  padding-left: 38px;
  .env-status{
    position: absolute;
    left: 16px;
    top: 0px;
    width: 24px;
    text-align: right;
  }
}
</style>
