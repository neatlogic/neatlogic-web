<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
  >
    <template v-slot>
      <div>
        <Tabs
          v-if="rowData.isMcp"
          v-model="activeTab"
          :animated="false"
          class="mb-md"
        >
          <TabPane :label="$t('term.framework.apitest')" name="api"></TabPane>
          <TabPane :label="$t('term.framework.mcptest')" name="mcp"></TabPane>
        </Tabs>
        <div v-if="!rowData.isMcp || activeTab === 'api'">
          <TsFormItem :label="$t('page.interface')" :labelWidth="80">
            <strong>{{ rowData.url }}</strong>
          </TsFormItem>
          <TsFormItem v-if="helpData.description" :labelWidth="80" :label="$t('page.description')">
            {{ helpData.description }}
          </TsFormItem>
          <TsFormItem v-if="rowData.apiType == 'custom'" :labelWidth="80" :label="rowData.authtypeName">
            <component
              :is="rowData.authtype"
              v-if="rowData.apiType == 'custom'"
              ref="authHandler"
              @setConfig="setAuthConfig"
            ></component>
          </TsFormItem>
          <TsFormItem v-if="helpData.example" :labelWidth="80" :label="$t('term.report.example')">
            <JsonViewer boxed copyable :value="helpData.example"></JsonViewer>
          </TsFormItem>
          <TsFormItem :label=" $t('page.request')" :labelWidth="80">
            <div class="mb-md"><TsFormRadio v-model="tab" :dataList="requestType"></TsFormRadio></div>
          </TsFormItem>
          <TsFormItem v-if="helpData.input && tab === 'form'" :label="$t('page.inputparam')" :labelWidth="80">
            <Table
              class="api-input-table"
              :columns="displayInputColumns"
              :data="helpData.input"
              border
            >
              <template v-slot:input="{ row }">
                <div>
                  <TsFormSwitch
                    v-if="row.type.toLowerCase().includes('boolean')"
                    :value="testData.param[row.name]"
                    :trueValue="true"
                    :falseValue="false"
                    @on-change="value => setValue(row, value)"
                  ></TsFormSwitch>
                  <TsFormInput
                    v-else-if="!row.type.startsWith('file')"
                    :value="testData.param[row.name]"
                    width="100%"
                    @on-change="
                      name => {
                        setValue(row, name);
                      }
                    "
                  ></TsFormInput>
                  <div v-else>
                    <TsUpLoad
                      styleType="button"
                      className="smallUpload"
                      :beforeUpload="
                        (file) => {
                          setValue(row, file);
                          return false;
                        }
                      "
                    ></TsUpLoad>
                  </div>
                </div>
              </template>
            </Table>
          </TsFormItem>
          <TsFormItem v-else-if="tab === 'json'" :label="$t('page.inputparam')" :labelWidth="80">
            <TsCodemirror
              :value="JSON.stringify(testData.param, null, 2)"
              codeMode="json"
              @change="setJsonValue"
            ></TsCodemirror>
            <div v-if="error" class="pt-md text-error">{{ error }}</div>
          </TsFormItem>
          <TsFormItem :labelWidth="80">
            <Button
              v-if="apiType === 'rest'"
              style="width:100%"
              type="primary"
              :loading="isApiTestLoading"
              @click="executeTest"
            >{{ $t('page.sendrequest') }}</Button>
            <Button
              v-if="apiType === 'binary'"
              style="width:100%"
              type="primary"
              :loading="isApiTestLoading"
              @click="executeDownload"
            >{{ $t('page.sendrequest') }}</Button>
          </TsFormItem>
          <TsFormItem v-if="testData.result" :label="$t('page.outputresults')" :labelWidth="80">
            <JsonViewer
              boxed
              copyable
              :value="testData.result"
            ></JsonViewer>
          </TsFormItem>
        </div>
        <div v-if="rowData.isMcp && activeTab === 'mcp'">
          <TsFormItem :label="$t('term.framework.toolname')" :labelWidth="100">
            <span>{{ mcpHelpData.toolName || '-' }}</span>
          </TsFormItem>
          <TsFormItem :label="$t('term.framework.calladdress')" :labelWidth="100">
            <span>{{ mcpHelpData.scopedEndpoint || mcpHelpData.endpoint || '-' }}</span>
          </TsFormItem>
          <TsFormItem :label="$t('term.framework.availablestatus')" :labelWidth="100">
            <span v-if="mcpHelpData.available" class="text-success">{{ $t('term.framework.available') }}</span>
            <span v-else class="text-error">{{ mcpHelpData.unavailableReason || mcpHelpMessage || $t('term.framework.unavailable') }}</span>
          </TsFormItem>
          <TsFormItem v-if="isDangerousTool" :label="$t('term.framework.risktip')" :labelWidth="100">
            <div class="text-warning">{{ $t('term.framework.mcpdebugdangeroustip') }}</div>
          </TsFormItem>
          <TsFormItem :label="$t('term.framework.callarguments')" :labelWidth="100">
            <TsCodemirror
              :value="argumentText"
              codeMode="json"
              @change="setArgumentText"
            ></TsCodemirror>
            <div v-if="argumentError" class="pt-md text-error">{{ argumentError }}</div>
          </TsFormItem>
          <TsFormItem :label="$t('term.framework.requestbody')" :labelWidth="100">
            <JsonViewer boxed copyable :value="mcpCallRequest"></JsonViewer>
          </TsFormItem>
          <TsFormItem :labelWidth="100">
            <Button
              style="width:100%"
              type="primary"
              :loading="isMcpDebugLoading"
              :disabled="!mcpHelpData.available || !!argumentError"
              @click="executeMcpCall"
            >{{ $t('page.sendrequest') }}</Button>
          </TsFormItem>
          <TsFormItem v-if="mcpDebugResult" :label="$t('term.framework.debugresult')" :labelWidth="100">
            <JsonViewer boxed copyable :value="mcpDebugResult"></JsonViewer>
          </TsFormItem>
        </div>
      </div>
    </template>
  </TsDialog>
