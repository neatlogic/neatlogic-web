<template>
  <div>
    <!-- 回复 -->
    <div v-if="actionConfigs.complete || actionConfigs.comment" id="content" class="reply-box-margin-bottom order-list comment-box">
      <div v-if="actionConfigs.complete || actionConfigs.comment" class="center-detail-upload-wrap">
        <TsUpLoad
          ref="uploadFileComment"
          className="smallUpload"
          styleType="text"
          :dataType="handler == 'changecreate'||handler == 'changehandle'?'change':'itsm'"
          rowSpan="24"
          :multiple="true"
          :defaultList="commentContent.fileList && commentContent.fileList.length > 0?commentContent.fileList :[]"
          @getFileList="getFileList"
          @remove="removeCommentFile"
        ></TsUpLoad>
      </div>
      <div v-if="handler == 'event'" class="eventEdit mt-sm">
        <!-- 事件节点 -->
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
                class="pl-xs tsfont-edit"
                @click="toEventSolutionEdit"
              ></span>
              <span
                v-if="actionConfig.complete && eventTypeId"
                class="pl-xs tsfont-rotate-right"
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
      </div>
   
      <div v-if="actionConfigs.complete || actionConfigs.comment" class="reply-template-position-box">
        <div class="reply-template-position" @click.stop>
          <!--回复 关联知识库 -->
          <div class="pr-sm">
            <TsFormItem :label="$t('term.process.relknowlege')">
              <TsFormSelect
                v-model="knowledgeId"
                v-bind="knowledgeSelectConfig"
                readonlyClass="text-title h3"
                @on-change="changeKnowledgeId"
              ></TsFormSelect>
            </TsFormItem>
          </div>
          <!-- 回复模板start -->
          <div v-if="handler != 'event'" class="content-template">
            <div class="comment-modules">
              <Poptip
                v-model="replyVisible"
                placement="top-end"
                width="750"
                transfer
                popperClass="reply-poptip"
              >
                <span class="text-href">
                  {{ $t('page.replytemplate') }}
                </span>
                <div slot="content">
                  <ReplyTemplate :content="commentContent.content" @selectTemplate="selectTemplate"></ReplyTemplate>
                </div>
              </Poptip>
            </div>
          </div>
        </div>
      </div>
                     
      <div v-if="actionConfigs.complete || actionConfigs.comment">
        <div>
          <TsCkeditor
            ref="taskStepContent"
            v-model="commentContent.content"
            :showIconToggle="!isShowProcessTaskStepCommentEditorToolbar"
            width="100%"
            :validateList="isRequiredContent? validateList : []"
            @change="changeCommentContent"
          ></TsCkeditor>
        </div>
      </div> 
    </div>
    <!-- 回复 end-->
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve),
    TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve),
    ReplyTemplate: resolve => require(['../reply/reply-template'], resolve)
  },
  props: {
    handler: {
      type: String,
      default: ''
    },
    actionConfig: {
      type: Object,
      default: function() {
        return {};
      }
    },
    commentObj: {
      type: Object,
      default: function() {
        return {};
      }
    },
    processTaskStepConfig: {
      type: Object,
      default: function() {
        return {};
      }
    },
    isShowProcessTaskStepCommentEditorToolbar: { //是否展示富文本框工具栏
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      actionConfigs: null,
      knowledgeId: null,
      replyVisible: false, //回复模板弹框
      commentContent: {
        content: null,
        fileList: null
      },
      eventSolutionId: null,
      solutionList: [],
      treeUrl: '/api/rest/eventtype/tree/search',
      treeParams: {
        isAuthenticate: 1
      },
      validConfig: {
        eventTypeId: null
      },
      eventTypeId: null,
      knowledgeSelectConfig: {
        dynamicUrl: '/api/rest/knowledge/document/search',
        params: { 
          knowledgeType: 'all',
          statusList: ['passed'],
          type: 'document'
        },
        placeholder: this.$t('form.placeholder.pleaseselect', {'target': this.$t('term.knowledge.knowledge')}),
        rootName: 'dataList',
        valueName: 'knowledgeDocumentId',
        textName: 'title',
        transfer: true,
        search: true,
        border: 'none' 
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    //选中回复模板
    selectTemplate(val) {
      this.commentTemplateId = val.id;
      this.commentContent.content = val.content;
      this.replyVisible = false;
    },
    changeKnowledgeId(val, item) {
      if (val) {
        let path = HOME + '/knowledge.html#/knowledge-detail?knowledgeDocumentId=' + val;
        let replaceStr = `<a href="${path}">${item.text}</a>`;
        if (this.commentContent.content) {
          this.commentContent.content += replaceStr;
        } else {
          this.commentContent.content = replaceStr;
        }
      }
    },
    getFileList(val) {
      //获取上传文件列表
      let fileList = val;
      if (fileList && fileList.length > 0) {
        this.$set(this.commentContent, 'fileList', fileList);
        let newArray = [];
        fileList.forEach(item => {
          let fileId = item.id;
          newArray.push(fileId);
        });
        this.fileIdList = newArray;
        this.updateDisableCommet(false);
      } else {
        if (!this.commentContent.content) {
          this.updateDisableCommet(true);
        } else {
          this.updateDisableCommet(false);
        }
      }
    },
    removeCommentFile(val) {
      this.$set(this.commentContent, 'fileList', val);
      if (val && val.length > 0) {
        this.fileIdList = val.map(item => {
          return item.id;
        });
        this.updateDisableCommet(false);
      } else {
        this.fileIdList = [];
        if (!this.commentContent.content) {
          this.updateDisableCommet(true);
        } else {
          this.updateDisableCommet(false);
        }
      }
    },
    changeCommentContent(val) {
      if (val && val.trim()) {
        this.$set(this.commentContent, 'content', val);
        this.updateDisableCommet(false);
      } else {
        if (this.fileIdList && this.fileIdList.length > 0) {
          this.updateDisableCommet(false);
        } else {
          this.updateDisableCommet(true);
        }
      }
    },
    clearReplyValue() {
      // 清空回复列表的值
      this.$refs.uploadFileComment.handleClearFiles();
      this.$refs.taskStepContent.currentValue = '';
    },
    updateDisableCommet(isDisableCommet) {
      // 更新禁用评论按钮
      this.$emit('update:isDisableCommet', isDisableCommet);
    },
    getEventData() {
      //保存数据
      let data = {
        handlerStepInfo: {
          eventTypeId: this.eventTypeId,
          eventSolutionId: this.eventSolutionId
        }
      };
      this.$set(data, 'content', this.commentContent.content);
      let fileIdList = [];

      if (this.commentContent.fileList?.length > 0) {
        fileIdList = this.commentContent.fileList.map(f => {
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
          msg: this.$t('form.validate.required', {target: this.$t('term.process.archivedtype') })
        };
        validList.push(o);
      }
      if (this.isRequiredContent) {
        if (!this.$refs.taskStepContent.valid()) {
          let o = {
            focus: '#event',
            msg: this.$t('form.validate.required', {target: this.$t('page.content') })
          };
          validList.push(o);
        }
      }
      return validList;
    },
    changeEventTypeId(val) {
      this.eventTypeId = val || null;
      this.eventSolutionId = null;
      if (val) {
        this.getSolutionList();
      } else {
        this.solutionList.splice(0);
      }
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
            this.$Message.success(this.$t('message.executesuccess'));
          }
        }
      });
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
          this.commentContent.content = solutionConfig.content;
        }
      });
    },
    toEventSolutionEdit() {
      window.open(HOME + '/process.html#/event-solution-edit?operation=edit&id=' + this.eventSolutionId, '_blank');
    }
  },
  filter: {},
  computed: {
    isRequiredContent() { //回复必填判断
      let valid = false;
      if (this.isStepRequired) {
        if (!this.processTaskStepConfig.commentList.length) {
          valid = true;
        } else if (this.processTaskStepConfig.commentList.length) {
          let startTime = this.processTaskStepConfig.startTime;
          let lcd = this.processTaskStepConfig.commentList[0].lcd; 
          startTime > lcd && (valid = true);
        }
      }
      return valid;
    }
  },
  watch: {
    actionConfig: {
      handler(val) {
        this.actionConfigs = val;
      },
      immediate: true,
      deep: true
    },
    commentObj: {
      handler(val) {
        this.commentContent = val;
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.center-detail-upload-wrap {
  position: relative;
  display: inline-block;
  margin-top: 10px;
}
.reply-template-position-box {
  position: relative;
  width: 100%;
  height: 10px;
  .reply-template-position {
    // 回复模板
    position: absolute;
    top: -28px;
    right: 5px;
    display: flex;
    align-items: center;
  }
}
.comment-box{
  .content-template{
    position: relative;
    /deep/ .template-pop{
      position:absolute;
      right:120px;
    }
  }
  .comment-save{
    width: 100%;
    text-align: right;
    padding-bottom: 16px;
  > button {
      margin-left: 16px;
    }
  }
  .reply-input{
    padding: 7px 10px;
    width: 340px;
    border:1px solid;
    cursor: pointer;
    font-size: 12px;
  }
  .comment-time{
    padding-top: 10px
  }
}
.eventEdit {
  /deep/ .ivu-input {
    background: transparent;
    cursor: pointer;
    border: none;
  }
  .event-text{
    display: inline-block;
    min-width: 90px;
    &.solution-select{
      padding-left: 10px;
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
