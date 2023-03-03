<template>
  <div>
    <TsDialog
      title="提示"
      type="modal"
      :isShow="isShow"
      :hasFooter="false"
      @on-close="close"
    >
      <template v-slot>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <template>
          <!-- 添加配置 -->
          <div v-if="selectedApp && !selectedApp.isConfig">当前应用尚未配置，点击<span class="text-href" @click="toPipeline()">添加配置</span></div>
          <!-- 添加模块 -->
          <div v-else-if="selectedApp && !selectedApp.isHasModule">当前应用未配置任何模块，点击<span class="text-href" @click="addModule()">添加模块</span></div>
          <!-- 添加环境 -->
          <div v-else-if="!appModuleId && selectedApp && selectedApp.isHasModule && !selectedApp.isHasEnv">
            <div v-for="item in moduleList" :key="item.id" class="pb-sm">
              <span>{{ selectedApp.name }}/{{ item.abbrName }}{{ item.name?'['+item.name+']':'' }}未配置环境信息，点击</span>
              <span class="text-href" @click="addEnv(item.id)">添加环境</span>
            </div>
          </div>
          <div v-else-if="appModuleId && selectedModule && !selectedModule.isHasEnv">
            <span>{{ selectedApp.name }}/{{ selectedModule.abbrName }}{{ selectedModule.name?'['+selectedModule.name+']':'' }}未配置环境信息，点击</span>
            <span class="text-href" @click="addEnv(selectedModule.id)">添加环境</span>
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
    AppEdit: resolve => require(['../../application-config/config/app/app-edit'], resolve) // 编辑权限
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
