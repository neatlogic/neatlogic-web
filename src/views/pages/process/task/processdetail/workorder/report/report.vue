/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div id="taskReport" class="report-detail">
    <div v-if="startHandler!='changecreate' && actionConfig.update" class="tsfont-edit text-action edit-report" @click="edit()"></div>
    <div v-if="startHandler=='changecreate' && isEditchange" class="tsfont-edit text-action edit-report" @click="edit()"></div>
    <template v-if="startHandler!='changecreate'">
      <template v-if="dataConfig.content || (dataConfig.fileList && dataConfig.fileList.length > 0)">
        <div v-if="dataConfig.content && isNeedContent" class="report-content pb10">
          <div class="text-grey fz10 pb-xs">描述</div>
          <div class="content-bg bg-tip-grey radius-sm">
            <div v-imgViewer class="content-detail" :style="{'height':maxheight}">
              <div ref="getheight" v-html="dataConfig.content"></div>
            </div>
            <div
              v-if="isView"
              class="text-href pt6"
              @click="viewMoreContent"
              v-text="maxheight=='200px'?'查看更多':'收起'"
            ></div>
          </div>
        </div>
        <div v-if="dataConfig.fileList.length > 0" class="report-content">
          <div class="text-grey pb10 fz10">附件</div>
          <div>
            <div v-for="(file, flindex) in dataConfig.fileList" :key="flindex" class="file-title">
              <span class="tsfont-attachment">
                {{ file.name }}
              </span>
              <i v-download="downurl(file.id)" class="tsfont-download text-action text-padding"></i>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="actionConfig.update">
        <div class="text-grey">暂无描述</div>
      </template>
    </template>
    <template v-else-if="startHandler=='changecreate'">
      <div v-if="handlerStepInfo" class="changeDispatch">
        <div class="change-infor dividing-color">
          <TsRow>
            <Col span="8">
              <div class="change-tip overflow text-grey fz10">
                <div class="require-label">计划起止时间</div>
                <div v-if="handlerStepInfo.autoStart" class="autoStart border-color">自动开始</div>
              </div>
              <div class="change-text">
                <template v-if="handlerStepInfo.planStartEndTime &&handlerStepInfo.planStartEndTime.length > 0">
                  {{ handlerStepInfo.planStartEndTime[0] }} - {{ handlerStepInfo.planStartEndTime[1] }}
                </template>
                <template v-else>-</template>
              </div>
            </Col>
            <Col span="8">
              <div class="change-tip text-grey fz10">时间窗口</div>
              <div class="change-text">
                <template v-if="handlerStepInfo.startTimeWindow || handlerStepInfo.endTimeWindow">{{ handlerStepInfo.startTimeWindow || '~' }} - {{ handlerStepInfo.endTimeWindow || '~' }}</template>
                <template v-else>-</template>
              </div>
            </Col>
            <Col span="8">
              <div class="change-tip text-grey require-label fz10">变更经理</div>
              <div class="change-text">
                <template v-if="handlerStepInfo.owner">
                  <UserCard :uuid="handlerStepInfo.owner"></UserCard>
                </template>
                <template v-else>-</template>
              </div>
            </Col>
          </TsRow>
        </div>
        <div v-if="handlerStepInfo.content || draftFile.length > 0" class="comment-box">
          <template v-if="handlerStepInfo.content || (handlerStepInfo.fileList && handlerStepInfo.fileList.length > 0)">
            <div v-if="handlerStepInfo.content" class="report-content">
              <div class="text-grey comment-title fz10">
                变更说明
              </div>
              <div class="content-bg bg-tip-grey radius-sm">
                <div v-imgViewer class="content-detail" :style="{'height':maxheight}">
                  <div ref="getheight" v-html="handlerStepInfo.content"></div>
                </div>
                <div
                  v-if="isView"
                  class="text-href pt6"
                  @click="viewMoreContent"
                  v-text="maxheight=='200px'?'查看更多':'收起'"
                ></div>
              </div>
       
            </div>
            <div v-if="handlerStepInfo.fileList.length > 0" class="report-content pt16">
              <div class="text-grey pb10 fz10">附件</div>
              <div>
                <div v-for="(file, flindex) in handlerStepInfo.fileList" :key="flindex" class="file-title">
                  <span class="tsfont-attachment">
                    {{ file.name }}
                  </span>
                  <i v-download="downurl(file.id)" class="tsfont-download text-action text-padding"></i>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
    <slot name="changeStep"></slot>
    <TsDialog
      type="slider"
      v-bind="dataDialog"
      :isShow.sync="isShow"
      @on-close="close()"
      @on-ok="save()"
    >
      <template>
        <div>
          <TsForm
            v-if="startHandler!='changecreate'"
            ref="form"
            v-model="omnipotentConfig"
            :itemList="omnipotentForm"
            labelPosition="top"
          >
          </TsForm>
          <TsForm
            v-else-if="startHandler=='changecreate'"
            ref="form"
            v-model="changecreateConfig"
            :itemList="changecreateForm"
            labelPosition="top"
          >
            <template v-slot:startTimeWindow>
              <div class="timeWindow">
                <TsFormDatePicker
                  v-model="changecreateConfig.startTimeWindow"
                  type="time"
                  format="HH:mm"
                  placeholder="开始时间"
                  width="120px"
                ></TsFormDatePicker>
                <div class="item-line">-</div>
                <TsFormDatePicker
                  v-model="changecreateConfig.endTimeWindow"
                  type="time"
                  format="HH:mm"
                  placeholder="结束时间"
                  width="120px"
                ></TsFormDatePicker>
              </div>
            </template>
          </TsForm>
          <div v-if="isShowUploadFile" class="file-box">
            <TsUpLoad
              :dataType="startHandler=='changecreate'?'change':'itsm'"
              styleType="button"
              className="smallUpload"
              rowSpan="24"
              :multiple="uploadMultiple"
              :defaultList="defaultTaskFileList"
              @getFileList="getTaskFileList"
              @remove="removeTastFile"
            ></TsUpLoad>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import imgViewer from '@/resources/directives/img-viewer.js';
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsDialog: resolve => require(['@/resources/plugins/TsDialog/TsDialog.vue'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    // TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  directives: {imgViewer, download},
  filters: {
  },
  props: {
    processTaskConfig: Object,
    actionConfig: Object,
    processTaskId: {
      type: [String, Number],
      default: null
    },
    processTaskStepId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    let _this = this;
    return {
      startHandler: 'omnipotent', //开始节点的类型：omnipotent(普通节点)、changecreate(变更创建)、autoexec(自动化)
      handler: 'omnipotent', //处理节点类型
      ckeditorRequired: false, //上报描述是否必填
      dataConfig: {
        content: null,
        fileList: [],
        fileIdList: []
      },
      isView: false, //查看更多内容
      maxheight: '18px',
      isShow: false,
      dataDialog: {
        type: 'slider',
        title: '修改',
        width: 'large'
      },
      omnipotentConfig: {
        content: '',
        fileList: [],
        fileIdList: []
      },
      omnipotentForm: {
        content: {
          type: 'ckeditor',
          label: '描述',
          isHidden: false
        }
      },
      changecreateConfig: {
        owner: null,
        autoStart: '1',
        planStartEndTime: null,
        startTimeWindow: null,
        endTimeWindow: null,
        content: null
      },
      changecreateForm: {
        owner: {
          name: 'owner',
          value: '',
          label: '变更经理',
          type: 'userselect',
          multiple: false,
          groupList: ['user'],
          validateList: ['required'],
          disabled: true
        },
        autoStart: {
          name: 'autoStart',
          value: 1,
          label: '自动开始',
          type: 'select',
          validateList: ['required'],
          search: false,
          dataList: [
            {
              text: '开启',
              value: 1
            },
            {
              text: '关闭',
              value: 0
            }
          ]
        },
        planStartEndTime: {
          name: 'planStartEndTime',
          value: [],
          label: '计划起止时间',
          type: 'datetimerange',
          format: 'yyyy-MM-dd HH:mm',
          validateList: ['required']
        },
        startTimeWindow: {
          type: 'slot',
          name: 'startTimeWindow',
          label: '时间窗口',
          format: 'HH:mm',
          transfer: true
        },
        content: {
          type: 'ckeditor',
          label: '描述',
          value: '',
          isHidden: false
        }
      },
      uploadMultiple: true,
      defaultTaskFileList: [],
      draftFile: [],
      isNeedContent: true, //流程上报可配置隐藏描述框
      isShowUploadFile: true, //流程上报可配置隐藏上传文件组件
      handlerStepInfo: null, //变更上报信息
      isEditchange: false, //编辑变更信息
      validConfig: {
        planStartEndTime: true,
        ownerChange: true
      },
      changeId: null //变更id
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initData();
    this.$nextTick(() => { // 页面渲染完成后的回调
      this.getHeight();
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      let startProcessTaskStep = this.processTaskConfig.startProcessTaskStep;
      let processTaskStepConfig = this.processTaskConfig.currentProcessTaskStep;
      this.startHandler = startProcessTaskStep.handler;
      this.handler = processTaskStepConfig ? processTaskStepConfig.handler : 'omnipotent';
      this.ckeditorRequired = startProcessTaskStep.isRequired;
      if (this.ckeditorRequired) {
        this.$set(this.omnipotentForm.content, 'validateList', ['required']);
        this.$set(this.changecreateForm.content, 'validateList', ['required']);
      }
      if (startProcessTaskStep.comment) {
        if (startProcessTaskStep.comment.content) {
          this.dataConfig.content = startProcessTaskStep.comment.content;
        }
        if (startProcessTaskStep.comment.fileList && startProcessTaskStep.comment.fileList.length > 0) {
          this.dataConfig.fileList = startProcessTaskStep.comment.fileList;
          this.defaultTaskFileList = startProcessTaskStep.comment.fileList;
        }
      }
      //流程上报可配置隐藏描述框
      this.isNeedContent = startProcessTaskStep.hasOwnProperty('isNeedContent') ? !!startProcessTaskStep.isNeedContent : true;
      this.$set(this.omnipotentForm.content, 'isHidden', !this.isNeedContent);
      this.$set(this.changecreateForm.content, 'isHidden', !this.isNeedContent);
      
      //流程上报可配置隐藏上传文件组件
      this.isShowUploadFile = startProcessTaskStep.hasOwnProperty('isNeedUploadFile') ? !!startProcessTaskStep.isNeedUploadFile : true;
      //变更上报
      let handlerStepInfo = null;
      if (this.handler == 'changecreate') { //当前节点是变更创建时，拿当前节点的数据
        handlerStepInfo = processTaskStepConfig.handlerStepInfo;
        if (this.actionConfig.complete) {
          this.isEditchange = true;
        }
      } else if (this.startHandler == 'changecreate') {
        handlerStepInfo = startProcessTaskStep.handlerStepInfo;
      }
      if (handlerStepInfo) {
        this.handlerStepInfo = this.$utils.deepClone(handlerStepInfo);
        this.changeId = handlerStepInfo.id || null;
        this.changeStepList = handlerStepInfo.changeStepList;
        Object.keys(this.changecreateConfig).forEach(key => {
          this.changecreateConfig[key] = this.handlerStepInfo[key];
        });
        this.defaultTaskFileList = this.handlerStepInfo.fileList || [];
        this.draftFile = this.handlerStepInfo.fileList || [];
        if (!handlerStepInfo.owner) {
          this.getUser();
        }
        if (handlerStepInfo.actionList && handlerStepInfo.actionList.length > 0) {
          let editchange = handlerStepInfo.actionList.find(h => h.value === 'editchange');
          if (editchange) {
            this.isEditchange = true;
          }
        }
      }
      if (!handlerStepInfo && this.startHandler == 'changecreate') {
        this.getUser();
      }
      if (this.handler == 'changecreate') { //只有在变更创建节点可以修改变更经理
        this.$set(this.changecreateForm.owner, 'disabled', false);
      }
    },
    viewMoreContent() {
      if (this.maxheight == '200px') {
        this.maxheight = 'auto';
      } else {
        this.maxheight = '200px';
      }
    },
    edit() {
      if (this.startHandler == 'changecreate') {
        this.handlerStepInfo && Object.keys(this.changecreateConfig).forEach(key => {
          this.changecreateConfig[key] = this.handlerStepInfo[key];
        });
        this.defaultTaskFileList = this.handlerStepInfo.fileList || [];
        this.draftFile = this.handlerStepInfo.fileList || [];
      } else {
        Object.keys(this.omnipotentConfig).forEach(key => {
          this.omnipotentConfig[key] = this.dataConfig.content;
        });
        this.defaultTaskFileList = this.dataConfig.fileList || [];
        this.draftFile = this.dataConfig.fileList || [];
      }
      this.isShow = true;
    },
    close() {
      this.isShow = false;
    },
    getTaskFileList(val) {
      this.draftFile = val;
    },
    removeTastFile(val) {
      this.draftFile = val;
    },
    updateWorkData() { //上报：普通节点
      let data = {
        processTaskId: this.processTaskId,
        processTaskStepId: this.processTaskStepId
      };
      Object.assign(data, this.dataConfig);
      return this.$api.process.processtask.updateWorkData(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.executesuccess'));
          this.$emit('upActivityList');
        }
      });
    },
    updateChange() { //上报：变更创建节点
      let data = {
        processTaskStepId: this.processTaskStepId,
        changeId: this.changeId
      };
      if (JSON.stringify(this.draftFile) != JSON.stringify(this.defaultTaskFileList)) {
        let fileIdList = this.draftFile.map(f => {
          return f.id;
        });
        this.$set(data, 'fileIdList', fileIdList);
      }
      data = Object.assign(data, this.changecreateConfig);
      return this.$api.process.processtask.updateChange(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.executesuccess'));
          this.$emit('upActivityList');
        }
      });
    },
    save() {
      if (this.$refs.form && !this.$refs.form.valid()) {
        return;
      }
      if (this.startHandler == 'changecreate') {
        Object.assign(this.handlerStepInfo, this.changecreateConfig);
        this.$set(this.handlerStepInfo, 'fileList', this.draftFile);
        if (this.handler == 'changecreate') {
          this.$emit('saveTaskD');
        } else {
          this.updateChange();
        }
      } else {
        Object.assign(this.dataConfig, this.omnipotentConfig);
        this.$set(this.dataConfig, 'fileList', this.draftFile);
        let fileIdList = this.draftFile.map(f => {
          return f.id;
        });
        this.$set(this.dataConfig, 'fileIdList', fileIdList);
        this.updateWorkData();
      }
      this.close();
      this.$nextTick(() => {
        this.getHeight();
      });
    },
    getChangecreateData() {
      //保存变更数据
      let data = Object.assign({}, this.changecreateConfig);
      let fileIdList = [];
      if (this.draftFile.length > 0) {
        fileIdList = this.draftFile.map(f => {
          return f.id;
        });
      }
      this.$set(data, 'fileList', this.draftFile);
      this.$set(data, 'fileIdList', fileIdList);
      return data;
    },
    changeValid() {
      //校验
      let validList = [];
      if (!this.changecreateConfig.planStartEndTime || this.changecreateConfig.planStartEndTime.length == 0) {
        this.validConfig.planStartEndTime = false;
        let o = {
          focus: '#taskReport',
          msg: '计划起止时间不能为空'
        };
        validList.push(o);
      } else {
        this.validConfig.planStartEndTime = true;
      }
      if (!this.changecreateConfig.owner) {
        let o = {
          focus: '#taskReport',
          msg: '变更经理不能为空'
        };
        this.validConfig.ownerChange = false;
        validList.push(o);
      } else {
        this.validConfig.ownerChange = true;
      }
      return validList;
    },
    //获取当前登录用户信息
    getUser() {
      let _this = this;
      this.$api.framework.user.getUser().then(res => {
        if (res.Status == 'OK') {
          let userDetail = res.Return;
          _this.changecreateConfig.owner = 'user#' + userDetail.uuid;
          this.$set(this.handlerStepInfo, 'owner', _this.changecreateConfig.owner);
        }
      });
    },
    getHeight() {
      if (this.$refs.getheight) {
        if (this.$refs.getheight.offsetHeight > 200) {
          this.isView = true;
          this.maxheight = '200px';
        } else {
          this.isView = false;
          this.maxheight = this.$refs.getheight.offsetHeight + 'px';
        }
      }
    }
  },
  computed: {
    downurl() {
      return (id) => {
        return {
          url: 'api/binary/file/download',
          params: {
            id: id
          }
        };
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.report-detail{
  position: relative;
  .pb10{
      padding-bottom: 10px;
    }
  .pt16{
    padding-top: 16px;
  }
  .pt6{
     padding-top: 6px;
  }
  .edit-report{
    position: absolute;
    right: -6px;
    top: 0;
    z-index: 2;
  }
  .report-content{
    .content-bg {
      padding: 10px 16px;
    }
    .content-detail{
      overflow: hidden;
    }
  }
  .file-title{
    padding-bottom: 6px;
  }
}
.file-box{
  padding-top: 16px;
}
.timeWindow{
  display: flex;
  align-items: center;
  .item-line{
    padding: 0 4px;
  }
}
/deep/.tsslider-body{
  overflow-x: hidden;
}
.changeDispatch {
  .change-infor {
    .change-tip {
      font-size: 12px;
      display: flex;
      align-items: center;
      line-height: 20px;
      padding-bottom: 10px;
      .autoStart{
        border-left: 1px solid;
        padding: 0 8px;
        margin-left: 8px;
      }
    }
  }
  .comment-box {
    position: relative;
    .comment-title {
      font-size: 12px;
      padding: 10px 0;
    }
  }
}
</style>
