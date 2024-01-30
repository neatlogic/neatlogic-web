<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
  >
    <template v-slot>
      <div>
        <div v-if="Object.keys(helpData).length">
          <Divider orientation="left">{{ $t('page.interface') }}</Divider>
          <div>{{ rowData.url }}</div>
          <Divider v-if="helpData.description" orientation="left">{{ $t('page.description') }}</Divider>
          <div v-if="helpData.description">{{ helpData.description }}</div>
          <Divider v-if="rowData.apiType == 'custom'" orientation="left">{{ rowData.authtypeName }}</Divider>
          <component
            :is="rowData.authtype"
            v-if="rowData.apiType == 'custom'"
            ref="authHandler"
            @setConfig="setAuthConfig"
          ></component>
          <Divider v-if="helpData.example" orientation="left">{{ $t('term.report.example') }}</Divider>
          <div v-if="helpData.example">
            <JsonViewer boxed copyable :value="helpData.example"></JsonViewer>
          </div>
          <Divider orientation="left">{{ $t('page.request') }}</Divider>
          <div class="mb-md"><TsFormRadio v-model="tab" :dataList="requestType"></TsFormRadio></div>
          <Divider v-if="helpData.input" orientation="left">{{ $t('page.inputparam') }}</Divider>
          <div v-if="tab == 'form'">
            <Table
              v-if="helpData.input"
              :columns="inputColumns"
              :data="helpData.input"
              border
            >
              <template v-slot:input="{ row }">
                <div>
                  <TsFormInput
                    v-if="!row.type.startsWith('file')"
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
            <div class="pt-md">
              <Button
                v-if="apiType === 'rest'"
                style="width:100%"
                type="primary"
                @click="executeTest"
              >{{ $t('page.sendrequest') }}</Button>
              <Button
                v-if="apiType === 'binary'"
                style="width:100%"
                type="primary"
                @click="executeDownload"
              >{{ $t('page.sendrequest') }}</Button>
            </div>
          </div>
          <div v-else-if="tab == 'json'">
            <TsFormInput
              height="400px"
              type="textarea"
              :value="JSON.stringify(testData.param, null, 2)"
              @on-change="setJsonValue"
            ></TsFormInput>
            <div class="pt-md">
              <Button
                v-if="apiType === 'rest'"
                style="width:100%"
                type="primary"
                @click="executeTest"
              >{{ $t('page.sendrequest') }}</Button>
              <Button
                v-if="apiType === 'binary'"
                style="width:100%"
                type="primary"
                @click="executeDownload"
              >{{ $t('page.sendrequest') }}</Button>
            </div>
          </div>
          <Divider v-if="testData.result" orientation="left">{{ $t('page.outputresults') }}</Divider>
          <JsonViewer
            v-if="testData.result"
            boxed
            copyable
            :value="testData.result"
          ></JsonViewer>
        </div>
        <div v-else>{{ helpMessage }}</div>
      </div>
    </template>
  </TsDialog>
</template>

<script>
import * as authHandler from './authhandler/index.js';
import download from '@/resources/mixins/download.js';

