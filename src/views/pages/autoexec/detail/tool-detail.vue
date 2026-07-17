
<template>
  <div class="tool-detail">
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsContain
      v-if="toolConfig"
      :rightWidth="204"
      :clearStyle="true"
      border="border"
    >
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ toolConfig.name }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group no-line" style="text-align: right;">
          <span class="action-item tsfont-question-o" @click.stop="openHelpDialog">{{ $t('page.help') }}</span>
          <template v-for="(operate, index) in toolConfig.operateList">
            <span
              v-if="operate.value != 'active'"
              :key="index"
              :class="getIcon(operate.value, operate)"
              :title="operate.disabledReason"
              class="action-item"
              @click="doAction(operate.value, operate)"
            >{{ operate.text }}</span>
            <span
              v-else
              :key="operate.value"
              class="action-item test"
              style="flex: 1;"
              :class="{ disable: operate.disabled }"
              :title="operate.disabledReason"
              @click.stop
            >
              <TsFormSwitch
                v-model="toolConfig.isActive"
                :true-value="1"
                :false-value="0"
                :disabled="operate.disabled ? true : false"
                showStatus
                @on-change="toggleAction()"
              ></TsFormSwitch>
            </span>
          </template>
          <span v-if="isExecrtoolActionVisible" class="action-item">
            <Dropdown trigger="hover" placement="bottom-end" transfer>
              <span class="tsfont-option-horizontal"></span>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="openDirectExecuteAuthority">
                  <Tooltip
                    :content="$t('term.autoexec.directexecuteauthoritytip')"
                    placement="left"
                    theme="light"
                    transfer
                    max-width="320"
                  >
                    <div class="tsfont-edit">{{ $t('term.autoexec.directexecuteauthority') }}</div>
                  </Tooltip>
                </DropdownItem>
                <DropdownItem @click.native="openDirectExecuteAudit">
                  <Tooltip
                    :content="$t('term.autoexec.directexecuteaudittip')"
                    placement="left"
                    theme="light"
                    transfer
                    max-width="320"
                  >
                    <div class="tsfont-time">{{ $t('term.autoexec.directexecuteaudit') }}</div>
                  </Tooltip>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </span>
        </div>
      </template>
      <template v-slot:right>
        <BasicDetail
          :config="toolConfig"
          operationType="tool"
          :showExecrtoolAuthority="false"
        ></BasicDetail>
      </template>
      <template v-slot:content>
        <div class="main pr-md">
          <div class="detail-content">
            <div v-if="toolConfig.description" class="bg-op padding mb-md radius-lg">{{ toolConfig.description }}</div>
            <div class="params-detail">
              <div class="item-list">
                <div class="h4 pb-md">{{ $t('page.inputparam') }}</div>
                <div v-if="!toolConfig.inputParamList || toolConfig.inputParamList.length == 0" class="text-tip">{{ $t('page.notarget', {target: $t('page.inputparam')}) }}</div>
                <template v-else>
                  <ParamsReadonly
                    v-for="(iParam,iindex) in toolConfig.inputParamList"
                    :key="iindex"
                    :typeList="paramsTypeList"
                    :config="iParam"
                  ></ParamsReadonly>
                </template>
              </div>
              <div v-if="toolConfig.argument" class="item-list free-params-box">
                <div class="h4 pb-md">{{ $t('term.autoexec.freeparameter') }}</div>
                <ParamsReadonly :typeList="paramsTypeList" :config="toolConfig.argument"></ParamsReadonly>
              </div>
              <div class="item-list">
                <div class="h4 pb-md">{{ $t('page.outputparam') }}</div>
                <div v-if="!toolConfig.outputParamList || toolConfig.outputParamList.length == 0" class="text-tip">{{ $t('page.notarget', {target: $t('page.outputparam')}) }}</div>
                <template v-else>
                  <ParamsReadonly
                    v-for="(oParam,oindex) in toolConfig.outputParamList"
                    :key="oindex"
                    :typeList="outputParamTypeList"
                    :config="oParam"
                  ></ParamsReadonly>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </TsContain>
    <component
      :is="autoexecToolUsageAiAssistantComponent"
      v-if="autoexecToolUsageAiAssistantComponent"
      ref="toolUsageAiAssistant"
    ></component>
    <component
      :is="autoexecScriptExecrtoolAuthorityComponent"
      v-if="autoexecScriptExecrtoolAuthorityComponent"
      ref="execrtoolAuthority"
      :config="toolConfig"
      :showCard="false"
      @visible-change="handleExecrtoolVisibleChange"
    ></component>
    <TsDialog
      v-if="isHelpShow"
      :isShow.sync="isHelpShow"
      :title="$t('term.autoexec.toolhelptitle', {target: toolConfig.name})"
      type="slider"
      width="large"
      @on-close="closeHelpDialog"
    >
      <template v-slot>
        <div class="tool-help-content">
          <Loading :loadingShow="helpLoading" type="fix"></Loading>
          <DocumentonlineContent
            v-if="onlineHelpContent"
            :content="onlineHelpContent"
          ></DocumentonlineContent>
          <template v-else-if="!helpLoading">
            <div class="tool-help-overview bg-op padding radius-lg mb-md">
              <div class="tool-help-overview-item">
                <div class="text-tip">{{ $t('page.description') }}</div>
                <div>{{ toolConfig.description || '-' }}</div>
              </div>
              <div v-if="toolConfig.isLib != 1" class="tool-help-overview-item">
                <div class="text-tip">{{ $t('page.executionmode') }}</div>
                <div>{{ toolConfig.execModeText || '-' }}</div>
              </div>
              <div v-if="toolConfig.isLib != 1" class="tool-help-overview-item">
                <div class="text-tip">{{ $t('term.autoexec.risklevel') }}</div>
                <div>{{ toolConfig.riskName || '-' }}</div>
              </div>
            </div>
            <div class="item-list">
              <div class="h4 pb-md">{{ $t('page.inputparam') }}</div>
              <div v-if="!toolConfig.inputParamList || toolConfig.inputParamList.length == 0" class="text-tip">{{ $t('page.notarget', {target: $t('page.inputparam')}) }}</div>
              <template v-else>
                <ParamsReadonly
                  v-for="(iParam,iindex) in toolConfig.inputParamList"
                  :key="iindex"
                  :typeList="paramsTypeList"
                  :config="iParam"
                ></ParamsReadonly>
              </template>
            </div>
            <div v-if="toolConfig.argument" class="item-list free-params-box">
              <div class="h4 pb-md">{{ $t('term.autoexec.freeparameter') }}</div>
              <ParamsReadonly :typeList="paramsTypeList" :config="toolConfig.argument"></ParamsReadonly>
            </div>
            <div class="item-list">
              <div class="h4 pb-md">{{ $t('page.outputparam') }}</div>
              <div v-if="!toolConfig.outputParamList || toolConfig.outputParamList.length == 0" class="text-tip">{{ $t('page.notarget', {target: $t('page.outputparam')}) }}</div>
              <template v-else>
                <ParamsReadonly
                  v-for="(oParam,oindex) in toolConfig.outputParamList"
                  :key="oindex"
                  :typeList="outputParamTypeList"
                  :config="oParam"
                ></ParamsReadonly>
              </template>
            </div>
          </template>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="closeHelpDialog">{{ $t('page.close') }}</Button>
        <Button
          v-if="onlineHelpContent"
          :disabled="helpLoading"
          @click="downloadOnlineHelp"
        >{{ $t('term.autoexec.downloadtoolhelp') }}</Button>
        <Button
          v-else
          v-download="exportWord"
          v-download:prevent="helpLoading || downloadLoading"
          :loading="helpLoading || downloadLoading"
        >{{ $t('term.autoexec.downloadtoolhelp') }}</Button>
        <Button
          v-if="autoexecToolUsageAiAssistantComponent"
          type="primary"
          @click="openToolUsageAiFromHelp"
        >{{ $t('term.autoexec.toolusageaihelp') }}</Button>
      </template>
    </TsDialog>
    <TsDialog
      v-if="isShow"
      :isShow.sync="isShow"
      @on-close="close()"
      @on-ok="saveAction()"
    >
      <template v-slot:header>
        <div>{{ $t('term.autoexec.publishcombinetool') }}</div>
      </template>
      <template v-slot>
        <div>
          <TsForm ref="settingForm" v-model="settingConfig" :itemList="settingForm"></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import ParamsReadonly from '@/views/pages/autoexec/components/param/params-readonly.vue';
