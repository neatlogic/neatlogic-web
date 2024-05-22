<template>
  <div>
    <TsDialog
      :title="$t('page.tip')"
      type="modal"
      :isShow="isShow"
      :hasFooter="false"
      @on-close="close"
    >
      <template v-slot>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <template>
          <!-- 添加配置 -->
          <div v-if="selectedApp && !selectedApp.isConfig">{{ $t('term.deploy.currentapplynoconfig') }}<span class="text-href" @click="toPipeline()">{{ $t('dialog.title.addtarget', {target: $t('page.config')}) }}</span></div>
          <!-- 添加模块 -->
          <div v-else-if="selectedApp && !selectedApp.isHasModule">{{ $t('term.deploy.applynoconfigmodule') }}<span class="text-href" @click="addModule()">{{ $t('dialog.title.addtarget', {target: $t('page.module')}) }}</span></div>
          <!-- 添加环境 -->
          <div v-else-if="!appModuleId && selectedApp && selectedApp.isHasModule && !selectedApp.isHasEnv">
            <div v-for="item in moduleList" :key="item.id" class="pb-sm">
              <span>{{ selectedApp.name }}/{{ item.abbrName }}{{ item.name?'['+item.name+']':'' }}{{ $t('term.deploy.noconfigenv') }}</span>
              <span class="text-href" @click="addEnv(item.id)">{{ $t('dialog.title.addtarget', {target: $t('page.environment')}) }}</span>
            </div>
          </div>
          <div v-else-if="appModuleId && selectedModule && !selectedModule.isHasEnv">
            <span>{{ selectedApp.name }}/{{ selectedModule.abbrName }}{{ selectedModule.name?'['+selectedModule.name+']':'' }}{{ $t('term.deploy.noconfigenv') }}</span>
            <span class="text-href" @click="addEnv(selectedModule.id)">{{ $t('dialog.title.addtarget', {target: $t('page.environment')}) }}</span>
          </div>
        </template>
      </template>
    </TsDialog>
    <AppEdit
      v-if="isShowAuthDialog"
      :isEdit="1"
      :params="{appSystemId: appSystemId}"
      @close="closeAuthDialog"
    ></AppEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppEdit: () => import('../../application-config/config/app/app-edit') // 编辑权限
  },
  props: {
    appSystemId: Number,
    appModuleId: Number,
    selectedApp: Object,
    selectedModule: Object,
    authLevel: { // 权限层级，module/env
      type: String,
      default: ''
    }
  },
  data() {
    return {
      moduleList: [],
      loadingShow: false,
      isShow: true,
      isShowAuthDialog: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (!this.appModuleId && this.selectedApp.isConfig && this.selectedApp.isHasModule && !this.selectedApp.isHasEnv) {
      this.getModuleList();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toPipeline() {
      this.$router.push({
        path: '/application-config-pipeline',
        query: {
          appSystemId: this.appSystemId
        }
      });
    },
    addModule() {
      this.$emit('addModule');
    },
    getModuleList() {
      this.loadingShow = true;
      this.$api.deploy.applicationConfig.getAppModuleTreeList({ appSystemId: this.appSystemId }).then(res => {
        if (res && res.Status == 'OK') {
          this.moduleList = res.Return || [];
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    close(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    addEnv(id) {
      this.$emit('addEnv', id);
    },
    openAuthDialog() {
      this.isShowAuthDialog = true;
    },
    closeAuthDialog(needRefresh) {
      this.isShowAuthDialog = false;
      if (needRefresh) {
        this.close(needRefresh);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
