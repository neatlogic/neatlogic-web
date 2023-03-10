<template>
  <div class="eventEdit">
    <div v-if="commentList.length > 0" class="comment-main border-color">
      <div v-for="(pcomment, pindex) in commentList" :key="pindex" class="order-comment">
        <div class="step-userimg">
          <UserCard v-bind="pcomment.fcuVo" :iconSize="24" hideName></UserCard>
        </div>
        <div class="comment-detail">
          <div>
            <span class="user-name text-primary">
              <UserCard v-bind="pcomment.fcuVo" hideAvatar></UserCard>
            </span>
          </div>
          <div v-if="!pcomment.editContent" class="comment-content">
            <div v-html="pcomment.content"></div>
            <div v-if="pcomment.fileList && pcomment.fileList.length > 0" class="file-main">
              <TsRow>
                <Col v-for="(file, flindex) in pcomment.fileList" :key="flindex" span="24">
                  <div class="file-list">
                    <i class="tsfont-attachment"></i>
                    <span class="file-name">{{ file.name }}</span>
                    <i v-download="downurl('/api/binary/file/download',file.id)" class="tsfont-download text-tip-active"></i>
                  </div>
                </Col>
              </TsRow>
            </div>
            <div class="text-grey comment-time">
              {{ pcomment.fcd | formatDate }}
            </div>
            <div v-if="pcomment.isDeletable == 1 || pcomment.isEditable == 1" class="comment-btn">
              <Button v-if="pcomment.isEditable == 1" size="small" @click="editComment(pcomment)">{{ $t('button.add') }}</Button>
              <Button v-if="pcomment.isDeletable == 1" size="small" @click="delComment(pcomment.id)">{{ $t('button.delete') }}</Button>
            </div>
          </div>
          <div v-if="pcomment.editContent" class="comment-content">
            <div class="order-list">
              <TsCkeditor v-model="pcomment.content" width="100%" :showIconToggle="true"></TsCkeditor>
            </div>
            <TsUpLoad
              ref="uploadFile"
              styleType="button"
              :defaultList="pcomment.fileList"
              className="smallUpload"
              data-type="itsm"
              :multiple="true"
              @getFileList="res => handleSuccess(res, pindex)"
            ></TsUpLoad>
            <div class="comment-btn">
              <Button size="small" @click="completeComment(pcomment, pindex)">{{ $t('page.complete') }}</Button>
              <Button size="small" @click="cancelComment(pcomment,pindex)">{{ $t('button.cancel') }}</Button>
            </div>
          </div>
          <div class="comment-border dividing-color"></div>
        </div>
      </div>
    </div>
    <div id="event" class="event-main">
      <div v-if="actionConfig.complete" class="upLoad-box">
        <span class="attachment-text">{{ $t('page.accessory') }}</span>
        <TsUpLoad
          ref="uploadFileComment"
          styleType="text"
          className="smallUpload"
          data-type="itsm"
          :multiple="true"
          rowSpan="24"
          :defaultList="commentObj.fileList"
          @getFileList="getFileList"
          @remove="removeCommentFile"
        ></TsUpLoad>
      </div>
      <TsRow>
        <Col span="12">
          <div class="event-tip">
            <span class="require-label" :class="validConfig.eventTypeId == false?'text-danger':'text-grey'">{{ $t('term.process.archivedtype') }}</span>
          </div>
          <div class="event-text">
            <TsFormTree
              v-model="eventTypeId"
              :readonly="actionConfig.complete?false:true"
              :url="treeUrl"
              search
              showPath
              selectLastLevel
              :params="treeParams"
              rootName="children"
              textName="name"
              valueName="id"
              border="none"
              readonlyClass="text-title h3"
              transfer
              :onChange="changeEventTypeId"
            ></TsFormTree>
          </div>
        </Col>
        <Col span="12">
          <div class="event-tip overflow solution-item">
            <span>
              <Tooltip
                placement="bottom"
                max-width="300"
                :transfer="true"
                theme="light"
              >
                <b class="tsfont-info-o text-href"></b>
                <div slot="content">
                  {{ $t('term.process.solutiontip') }}
                </div>
              </Tooltip>
            </span>
            <span class="text-grey">{{ $t('term.process.solution') }}</span>
            <span
              v-if="actionConfig.complete && eventSolutionId"
              class="text-tip-active tsfont-edit"
              @click="toSolution"
            ></span>
            <span
              v-if="actionConfig.complete && eventTypeId"
              class="text-tip-active tsfont-rotate-right"
              @click="getSolutionList('refresh')"
            ></span>
          </div>
          <div class="event-text solution-select">
            <TsFormSelect
              v-model="eventSolutionId"
              :readonly="actionConfig.complete?false:true"
              :dataList="solutionList"
              textName="name"
              valueName="id"
              border="none"
              readonlyClass="text-title h3"
              class="solution-select-clearbtn-align"
              transfer
              @on-change="changeSolution"
            ></TsFormSelect>
          </div>
        </Col>
      </TsRow>
      <div v-if="actionConfig.complete" style="margin-top:8px;">
        <div class="order-content no-padding" style="padding-bottom:16px">
          <TsCkeditor
            ref="taskStepContent"
            v-model="commentObj.content"
            :validateList="isRequiredContent?validateList:[]"
            width="100%"
            :showIconToggle="true"
            @change="commentContent"
          ></TsCkeditor>
        </div>
      </div>
      <div v-else>
        <div class="text-grey">{{ $t('page.reply') }}</div>
        <div v-if="commentObj.content">
          <div v-html="commentObj.content"></div>
        </div>
        <div v-else class="text-tip">{{ $t('page.notarget',{target:''}) }}</div>
      </div>
    </div>
    <div v-if="actionConfig.comment" class="list-btn">
      <Button
        type="primary"
        ghost
        :disabled="!isShowSaveSolution"
        @click="saveSolution()"
      >{{ $t('term.process.savesolution') }}</Button>
      <!-- <Button
        v-if="actionConfig.save"
        type="primary"
        ghost
        @click="draftSave(false)"
      >{{ actionConfig.save }}</Button>
      <Button
        v-if="actionConfig.comment"
        type="primary"
        :disabled="isDisableCommet"
        :title="isDisableCommet ? '回复框或附件不为空时允许点击' : null"
        @click="comment"
      >{{ actionConfig.comment }}</Button> -->
    </div>
    <TsDialog
      type="modal"
      :isShow.sync="eventModal"
      :title="$t('term.process.solution')"
      @on-ok="okSolution"
    >
      <template>
        <div style="width:90%">
          <TsForm ref="eventForm" :itemList="eventFormList" type="type"></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
