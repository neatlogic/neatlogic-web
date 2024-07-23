<template>
  <div class="workorderReport">
    <loading :loadingShow="taskLoading" type="fix"></loading>
    <TsContain
      :rightWidth="290"
      :isRightSiderHide="isOrderRightHide"
      :hasContentPadding="false"
      rightBtn
      hideHeader
      @rightSiderToggle="rightSiderToggle"
    >
      <template v-slot:content>
        <div v-scrollHidden class="workorder-main">
          <!-- 转报 -->
          <div v-if="tranferReportProcessTaskList && tranferReportProcessTaskList.length > 0" class="pb-nm">
            <ForwardingDetail :tranferReportProcessTaskList="tranferReportProcessTaskList"></ForwardingDetail>
          </div>
          <div id="title" class="bg-op radius-lg padding mb-nm list-block">
            <div class="title" :class="{'pb-sm':showDetailConfig.title}" @click="showDetailConfig.title = !showDetailConfig.title">
              <span>{{ $t('page.title') }}</span>
              <span class="require-label"></span>
              <span class="detail-icon text-tip-active" :class="showDetailConfig.title?'tsfont-down':'tsfont-up'"></span>
            </div>
            <TsFormInput
              v-show="showDetailConfig.title"
              ref="dispatchTitle"
              v-model="dispatchTitle"
              :placeholder="$t('form.placeholder.pleaseinput', {target: $t('page.title')})"
              maxlength="200"
              :validateList="validateList"
              @on-keyup="knowledgeSearch()"
            ></TsFormInput>
          </div>
          <div v-if="isShowForm" id="formPreview" class="bg-op radius-lg padding mb-nm list-block">
            <div class="title" :class="{'pb-nm':showDetailConfig.form}" @click="showDetailConfig.form = !showDetailConfig.form">
              <span>{{ $t('term.process.reportcontent') }}</span>
              <span class="detail-icon text-tip-active" :class="showDetailConfig.form?'tsfont-down':'tsfont-up'"></span>
            </div>
            <FormSetting
              v-show="showDetailConfig.form"
              ref="formSetting"
              :draftData="draftData"
              :priorityList="priorityList"
              @setPriorityByForm="setPriorityByForm"
            ></FormSetting>
          </div>
          <component :is="handlerName" ref="dispatchHandler" :draftData="draftData"></component>
        </div>
      </template>
      <template v-slot:right>
        <BaseSetting
          ref="baseSetting"
          :draftData="draftData"
          :priorityList="priorityList"
          :defaultPriorityConfig="defaultPriorityConfig"
        ></BaseSetting>
      </template>
    </TsContain>
  </div>
</template>
<script>
import '@/views/pages/process/flow/topoComponent/index.js';
import Dispatch from './index.js';
import scrollHidden from '@/resources/directives/scroll-hidden.js';
import {store} from './dispatchState.js';

