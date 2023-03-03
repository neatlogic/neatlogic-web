<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <Tabs v-model="currentTab" name="preview">
        <TabPane label="表单" name="form" tab="preview">
          <TsSheet
            v-if="isReady"
            ref="sheet"
            mode="read"
            :value="data"
            :data="inputFormData"
            @emit="emitFn"
          ></TsSheet>
        </TabPane>
        <TabPane label="输入数据" name="input" tab="preview">
          <div class="text-grey mb-sm">
            帮助：输入数据测试表单对数据的处理是否正常，输入数据支持两种格式：1、直接使用输出数据。2、简化格式：{"组件1uuid":"值1","组件2uuid":"值2"}
          </div>
          <div v-if="formItemList && formItemList.length > 0" class="mb-sm">
            <span class="text-grey">组件列表（点击复制组件uuid）：</span>
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
          label="输出数据"
          name="data"
          tab="preview"
        >
          <JsonViewer boxed copyable :value="formData"></JsonViewer>
        </TabPane>
        <TabPane
          v-if="!$utils.isEmpty(emitData)"
          label="触发结果"
          name="emit"
          tab="preview"
        >
          <TsTable
            :theadList="[{key:'emit',title:'触发动作'},{key:'value',title:'值'},{key:'time',title:'触发时间'}]"
            :tbodyList="tbodyList"
          >
          </TsTable>
        </TabPane>
      </Tabs>
      <div></div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">关闭</Button>
      <Button type="primary" ghost @click="updateFormData()">更新数据</Button>
      <Button type="primary" @click="getFormData()">模拟提交</Button>
    </template>
  </TsDialog>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
import { default as emitTypeList } from './form/define/common/emittype.json';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve),
    JsonViewer: resolve => require(['vue-json-viewer'], resolve),
    TsSheet: resolve => require(['./TsSheet.vue'], resolve)
  },
  directives: { clipboard },
  props: {
    data: { type: Object }
  },
  data() {
    return {
      emitTypeList: emitTypeList,
      isReady: true,
      currentTab: 'form',
      dialogConfig: {
        title: '表单预览',
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
      emitData: {}
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
      this.$Message.success('成功复制组件“' + label + '”UUID');
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
