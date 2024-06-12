<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <Tabs v-model="currentTab" name="preview" :animated="false">
        <TabPane :label="$t('page.form')" name="form" tab="preview">
          <TsSheet
            v-if="isReady"
            ref="sheet"
            mode="read"
            :value="data"
            :formSceneUuid="formSceneUuid"
            :data="inputFormData"
            @emit="emitFn"
          ></TsSheet>
        </TabPane>
        <TabPane :label="$t('term.framework.inputdata')" name="input" tab="preview">
          <div class="text-grey mb-sm">
            {{ $t('message.framework.forminputdatatip') }}
          </div>
          <div v-if="formItemList && formItemList.length > 0" class="mb-sm">
            <span class="text-grey">{{ $t('term.framework.formcomplistlable') }}：</span>
            <Tag
              v-for="(formitem, index) in formItemList"
              :key="index"
              v-clipboard="formitem.uuid"
              v-clipboard:success="
                val => {
                  copySuccess(formitem.label);
                }
              "
              class="cursor"
            >
              {{ formitem.label }}
            </Tag>
          </div>
          <TsCodemirror v-model="inputData" codeMode="json"></TsCodemirror>
        </TabPane>
        <TabPane
          v-if="!$utils.isEmpty(formData)"
          :label="$t('term.framework.outputdata')"
          name="data"
          tab="preview"
        >
          <JsonViewer boxed copyable :value="formData"></JsonViewer>
        </TabPane>
        <TabPane
          label="测试"
          name="test"
          tab="preview"
        >
          <JsonViewer boxed copyable :value="currentData"></JsonViewer>
          <TsCodemirror v-model="testData" codeMode="json"></TsCodemirror>
          <TsCodemirror v-model="testmounted" codeMode="javascript"></TsCodemirror>
          <Button @click="getTest()">测试</Button>
          输出：
          <JsonViewer boxed copyable :value="outinpuData"></JsonViewer>
        </TabPane>
        <TabPane
          v-if="!$utils.isEmpty(emitData)"
          label="触发结果"
          name="emit"
          tab="preview"
        >
          <TsTable
            :theadList="[{key:'emit',title:$t('page.triggeraction')},{key:'value',title:$t('page.value')},{key:'time',title:$t('page.triggertime')}]"
            :tbodyList="tbodyList"
          >
          </TsTable>
        </TabPane>
      </Tabs>
      <div></div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.close') }}</Button>
      <Button type="primary" ghost @click="updateFormData()">{{ $t('page.updatedata') }}</Button>
      <Button type="primary" @click="getFormData()">{{ $t('term.framework.simulatedsubmission') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
import { default as emitTypeList } from './form/define/common/emittype.js';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror'),
    JsonViewer: () => import('vue-json-viewer'),
    TsSheet: () => import('./TsSheet.vue')
  },
  directives: { clipboard },
  props: {
    data: { type: Object },
    formSceneUuid: [String, Array]
  },
  data() {
    return {
      emitTypeList: emitTypeList,
      isReady: true,
      currentTab: 'form',
      dialogConfig: {
        title: this.$t('page.preview'),
        type: 'slider',
        maskClose: true,
        isShow: true,
        width: 'large'
      },
      errorData: {},
      formData: {},
      inputData: '',
      inputFormData: {},
      formItemList: [],
      emitData: {},
      currentData: [
        {
          'attributeUuid': '6f894a16a3a044ad860b8c4d77ec735d',
          'handler': 'formcustom',
          'dataList': {
            'systemName': 'TLOP',
            'systemZhName': '开放平台',
            'systemNum': '3024',
            'sysLevel': '重要',
            'xuqiu': [
              'XQ20240512-002'
            ],
            'env': '测试',
            'envCode': 'SIT',
            'os': [
              {
                'uuid': 1171687085187082,
                'name': 'TLOP_三资村行前置机',
                'osType': 'ECS',
                'oscfg': '中配[8c16g]',
                'osver': '麒麟v10',
                'sysUesr': '22',
                'netRegion': 'DMZ区域',
                'netName': '测试DMZ区',
                'netCode': 'SIT_DMZ',
                '_selected': false
              }
            ]
          }
        }
      ],
      testData: null,
      testmounted: '',
      outinpuData: null,
      testM: {}
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      if (!this.$utils.isEmpty(this.data) && this.data.tableList && this.data.tableList.length > 0) {
        this.data.tableList.forEach(d => {
          let component = d.component;
          while (component && !this.$utils.isEmpty(component)) {
            if (!Array.isArray(component)) {
              if (component.hasValue) {
                this.formItemList.push(component);
              }
            } else {
              component.forEach(c => {
                if (c.hasValue) {
                  this.formItemList.push(c);
                }
              });
            }
            if (component.isContainer && component.component) {
              component = component.component;
            } else {
              component = null;
            }
          }
        });
      }
    },
    getEmitTypeLabel(name) {
      const emittype = this.emitTypeList.find(d => d.value === name);
      if (emittype) {
        return emittype.text;
      }
    },
    copySuccess(label) {
      this.$Message.success(this.$t('message.copysuccess') + '“' + label + '”UUID');
    },
    close() {
      this.$emit('close');
    },
    emitFn(data) {
      if (data && !this.$utils.isEmpty(data)) {
        for (let key in data) {
          this.$set(this.emitData, key, { value: data[key], time: this.$utils.getCurrenttime('HH:mm:ss') });
        }
      }
    },
    getFormData() {
      const sheet = this.$refs['sheet'];
      this.errorData = sheet.validData();
      this.formData = sheet.getFormData();
    },
    updateFormData() {
      this.isReady = false;
      this.$nextTick(() => {
        try {
          this.inputFormData = JSON.parse(this.inputData);
          this.currentTab = 'form';
        } catch (e) {
          //
        }
        this.isReady = true;
      });
    },
    getTest() {
      console.log(this.testData, JSON.parse(this.testData));
      let currentConfig = JSON.parse(this.testData);
      try {
        if (this.testmounted) {
          // eslint-disable-next-line no-eval
          const testmounted = eval('(' + this.testmounted + ')');
          console.log(testmounted);
          this.testM = testmounted.methods;
          let methods = testmounted.methods;
          Object.keys(methods).forEach(methodsName => {
            if (typeof methods[methodsName] === 'function' && !this.methodsName) {
              this[methodsName] = methods[methodsName].bind(this);
            }
          });

          this.outinpuData = this.setExtendValue(currentConfig, this.currentData);
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
  filter: {},
  computed: {
    tbodyList() {
      const tbodyList = [];
      for (let k in this.emitData) {
        tbodyList.push({emit: this.getEmitTypeLabel(k), value: this.emitData[k].value, time: this.emitData[k].time});
      }
      return tbodyList;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
