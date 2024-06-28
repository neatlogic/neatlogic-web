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
          <ExtendTagTest :formData="formData" :extendConfigList="extendConfigList" :formItemList="formItemList"></ExtendTagTest>
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
    TsSheet: () => import('./TsSheet.vue'),
    ExtendTagTest: () => import('./extend/extend-tag-test.vue')
  },
  directives: { clipboard },
  props: {
    data: { type: Object },
    formSceneUuid: [String, Array],
    extendConfigList: Array
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
              this.formItemList.push(component);
            } else {
              this.formItemList.push(...component);
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