import TsUpLoad from '@/resources/components/UpLoad/UpLoad.vue';
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsDialog: resolve => require(['@/resources/plugins/TsDialog/TsDialog.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsCkeditor,
    TsUpLoad
  },
  directives: { download },
  filters: {},
  props: {
    actionConfig: Object,
    processTaskConfig: Object
  },
  data() {
    return {
      isStepRequired: 0,
      validateList: ['required'],
      processTaskId: null,
      processTaskStepId: null,
      treeUrl: '/api/rest/eventtype/tree/search',
      treeParams: {
        isAuthenticate: 1
      },
      eventTypeId: null,
      solutionList: [],
      eventSolutionId: null,
      defaultContent: null,
      commentObj: {
        //回复
        content: null,
        fileList: []
      },
      commentList: [],
      defaultCommentList: [],
      isShowSaveSolution: false, //是否可保持解决方案
      isDisableCommet: true, //是否可回复
      eventModal: false,
      eventFormList: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          value: '',
          width: '100%',
          validateList: ['required']
        },
        {
          type: 'tree',
          name: 'eventTypeList',
          value: '',
          label: this.$t('term.process.archivedtype'),
          width: '100%',
          transfer: true,
          multiple: true,
          url: '/api/rest/eventtype/tree/search',
          params: {
            isAuthenticate: 1
          },
          rootName: 'children',
          textName: 'name',
          valueName: 'id',
          validateList: ['required']
        }
      ],
      validConfig: {
        eventTypeId: null
      },
      auditId: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.processTaskId = this.$route.query.processTaskId || null;
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeEventTypeId(val) {
      this.eventTypeId = val || null;
      this.eventSolutionId = null;
      if (val) {
        this.getSolutionList();
      } else {
        this.solutionList.splice(0);
      }
    },
    changeSolution(val) {
      if (val) {
        this.searchSolution(val);
      }
    },
    searchSolution(id) {
      let data = {
        id: id
      };
      this.$api.process.eventSolution.get(data).then(res => {
        if (res.Status === 'OK') {
          let solutionConfig = res.Return.solution;
          this.defaultContent = this.$utils.deepClone(solutionConfig.content);
          this.commentObj.content = solutionConfig.content;
        }
      });
    },
    getSolutionList(type) {
      let data = {
        isActive: 1,
        id: this.eventTypeId
      };
      this.$api.process.eventType.getSolutionList(data).then(res => {
        if (res.Status === 'OK') {
          this.solutionList = res.Return.solutionList;
          if (type) {
            this.$Message.success(this.$t('message.content.executesuccess'));
          }
        }
      });
    },
    toSolution() {
      window.open(HOME + '/process.html#/event-solution-edit?operation=edit&id=' + this.eventSolutionId, '_blank');
    },
    commentContent(val) {
      if (val && val.trim()) {
        this.$set(this.commentObj, 'content', val);
        this.isDisableCommet = false;
        if (val != this.defaultContent) {
          this.isShowSaveSolution = true;
        } else {
          this.isShowSaveSolution = false;
        }
      } else {
        this.isShowSaveSolution = false;
        if (this.fileIdList && this.fileIdList.length > 0) {
          this.isDisableCommet = false;
        } else {
          this.isDisableCommet = true;
        }
      }
    },
    getFileList(val) {
      //获取上传文件列表
      let fileList = val;
      if (fileList && fileList.length > 0) {
        this.$set(this.commentObj, 'fileList', fileList);
        let newArray = [];
        fileList.forEach(item => {
          let fileId = item.id;
          newArray.push(fileId);
        });
        this.fileIdList = newArray;
        this.isDisableCommet = false;
      } else {
        if (!this.commentObj.content) {
          this.isDisableCommet = true;
        } else {
          this.isDisableCommet = false;
        }
      }
    },
    removeCommentFile(val) {
      let _this = this;
      this.$set(_this.commentObj, 'fileList', val);
      if (val && val.length > 0) {
        _this.fileIdList = val.map(item => {
          return item.id;
        });
        _this.isDisableCommet = false;
      } else {
        _this.fileIdList = [];
        if (!_this.commentObj.content) {
          _this.isDisableCommet = true;
        } else {
          _this.isDisableCommet = false;
        }
      }
    },
    handleSuccess(res, index) {
      this.commentList[index].fileList = res;
    },
    saveSolution() {
      if (this.isShowSaveSolution) {
        this.eventModal = true;
      }
    },
    okSolution() {
      let data = {
        isActive: 1,
        content: this.commentObj.content
      };
      if (this.$refs.eventForm.valid()) {
        let form = this.$refs.eventForm.getFormValue();
        data = Object.assign(data, form);
        this.$api.process.eventSolution.save(data).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.eventModal = false;
            // console.log(res.Return.solutionId);
          }
        });
      }
    },
    editComment(obj) {
      //回复列表：编辑
      this.$set(obj, 'editContent', true);
    },
    delComment(id) {
      //回复列表：删除
      let data = {
        id: id
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.replycontent')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.process.processtask
            .deleteComment(data)
            .then(res => {
              if (res.Status == 'OK') {
                let commentList = res.Return.commentList || [];
                this.commentList = commentList;
                this.defaultCommentList = this.$utils.deepClone(commentList);
                this.$emit('updateActiveStep');
              }
            })
            .catch(error => {});
          vnode.isShow = false;
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    completeComment(obj, index) {
      //回复列表：完成
      let defaultData = this.defaultCommentList.find(d => d.id == obj.id);
      if (JSON.stringify(obj.content) != JSON.stringify(defaultData.content) || JSON.stringify(obj.fileList) != JSON.stringify(defaultData.fileList)) {
        let data = {
          id: obj.id,
          content: obj.content,
          fileIdList: []
        };
        if (obj.content) {
          this.$set(data, 'content', obj.content);
        }
        if (obj.fileList && obj.fileList.length > 0) {
          let fileIdList = [];
          obj.fileList.forEach(item => {
            fileIdList.push(item.id);
          });
          this.$set(data, 'fileIdList', fileIdList);
        }
        this.$api.process.processtask.editComment(data).then(res => {
          if (res.Status == 'OK') {
            let commentList = res.Return.commentList || [];
            this.commentList = commentList;
            this.defaultCommentList = this.$utils.deepClone(commentList);
            this.$emit('updateActiveStep');
          }
        });
      } else {
        this.$set(obj, 'editContent', false);
      }
    },
    cancelComment(item, index) {
      //回复列表：取消
      let obj = this.defaultCommentList.find(d => d.id == item.id);
      if (obj) {
        this.$set(item, 'editContent', false);
        this.$set(item, 'content', obj.content);
        this.$set(item, 'fileList', obj.fileList);
      }
    },
    async comment() {
      let _this = this;
      if (!_this.isDisableCommet) {
        let complete = await _this.submitComment();
        if (complete) {
          _this.draftSave(true);
        }
      }
      _this.isDisableCommet = true;
    },
    submitComment() {
      //回复
      return new Promise((resolve, reject) => {
        let data = {
          processTaskId: this.processTaskId,
          processTaskStepId: this.processTaskStepId,
          auditId: this.auditId
        };
        this.$set(data, 'content', this.commentObj.content);
        if (this.commentObj.fileList && this.commentObj.fileList.length > 0) {
          let fileIdList = this.commentObj.fileList.map(item => {
            return item.id;
          });
          this.$set(data, 'fileIdList', fileIdList);
        }

        let _this = this;
        this.$api.process.processtask.commentTask(data).then(res => {
          if (res.Status == 'OK') {
            let commentList = res.Return.commentList || [];
            _this.commentList = commentList;
            _this.auditId = null;
            _this.$refs.uploadFileComment.handleClearFiles();
            _this.fileIdList = [];
            _this.$refs.taskStepContent.currentValue = '';
            _this.$set(_this.commentObj, 'content', '');
            _this.$set(_this.commentObj, 'fileList', []);
            _this.isDisableCommet = true;
            this.$emit('updateActiveStep');
            resolve(_this.isDisableCommet);
          }
        });
      });
    },
    draftSave(val) {
      this.$emit('draftSave', val);
    },
    getEventData() {
      //保存数据
      let _this = this;
      let data = {
        handlerStepInfo: {
          eventTypeId: this.eventTypeId,
          eventSolutionId: this.eventSolutionId
        }
      };
      this.$set(data, 'content', _this.commentObj.content);
      let fileIdList = [];

      if (_this.commentObj.fileList.length > 0) {
        fileIdList = _this.commentObj.fileList.map(f => {
          return f.id;
        });
      }
      this.$set(data, 'fileIdList', fileIdList);
      return data;
    },
    eventValid() {
      //校验
      let validList = [];
      if (!this.eventTypeId) {
        this.validConfig.eventTypeId = false;
        let o = {
          focus: '#event',
          msg: this.$t('message.content.required', {target: this.$t('term.process.archivedtype') })
        };
        validList.push(o);
      }
      if (this.isRequiredContent) {
        if (!this.$refs.taskStepContent.valid()) {
          let o = {
            focus: '#event',
            msg: this.$t('message.content.required', {target: this.$t('page.content') })
          };
          validList.push(o);
        }
      }
      return validList;
    }
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    },
    isRequiredContent() { //回复必填判断
      let valid = false;
      if (this.isStepRequired) {
        if (!this.commentList.length) {
          valid = true;
        } else if (this.processTaskConfig.currentProcessTaskStep && this.commentList.length) {
          let startTime = this.processTaskConfig.currentProcessTaskStep.startTime;
          let lcd = this.commentList[0].lcd;
          startTime > lcd && (valid = true);
        }
      }
      return valid;
    } 
  },
  watch: {
    processTaskConfig: {
      handler(val) {
        if (val) {
          let config = this.$utils.deepClone(val);
          if (config.currentProcessTaskStep) {
            this.processTaskStepId = config.currentProcessTaskStep.id;
            let stepConfig = config.currentProcessTaskStep;
            if (stepConfig.handlerStepInfo) {
              this.eventTypeId = stepConfig.handlerStepInfo.eventTypeId || null;
              this.eventSolutionId = stepConfig.handlerStepInfo.eventSolutionId || null;
              if (this.eventTypeId) {
                this.getSolutionList();
              }
            }
            if (stepConfig.commentList) {
              this.commentList = stepConfig.commentList;
              this.defaultCommentList = this.$utils.deepClone(stepConfig.commentList);
            }
            if (stepConfig.comment && (stepConfig.comment.fileList || stepConfig.comment.content)) {
              this.defaultContent = stepConfig.comment.content || null;
              this.$set(this.commentObj, 'content', stepConfig.comment.content || null);
              this.$set(this.commentObj, 'fileList', stepConfig.comment.fileList || []);
              this.isDisableCommet = false;
            }
            this.isStepRequired = stepConfig.isRequired; //流转时，回复必填判断
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.eventEdit {
  .comment-main{
    border-bottom: 1px solid;
    margin-bottom: 16px;
    .step-userimg {
      position: absolute;
    }
    .user-name {
      padding-right: 8px;
    }
    .comment-btn {
      position: absolute;
      top: 0;
      right: 0;
      > button {
        margin-left: 16px;
      }
    }
    .order-comment {
      &:not(:last-child) {
        padding-bottom: 16px;
        .comment-border {
          border-bottom: 1px solid;
        }
      }
      .comment-detail {
        position: relative;
        padding-left: 32px;
        .user-name {
          line-height: 24px;
        }
        .comment-content {
          padding-top: 4px;
        }
      }
      .comment-time {
        padding: 10px 0 16px;
        font-size: 12px;
      }
    }
    .file-main{
      padding-top: 6px;
      .file-name{
        padding: 0 4px;
      }
    }
  }
  .f12 {
    font-size: 12px;
    padding-left: 8px;
  }
  /deep/ .ivu-input {
    background: transparent;
    cursor: pointer;
    border: none;
    // padding-right: 30px;
  }
  .upLoad-box {
    position: relative;
    margin-bottom: 10px;
    .attachment-text {
      display: inline-block;
      margin-right: 16px;
      font-weight: 600;
      font-size: 13px;
    }
    /deep/ .ivu-upload {
      position: absolute;
      top: 0;
      left: 9px;
    }
    .case-btn {
      position: absolute;
      right: 0;
      top: 0;
    }
  }
  .list-btn {
    text-align: right;
    button {
      margin-left: 10px;
    }
  }
  .event-text{
    display: inline-block;
    min-width: 90px;
    &.solution-select{
      padding-left: 10px;
    }
  }
  .solution-item{
    .text-tip-active{
      padding-left: 6px;
    }
  }
  .solution-select-clearbtn-align {
    // 解决方案图标对齐
    /deep/ .select-top .clearBtn {
      right: -4px !important;
      top: 45% !important;
    }
  }
}
</style>
