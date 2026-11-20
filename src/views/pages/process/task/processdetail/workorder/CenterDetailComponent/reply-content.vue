<template>
  <div>
    <!-- 回复 -->
    <div
      v-if="actionConfigs.complete || actionConfigs.comment"
      id="content"
      class="reply-box-margin-bottom order-list comment-box"
    >
      <div v-if="handler == 'event'" id="event" class="eventEdit mt-sm">
        <!-- 事件节点 -->
        <TsRow>
          <Col span="12">
            <div class="event-tip">
              <span
                class="require-label"
                :class="validConfig.eventTypeId == false?'text-danger':'text-grey'"
              >{{ $t('term.process.archivedtype') }}</span>
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

      <div class="reply-toolbar">
        <div class="center-detail-upload-wrap">
          <!-- 主回复附件使用当前节点处理器，并在已有工单时通过扩展参数携带工单 ID。 -->
          <TsUpLoad
            ref="uploadFileComment"
            className="smallUpload"
            styleType="text"
            :dataType="attachmentFileType"
            :params="attachmentUploadParams"
            rowSpan="24"
            :multiple="true"
            :defaultList="commentContent.fileList && commentContent.fileList.length > 0?commentContent.fileList :[]"
            @getFileList="getFileList"
            @remove="removeCommentFile"
          ></TsUpLoad>
        </div>
        <div class="reply-tools" @click.stop>
          <div v-if="hasKnowledgeDrawer && actionConfigs.save" class="reply-knowledge-picker">
            <span class="text-grey">{{ $t('term.process.relknowlege') }}</span>
            <Button class="knowledge-action knowledge-select bg-op text-grey" aria-haspopup="dialog" @click="taskKnowledge.openTaskKnowledge('ref')">
              {{ $t('form.placeholder.pleaseselect', { target: $t('page.knowledge') }) }}
              <i class="tsfont-down" aria-hidden="true"></i>
            </Button>
          </div>
          <div v-else-if="canQuoteKnowledge" class="reply-community-knowledge">
            <TsFormItem :label="$t('term.process.relknowlege')">
              <TsFormSelect
                v-model="knowledgeId"
                v-bind="knowledgeSelectConfig"
                readonlyClass="text-title h3"
                @on-change="changeKnowledgeId"
              ></TsFormSelect>
            </TsFormItem>
          </div>
          <button
            v-if="hasKnowledgeDrawer && actionConfigs.save"
            type="button"
            class="knowledge-action knowledge-generate text-href"
            aria-haspopup="dialog"
            @click="taskKnowledge.openTaskKnowledge('generate')"
          >{{ $t('term.process.taskknowledge.generate') }}</button>
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
            :validateList="isRequiredContent? ['required'] : []"
            :toolbar="!hasKnowledgeDrawer && $AuthUtils.hasRole('KNOWLEDGE_BASE') ? ['KnowledgeSelect'] : []"
            :params="{ uploadVideoConfig: { type: 'itsm'} }"
            @change="changeCommentContent"
          >
          </TsCkeditor>
        </div>
      </div>
    </div>
    <!-- 回复 end-->
  </div>
</template>
<script>
import { getFileTypeHandler } from '../../../taskcommon/file-type-handler.js';

