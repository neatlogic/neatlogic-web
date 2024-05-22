<template>
  <div>
    <!-- 变更 -->
    <div class="bg-op radius-lg padding mb-nm list-block">
      <div class="title" :class="{'pb-nm':showDetailConfig.handlerStepInfo}" @click="showDetailConfig.handlerStepInfo = !showDetailConfig.handlerStepInfo">
        <span>{{ $t('term.process.changedetail') }}</span>
        <span class="detail-icon text-tip-active" :class="showDetailConfig.handlerStepInfo?'tsfont-down':'tsfont-up'"></span>
      </div>
      <div v-show="showDetailConfig.handlerStepInfo">
        <div id="handlerStepInfo" class="pb-nm">
          <TsRow>
            <Col span="12">
              <TsFormItem
                :label="$t('term.process.planStartEndTime')"
                labelPosition="top"
                :validateList="validateList"
                itemWidth="80%"
                class="pb-nm"
              >
                <TsFormDatePicker
                  ref="planStartEndTime"
                  v-model="changeReport.planStartEndTime"
                  format="yyyy-MM-dd HH:mm"
                  type="datetimerange"
                  :validateList="validateList"
                  transfer
                ></TsFormDatePicker>
              </TsFormItem>
            </Col>
            <Col span="12">
              <TsFormItem
                :label="$t('term.process.changeowner')"
                labelPosition="top"
                :validateList="validateList"
                itemWidth="80%"
                class="pb-nm"
              >
                <UserSelect
                  ref="owner"
                  v-model="changeReport.owner"
                  :groupList="['user']"
                  :multiple="false"
                  :validateList="validateList"
                  :clearable="false"
                  transfer
                  @click.native.stop
                ></UserSelect>
              </TsFormItem>
            </Col>
            <Col span="12">
              <TsFormItem
                :label="$t('term.process.startTimeWindow')"
                labelPosition="top"
                itemWidth="80%"
                class="pb-nm"
              >
                <div class="change-timeWindow">
                  <TsFormDatePicker
                    ref="startTimeWindow"
                    v-model="changeReport.startTimeWindow"
                    :placeholder="$t('page.starttime')"
                    format="HH:mm"
                    type="time"
                    :clearable="true"
                  ></TsFormDatePicker>
                  <span class="timeWindow-line">-</span>
                  <TsFormDatePicker
                    ref="endTimeWindow"
                    v-model="changeReport.endTimeWindow"
                    :placeholder="$t('page.endtime')"
                    format="HH:mm"
                    type="time"
                  ></TsFormDatePicker>
                </div>
              </TsFormItem>
            </Col>
            <Col span="12">
              <TsFormItem
                :label="$t('term.process.autostart')"
                labelPosition="top"
                itemWidth="80%"
                class="pb-nm"
              >
                <TsFormSwitch
                  v-model="changeReport.autoStart"
                  :true-value="1"
                  :false-value="0"
                ></TsFormSwitch>
              </TsFormItem>
            </Col>
          </TsRow>
        </div>
        <ChangeDetail id="changeStepList" ref="changeStepList" :handlerStepInfo="handlerStepInfo"></ChangeDetail>
      </div>
    </div>
    <div v-if="!!isNeedContent" id="dispatchContent" class="bg-op radius-lg padding mb-nm list-block">
      <div class="title" :class="{'pb-nm':showDetailConfig.content}" @click="showDetailConfig.content = !showDetailConfig.content">
        <span>{{ $t('term.process.changecontent') }}</span>
        <span v-show="ckeditorRequired" class="require-label"></span>
        <span class="detail-icon text-tip-active" :class="showDetailConfig.content?'tsfont-down':'tsfont-up'"></span>
      </div>
      <div v-show="showDetailConfig.content" class="editor">
        <TsCkeditor
          ref="TsCkeditor"
          v-model="changeReport.content"
          :editorDataS="changeReport.content"
          :showIconToggle="true"
          width="100%"
          :validateList="ckeditorValidateList"
        ></TsCkeditor>
      </div>
    </div>
    <div v-if="isNeedUploadFile" class="bg-op radius-lg padding list-block">
      <div class="title" :class="{'pb-nm':showDetailConfig.file}" @click="showDetailConfig.file = !showDetailConfig.file">
        <span>{{ $t('page.accessory') }}</span>
        <span class="detail-icon text-tip-active" :class="showDetailConfig.file?'tsfont-down':'tsfont-up'"></span>
      </div>
      <TsUpLoad
        v-show="showDetailConfig.file"
        ref="changeFileList"
        class="upload"
        data-type="itsm"
        styleType="button"
        className="smallUpload"
        :multiple="true"
        :defaultList="defaultFileList"
        dataType="change"
      ></TsUpLoad>
    </div>
  </div>
