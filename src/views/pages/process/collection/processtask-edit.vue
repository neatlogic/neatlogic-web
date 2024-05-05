<template>
  <div>
    <TsFormItem :label="$t('page.title')" labelPosition="top" :required="true">
      <TsFormInput
        ref="title"
        v-model="taskData.title"
        :placeholder="$t('form.placeholder.pleaseinput', { target: $t('page.title') })"
        maxlength="50"
        :validateList="['required']"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem
      v-if="isNeedPriority"
      :label="$t('page.priority')"
      labelPosition="top"
      :required="true"
    >
      <TsFormSelect
        ref="priorityUuid"
        v-model="taskData.priorityUuid"
        :dataList="priorityList"
        valueName="uuid"
        textName="name"
        :validateList="['required']"
        :clearable="false"
        transfer
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('page.tag')" labelPosition="top">
      <WorkLabel ref="workLabel" :list="tagList" :showLogo="false"></WorkLabel>
    </TsFormItem>
    <TsFormItem v-if="processData.formConfig" :label="$t('term.process.reportcontent')" labelPosition="top">
      <div class="border-base radius-md padding-md">
        <FormSetting
          ref="formSetting"
          :draftData="processData"
          :priorityList="priorityList"
          @setPriorityByForm="setPriorityByForm"
        ></FormSetting>
      </div>
    </TsFormItem>
    <TsFormItem v-if="isNeedFile" :label="$t('page.accessory')" labelPosition="top">
      <TsUpLoad
        class="upload"
        data-type="itsm"
        styleType="button"
        className="smallUpload"
        :multiple="true"
        @remove="getFileList"
        @getFileList="getFileList"
      ></TsUpLoad>
    </TsFormItem>
    <TsFormItem v-if="isNeedContent" :label="$t('page.description')" labelPosition="top">
      <TsCkeditor v-model="content" :showIconToggle="true"></TsCkeditor>
    </TsFormItem>
  </div>
</template>
<script>
import '@/views/pages/process/flow/topoComponent/index.js';
import Dispatch from '@/views/pages/process/task/processdispatch/index.js';
import { store } from '@/views/pages/process/task/processdispatch/dispatchState.js';

export default {
  //工单上报
  name: '',
  tagComponent: 'taskDispatch', //主要用来标识是上报页面，为表单修改优先级做标志
  components: {
    ...Dispatch,
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve),
    FormSetting: resolve => require(['@/views/pages/process/task/processdispatch/workorder/form-setting.vue'], resolve),
    WorkLabel: resolve => require(['@/views/pages/process/task/processdetail/workorder/label/label.vue'], resolve)
  },
  props: {
    taskData: { type: Object }
  },
  data() {
    return {
      handler: null,
      processData: {}, //流程信息，根据通道返回
      baseData: {},
      title: '',
      fileIdList: [],
      priorityUuid: '',
      content: '',
      tagList: [],
      defaultPriorityUuid: null, //默认优先级
      defaultPriorityConfig: null,
      tranferReportProcessTaskList: null, //转报的工单信息
      isShowForm: false,
      validateList: ['required'],
      priorityList: []
    };
  },
  created() {
    this.getChannelByUuid();
    this.getPriority(); 
  },
  mounted() {
  },
  destroyed() {},
  methods: {
    getFileList(val) {
      let fileIdList = [];
      if (val && val.length > 0) {
        fileIdList = this.$utils.mapArray(val, 'id');
      }
      this.fileIdList = fileIdList;
    },
    getChannelByUuid() {
      if (this.taskData) {
        this.$api.process.process.getDraft({ channelUuid: this.taskData.channelUuid }).then(res => {
          this.handler = res.Return.startProcessTaskStep.handler;
          this.processData = res.Return;
          this.processData.formAttributeDataMap = this.taskData.formAttributeDataList;
          //formAttributeDataList
        });
      }
    },
    getPriority() {
      this.$api.process.priority
        .search({
          needPage: false,
          channelUuid: this.taskData.channelUuid
        })
        .then(res => {
          this.priorityList = res.Return.tbodyList || [];
        });
    },
    //对外接口，返回单个工单数据
    getData() {
      let data = {
        title: this.title,
        fileIdList: this.fileIdList,
        tagList: this.tagList,
        priorityUuid: this.priorityUuid,
        content: this.content
      };
      if (this.$refs.formSetting) {
        let formData = this.$refs.formSetting.getFormData();
        Object.assign(this.taskData, formData);
      }
      return this.taskData;
    },
    setPriorityByForm(list) {
      //如果list存在则通过list赋值过去 ，list 主要是为了表单规则时修改优先级下拉数据
      if (list.length == 1) {
        this.defaultPriorityConfig = list[0];
      } else {
        this.defaultPriorityConfig = list.find(d => d.uuid == this.defaultPriorityUuid) || {};
      }
    },
    async valid() {
      //校验未通过列表
      let validList = [];
      //上报内容校验
      let isValidForm = true;
      if (!this.$refs.title.valid()) {
        validList.push({
          focus: '#title',
          icon: 'tsfont-close-o',
          msg: this.$t('message.process.required', { target: this.$t('page.title') }),
          type: 'error',
          showDetail: 'title'
        });
      }
      if (this.$refs.baseSetting) {
        validList.push(...this.$refs.baseSetting.validData());
      } else {
        if (!this.baseData.owner) {
          validList.push({
            focus: '#base',
            icon: 'tsfont-close-o',
            msg: this.$t('message.process.required', { target: this.$t('page.informant') }),
            type: 'error'
          });
        }
        if (this.isNeedPriority && !this.baseData.priorityUuid) {
          validList.push({
            focus: '#base',
            icon: 'tsfont-close-o',
            msg: this.$t('message.process.required', { target: this.$t('page.priority') }),
            type: 'error'
          });
        }
      }
      if (this.$refs.formSetting) {
        isValidForm = await this.$refs.formSetting.valid();
        if (!isValidForm) {
          validList.push({
            focus: '#formPreview',
            icon: 'tsfont-close-o',
            msg: this.$t('message.process.complete', { target: this.$t('page.form') }),
            type: 'error',
            showDetail: 'form'
          });
        }
      }

      if (this.$refs.dispatchHandler) {
        let dispatchValidList = this.$refs.dispatchHandler.valid();
        if (dispatchValidList && dispatchValidList.length > 0) {
          validList.push(...dispatchValidList);
        }
      }
      return validList;
    }
  },
  computed: {
    isNeedFile() {
      if (this.processData && this.processData.startProcessTaskStep) {
        return this.processData.startProcessTaskStep.hasOwnProperty('isNeedUploadFile') ? !!this.processData.startProcessTaskStep.isNeedUploadFile : true;
      }
      return false;
    },
    isNeedContent() {
      if (this.processData && this.processData.startProcessTaskStep) {
        return this.processData.startProcessTaskStep.hasOwnProperty('isNeedContent') ? !!this.processData.startProcessTaskStep.isNeedContent : true;
      }
      return false;
    },
    isNeedPriority() {
      if (this.processData && this.processData.startProcessTaskStep) {
        return this.processData.startProcessTaskStep.hasOwnProperty('isNeedPriority') ? !!this.processData.startProcessTaskStep.isNeedPriority : true;
      }
      return false;
    },
    handlerName() {
      let node = {
        omnipotent: 'omnipotent', //普通节点
        changecreate: 'changecreate' //变更创建
      };
      let itemName = node[this.handler];
      return itemName || 'omnipotent';
    },
    showDetailConfig() {
      return store.showDetailConfig;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