</template>

<script>
import * as authHandler from './authhandler/index.js';

export default {
  name: 'ApiTest',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue'),
    JsonViewer: () => import('vue-json-viewer'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror'),
    ...authHandler
  },
  props: {
    rowData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.framework.apitest'),
        type: 'slider',
        isShow: true,
        maskClose: false,
        width: '1100px',
        hasFooter: false
      },
      activeTab: 'api',
      requestType: [
        { value: 'form', text: this.$t('term.framework.formrequesttype') },
        { value: 'json', text: this.$t('term.framework.jsonrequesttype') }
      ],
      tab: 'form',
      helpData: {},
      testData: {},
      error: '',
      mcpHelpData: {},
      mcpHelpMessage: '',
      argumentText: '{}',
      argumentError: '',
      mcpDebugResult: null,
      isApiTestLoading: false,
      isMcpDebugLoading: false,
      inputColumns: Object.freeze([
        { title: this.$t('page.name'), key: 'name' },
        { title: this.$t('page.description'), key: 'description' },
        { title: this.$t('page.type'), key: 'type' },
        { title: this.$t('page.rule'), key: 'rule' },
        { title: this.$t('page.isrequired'), key: 'isRequired', render: (h, params) => {
          if (params.row.isRequired) {
            return h('div', {class: 'text-success'}, this.$t('page.yes'));
          } else {
            return h('div', {class: 'text-grey'}, this.$t('page.no'));
          }
        } },
        { title: this.$t('page.explain'), key: 'help' },
        { title: this.$t('page.insert'), key: 'input', slot: 'input' }
      ])
    };
  },
  created() {
    this.getHelpData(this.rowData);
    this.testData.token = this.rowData.url;
    this.testData.param = {};
    if (this.rowData.isMcp) {
      this.getMcpHelp();
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    setValue(row, value) {
      const type = row.type.toLowerCase();
      if (type.includes('long') || type.includes('int')) {
        value = parseInt(value);
      } else if (type.includes('json')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = null;
        }
      } else if (type.includes('double')) {
        value = parseFloat(value);
      } else if (type.includes('boolean')) {
        value = !!value;
      }
      if (value != null) {
        this.$set(this.testData.param, row.name, value);
      } else {
        this.$delete(this.testData.param, row.name);
      }
      this.$forceUpdate();
    },
    setJsonValue(value) {
      this.error = '';
      let j = null;
      if (this.rowData.type !== 'raw') {
        try {
          j = JSON.parse(value);
          this.$set(this.testData, 'param', j);
          this.$forceUpdate();
        } catch (e) {
          this.error = e.message;
        }
      } else {
        this.$set(this.testData, 'param', value);
        this.$forceUpdate();
      }
    },
    async executeDownload() {
      if (this.isApiTestLoading) {
        return;
      }
      this.isApiTestLoading = true;
      this.$delete(this.testData, 'result');
      try {
        let header = null;
        if (this.rowData.apiType == 'custom') {
          //如果是公共接口，需要将认证信息送进后台生成认证Header才能调用测试接口
          const res = await this.$api.framework.apiManage.getAuthHeader(this.rowData.authtype, this.testData.authData);
          if (res.Status == 'OK') {
            header = res.Return;
          }

          if (this.testData.authData.method == 'get') {
            header.type = 'get';
          }
        }
        const formData = new FormData();
        for (let k in this.testData.param) {
          let paramValue = this.testData.param[k];
          if (Array.isArray(paramValue)) {
            paramValue.forEach(item => {
              formData.append(k, item);
            });
          } else {
            formData.append(k, paramValue);
          }
        }
        const res = await this.$api.framework.apiManage.upload(this.rowData.url, formData, header);
        if (res.status == '200') {
          if (res.data.type == 'application/json') {
            //处理返回的文本
            const text = await res.data.text();
            const jsonText = JSON.parse(text);
            this.$set(this.testData, 'result', jsonText);
          } else {
            //处理返回的文件流
            const aLink = document.createElement('a');
            let blob = new Blob([res.data], {
              type: 'application/octet-stream'
            });
            aLink.href = URL.createObjectURL(blob);
            let contentDisposition = decodeURI(res.headers['content-disposition']);
            let fileName = this.$t('term.framework.apitestdownloaddata');
            let filePath = '';
            filePath = contentDisposition.indexOf('filename=') > -1 ? contentDisposition.split('filename=')[1] : contentDisposition.split('fileName=')[1];
            if (!this.$utils.isEmpty(filePath)) {
              fileName = filePath.substring(1, filePath.length - 1);
            }
            aLink.download = fileName;
            document.body.appendChild(aLink);
            aLink.click();
            aLink.remove();
          }
        }
      } finally {
        this.isApiTestLoading = false;
      }
    },
    setAuthConfig(authData) {
      this.testData.authData = authData;
    },
    async executeTest() {
      if (this.isApiTestLoading) {
        return;
      }
      this.isApiTestLoading = true;
      this.$delete(this.testData, 'result');
      try {
        let header = {};
        if (this.rowData.apiType == 'custom') {
          //如果是公共接口，需要将认证信息送进后台生成认证Header才能调用测试接口
          const res = await this.$api.framework.apiManage.getAuthHeader(this.rowData.authtype, this.testData.authData);
          if (res.Status == 'OK') {
            header = res.Return;
          }

          if (this.testData.authData.method == 'get') {
            header.type = 'get';
          }
        }
        if (this.rowData.type === 'raw') {
          header['Content-Type'] = 'text/plain';
        }
        const res = await this.$api.framework.apiManage.test(this.testData.token, this.testData.param, header);
        this.$set(this.testData, 'result', res);
      } catch (error) {
        this.$set(this.testData, 'result', error && error.data ? error.data : error);
      } finally {
        this.isApiTestLoading = false;
      }
    },
    getHelpData({ helpUrl }) {
      //help接口返回无return层和status层
      return this.$api.framework.apiManage
        .help(helpUrl)
        .then(res => {
          this.helpData = res;
        })
        .catch(error => {
          this.$Notice.error({ title: this.$t('message.framework.apihelperror'), desc: error });
        });
    },
    getMcpHelp() {
      this.mcpHelpMessage = this.$t('page.loadingtip');
      return this.$api.framework.apiManage
        .getMcpHelp({ token: this.rowData.token })
        .then(res => {
          if (res.Status === 'OK') {
            this.mcpHelpData = res.Return || {};
          }
          if (!Object.keys(this.mcpHelpData).length) {
            this.mcpHelpMessage = this.$t('term.framework.mcphelploadfailed');
          }
        })
        .catch(error => {
          this.mcpHelpMessage = error && error.data ? error.data.Message : this.$t('term.framework.mcphelploadfailed');
        });
    },
    setArgumentText(value) {
      this.argumentText = value;
      this.argumentError = '';
      try {
        JSON.parse(value || '{}');
      } catch (e) {
        this.argumentError = e.message;
      }
    },
    executeMcpCall() {
      this.isMcpDebugLoading = true;
      this.mcpDebugResult = null;
      this.$api.framework.apiManage
        .mcpCall(this.mcpHelpData.scopedEndpoint || this.mcpHelpData.endpoint, this.mcpCallRequest)
        .then(res => {
          this.mcpDebugResult = res;
        })
        .catch(error => {
          this.mcpDebugResult = error && error.data ? error.data : error;
        })
        .finally(() => {
          this.isMcpDebugLoading = false;
        });
    }
  },
  computed: {
    displayInputColumns() {
      const inputList = Array.isArray(this.helpData.input) ? this.helpData.input : [];
      const hiddenColumnKeyList = ['rule', 'help'].filter(key => !inputList.some(item => !this.$utils.isEmpty(item[key])));
      return this.inputColumns.filter(column => !hiddenColumnKeyList.includes(column.key));
    },
    apiType() {
      if (this.rowData.url.startsWith('api/binary')) {
        return 'binary';
      } else {
        return 'rest';
      }
    },
    parsedArguments() {
      try {
        return JSON.parse(this.argumentText || '{}');
      } catch (e) {
        return {};
      }
    },
    mcpCallRequest() {
      return {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: this.mcpHelpData.toolName,
          arguments: this.parsedArguments
        }
      };
    },
    isDangerousTool() {
      return this.mcpHelpData.annotations && this.mcpHelpData.annotations.readOnlyHint !== true;
    }
  }
};
</script>

<style lang="less" scoped>
.api-input-table {
  ::v-deep .ivu-table-tbody .ivu-table-cell {
    line-height: 22px;
  }
}
</style>