export default {
  //工单上报
  name: '',
  tagComponent: 'taskDispatch', //主要用来标识是上报页面，为表单修改优先级做标志
  components: {
    ...Dispatch,
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    ForwardingDetail: () => import('@/views/pages/process/task/taskcommon/forwarding-detail.vue'),
    BaseSetting: () => import('./workorder/base-setting.vue'),
    FormSetting: () => import('./workorder/form-setting.vue')
  },
  directives: {scrollHidden},
  props: {
    handler: { //节点类型
      type: String
    },
    draftData: {//暂存数据
      type: Object
    },
    isOrderRightHide: {
      type: Boolean,
      default: false
    }
  },
  data() {
    let _this = this;
    return {
      taskLoading: true,
      channelUuid: _this.defaultChannelUuid,
      baseData: {},
      dispatchTitle: '',
      defaultPriorityUuid: null, //默认优先级
      defaultPriorityConfig: null,
      tranferReportProcessTaskList: null, //转报的工单信息
      isShowForm: false,
      validateList: ['required'],
      priorityList: []
      // showDetailConfig: {
      //   title: true,
      //   form: true
      // }
    };
  },
  created() {},
  mounted() {
    this.init();
    this.getPriority();
  },
  destroyed() {
  },
  methods: {
    init() {
      let draftData = this.$utils.deepClone(this.draftData);
      this.channelUuid = draftData.channelUuid || null;
      this.dispatchTitle = draftData.title;
      if (this.channelUuid) {
        try {
          document.getElementById(this.channelUuid) && document.getElementById(this.channelUuid).scrollIntoView();
        } catch (e) {
          console.log(e);
        }
        this.defaultPriorityUuid = draftData.defaultPriorityUuid; //选中默认优先级
      }
      if (!this.$utils.isEmpty(draftData.formConfig)) {
        this.isShowForm = true;
      }
      //转报信息
      if (draftData.tranferReportProcessTaskList) {
        this.tranferReportProcessTaskList = draftData.tranferReportProcessTaskList;
      }
      this.taskLoading = false;
    },
    getPriority() { //获取优先级列表
      let data = {
        needPage: false,
        channelUuid: this.draftData.channelUuid
      };
      return this.$api.process.priority.search(data).then(res => {
        if (res.Status == 'OK') {
          this.priorityList = res.Return.tbodyList || [];
        }
      });
    },
    getData() { //获取页面数据
      let data = {
        channelUuid: this.channelUuid,
        title: this.dispatchTitle
      };
      if (this.$refs.formSetting) {
        let formData = this.$refs.formSetting.getFormData();
        Object.assign(data, formData);
      }
      if (this.$refs.dispatchHandler) {
        this.dispatchHandlerData = this.$refs.dispatchHandler.getData();
      }
      if (this.$refs.baseSetting) {
        this.baseData = this.$refs.baseSetting.getBaseData();
      }
      Object.assign(data, this.dispatchHandlerData, this.baseData);
      return data;
    },
    setPriorityByForm(list) {
      //如果list存在则通过list赋值过去 ，list 主要是为了表单规则时修改优先级下拉数据
      if (list.length == 1) {
        this.defaultPriorityConfig = list[0];
      } else {
        this.defaultPriorityConfig = list.find(d => d.uuid == this.defaultPriorityUuid) || {};
      }
    },
    async valid() { //校验未通过列表
      let validList = [];
      //上报内容校验
      let isValidForm = true;
      if (!this.$refs.dispatchTitle.valid()) {
        validList.push({
          focus: '#title',
          icon: 'tsfont-close-o',
          msg: this.$t('message.process.required', {target: this.$t('page.title')}),
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
            msg: this.$t('message.process.required', {target: this.$t('page.informant')}),
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
            msg: this.$t('message.process.complete', {target: this.$t('page.form')}),
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
    },
    rightSiderToggle() {
      this.$emit('rightSiderToggle');
    },
    validTitle() {
      let validList = [];
      if (!this.$refs.dispatchTitle.valid()) {
        validList.push({
          focus: '#title',
          icon: 'tsfont-close-o',
          msg: '【标题】不能为空',
          type: 'error',
          showDetail: 'title'
        });
      }
      return validList;
    },
    knowledgeSearch() {
      this.$refs.baseSetting.knowledgeSearch(this.dispatchTitle);
    },
    updateFormWidth() {
      if (this.$refs.formSetting && this.$refs.formSetting.$el && this.$refs.formSetting.$el.__vue__.$refs.formSheet) {
        this.$refs.formSetting.$el.__vue__.$refs.formSheet.initContainerWidth();
      }
    }
  },
  computed: {
    handlerName() {
      let node = {
        'omnipotent': 'omnipotent', //普通节点
        'changecreate': 'changecreate' //变更创建
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
<style lang="less" scoped>
.workorder-main {
  position: relative;
  height: 100%;
  overflow: auto;
  .list-block {
    .title{
      position: relative;
    }
    .detail-icon {
      position: absolute;
      right: 0;
      top: 0;
    }
  }
}
</style>