export default {
  name: '',
  inject: {taskKnowledge: {default: null}},
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue'),
    TsCkeditor: () => import('@/resources/plugins/TsCkeditor/TsCkeditor.vue'),
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree'),
    ReplyTemplate: () => import('../reply/reply-template')
  },
  props: {
    processTaskId: {
      // LONG 类型 ID 兼容接口返回的数字和字符串，不强制转为 Number 以避免精度丢失。
      type: [Number, String],
      default: null
    },
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
    isShowProcessTaskStepCommentEditorToolbar: {
      //是否展示富文本框工具栏
      type: Boolean,
      default: false
    },
    isStepRequired: {
      type: [Number, Boolean]
    }
  },
  data() {
    return {
      actionConfigs: null,
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
      knowledgeId: null,
      knowledgeSelectConfig: {
        dynamicUrl: '/api/rest/knowledge/document/search',
        params: {
          knowledgeType: 'all',
          statusList: ['passed'],
          type: 'document'
        },
        placeholder: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.knowledge') }),
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
    // 社区版沿用原有的已发布知识引用，仅将链接写入回复草稿。
    changeKnowledgeId(id, item) {
      if (id) this.appendKnowledgeLinks([{documentId: id, title: item.text}]);
    },
    // 在提交关联成功后，按返回的新增文档追加链接，保留原回复及附件。
    appendKnowledgeLinks(documents) {
      if (!documents?.length) return;
      const appended = document.createElement('div');
      documents.forEach(doc => {
        const link = document.createElement('a');
        link.href = HOME + '/knowledge.html#/knowledge-detail?knowledgeDocumentId=' + encodeURIComponent(doc.documentId);
        link.textContent = doc.title;
        appended.append(document.createElement('br'), link);
      });
      const current = this.$refs.taskStepContent?.currentValue ?? this.commentContent.content ?? '';
      if (!current) appended.firstElementChild.remove();
      this.changeCommentContent(current + appended.innerHTML);
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
          msg: this.$t('form.validate.required', { target: this.$t('term.process.archivedtype') })
        };
        validList.push(o);
      }
      if (this.isRequiredContent) {
        let taskStepContent = this.$refs.taskStepContent;
        if (taskStepContent && !taskStepContent.valid()) {
          let o = {
            focus: '#event',
            msg: this.$t('form.validate.required', { target: this.$t('page.content') })
          };
          validList.push(o);
        }
      }
      return validList;
    },
    valid() {
      let isValidPass = true;
      if (this.isRequiredContent) {
        let taskStepContent = this.$refs.taskStepContent;
        if (taskStepContent && !taskStepContent.valid()) {
          isValidPass = false;
        }
      }
      return isValidPass;
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
    // 商业工单在批量引用抽屉中同时关联文档和插入链接。
    canQuoteKnowledge() {
      return !this.hasKnowledgeDrawer && this.$AuthUtils.hasRole('KNOWLEDGE_BASE') &&
        this.$store.state.topMenu?.moduleList?.some(module => module.moduleId === 'knowledge');
    },
    hasKnowledgeDrawer() {
      return !!this.taskKnowledge?.taskKnowledgeComponents;
    },
    attachmentUploadParams() {
      // multipart 表单以 JSON 字符串提交扩展对象；无工单 ID 时完全省略该字段。
      return this.processTaskId ? { extendParam: JSON.stringify({ processTaskId: this.processTaskId }) } : {};
    },
    attachmentFileType() {
      // props 对应 currentProcessTaskStep；只读平级字段，节点切换或清空后同步更新类型。
      return getFileTypeHandler(this.processTaskStepConfig, this.handler);
    },
    isRequiredContent() {
      //回复必填判断
      let valid = false;
      if (this.isStepRequired) {
        valid = true;
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
.reply-toolbar {
  --reply-control-height: 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 4px 12px;
  margin: 8px 0;
}
.center-detail-upload-wrap {
  flex: 1 1 128px;
  min-width: 0;
  max-width: 100%;
  ::v-deep .text-btn { line-height: var(--reply-control-height); }
}
.reply-tools, .reply-knowledge-picker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  max-width: 100%;
  gap: 4px 8px;
}
.reply-tools {
  justify-content: flex-end;
  margin-left: auto;
  min-height: var(--reply-control-height);
}
.reply-knowledge-picker > .text-grey, .content-template { white-space: nowrap; }
.reply-community-knowledge { min-width: 0; max-width: 100%; }
.knowledge-select {
  display: flex;
  align-items: center;
  width: 126px;
  max-width: 100%;
  padding: 0 10px;
  border-color: transparent;
  ::v-deep > span {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
    line-height: var(--reply-control-height);
  }
}
.knowledge-generate { padding: 0; background: transparent; border: 0; font: inherit; }
.knowledge-generate, .reply-knowledge-picker > .text-grey, .content-template .text-href {
  line-height: var(--reply-control-height);
}
.comment-box {
  .content-template {
    position: relative;
    // 浮层触发器用块布局，避免多层行内元素逐层偏移回复模板的文字基线。
    ::v-deep .ivu-poptip, ::v-deep .ivu-poptip-rel, .text-href {
      display: block;
    }
    ::v-deep .template-pop {
      position: absolute;
      right: 120px;
    }
  }
  .comment-save {
    width: 100%;
    text-align: right;
    padding-bottom: 16px;
    > button {
      margin-left: 16px;
    }
  }
  .reply-input {
    padding: 7px 10px;
    width: 340px;
    border: 1px solid;
    cursor: pointer;
    font-size: 12px;
  }
  .comment-time {
    padding-top: 10px;
  }
}
.eventEdit {
  ::v-deep .ivu-input {
    background: transparent;
    cursor: pointer;
    border: none;
  }
  .event-text {
    display: inline-block;
    min-width: 90px;
    &.solution-select {
      padding-left: 10px;
    }
  }
  .solution-select-clearbtn-align {
    // 解决方案图标对齐
    ::v-deep .select-top .clearBtn {
      right: -4px !important;
      top: 45% !important;
    }
  }
}
</style>
