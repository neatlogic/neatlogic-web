
<template>
  <div class="subtask-detail">
    <div v-for="(subStep, subIndex) in stepList" :key="subStep.id" class="subtask-list-content">
      <div class="padding">
        <div class="top-content dividing-color">
          <div class="sub-btn-list">
            <Button
              v-if="subStep.isRedoable"
              :title="getsubstepActionLObj(subStep.actionList).redosubtask"
              size="small"
              @click="subRedo(subStep.id)"
            ><div class="overflow" style="max-width:80px">{{ getsubstepActionLObj(subStep.actionList).redosubtask }}</div></Button>
            <Button
              v-if="subStep.isCompletable"
              :title="getsubstepActionLObj(subStep.actionList).completesubtask"
              size="small"
              @click="subComplete(subStep.id, subStep.content)"
            ><div class="overflow" style="max-width:80px">{{ getsubstepActionLObj(subStep.actionList).completesubtask }}</div></Button>
            <Button
              v-if="subStep.isEditable"
              :title="getsubstepActionLObj(subStep.actionList).editsubtask"
              size="small"
              @click="subEdit(subStep)"
            ><div class="overflow" style="max-width:80px">{{ getsubstepActionLObj(subStep.actionList).editsubtask }}</div></Button>
            <Button
              v-if="subStep.isAbortable"
              :title="getsubstepActionLObj(subStep.actionList).abortsubtask"
              size="small"
              @click="subAbort(subStep.id, subStep.userName)"
            ><div class="overflow" style="max-width:80px">{{ getsubstepActionLObj(subStep.actionList).abortsubtask }}</div></Button>
          </div>
          <div>
            <TsRow>
              <Col v-if="subStep.userName" span="10">
                <div class="sub-label overflow">
                  <span class="text-grey sub-title">{{ $t('term.process.dealwithuser') }}</span>
                  <UserCard v-bind="subStep.userVo" hideAvatar></UserCard>
                </div>
              </Col>
              <Col v-if="subStep.statusVo" span="10">
                <div class="sub-label overflow">
                  <span class="text-grey sub-title">任务状态</span>
                  <span :style="{ color: subStep.statusVo.color }">{{ subStep.statusVo.text }}</span>
                </div>
              </Col>
              <Col v-if="subStep.targetTime" span="10">
                <div class="sub-label overflow">
                  <span class="text-grey sub-title">期望完成时间</span>
                  <span>{{ subStep.targetTime | formatDate }}</span>
                </div>
              </Col>
              <Col v-if="subStep.startTime" span="10">
                <div class="sub-label overflow">
                  <span class="text-grey sub-title">{{ $t('page.starttime') }}</span>
                  <span>{{ subStep.startTime | formatDate }}</span>
                </div>
              </Col>
              <Col v-if="subStep.endTime" span="10">
                <div class="sub-label overflow">
                  <span class="text-grey sub-title">完成时间</span>
                  <span>{{ subStep.endTime | formatDate }}</span>
                </div>
              </Col>
            </TsRow>
          </div>
          <div class="text-content">
            <span class="text-grey content-title">{{ $t('page.description') }}</span>
            <div v-html="subStep.content"></div>
          </div>
        </div>
        <div class="sub-comment">
          <div v-for="scomment in subStep.contentList" :key="scomment.id">
            <div class="step-userimg">
              <UserCard v-bind="scomment.fcuVo" :iconSize="24" hideName></UserCard>
            </div>
            <div class="auditList-content">
              <div>
                <span class="user-name text-bold text-primary"><UserCard v-bind="scomment.fcuVo" hideAvatar></UserCard></span>
                <span class="text-bold text-primary">
                  {{ getActionType(scomment.action) }}
                  <template v-if="replaceableTextConfig['replaceable_subtask']">
                    {{ replaceableTextConfig['replaceable_subtask'].value || replaceableTextConfig['replaceable_subtask'].text }}
                  </template>
                  <template v-else>子任务</template>
                </span>
                <span class="text-grey text-primary">·{{ scomment.fcd | formatDate }}</span>
              </div>
              <div v-html="scomment.content"></div>
            </div>
          </div>
          <div v-if="subStep.isCommentable" class="input-border comment-input">
            <TsFormInput
              :ref="`subCommentInput${subIndex}`"
              v-model="subStep.contentVal"
              placeholder="请输入内容"
              class="input-text"
            ></TsFormInput>
            <div class="overflow">
              <Button
                type="primary"
                class="btn-comment"
                :title="getsubstepActionLObj(subStep.actionList).commentsubtask"
                :disabled="!subStep.contentVal"
                @click="subComment(subStep.id, subIndex)"
              >{{ getsubstepActionLObj(subStep.actionList).commentsubtask }}</Button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="stepList.length-1 > subIndex" class="bg-grey line-dividing"></div>
    </div>
    <TsDialog
      type="modal"
      :isShow.sync="subContentModal"
      class="vertical-center-modal"
      :title="subTaskContentTitle"
      @on-ok="subTaskContentSave"
    >
      <template>
        <TsForm ref="subTaskContent" :itemList="subContentList"></TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: {
    TsFormInput,
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {
  },
  props: {
    processTaskId: [Number, String],
    processTaskStepId: [Number, String],
    list: {
      type: Array,
      default: () => []
    },
    replaceableTextConfig: Object
  },
  data() {
    return {
      stepList: [],
      actionType: {
        editsubtask: '修改',
        completesubtask: '完成',
        redosubtask: '重做',
        abortsubtask: '取消',
        createsubtask: this.$t('page.build'),
        commentsubtask: '回复',
        startprocess: '提交',
        completablesubtask: '完成'
      },
      subContentModal: false,
      subTaskContentTitle: '完成',
      subContentList: [
        {
          type: 'ckeditor',
          name: 'content',
          value: '',
          width: '90%',
          label: this.$t('page.description'),
          validateList: ['required']
        }
      ]
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
    getsubstepActionLObj(list) {
      let actionObj = {};
      list.forEach(e => {
        actionObj[e.value] = e.text;
      });
      return actionObj;
    },
    subRedo(id) {
      //子任务重做
      this.processTaskStepSubtaskId = id;
      this.subContentList[0].value = '';
      this.subTaskContentTitle = '重做';
      this.issubTaskComplete = false;
      this.subContentModal = true;
    },
    subEdit(obj) {
      //子任务编辑
      this.$emit('addAssist', obj, true);
    },
    subAbort(id, name) {
      //子任务取消
      let data = {
        processTaskStepSubtaskId: id
      };
      let _this = this;
      let subTaskText = this.replaceableTextConfig['replaceable_subtask'] ? this.replaceableTextConfig['replaceable_subtask'].value || this.replaceableTextConfig['replaceable_subtask'].text : '子任务';
      this.$createDialog({
        title: '提示',
        content: '确定取消当前' + subTaskText + '？',
        'on-ok': vnode => {
          this.$api.process.processtask.subAbortable(data).then(res => {
            if (res.Status == 'OK') {
              this.$router.push({
                path: '/task-detail',
                query: {
                  processTaskId: _this.processTaskId,
                  processTaskStepId: _this.processTaskStepId,
                  type: Date.now()
                }
              });
            }
          });
          vnode.isShow = false;
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    subComplete(id) {
      //子任务完成按钮
      this.processTaskStepSubtaskId = id;
      this.subContentList[0].value = '';
      this.subTaskContentTitle = '完成';
      this.issubTaskComplete = true;
      this.subContentModal = true;
    },
    subComment(id, index) {
      //子任务评论
      if (this.$refs[`subCommentInput${index}`][0].currentValue) {
        let content = this.$refs[`subCommentInput${index}`][0].currentValue;
        let data = {
          processTaskStepSubtaskId: id,
          content: content
        };
        this.$api.process.processtask.subTaskComment(data).then(res => {
          if (res.Status == 'OK') {
            let contentList = res.Return.contentList;
            this.stepList[index].contentList = contentList;
            this.stepList[index].contentVal = '';
            this.$refs[`subCommentInput${index}`][0].currentValue = '';
            this.$emit('getStepStatusList');
          }
        });
      }
    },
    subTaskContentSave() {
      let subTaskContentForm = this.$refs.subTaskContent;
      if (subTaskContentForm.valid()) {
        let formList = subTaskContentForm.getFormValue();
        if (this.issubTaskComplete) {
          let data = {
            processTaskStepSubtaskId: this.processTaskStepSubtaskId,
            content: formList.content
          };
          this.$api.process.processtask.subComplete(data).then(res => {
            if (res.Status == 'OK') {
              this.subContentModal = false;
              this.$router.push({
                path: '/task-detail',
                query: {
                  processTaskId: this.processTaskId,
                  processTaskStepId: this.processTaskStepId,
                  type: Date.now()
                }
              });
            }
          });
        } else {
          let data = {
            processTaskStepSubtaskId: this.processTaskStepSubtaskId,
            content: formList.content
          };
          this.$api.process.processtask.subRedoable(data).then(res => {
            if (res.Status == 'OK') {
              this.subContentModal = false;
              this.$router.push({
                path: '/task-detail',
                query: {
                  processTaskId: this.processTaskId,
                  processTaskStepId: this.processTaskStepId,
                  type: Date.now()
                }
              });
            }
          });
        }
      }
    },
    getActionType(val) {
      let text = '处理';
      if (this.actionType[val]) {
        text = this.actionType[val];
      }
      return text;
    }
  },
  computed: {},
  watch: {
    list: {
      handler(val) {
        let stepList = val || [];
        this.stepList = this.$utils.deepClone(stepList);
        if (this.stepList.length > 0) {
          this.stepList.forEach(item => {
            this.$set(item, 'contentVal', '');
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.subtask-detail{
  padding-bottom: 16px;
 .subtask-list-content {
   width: 100%;
   height: 100%;
   .line-dividing{
     width: 100%;
     height: 10px;
   }

    .top-content {
      position: relative;
      padding-bottom: 16px;
      border-bottom: 1px solid;
      padding-top: 16px;
      .sub-btn-list {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1;
        >button {
          margin-left: 10px;
        }
      }
    }

    .sub-label {
      line-height: 32px;
      height: 32px;
      .sub-title {
        width: 90px;
        display: inline-block;
      }
    }

    .text-content {
      position: relative;
      padding-left: 40px;

      .content-title {
        position: absolute;
        top: 0;
        left: 0;
      }
    }

    .sub-comment {
      padding-top: 16px;

      position: relative;

      .step-userimg {
        position: absolute;
      }

      .user-name {
        padding-right: 8px;
      }

      .text-bold {
        font-weight: bold;
      }

      .auditList-content {
        padding-left: 40px;
        line-height: 24px;
        padding-bottom: 12px;
      }
    }

    .comment-input {
      display: flex;
      align-items: center;
      .input-text{
        width: 340px;
        padding-right: 16px;
        flex-shrink: 0;
      }
      .btn-comment{
        width: 100%;
        /deep/ span{
          width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
            white-space: nowrap;
        }
      }
    }
  }
} 
</style>
