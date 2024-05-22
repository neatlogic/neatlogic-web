<template>
  <div
    v-if="newChangeStepList && newChangeStepList.length > 0"
    ref="changeBox"
    class="change-detail"
    @click.stop
  >
    <div class="change-top">
      <div class="text-grey top-title fz10">{{ title }}</div>
      <div class="top-right">
        <div v-if="!isEditStepworker">
          <div class="action-group text-right no-line">
            <span
              v-for="s in statusList"
              :key="s.value"
              class="block-item"
            >
              <span class="color-tip" :style="{'background':s.color}"></span>
              <span class="fz10">{{ s.text }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isEditStepworker" class="tsfont-edit text-action edit-userAll">
      <span @click="editUser">{{ $t('term.process.batchedituser') }}</span>
      <div v-if="visible" class="pop-box">
        <div class="tooltip-box">
          <div class="tooltip tipbottom">
            <div class="tooltip-content input-border">
              <div class="user-select">
                <UserSelect
                  ref="worker"
                  :value.sync="worker"
                  transfer
                  :groupList="groupList"
                  :multiple="false"
                  :validateList="validateList"
                  :onChange="getUserText"
                ></UserSelect>
              </div>
              <div class="btn-user">
                <Button
                  type="text"
                  size="small"
                  style="margin-right: 8px;"
                  @click="cancelAllUser"
                >{{ $t('page.cancel') }}</Button>
                <Button
                  type="primary"
                  size="small"
                  style="margin:0;"
                  @click="changeAllUser"
                >{{ $t('page.confirm') }}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="change-main card-wrapper">
      <div v-for="(cd, index) in newChangeStepList" :key="index" class="card-list">
        <span class="sub-line"></span>
        <div class="card-item radius-sm" :class="cd.isActive == 1 && (cd.isAfterStartDate == 0 || cd.isInWindow == 0) ? 'bg-warning-grey' : 'bg-grey-hover'" :style="{ 'margin-bottom': cd.isShow ? '0px' : '8px', 'border-left': isEditStepworker ? 'none' : '3px solid ' + cd.statusVo.color }">
          <div class="content-block" @click="lookContent(cd)">
            <div class="title-block overflow">
              <div class="text-grey" :title="cd.code">{{ cd.code }}</div>
              <span class="overflow" :title="cd.name">{{ cd.name }}</span>
            </div>
            <div v-if="cd.isActive == 1 && (cd.isAfterStartDate == 0 || cd.isInWindow == 0)" class="timewindow-block">
              <div v-if="cd.isAfterStartDate == 0">
                <span class="text-grey timewindow-tip">{{ $t('term.process.planstartdate') }}</span>
                <span class="window-time-text">{{ cd.planStartDate }}</span>
              </div>
              <div v-if="cd.isAfterStartDate == 1 && cd.isInWindow == 0">
                <span class="text-grey timewindow-tip">{{ $t('term.process.startTimeWindow') }}</span>
                <span class="window-time-text">{{ cd.startTimeWindow || '~' }}</span>
                <span class="window-time-text">-</span>
                <span class="window-time-text">{{ cd.endTimeWindow || '~' }}</span>
              </div>
            </div>
            <div v-show="cd.isActive == 0 || (cd.isAfterStartDate == 1 && cd.isInWindow == 1)" class="work-block overflow">
              <UserCard :uuid="cd.workerVo.uuid" :initType="cd.workerVo.initType"></UserCard>
            </div>
            <div v-show="cd.isActive == 0 || (cd.isAfterStartDate == 1 && cd.isInWindow == 1)" class="time-block">
              <div v-if="cd.status != 'pending'">
                <div class="text-grey" :title="$t('term.process.actualstarttime')">{{ $t('term.process.actualstarttime') }}</div>
                <div v-if="cd.startTime" class="overflow" :title="cd.startTime | formatDate">
                  {{ cd.startTime | formatDate }}
                </div>
                <div v-else>-</div>
              </div>
              <div v-else>
                <div class="text-grey overflow" :title="$t('term.process.planstartdate')">{{ $t('term.process.planstartdate') }}</div>
                <div v-if="cd.planStartDate" class="overflow" :title="cd.planStartDate">
                  {{ cd.planStartDate }}
                </div>
                <div v-else>-</div>
              </div>
            </div>
            <div v-show="cd.isActive == 0 || (cd.isAfterStartDate == 1 && cd.isInWindow == 1)" class="time-block">
              <div v-if="cd.status != 'pending'">
                <div class="text-grey" :title="$t('term.process.actualendtime')">{{ $t('term.process.actualendtime') }}</div>
                <div v-if="cd.endTime" class="overflow" :title="cd.endTime | formatDate">
                  {{ cd.endTime | formatDate }}
                </div>
                <div v-else>-</div>
              </div>
              <div v-else>
                <div class="text-grey" :title="$t('term.process.startTimeWindow')">{{ $t('term.process.startTimeWindow') }}</div>
                <span v-if="cd.startTimeWindow || cd.endTimeWindow" class="overflow" :title="cd.startTimeWindow + '-' + cd.endTimeWindow">
                  <span class="text-title window-time-text">{{ cd.startTimeWindow || '~' }}</span>
                  <span class="text-title window-time-text">-</span>
                  <span class="text-title window-time-text">{{ cd.endTimeWindow || '~' }}</span>
                </span>
                <span v-else>-</span>
              </div>
            </div>
            <div v-show="cd.isActive == 0 || (cd.isAfterStartDate == 1 && cd.isInWindow == 1)" class="files-block" style="position: relative;">
              <div class="text-grey">{{ $t('page.accessory') }}</div>
              <div v-if="cd.fileIdList && cd.fileIdList.length" class="text-action" @click.stop>
                <Dropdown>
                  <span>{{ cd.fileIdList.length }}</span>
                  <DropdownMenu slot="list" class="dropdown">
                    <DropdownItem v-for="f in cd.fileList" :key="f.id">
                      <span v-download="downurl('/api/binary/file/download', f.id)" class="tsfont-attachment text-action">
                        {{ f.name }}
                        <i class="tsfont-download"></i>
                      </span>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <span v-else>-</span>
            </div>
            <div class="btn-list bg-grey-hover">
              <template v-if="cd.actionList && cd.actionList.length > 0">
                <div class="action-group line">
                  <span
                    v-for="(action, cindex) in cd.actionList"
                    :key="cindex"
                    class="action-item"
                    @click.stop="stepFunction(action.value, cd)"
                  >{{ action.text }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div v-if="cd.isShow" class="content-box dividing-color radius-sm">
          <div class="text-grey content-top">
            <div class="order-tabs-title step-tabs-title">
              <span
                v-for="(item, tindex) of changeTitle"
                :key="tindex"
                :class="{ active: cd.cur == tindex }"
                class="text-action"
                @click="cd.cur = tindex"
              >
                <span class="title-box">
                  {{ item.title }}
                  <span v-show="item.isCount != false">({{ cd.commentList.length }})</span>
                </span>
              </span>
            </div>
          </div>
          <div v-show="cd.cur == 0">
            <div v-if="(cd.fileList && cd.fileList.length) || cd.content" class="content-text">
              <div>
                {{ cd.content }}
              </div>
              <div v-if="cd.fileList && cd.fileList.length">
                <div v-for="f in cd.fileList" :key="f.id">
                  <span v-download="downurl('/api/binary/file/download', f.id)" class="tsfont-attachment text-action">
                    {{ f.name }}
                    <i class="tsfont-download"></i>
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-grey content-text">{{ $t('page.notarget',{target:$t('page.description')}) }}</div>
          </div>
          <div v-show="cd.cur == 1">
            <div v-scrollHidden class="content-text">
              <div v-if="getActionValue(cd.actionList)" class="comment-content">
                <div style="margin-bottom:8px;">
                  <TsCkeditor
                    :ref="`commentChangeStep${index}`"
                    width="100%"
                    class="editor"
                    :showIconToggle="true"
                  ></TsCkeditor>
                </div>
                <TsUpLoad
                  :ref="`uploadFile${index}`"
                  styleType="button"
                  className="smallUpload"
                  dataType="change"
                  :multiple="uploadMultiple"
                ></TsUpLoad>
                <div class="comment-click">
                  <Button type="primary" @click="commentOk(cd, index)">{{ $t('page.reply') }}</Button>
                </div>
              </div>
              <div v-if="cd.commentList && cd.commentList.length > 0" class="order-list bg-block" stype="margin:0;">
                <div class="comment-list">
                  <div v-for="comment in cd.commentList" :key="comment.id" class="order-comment">
                    <div class="step-userimg">
                      <UserCard v-bind="comment.fcuVo" :iconSize="24" hideName></UserCard>
                    </div>
                    <div class="comment-detail">
                      <div>
                        <span class="user-name text-primary">
                          <UserCard v-bind="comment.fcuVo" hideAvatar></UserCard>
                        </span>
                        <span class="text-grey">{{ comment.fcd | formatDate }}</span>
                        <div v-if="!comment.editContent&&(comment.isDeletable == 1 || comment.isEditable == 1)" class="comment-btn">
                          <Button v-if="comment.isEditable == 1" size="small" @click="editStepComment(comment)">{{ $t('page.add') }}</Button>
                          <Button v-if="comment.isDeletable == 1" size="small" @click="delStepComment(comment, cd)">{{ $t('page.delete') }}</Button>
                        </div>
                      </div>
                      <div v-show="!comment.editContent" class="comment-content">
                        <div v-html="comment.content"></div>
                        <div v-if="comment.fileList && comment.fileList.length">
                          <div v-for="cFile in comment.fileList" :key="cFile.id">
                            <span v-download="downurl('/api/binary/file/download', cFile.id)" class="tsfont-attachment text-action">
                              {{ cFile.name }}
                              <i class="tsfont-download"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div v-if="comment.editContent" class="comment-content">
                        <div class="order-list">
                          <TsCkeditor
                            :ref="`comment${comment.id}`"
                            :value="comment.content"
                            width="100%"
                            :showIconToggle="true"
                          ></TsCkeditor>
                        </div>
                        <TsUpLoad
                          ref="uploadFile"
                          styleType="button"
                          :defaultList="comment.fileList"
                          className="smallUpload"
                          dataType="change"
                          :multiple="uploadMultiple"
                          @getFileList="res => handleSuccess(res, comment)"
                          @remove="res => handleSuccess(res, comment)"
                        ></TsUpLoad>
                        <div class="comment-btn">
                          <Button size="small" @click="completeComment(comment, cd)">{{ $t('page.complete') }}</Button>
                          <Button size="small" @click="cancelComment(comment)">{{ $t('page.cancel') }}</Button>
                        </div>
                      </div>
                      <div class="comment-border dividing-color"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="!getActionValue(cd.actionList) && cd.commentList.length == 0" class="text-grey">{{ $t('page.notarget',{target:$t('page.reply')}) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="stepDialog">
      <stepdialog
        :is="stepdialogType"
        :isShow="stepDialog"
        :config="stepConfig"
        :defaultProcessTaskStepId="processTaskStepId"
        @close="closeDialog"
        @save="saveStepObj"
      ></stepdialog>
    </div>
  </div>
</template>
<script>
import UserSelect from '@/resources/components/UserSelect/UserSelect';
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
import TsUpLoad from '@/resources/components/UpLoad/UpLoad.vue';
import download from '@/resources/directives/download.js';
import EditStepDialog from './stepdialog/edit-step.vue';
import stepdialog from './stepdialog';
import scrollHidden from '@/resources/directives/scroll-hidden.js';
export default {
  name: 'ChangeDetail',
  components: {
    ...stepdialog,
    UserSelect,
    TsCkeditor,
    TsUpLoad,
    EditStepDialog,
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    TsAvatar: () => import('@/resources/components/TsAvatar/TsAvatar')
  },
  directives: { download, scrollHidden },
  props: {
    handlerStepInfo: Object,
    changeStepList: {
      type: Array,
      default: () => []
    },
    isEditStepworker: {
      type: Boolean,
      default: false
    },
    defaultProcessTaskStepId: {
      //工单步骤id
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      stepdialogType: 'EditStep',
      processTaskId: null,
      processTaskStepId: null,
      title: this.$t('term.process.changestep'),
      stepDialog: false,
      dialogStepTitle: this.$t('dialog.title.addtarget', {target: this.$t('term.process.step')}),
      ChangeStepConfig: {}, //添加步骤数据
      selectId: null,
      worker: '', //批量处理人
      allWorkerVo: null, //批量编辑处理人
      groupList: ['user', 'team'],
      visible: false,
      validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.dealwithuser')}) }],
      newChangeStepList: [],
      stepConfig: null, //步骤信息
      character: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'],
      statusList: [],
      changeTitle: [
        //工单处理标题
        {
          title: this.$t('page.description'),
          isCount: false
        },
        {
          title: this.$t('page.reply'),
          isCount: true
        }
      ],
      cur: 0,
      uploadMultiple: true
      //   editchangestep: null, //编辑
      //   startchangestep: null, //开始
      //   completechangestep: null, //完成
      //   abortchangestep: null, //取消
      //   editcommentchangestep: null//回复
      // }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.processTaskId = this.$route.query.processTaskId;
    this.processTaskStepId = this.defaultProcessTaskStepId;
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      if (this.handlerStepInfo) {
        this.statusList = this.handlerStepInfo.changeStatusVoList || []; //转态颜色由后台返回
      }
    },
    toTask() {
      //刷新
      this.$router.push({
        path: '/task-detail',
        query: {
          processTaskId: this.processTaskId,
          processTaskStepId: this.processTaskStepId,
          type: Date.now()
        }
      });
    },
    saveStepObj(obj) {
      if (obj) {
        let select = this.newChangeStepList.find(c => c.uuid === obj.uuid);
        if (select) {
          let newList = this.newChangeStepList.map(d => {
            return d.uuid === obj.uuid ? obj : d;
          });
          this.newChangeStepList = newList;
          let data = {
            processTaskStepId: this.processTaskStepId,
            changeStepId: select.id,
            planStartDate: select.planStartDate,
            startTimeWindow: select.startTimeWindow,
            endTimeWindow: select.endTimeWindow,
            worker: select.worker
          };
          this.$api.process.processtask.updateChangeStep(data).then(res => {
            if (res.Status == 'OK') {
              this.getChangeStart(obj.id);
              this.$Message.success(this.$t('message.executesuccess'));
              this.$emit('updateStepActive');
            }
          });
        }
      }
    },
    editUser() {
      this.worker = null;
      if (this.visible) {
        this.visible = false;
      } else {
        this.visible = true;
      }
    },
    cancelAllUser() {
      this.visible = false;
      this.worker = null;
    },
    getUserText(val, item) {
      if (item) {
        this.allWorkerVo = item;
        this.$set(this.allWorkerVo, 'name', item.text);
        this.$set(this.allWorkerVo, 'initType', item.value.split('#')[0]);
        this.$set(this.allWorkerVo, 'uuid', item.value.split('#')[1]);
      }
    },
    changeAllUser() {
      if (this.$refs.worker.valid()) {
        this.newChangeStepList.forEach(i => {
          i.worker = this.worker;
          this.$set(i, 'workerVo', this.allWorkerVo);
        });
        this.visible = false;
        let data = {
          processTaskStepId: this.processTaskStepId,
          changeId: this.handlerStepInfo.id,
          worker: this.worker
        };
        this.$api.process.processtask.changeStepWorker(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.$emit('updateStepActive');
          }
        });
      }
    },
    saveChangeStepData() {
      //保存步骤数据
      let data = {
        changeStepList: this.newChangeStepList
      };
      return data;
    },
    closeDialog(needRefresh) {
      this.stepConfig = null;
      this.stepDialog = needRefresh;
    },
    lookContent(obj) {
      let _this = this;
      _this.$set(obj, 'cur', 0);
      if (obj.isShow) {
        _this.$set(obj, 'isShow', false);
      } else {
        _this.$set(obj, 'isShow', true);
      }
    },
    stepFunction(methods, obj) {
      this[methods](obj);
    },
    // addStep() {
    //   this.stepdialogType = 'AddStep';
    //   this.stepDialog = true;
    // },
    editchangestep(obj) {
      //编辑
      this.stepdialogType = 'EditStep';
      this.stepConfig = obj || null;
      this.stepDialog = true;
    },
    getChangeStart(id) {
      let data = {
        changeStepId: id
      };
      this.$api.process.processtask.getChangeStep(data).then(res => {
        if (res.Status == 'OK') {
          let config = res.Return;
          if (config) {
            let newList = this.newChangeStepList.map(d => {
              return d.uuid === config.uuid ? config : d;
            });
            this.newChangeStepList = newList;
          }
        }
      });
    },
    startchangestep(obj) {
      //开始
      let data = {
        changeStepId: obj.id
      };
      this.$api.process.processtask.changeStepStart(data).then(res => {
        if (res.Status == 'OK') {
          this.getChangeStart(obj.id);
          this.$emit('updateStepActive'); //只更新活动和步骤
          // this.toTask(); //刷新页面
        }
      });
    },
    completechangestep(obj) {
      //完成
      let data = {
        changeStepId: obj.id
      };
      this.$api.process.processtask.changeStepComplete(data).then(res => {
        if (res.Status == 'OK') {
          this.toTask();
        }
      });
    },
    abortchangestep(obj) {
      //取消
      this.stepdialogType = 'AbortStep';
      this.stepConfig = obj || null;
      this.stepDialog = true;
    },
    commentchangestep(obj) {
      //编辑回复
      this.$set(obj, 'cur', 1);
      this.$set(obj, 'isShow', true);
    },
    commentOk(cd, index) {
      //回复
      let obj = cd;
      let _this = this;
      if (this.$refs[`commentChangeStep${index}`][0].currentValue || this.$refs[`uploadFile${index}`][0].uploadList.length > 0) {
        let content = this.$refs[`commentChangeStep${index}`][0].currentValue;
        let fileList = this.$refs[`uploadFile${index}`][0].uploadList;
        let data = {
          changeStepId: obj.id,
          content: content,
          fileIdList: []
        };
        if (fileList.length > 0) {
          let fileIdList = [];
          fileList.forEach(item => {
            fileIdList.push(item.id);
          });
          this.$set(data, 'fileIdList', fileIdList);
        }
        this.$api.process.processtask.commentChangeStep(data).then(res => {
          if (res.Status == 'OK') {
            _this.getCommentList(obj);
            _this.$refs[`commentChangeStep${index}`][0].currentValue = '';
            _this.$refs[`uploadFile${index}`][0].handleClearFiles();
            this.$emit('updateStepActive');
          }
        });
      }
    },
    getCommentList(cd) {
      let data = {
        changeStepId: cd.id
      };
      this.$api.process.processtask.changeStepCommentList(data).then(res => {
        if (res.Status == 'OK') {
          let commentList = res.Return;
          this.$set(cd, 'commentList', commentList);
        }
      });
    },
    handleSuccess(res, obj) {
      this.$set(obj, 'draftFileList', res);
    },
    getActionValue(actionlist) {
      let commentchangestep = actionlist.find(f => f.value === 'commentchangestep');
      return commentchangestep;
    },
    editStepComment(obj) {
      this.$set(obj, 'editContent', true);
    },
    completeComment(obj, cd) {
      let _this = this;
      if (this.$refs[`comment${obj.id}`][0].currentValue) {
        let content = this.$refs[`comment${obj.id}`][0].currentValue;
        let data = {
          id: obj.id,
          content: content,
          fileIdList: []
        };
        if (obj.draftFileList) {
          let fileIdList = obj.draftFileList.map(item => {
            return item.id;
          });
          this.$set(data, 'fileIdList', fileIdList);
        } else if (obj.fileIdList && obj.fileIdList.length > 0) {
          this.$set(data, 'fileIdList', obj.fileIdList);
        }
        this.$set(obj, 'editContent', false);
        this.$api.process.processtask.editchangeStepComment(data).then(res => {
          if (res.Status == 'OK') {
            _this.getCommentList(cd);
          }
        });
      }
    },
    cancelComment(obj) {
      this.$set(obj, 'editContent', false);
      this.$set(obj, 'content', obj.content);
      this.$refs[`comment${obj.id}`][0].currentValue = obj.content;
    },
    delStepComment(obj, cd) {
      let _this = this;
      let data = {
        id: obj.id
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.replycontent')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.process.processtask
            .delchangeStepComment(data)
            .then(res => {
              if (res.Status == 'OK') {
                _this.getCommentList(cd);
              }
            })
            .catch(error => {});
          vnode.isShow = false;
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    }
  },
  filter: {},
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    }
  },
  watch: {
    changeStepList: {
      handler(val) {
        if (val) {
          this.newChangeStepList = JSON.parse(JSON.stringify(val));
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.change-detail {
  position: relative;
  .edit-userAll{
    position: relative;
  }
  .change-top {
    position: relative;
    .top-right {
      position: absolute;
      right: 0;
      top: 0;
      .color-tip {
        width: 12px;
        height: 12px;
        display: inline-block;
        margin-right: 4px;
      }
      .action-group .action-item {
        padding: 0 8px;
      }
    }
    .top-title {
      padding-bottom: 10px;
    }
  }
  .change-main {
    margin-top: 8px;
  }
  .card-wrapper {
    position: relative;
  }
  .pop-box {
    position: absolute;
    left: 0;
    top: 14px;
    z-index: 10;
    .tooltip-box {
      position: absolute;
      top: 0;
      left: 0;

      .tooltip {
        position: absolute;
        top: 100%;
        left: 20px;
        display: block;
        opacity: 1;
        width: 100%;
        transform: translateY(10px);
        transition: all 0.25s ease-out;
        width: 250px;
        max-height: 200px;
        border-radius: 2px;
        padding: 0 16px;

        /**下边**/
        &.tipbottom {
          &:before {
            position: absolute;
            display: inline-block;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            left: 10px;
            top: -7px;
            content: '';
          }

          &:after {
            position: absolute;
            display: inline-block;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            left: 11px;
            top: -6px;
            content: '';
          }
        }

        .tooltip-title {
          line-height: 40px;
          border-bottom: 1px solid;
        }

        .tooltip-content {
          line-height: 40px;
          width: 100%;
          overflow: auto;
          max-height: 160px;

          .tooltip-list {
            position: relative;
            padding-left: 80px;

            .label {
              width: 80px;
              position: absolute;
              left: 0;
            }
          }
        }
      }
    }
    .tooltip-content {
      padding: 8px 0;
    }
    .user-select {
      text-align: left;
    }
    .btn-user {
      text-align: right;
    }
  }

  //树的样式
  .card-list {
    position: relative;
    &:hover{
       .btn-list {
         display: block;
       }
    }
    .card-top {
      position: relative;
      padding: 0 8px 0;
      .action {
        text-align: center;
      }
    }
    .card-item {
      margin-bottom: 8px;
      border-left: 3px solid;
      padding: 8px;
      &:hover {
        .action {
          display: block;
        }
      }
      .action {
        display: none;
        cursor: pointer;
      }
      .cuont {
        > span {
          margin-left: 5px;
        }
      }
    }
    .move-icon {
      padding-top: 18px;
      display: inline-block;
      .move {
        cursor: move;
      }
    }
  }
  .content-block {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    > div {
      flex-grow: 1;
    }
  }
  .btn-list {
    // width: 110px;
    position: absolute;
    right: 10px;
    height: 52px;
    padding-top: 16px;
    display: none;
    .action-group > .action-item {
      padding: 0 16px;
      &:after {
        top: 0;
        bottom: 0;
      }
    }
  }
  .work-block {
    width: 60px;
    margin-right: 8px;
    .user-image {
      width: 24px;
      height: 24px;
      line-height: 24px;
      display: inline-block;
      border-radius: 50%;
      margin-right: 4px;
      margin-left: 4px;
    }
  }
  .title-block {
    width: 110px;
  }
  .data-block {
   width: 80px;
  }
  .time-block {
    width: 80px;
  }
  .timewindow-block {
    .timewindow-tip {
      padding-right: 8px;
    }
    .window-time-text {
      font-size: 20px;
    }
  }
  .files-block {
  }
  .content-box {
    width: 100%;
    min-height: 100px;
    border: 1px solid;
    margin-bottom: 10px;
    .content-top {
      line-height: 40px;
      font-size: 14px;
      padding: 0 16px;
      .title-box {
        display: inline-block;
        margin: 0;
        margin-right: 16px;
        border-bottom: 2px solid transparent;
      }
      .active {
        .title-box {
          border-bottom: 2px solid;
          cursor: pointer;
        }
      }
    }
    .content-text {
      padding: 16px;
      max-height: 300px;
      overflow: auto;
      line-height: 24px;
    }
  }
  .comment-btn {
    margin-bottom: 16px;
  }
  .comment-click{
    margin: 16px 0;
  }
}
</style>