</template>
<script>
import {store} from './dispatchState.js';
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue'),
    TsCkeditor: () => import('@/resources/plugins/TsCkeditor/TsCkeditor.vue'),
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue'),
    ChangeDetail: () => import('./workorder/change/change-detail.vue')
  },
  props: {
    draftData: Object
  },
  data() {
    return {
      handlerStepInfo: {},
      changeReport: {
        owner: null,
        planStartEndTime: null,
        autoStart: 1,
        startTimeWindow: null,
        endTimeWindow: null,
        content: null
      },
      defaultFileList: [],
      validateList: [{ name: 'required', message: ' ' }],
      ckeditorValidateList: [],
      isNeedContent: true,
      isNeedUploadFile: true,
      ckeditorRequired: false
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
      if (!this.$utils.isEmpty(this.draftData)) {
        if (!this.$utils.isEmpty(this.draftData.startProcessTaskStep)) {
          let handlerStepInfo = this.draftData.startProcessTaskStep.handlerStepInfo;
          this.handlerStepInfo = this.$utils.deepClone(handlerStepInfo);
          if (handlerStepInfo) {
            this.handlerStepInfo = handlerStepInfo;
            this.defaultFileList = handlerStepInfo.fileList || [];
            Object.keys(this.changeReport).forEach(key => {
              if (this.handlerStepInfo.hasOwnProperty(key)) {
                this.changeReport[key] = this.handlerStepInfo[key];
              }
            });
          }
          this.isNeedContent = this.draftData.startProcessTaskStep.hasOwnProperty('isNeedContent') ? !!this.draftData.startProcessTaskStep.isNeedContent : true;
          // 流程上报可配置隐藏上传文件
          this.isNeedUploadFile = this.draftData.startProcessTaskStep.hasOwnProperty('isNeedUploadFile') ? !!this.draftData.startProcessTaskStep.isNeedUploadFile : true;
          this.ckeditorRequired = this.draftData.startProcessTaskStep.isRequired;
          if (this.ckeditorRequired) this.ckeditorValidateList.push('required');
        }
        if (!this.changeReport.owner) {
          let userDetail = this.$AuthUtils.getCurrentUser();
          this.changeReport.owner = 'user#' + userDetail.uuid;
        }
      }
    },
    getData() {
      let data = {
        handlerStepInfo: this.changeReport
      };
      let fileList = this.$refs.changeFileList ? this.$refs.changeFileList.uploadList || [] : [];
      let fileIdList = [];
      if (fileList.length > 0) {
        fileIdList = this.$utils.mapArray(fileList, 'id');
      }
      this.$set(data.handlerStepInfo, 'fileList', fileList);
      this.$set(data.handlerStepInfo, 'fileIdList', fileIdList);
      if (this.$refs.changeStepList) {
        Object.assign(data.handlerStepInfo, this.$refs.changeStepList.saveChangeStepData());
      }
      return data;
    },
    valid() {
      let validList = [];
      //校验变更变量
      if (this.$refs.planStartEndTime && !this.$refs.planStartEndTime.valid()) {
        validList.push({
          focus: '#handlerStepInfo',
          icon: 'tsfont-close-o',
          msg: this.$t('message.process.required', {target: this.$t('term.process.planStartEndTime')}),
          type: 'error',
          showDetail: 'handlerStepInfo'
        });
      }
      if (this.$refs.owner && !this.$refs.owner.valid()) {
        validList.push({
          focus: '#handlerStepInfo',
          icon: 'tsfont-close-o',
          msg: this.$t('message.process.required', {target: this.$t('term.process.changeowner')}),
          type: 'error',
          showDetail: 'handlerStepInfo'
        });
      }
      if (this.$refs.changeStepList && this.$refs.changeStepList.validParam().length > 0) {
        validList.push({
          focus: '#changeStepList',
          icon: 'tsfont-close-o',
          msg: this.$t('message.process.required', {target: this.$t('term.process.changeparams')}),
          type: 'error',
          showDetail: 'handlerStepInfo'
        });
      }
      if (this.$refs.TsCkeditor && !this.$refs.TsCkeditor.valid()) {
        validList.push({
          focus: '#dispatchContent',
          icon: 'tsfont-close-o',
          msg: this.$t('message.process.required', {target: this.$t('term.process.changecontent')}),
          type: 'error',
          showDetail: 'centent'
        });
      }
      return validList;
    }
  },
  filter: {},
  computed: {
    showDetailConfig() {
      return store.showDetailConfig;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.change-timeWindow{
  display: grid;
  width: 100%;
  grid-gap: 10px;
  grid-template-columns: auto 5px auto;
}
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
</style>
