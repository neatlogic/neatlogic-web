<template>
  <div>
    <TsDialog
      v-if="isShowModal"
      type="slider"
      :isShow.sync="isShowModal"
      :bgOp="true"
      width="1200px"
      :title="title"
      className="knowledge-dialog"
      @on-ok="saveOk"
      @on-close="close"
    >
      <template>
        <div class="main">
          <div class="dividing-color left">
            <div class="form-list">
              <Tsform
                ref="form"
                :itemList="formItemConfig"
                labelPosition="top"
                width="100%"
              ></Tsform>
              <div class="nav-box">
                <div class="list-tip text-tip">{{ $t('term.process.tranknowledgetip') }}</div>
                <vuedraggable
                  v-model="list"
                  :options="{ chosenClass: 'choose', animation: '150', handle: '.move' }"
                  @start="dragStart"
                  @end="dragEnd"
                >
                  <div v-for="item in list" :key="item.handler">
                    <div class="nav-li dividing-color">
                      <Checkbox
                        v-model="item.isChecked"
                        :true-value="1"
                        :false-value="0"
                        @on-change="changeSelect(item)"
                      ></Checkbox>
                      <span>{{ item.title }}</span>
                      <span class="tsfont-bar move"></span>
                    </div>
                    <div v-if="item.isChecked == 1 && item.list && item.list.length > 0" class="second-nav">
                      <div v-for="(c, cindex) in item.list" :key="cindex" class="nav-li dividing-color">
                        <Checkbox
                          v-model="c.isChecked"
                          :true-value="1"
                          :false-value="0"
                          @on-change="changeSelect(c)"
                        ></Checkbox>
                        <span>{{ c.name }}</span>
                      </div>
                    </div>
                  </div>
                </vuedraggable>
                <div v-if="fileConfig.fileList.length > 0" class="nav-li dividing-color">
                  <Checkbox
                    v-model="fileConfig.isChecked"
                    :true-value="1"
                    :false-value="0"
                    @on-change="changeFileSelect"
                  ></Checkbox>
                  <span>{{ $t('page.accessory') }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="right">
            <div v-if="list.length > 0 && isDragrerender">
              <div
                :is="'item-' + item.handler"
                v-for="(item, index) in list"
                :key="index"
                ref="itemData"
                :config="item"
              ></div>
            </div>
            <div v-if="fileConfig.isChecked == 1 && fileConfig.fileList.length > 0">
              <ItemFile :config="fileConfig"></ItemFile>
            </div>
          </div>
        </div>
      </template>
    </TsDialog>
    <!-- 提交审核 -->
    <ReviewDialog
      :isShow.sync="isReviewShow"
      :documentId="knowledgeDocumentId"
      :versionId="knowledgeDocumentVersionId"
      :type="userType"
    ></ReviewDialog>
  </div>
</template>
<script>
import items from './knowledge/index.js';
import vuedraggable from 'vuedraggable';
export default {
  name: '',
  components: {
    Tsform: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    ...items,
    vuedraggable
  },
  filters: {},
  props: {
    isShow: { type: Boolean, default: false },
    processTaskConfig: { type: Object }
  },
  data() {
    return {
      isDragrerender: true, // 拖拽之后，需重新渲染list，否则获取的是拖拽前的数据
      isShowModal: false,
      title: this.$t('term.process.tasksaveknow'),
      formItemConfig: {
        title: {
          type: 'text',
          label: this.$t('page.title'),
          value: null,
          maxlength: 50,
          validateList: [
            'required', 'name-special',
            { name: 'searchUrl', url: 'api/rest/knowledge/document/title/update', message: this.$t('term.process.titleexisted') }
          ]
        },
        knowledgeDocumentTypeUuid: {
          type: 'tree',
          label: this.$t('page.classify'),
          url: '/api/rest/knowledge/document/type/tree/forselect',
          valueName: 'uuid',
          textName: 'name',
          value: '',
          showPath: true,
          readonlyClass: '',
          validateList: ['required']
        }
      },
      list: [],
      fileConfig: {
        title: this.$t('page.accessory'),
        handler: 'file',
        isChecked: 1,
        fileList: []
      },
      knowledgeDocumentId: null,
      knowledgeDocumentVersionId: null,
      processTaskId: null,
      commentList: [],
      isReviewShow: false,
      userType: 'submit' //审核人权限
    };
  },
  beforeCreate() {},
  created() {
    this.processTaskId = this.$route.query.processTaskId;
    this.getStepStatusList();
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
    close() {
      this.$emit('update:isShow', false);
    },
    initData() {
      let config = this.processTaskConfig;
      let list = [];
      let fileList = [];
      if (config.startProcessTaskStep.comment) {
        //工单描述
        let obj = {
          title: this.$t('page.description'),
          handler: 'content',
          isChecked: 1,
          content: '',
          fileList: []
        };
        let defaultTaskContent = '';
        let defaultTaskFileList = [];
        if (config.startProcessTaskStep.comment.content) {
          defaultTaskContent = config.startProcessTaskStep.comment.content;
          this.$set(obj, 'content', defaultTaskContent);
        }
        if (config.startProcessTaskStep.comment.fileList && config.startProcessTaskStep.comment.fileList.length > 0) {
          defaultTaskFileList = config.startProcessTaskStep.comment.fileList;
          this.$set(obj, 'fileList', defaultTaskFileList);
        }
        if (defaultTaskContent || defaultTaskFileList.length > 0) {
          list.push(obj);
        }
      }
      if (config.formConfig) {
        let formConfig = config.formConfig;
        if (formConfig.tableList && formConfig.tableList.length > 0) {
          let obj = {
            title: this.$t('page.form'),
            handler: 'form',
            isChecked: 1,
            formConfig: formConfig,
            formAttributeDataMap: config.formAttributeDataMap
          };
          list.push(obj);
        }
      }
      if (this.commentList.length > 0) {
        let obj = {
          title: this.$t('page.reply'),
          handler: 'comment',
          isChecked: 1,
          list: []
        };
        let commentList = [];
        this.commentList.forEach(item => {
          let list = [];
          item.list.forEach(c => {
            if (c.content && c.content != '') {
              list.push(c);
            }
            if (c.fileList.length > 0) {
              fileList.push(...c.fileList);
            }
          });
          this.$set(item, 'list', list);
          if (list.length > 0) {
            commentList.push(item);
          }
        });
        if (commentList.length > 0) {
          this.$set(obj, 'list', commentList);
        }
        list.push(obj);
      }
      if (fileList.length > 0) {
        var newFileList = fileList.map((item, index) => {
          return Object.assign(item, { isChecked: 1 });
        });
        this.fileConfig.fileList = fileList;
      }
      this.list = list;
    },
    getStepStatusList() {
      //步骤状态
      let data = {
        processTaskId: this.processTaskId
      };
      this.$api.process.processtask.getStepStatusList(data).then(res => {
        if (res.Status == 'OK') {
          let stepDataList = res.Return || [];
          let commentList = [];
          if (stepDataList.length > 0) {
            stepDataList.forEach(item => {
              if (item.commentList.length > 0) {
                var newCommentList = item.commentList.map((item, index) => {
                  return Object.assign(item, { isChecked: 1 });
                });
                let obj = {
                  name: item.name,
                  isChecked: 1,
                  list: newCommentList
                };
                commentList.push(obj);
              }
            });
          }
          if (commentList.length > 0) {
            this.commentList = commentList;
          }
        }
      });
    },
    changeSelect(item) {
      if (item.list && item.list.length > 0) {
        item.list.forEach(c => {
          this.$set(c, 'isChecked', item.isChecked);
          if (c.list && c.list.length > 0) {
            c.list.forEach(d => {
              this.$set(d, 'isChecked', item.isChecked);
            });
          }
        });
      }
    },
    changeFileSelect(val) {
      this.fileConfig.fileList.forEach(item => {
        this.$set(item, 'isChecked', val);
      });
    },
    saveData() {
      let data = {
        invokeId: this.processTaskId,
        source: 'processtask',
        isSubmit: 1,
        lineList: [],
        fileIdList: []
      };
      let itemList = this.$refs.itemData || [];
      let lineList = [];
      if (itemList.length > 0) {
        itemList.forEach(item => {
          let arr = item.getData();
          lineList.push(...arr);
        });
        this.$set(data, 'lineList', lineList);
      }
      let fileIdList = [];
      if (this.fileConfig.isChecked == 1 && this.fileConfig.fileList.length > 0) {
        this.fileConfig.fileList.forEach(item => {
          if (item.isChecked == 1) {
            fileIdList.push(item.id);
          }
        });
      }
      this.$set(data, 'fileIdList', fileIdList);
      return data;
    },
    dragStart() {
      // 拖拽开始
      this.isDragrerender = false;
    },
    dragEnd(evt) {
      // 拖拽结束
      this.isDragrerender = true;
    },
    saveDraftDocument() {
      let _this = this;
      if (!_this.$refs.form.valid()) {
        return;
      }
      let data = _this.saveData();
      let obj = this.$refs.form.getFormValue();
      Object.assign(data, obj);
      this.$api.process.processtask.saveDraftDocument(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.getKnowledgeAudit();
          let config = res.Return;
          _this.knowledgeDocumentId = config.knowledgeDocumentId;
          _this.knowledgeDocumentVersionId = config.knowledgeDocumentVersionId;
          let isReviewable = config.isReviewable;
          if (isReviewable == 1) {
            _this.userType = 'review';
          } else {
            _this.userType = 'submit';
          }
          _this.isReviewShow = true;
          _this.$parent.getKnowledgeDetail();
          _this.$emit('update:isShow', false);
        }
      });
    },
    getKnowledgeAudit() {
      //知识活动
      let data = {
        processTaskId: this.processTaskId,
        title: this.formItemConfig.title.value
      };
      this.$api.process.processtask.knowledgeAudit(data).then(res => {
        if (res.Status == 'OK') {
          //
        }
      });
    },
    saveOk() {
      this.saveDraftDocument();
    }
  },
  computed: {},
  watch: {
    isShow(val) {
      this.isShowModal = val;
      if (val) {
        this.processTaskId = this.processTaskConfig.id;
        this.initData();
      }
    }
  }
};
</script>
<style lang="less" scoped>
.knowledge-dialog {
  position: relative;
  .main {
    padding-left: 320px;
    height: 100%;
    .left {
      position: absolute;
      top: 0;
      left: 0;
      width: 320px;
      padding: 12px 16px;
      border-right: 1px solid;
      height: calc(100vh - 109px);
      overflow: auto;
      margin-top: 52px;
      .nav-box {
        padding: 24px 0;
        .list-tip {
          padding-bottom: 8px;
        }
        .second-nav {
          padding-left: 12px;
        }
      }
      .nav-li {
        position: relative;
        border: 1px solid;
        padding: 8px 32px 8px 16px;
        margin-bottom: 12px;
        overflow: hidden;
        .move {
          cursor: move;
          position: absolute;
          right: 8px;
          top: 8px;
        }
      }
    }
    .right {
      width: 100%;
      overflow-x: auto;
      @import (reference) '~@/resources/assets/css/theme.less';
      /deep/ .fz-h1 {
        position: relative;
        font-size: 16px;
        font-weight: bold;
        min-height: 32px;
        line-height: 30px;
        padding-left: 10px;
        margin: 6px 0;
        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          height: 18px;
          width: 4px;

          border-radius: 2px;
          background-color: @dividing-color;
        }
      }
    }
  }
}
</style>