export default {
  name: 'ApiTest',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    JsonViewer: resolve => require(['vue-json-viewer'], resolve),
    ...authHandler
  },
  mixins: [download],
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
        maskClose: true,
        width: 'large',
        hasFooter: false
      },
      requestType: [
        { value: 'form', text: this.$t('term.framework.formrequesttype') },
        { value: 'json', text: this.$t('term.framework.jsonrequesttype') }
      ],
      tab: 'form',
      helpData: {},
      testData: {},
      helpMessage: '',
      inputColumns: Object.freeze([
        { title: this.$t('page.name'), key: 'name' },
        { title: this.$t('page.explain'), key: 'description' },
        { title: this.$t('page.type'), key: 'type' },
        { title: this.$t('page.isrequired'), key: 'isRequired', width: 100, render: (h, params) => {
          if (params.row.isRequired) {
            return h('div', {class: 'text-success'}, this.$t('page.yes'));
          } else {
            return h('div', {class: 'text-grey'}, this.$t('page.no'));
          }
        } },
        { title: this.$t('page.help'), key: 'help' },
        { title: this.$t('page.insert'), key: 'input', slot: 'input' }
      ]),
      outputColumns: Object.freeze([
        { title: this.$t('page.name'), key: 'name', tree: true },
        { title: this.$t('page.type'), key: 'type' },
        { title: this.$t('page.explain'), key: 'description' }
      ])
    };
  },
  created() {
    // eslint-disable-next-line generator-star-spacing
    this.counter = (function*() {
      let i = 1;
      while (true) yield i++;
    })();
    this.getHelpData(this.rowData);
    this.testData.token = this.rowData.url;
    this.testData.param = {};
  },
  mounted() {},
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
      let j = null;
      if (this.rowData.type !== 'raw') {
        try {
          j = JSON.parse(value);
          this.$set(this.testData, 'param', j);
          this.$forceUpdate();
        } catch (e) {
          e;
        }
      } else {
        this.$set(this.testData, 'param', value);
        this.$forceUpdate();
      }
    },
    async executeDownload() {
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
      const p = {
        url: this.rowData.url,
        params: this.testData.param,
        header: header
      };
      const formData = new FormData();
      for (let k in this.testData.param) {
        formData.append(k, this.testData.param[k]);
      }
      const _this = this;
      this.$api.framework.apiManage.upload(this.rowData.url, formData, header).then(async res => {
        if (res.status == '200') {
          if (res.data.type == 'application/json') {
            //处理返回的文本
            const text = await res.data.text();
            const jsonText = await JSON.parse(text);
            this.$set(this.testData, 'result', jsonText);
          } else {
            //处理返回的文件流
            const aLink = document.createElement('a');
            let blob = new Blob([res.data], {
              type: 'application/octet-stream'
            });
            aLink.href = URL.createObjectURL(blob);
            let contentDisposition = decodeURI(res.headers['content-disposition']);
            let filePath = '';
            filePath = contentDisposition.indexOf('filename=') > -1 ? contentDisposition.split('filename=')[1] : contentDisposition.split('fileName=')[1];
            let fileName = filePath.substring(1, filePath.length - 1);
            aLink.download = fileName;
            document.body.appendChild(aLink);
            aLink.click();
            aLink.remove();  
          }
        }
      });
    },
    setAuthConfig(authData) {
      this.testData.authData = authData;
    },
    async executeTest() {
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
      this.$api.framework.apiManage
        .test(this.testData.token, this.testData.param, header)
        .then(res => {
          this.$set(this.testData, 'result', res);
        })
        .catch(error => {
          this.$set(this.testData, 'result', error);
        });
    },
    getHelpData({ type, token, helpUrl }) {
      this.helpMessage = this.$t('page.loading');
      const param = `${type === 'object' ? 'rest' : type}/${token}`;
      //help接口返回无return层和status层
      return this.$api.framework.apiManage
        .help(helpUrl)
        .then(res => {
          this.helpData = this.addId(res);
          if (!Object.values(this.helpData).length) {
            this.helpMessage = this.$t('message.framework.notapihelp', {'target': this.rowData.token});
          }
        })
        .catch(error => {
          this.$Notice.error({ title: this.$t('message.framework.apihelperror'), desc: error });
          this.helpMessage = this.$t('message.framework.apihelperror');
        });
    },
    addId(res) {
      // https://www.iviewui.com/components/table#SXSJ
      // table组件使用树形数据时，必须指定 row-key，比如 id
      // id必须唯一，不能重复，不然控制台会提示key重复的报错，而且鼠标悬浮高亮行会出错
      // 这里用生成器counter给有children的output表格数据添加唯一的id
      if (!res.output) return res;
      res.output.forEach(item => {
        item.id = this.counter.next().value;
        if (item.children) {
          item.children.forEach(child => {
            child.id = this.counter.next().value;
          });
        }
      });
      return res;
    }
  },
  computed: {
    apiType() {
      if (this.rowData.url.startsWith('api/binary')) {
        return 'binary';
      } else {
        return 'rest';
      }
    }
  }
};
</script>

<style lang="less" scoped></style>
