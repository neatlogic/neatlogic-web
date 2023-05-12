<template>
  <div class="extrainfo-detail bg-op padding radius-lg">
    <div class="extrainfo-content">
      <div class="overflow">
        <div class="text-tip pb-sm">{{ $t('page.apply') }}</div>
        <div v-if="config.appSystemAbbrName || config.appSystemName" class="text-href overflow" @click="gotoManage('app')">
          <span v-if="config.appSystemAbbrName">{{ config.appSystemAbbrName }}</span>
          <span v-if="config.appSystemName">[{{ config.appSystemName }}]</span>
        </div>
        <div v-else>-</div>
      </div>
      <div class="overflow">
        <div class="text-tip pb-sm">{{ $t('page.module') }}</div>
        <div v-if="config.appModuleAbbrName || config.appModuleName" class="text-href overflow" @click="gotoManage('module')">
          <span v-if="config.appModuleAbbrName">{{ config.appModuleAbbrName }}</span>
          <span v-if="config.appModuleName">[{{ config.appModuleName }}]</span>
        </div>
        <div v-else>-</div>
      </div>
      <div class="overflow">
        <div class="text-tip pb-sm">{{ $t('page.environment') }}</div>
        <div v-if="config.envName" class="text-href" @click="gotoManage('env')">{{ config.envName }}</div>
        <div v-else>-</div>
      </div>
      <div class="overflow">
        <div class="text-tip pb-sm">{{ $t('page.versions') }}</div>
        <div
          v-if="config.version"
          :class="config.env? 'text-href' : 'text-disabled'"
          @click="openVersionDialog"
        >
          <span v-if="config.env" class="pr-xs">{{ config.version.version }}</span>
          <Tooltip
            v-else
            transfer
            theme="light"
            :content="$t('term.autoexec.noenvproducts')"
          >
            <span class="pr-xs">{{ config.version.version }}</span>
          </Tooltip>
          <Status v-if="config.env && config.env.status" :statusName="config.env.statusName" :statusValue="config.env.status"></Status>
        </div>
        <div v-else>-</div>
      </div>
      <div class="overflow">
        <div class="text-tip pb-sm">buildNo</div>
        <div v-if="config.buildNo" class="text-href" @click="openBuildNoDialog">
          <span class="pr-xs">{{ config.buildNo.buildNo }}</span>
          <Status v-if="config.buildNo.status" :statusName="config.buildNo.statusName" :statusValue="config.buildNo.status"></Status>
        </div>
        <div v-else>-</div>
      </div>
      <!-- <div>
        <Button type="warning" ghost>回退</Button>
      </div> -->
    </div>
    <BuildNoDialog
      v-if="isShowBuildNoDialog"
      :buildNoParams="buildNoParams"
      :title="buildNoTitle"
      :statusValue="statusValue"
      :statusName="statusName"
      @close="isShowBuildNoDialog = false"
    ></BuildNoDialog>
    <VersionDialog
      v-if="isShowVersionDialog"
      :envParams="envParams"
      :title="envTitle"
      :statusValue="statusValue"
      :statusName="statusName"
      @close="isShowVersionDialog = false"
    ></VersionDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    BuildNoDialog: resolve => require(['@/views/pages/deploy/version/components/build-no-dialog'], resolve), // build-no
    VersionDialog: resolve => require(['@/views/pages/deploy/version/components/env-dialog'], resolve) // 版本
  },
  props: {
    config: Object
  },
  data() {
    return {
      buildNoTitle: '',
      buildNoParams: {},
      isShowBuildNoDialog: false,
      versionTitle: '',
      isShowVersionDialog: false,
      envParams: {},
      statusName: '',
      statusValue: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    gotoManage(type) {
      let params = '';
      if (type == 'app') {
        params = 'appSystemId=' + this.config.appSystemId;
      }
      if (type == 'module') {
        params = 'appSystemId=' + this.config.appSystemId + '&appModuleId=' + this.config.appModuleId;
      }
      if (type == 'env') {
        params = 'appSystemId=' + this.config.appSystemId + '&appModuleId=' + this.config.appModuleId + '&envId=' + this.config.envId;
      }
      window.open(HOME + '/deploy.html#/application-config-manage?' + params, '_blank');
    },
    openVersionDialog() {
      if (this.config) {
        if (!this.config.env) {
          return;
        }
        this.envParams = {
          id: this.config.version.id,
          type: 'env'
        }; 
        if (this.config.buildNo) {
          this.$set(this.envParams, 'buildNo', this.config.buildNo.buildNo);
        }
        if (this.config.env) {
          this.config.env.hasOwnProperty('isMirror') && this.$set(this.envParams, 'isMirror', this.config.env.isMirror);
          this.$set(this.envParams, 'envId', this.config.env.envId);
          this.statusName = this.config.env.statusName;
          this.statusValue = this.config.env.status;
        }
        this.envTitle = `${this.config.envName || ''}-${this.config.version.version}`;
        this.isShowVersionDialog = true;
      }
    },
    openBuildNoDialog() {
      if (this.config) {
        this.buildNoParams = {
          id: this.config.version.id,
          buildNo: this.config.buildNo.buildNo,
          type: 'build'
        };
        this.statusName = this.config.buildNo.statusName;
        this.statusValue = this.config.buildNo.status;
        this.buildNoTitle = `${this.config.version.version}-build${this.config.buildNo.buildNo || ''}`;
        this.isShowBuildNoDialog = true;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.extrainfo-detail {
  position: relative;
  .extrainfo-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