import download from '@/resources/directives/download.js';
import ImportComponent from '@/views/components/import-component.js';
import { downloadBlobFile } from '@/resources/assets/js/downloadUtil.js';
export default {
  name: '',
  components: {
    ParamsReadonly,
    BasicDetail: () => import('./scriptDetail/edit/basic-detail'),
    DocumentonlineContent: () => import('@/views/pages/documentonline/document/documentonline-content.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  filters: {},
  directives: { download },
  props: {},
  data() {
    return {
      id: null,
      fromPath: '',
      isLoading: true,
      toolConfig: null,
      downloadLoading: false,
      isHelpShow: false,
      helpLoading: false,
      onlineHelpContent: '',
      isExecrtoolActionVisible: false,
      paramMode: {
        input: {
          mode: 'input'
        },
        output: {
          mode: 'output'
        }
      },
      actionIcons: {
        generateToCombop: 'tsfont-tool',
        copy: 'tsfont-copy',
        export: 'tsfont-download',
        delete: 'tsfont-trash-o',
        test: 'tsfont-test'
      },
      isShow: false,
      settingConfig: {
        name: '',
        typeId: '',
        description: ''
      },
      settingForm: [
        {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          validateList: ['required', 'name-special', { name: 'searchUrl', url: '/api/rest/autoexec/combop/basic/info/save', key: 'name', message: this.$t('message.targetisexists', {target: this.$t('page.name')}) }]
        },
        {
          type: 'select',
          name: 'typeId',
          value: '',
          dataList: [],
          label: this.$t('term.autoexec.toolclassification'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          validateList: ['required'],
          search: true,
          dynamicUrl: '/api/rest/autoexec/type/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getToolClassificationList,
          transfer: true
        },
        {
          type: 'textarea',
          name: 'description',
          value: '',
          label: this.$t('page.description'),
          transfer: true,
          maxlength: 500
        }
      ],
      outputParamTypeList: [] //输出参数类型
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.id) {
      this.id = parseInt(this.$route.query.id);
    }
    this.initData();
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
    async initData() {
      await this.getParamsTypeLit();
      await this.getDetail();
    },
    getDetail() {
      //根据id获取详情
      let param = { id: this.id };
      this.$api.autoexec.tool
        .getToolDetail(param)
        .then(res => {
          if (res.Status == 'OK') {
            this.toolConfig = res.Return;
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    doAction(methods, item) {
      this[methods](item);
    },
    generateToCombop(item) {
      if (item.disabled) {
        return;
      }
      Object.keys(this.settingConfig).forEach(key => {
        let i = this.toolConfig[key];
        this.settingConfig[key] = i;
      });
      this.isShow = true;
    },
    close() {
      this.isShow = false;
    },
    saveAction() {
      if (!this.$refs.settingForm.valid()) {
        return;
      }
      let data = {
        operationId: this.id,
        operationType: 'tool',
        ...this.settingConfig
      };
      this.$api.autoexec.script
        .generateAction(data)
        .then(res => {
          if (res.Status == 'OK' && res.Return) {
            this.$router.push({
              path: '/action-detail',
              query: {
                id: res.Return,
                versionStatus: 'passed'

              }
            });
          }
        })
        .finally(() => {
          this.isShow = false;
        });
    },
    test() {
      this.$router.push({
        path: '/test-detail',
        query: {
          id: this.id,
          type: 'tool',
          execMode: this.toolConfig.execMode
        }
      });
    },
    openToolUsageAiAssistant() {
      const assistant = this.$refs.toolUsageAiAssistant;
      if (!assistant || !assistant.openDialog) {
        return;
      }
      assistant.openDialog({
        toolContext: this.buildToolUsageContext(),
        documentContent: this.onlineHelpContent
      });
    },
    handleExecrtoolVisibleChange(isVisible) {
      this.isExecrtoolActionVisible = isVisible;
    },
    openDirectExecuteAuthority() {
      const authority = this.$refs.execrtoolAuthority;
      if (authority && authority.editExecrtoolAuthority) {
        authority.editExecrtoolAuthority();
      }
    },
    openDirectExecuteAudit() {
      const authority = this.$refs.execrtoolAuthority;
      if (authority && authority.showExecrtoolAuditDialog) {
        authority.showExecrtoolAuditDialog();
      }
    },
    openHelpDialog() {
      this.isHelpShow = true;
      this.loadOnlineToolHelp();
    },
    closeHelpDialog() {
      this.isHelpShow = false;
    },
    async loadOnlineToolHelp() {
      // 商业在线文档按完整工具路径精确匹配，任何异常或空结果都回退到本地结构化帮助。
      const toolName = this.toolConfig && this.toolConfig.name;
      this.onlineHelpContent = '';
      if (!toolName) {
        return;
      }
      const toolNameList = toolName.split('/');
      const keyword = toolNameList[toolNameList.length - 1];
      const silentRequestConfig = {headers: {unConsole: 1}};
      this.helpLoading = true;
      try {
        const searchRes = await this.$api.documentonline.searchDocument({keyword: keyword, pageSize: 100}, silentRequestConfig);
        const documentList = searchRes.Status === 'OK' && searchRes.Return ? searchRes.Return.tbodyList || [] : [];
        const expectedPathSuffix = `/${toolName}.md`;
        const document = documentList.find(item => item.filePath && item.filePath.endsWith(expectedPathSuffix));
        if (!document) {
          return;
        }
        const detailRes = await this.$api.documentonline.getDocumentDetail({filePath: document.filePath}, silentRequestConfig);
        if (detailRes.Status === 'OK' && detailRes.Return && detailRes.Return.content) {
          this.onlineHelpContent = detailRes.Return.content;
        }
      } catch (error) {
        // 在线文档属于可选商业能力，失败时由页面已有工具数据提供帮助，不打断用户操作。
      } finally {
        this.helpLoading = false;
      }
    },
    openToolUsageAiFromHelp() {
      this.closeHelpDialog();
      this.$nextTick(() => {
        this.openToolUsageAiAssistant();
      });
    },
    downloadOnlineHelp() {
      if (!this.onlineHelpContent) {
        return;
      }
      const toolNameList = (this.toolConfig.name || 'tool').split('/');
      const fileName = toolNameList[toolNameList.length - 1];
      downloadBlobFile(this.onlineHelpContent, {
        defaultFileName: `[${fileName}]帮助.md`,
        type: 'text/markdown;charset=utf-8'
      });
    },
    buildToolUsageContext() {
      // 详情页只提供当前工具自身信息，与组合工具中的单工具介绍入口保持一致。
      const toolConfig = this.toolConfig || {};
      return {
        operationId: toolConfig.id || this.id,
        operationType: 'tool',
        operationName: toolConfig.name,
        description: toolConfig.description || '',
        riskVo: toolConfig.riskVo || null,
        execMode: toolConfig.execMode,
        profileId: toolConfig.defaultProfileId || null,
        inputParamList: toolConfig.inputParamList || [],
        argument: toolConfig.argument || null,
        outputParamList: toolConfig.outputParamList || []
      };
    },
    toggleAction() {
      let param = {
        id: this.toolConfig.id,
        isActive: this.toolConfig.isActive
      };
      this.$api.autoexec.tool.updateToolStatus(param).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess')); //保存成功
          this.getDetail();
        }
      });
    },
    getParamsTypeLit() { //选择组件类型
      let data = {
        enumClassList: ['neatlogic.framework.autoexec.constvalue.ParamType', 'neatlogic.framework.autoexec.constvalue.OutputParamType']
      };
      return this.$api.common.getBatchSelectList(data).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return || {};
          this.paramsTypeList = obj['neatlogic.framework.autoexec.constvalue.ParamType'] || [];
          this.outputParamTypeList = obj['neatlogic.framework.autoexec.constvalue.OutputParamType'] || [];
        }
      });
    }
  },
  computed: {
    autoexecToolUsageAiAssistantComponent() {
      return ImportComponent && ImportComponent.autoexecToolUsageAiAssistant ? ImportComponent.autoexecToolUsageAiAssistant : null;
    },
    autoexecScriptExecrtoolAuthorityComponent() {
      return ImportComponent && ImportComponent.autoexecScriptExecrtoolAuthority ? ImportComponent.autoexecScriptExecrtoolAuthority : null;
    },
    getIcon() {
      return function(type, item) {
        let className = this.actionIcons[type] || 'tsfont-tool';
        if (item.disabled) {
          className += ' disable';
        }
        return className;
      };
    },
    exportWord() {
      // 导出参数说明
      return {
        url: '/api/binary/autoexec/tool/param/export',
        method: 'post',
        params: {toolId: this.id, isAll: 0},
        changeStatus: status => {
          if (status == 'start') {
            this.downloadLoading = true;
          } else if (status == 'success' || status == 'error') {
            this.downloadLoading = false;
          }
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.main {
  height: 100%;
  .detail-content {
    height: 100%;
    overflow-y: auto;
  }
  .item-list {
    padding-bottom: 16px;
  }
}
.tool-help-content {
  min-height: 300px;
  position: relative;
  .item-list {
    padding-bottom: 16px;
  }
}
.tool-help-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  .tool-help-overview-item {
    > div:last-child {
      padding-top: 6px;
      word-break: break-word;
    }
  }
}
.free-params-box{
  .param-header{
    padding-bottom: @space-sm;
  }
  .param-list{
    position: relative;
    padding-right: 60px;
    padding-bottom: 16px;
    &:last-child{
      padding-bottom: 10px;
    }
    .btn-item{
      width: 50px;
      position: absolute;
      right: 0;
      top: 0;
      display: flex;
      justify-content: space-between;
      height: 32px;
      line-height: 32px;
    }
  }
  .item-col{
    display: flex;
    justify-content: space-between;
    height: 32px;
    line-height: 32px;
  }
}
</style>
