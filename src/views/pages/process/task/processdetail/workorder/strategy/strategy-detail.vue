
<template>
  <div class="subtask-detail padding">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <Button
      v-if="!readonly && isCreatetask"
      type="primary"
      icon="tsfont-plus"
      ghost
      @click="add"
    >{{ $t('page.add') }}</Button>
    <div v-if="processTaskStepTaskList && processTaskStepTaskList.length" class="item-main">
      <div v-for="(item, index) in processTaskStepTaskList" :key="item.id" class="item-list border-color padding">
        <TsRow class="mb-xs">
          <Col span="8"><span class="text-title">{{ $t('term.process.policy') }}</span><span class="text-default">{{ item.taskConfigPolicyName }}</span></Col>
          <Col span="12" class="time">
            <span class="text-title">{{ $t('page.starttime') }}</span>
            <span class="text-default">{{ item.createTime | formatDate }}</span>
          </Col>
          <Col v-if="isCreatetask" span="4" class="operations action-group">
            <span class="action-item tsfont-edit" @click="edit(item)"></span>
            <span class="action-item tsfont-trash-o del" @click="del(item, index)"></span>
          </Col>
        </TsRow>
        <TsRow>
          <Col span="24">
            <div class="content-main">
              <span class="text-title">{{ $t('page.description') }}</span>
              <span class="text-default" v-html="item.content"></span>
            </div>

          </Col>
        </TsRow>
        <div class="mt-md">
          <TsTable
            :tbodyList="item.tbodyList"
            :theadList="theadList"
            :height="'280'"
            keyName="id"
          >
            <template slot="userUuid" slot-scope="{ row }">
              <div class="task-user" :class="{'text-disabled':row.isDelete == 1}">
                <UserCard
                  :uuid="row.userUuid"
                  :initType="row.userVo.initType"
                ></UserCard>
                <template v-if="row.originalUserUuid">
                  （{{ $t('term.process.act') }}<UserCard :uuid="row.originalUserUuid" hideAvatar></UserCard>）
                </template>
              </div>
            </template>
            <template slot="endTime" slot-scope="{ row }">
              <span :class="{'text-disabled':row.isDelete == 1}">{{ row.endTime | formatDate }}</span>
            </template>
            <template slot="content" slot-scope="{ row }">
              <div v-if="row.content" :class="{'text-disabled':row.isDelete == 1}">
                <Tooltip max-width="500" transfer>
                  <span v-if="$utils.removeHTMLTag(row.content) && $utils.removeHTMLTag(row.content).length >30">
                    {{ $utils.removeHTMLTag(row.content).substr(0, Number(30)) }}...
                  </span>
                  <span v-else>{{ $utils.removeHTMLTag(row.content) }}</span>

                  <div slot="content">
                    <div v-html="row.content"></div>
                  </div>
                </Tooltip>
              </div>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul v-if="!readonly && row.isReplyable && item.readonlyContent" class="tstable-action-ul" @click.stop>
                  <li class="tsfont-edit" @click="editCkeditor(item)">{{ $t('page.edit') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
        <div v-if="!readonly && item.isReplyable && !item.readonlyContent">
          <div class="inline-block mt-md">
            <TsUpLoad
              ref="fileList"
              className="smallUpload"
              styleType="text"
              dataType="itsm"
              rowSpan="24"
              :multiple="true"
              :defaultList="item.fileList && item.fileList.length > 0 ? item.fileList : []"
              @getFileList="(list, id) => { getFileList(id, item) }"
              @remove="(list, id) => { removeCommentFile(id, item) }"
            ></TsUpLoad>
          </div>
          <div class="mt-md">
            <TsCkeditor
              ref="taskStepContent"
              v-model="item.CkeditorContent"
              :showIconToggle="true"
              width="100%"
              @change="commentContent(item, item.CkeditorContent)"
            ></TsCkeditor>
          </div>
          <div class="mt-md">
            <template v-if="customButtonList.length > 0">
              <Button
                v-for="btn in customButtonList"
                :key="btn.name"
                class="mr-xs"
                type="primary"
                ghost
                @click="comment(item, btn)"
              >{{ btn.name }}</Button>
            </template>
            <Button
              v-else
              type="primary"
              :disabled="isDisableCommet"
              :title="isDisableCommet ? $t('term.process.replycanclicktip') : null"
              @click="comment(item)"
            >{{ $t('page.reply') }}</Button>
          </div>
        </div>
      </div>
    </div>
    <TsDialog
      type="modal"
      :isShow.sync="isShow"
      class="vertical-center-modal"
      :title="subTaskContentTitle"
      @on-close="closeDialog"
      @on-ok="saveStrategy"
    >
      <template>
        <div style="overflow:hidden">
          <TsForm ref="subTaskContent" v-model="subTaskContent" :itemList="subTaskForm"></TsForm>
        </div>
      </template>
    </TsDialog>
    <ReplyDialog
      v-if="isShowReplyDialog"
      :config="replyConfig"
      :customButtonList="customButtonList"
      @getListTask="getListTask()"
      @close="closeReply"
    ></ReplyDialog>
  </div>
</template>
<script>
export default {
  name: 'StrategyDetail',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    UserCard: () => import('@/resources/components/UserCard/UserCard'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsCkeditor: () => import('@/resources/plugins/TsCkeditor/TsCkeditor'),
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue'),
    ReplyDialog: () => import('./reply-dialog.vue')
  },
  filters: {
  },
  props: {
    processTaskId: [String, Number], //工单id
    processTaskStepId: [String, Number], //工单步骤id
    actionConfig: Object, //权限数据
    config: Object, //策略数据
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loadingShow: true,
      stepConfig: null,
      taskConfigId: null, //任务策略id
      processTaskStepTaskList: [],
      num: -1, //处理人数，默认-1（不限）
      isCreatetask: false, //新增，修改，删除权限
      theadList: [
        {
          title: this.$t('term.process.dealwithuser'),
          key: 'userUuid',
          type: 'user',
          uuid: 'userUuid'
        },
        {
          title: this.$t('page.replytime'),
          key: 'endTime',
          type: 'time'
        }, {
          title: this.$t('page.reply'),
          key: 'content',
          type: 'html'
        }, {
          title: this.$t('page.accessory'),
          key: 'fileList',
          type: 'file'
        }, {
          key: 'action'
        }
      ],
      isShow: false,
      subTaskContentTitle: '',
      processTaskStepTaskId: null,
      subTaskForm: {
        userList: {
          type: 'userselect',
          name: 'userList',
          label: this.$t('term.process.dealwithuser'),
          groupList: ['user'],
          rangeList: [],
          validateList: [{name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: ''})}],
          transfer: true
        },
        content: {
          type: 'ckeditor',
          name: 'content',
          label: this.$t('page.description'),
          validateList: ['required']
        }
      },
      subTaskContent: {
        userList: null,
        content: null
      },
      isDisableCommet: false,
      editType: 'add',
      customButtonList: [], //策略：自定义按钮列表
      isShowReplyDialog: false,
      replyConfig: {}
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
    initData(val) {
      this.stepConfig = this.$utils.deepClone(val);
      this.taskConfigId = this.stepConfig.id;
      this.processTaskStepTaskList = this.stepConfig.processTaskStepTaskList || [];
      this.subTaskForm.userList.rangeList = this.stepConfig.rangeList;
      this.num = this.stepConfig.num;
      if (this.num == -1) {
        this.subTaskForm.userList.placeholder = this.$t('form.placeholder.pleaseselect', {target: this.$t('page.user')});
      } else {
        this.subTaskForm.userList.placeholder = this.$t('term.process.pleusernum', {target: this.num});
      }
      this.processTaskStepTaskList.forEach(item => {
        let contentobj = {};
        item.CkeditorContent = '';
        item.fileList = [];
        if (item.stepTaskUserVoList && item.stepTaskUserVoList.length) {
          for (let i = 0; i < item.stepTaskUserVoList.length; i++) {
            let s = item.stepTaskUserVoList[i];
            if (s.isReplyable && !s.isDelete) {
              Object.assign(contentobj, s);
              this.$set(item, 'isReplyable', true);
              if (s.content) {
                this.$set(item, 'CkeditorContent', s.content);
                this.$set(item, 'readonlyContent', true);
              } else {
                this.$set(item, 'readonlyContent', false);
              }
              if (s.fileList) {
                this.$set(item, 'fileList', s.fileList);
              }
              this.$set(item.stepTaskUserVoList[i], 'isDisabled', true);
              break;
            }
          }
        }
        this.$set(item, 'tbodyList', this.getTbodyList(item));
      });
      if (this.stepConfig.config && this.stepConfig.config.customButtonList && this.stepConfig.config.customButtonList.length > 0) {
        this.customButtonList = this.stepConfig.config.customButtonList;
      }

      this.loadingShow = false;
    },
    async getListTask() {
      let data = {processTaskStepId: this.processTaskStepId};
      this.loadingShow = true;
      this.$api.process.process.getProcesstask(data).then(res => {
        this.$emit('getStepList', res.Return);
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    add() {
      this.editType = 'add';
      this.subTaskContentTitle = this.$t('dialog.title.addtarget', {target: this.stepConfig.name});
      this.processTaskStepTaskId = null;
      this.subTaskContent.userList = null;
      this.subTaskContent.content = null;
      this.isShow = true;
    },
    edit(item) {
      this.editType = 'edit';
      this.subTaskContentTitle = this.$t('dialog.title.edittarget', {target: this.stepConfig.name});
      let userList = [];
      this.subTaskContent.content = item.content || null;
      this.processTaskStepTaskId = item.id;
      let userVolist = item.stepTaskUserVoList;
      if (userVolist && userVolist.length > 0) {
        userVolist.forEach(v => {
          if (v.isDelete == 0) {
            userList.push('user#' + v.userVo.uuid);
          }
        });
      }
      userList = this.$utils.uniqueArr(userList);
      this.subTaskContent.userList = userList;
      this.isShow = true;
    },
    del(item, index) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.task')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.process.process
            .deleteTask({processTaskStepTaskId: item.id})
            .then(res => {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.processTaskStepTaskList.splice(index, 1);
              this.getListTask();
            });
        }
      });
    },
    getTbodyList(item) {
      if (item.stepTaskUserVoList) {
        let newArr = [];
        item.stepTaskUserVoList.forEach((r, i) => {
          if (!r.isReplyable || r.isDelete) { //不能回复或者已删除的行不能选中
            this.$set(r, 'isDisabled', true);
          }
          newArr.push(
            {id: r.id, userUuid: r.userUuid, userVo: r.userVo, originalUserUuid: r.originalUserUuid || null, endTime: r.endTime, content: r.content, isDelete: r.isDelete, isReplyable: !!r.isReplyable, isDisabled: !!r.isDisabled || false, fileList: r.fileList }
          );
        });
        return newArr;
      } else {
        return [];
      }
    },
    closeDialog() {
      this.isShow = false;
    },
    saveStrategy() {
      if (this.$refs.subTaskContent.valid()) {
        let data = {
          id: this.processTaskStepTaskId,
          processTaskStepId: this.processTaskStepId,
          taskConfigId: this.taskConfigId,
          content: this.subTaskContent.content,
          stepTaskUserVoList: []
        };
        let stepTaskUserVoList = [];
        let userList = this.subTaskContent.userList || [];
        userList = this.$utils.uniqueArr(userList); //去重（可能出现相同处理人）
        userList.forEach(u => {
          let uuid = u.split('#')[1];
          let subStep = this.processTaskStepTaskList.find(p => p.id == data.id);
          let tbodyList = [];
          subStep && (tbodyList = subStep.tbodyList);
          let userVo = {};
          let userArr = [];
          let findUserList = tbodyList.filter(t => {
            if (!t.isDelete && (t.userUuid == uuid)) {
              return t;
            }
          });
          if (findUserList && findUserList.length > 0) {
            findUserList.forEach(f => { //相同处理人，回复id不同
              let user = {};
              this.$set(user, 'id', f.id);
              this.$set(user, 'userUuid', uuid);
              userArr.push(user);
            });
            stepTaskUserVoList.push(...userArr);
          } else {
            this.$set(userVo, 'userUuid', uuid);
            stepTaskUserVoList.push(userVo);
          }
        });
        this.$set(data, 'stepTaskUserVoList', stepTaskUserVoList);
        this.$api.process.process.saveTask(data).then(res => {
          this.isShow = false;
          this.$Message.success(this.$t('message.executesuccess'));
          this.getListTask();
        });
      }
    },
    commentContent(item, val) {
      if (val && val.trim()) {
        this.$set(item, 'CkeditorContent', val);
        this.isDisableCommet = false;
      }
    },
    editCkeditor(item) {
      this.replyConfig = this.$utils.deepClone(item);
      this.isShowReplyDialog = true;
    },
    comment(item, btn) {
      let data = {
        id: item.id,
        content: item.CkeditorContent
      };
      let isValid = true;
      if (btn) {
        this.$set(data, 'button', btn.name);
        !data.content && this.$set(data, 'content', btn.defaultContent);
        //检验：判断回复意见是否必填
        if (btn.isRequired && !data.content) {
          isValid = false;
        }
      } else if (!data.content) {
        isValid = false;
      }
      if (!isValid) {
        this.$Notice.warning({
          title: this.$t('form.validate.required', {target: this.$t('page.reply')})
        });
        return;
      }
      this.$api.process.process.completeTask(data).then(res => {
        this.isShow = false;
        this.$Message.success(this.$t('message.executesuccess'));
        this.getListTask();
      });
    },
    getFileList(fileId, item) {
      this.loadingShow = true;
      let data = {
        id: item.id,
        fileId: fileId
      };
      this.$api.process.process.saveTaskFile(data).then((res) => {
        if (res.Status == 'OK') {
          this.getListTask();
        }
      });
    },
    removeCommentFile(fileId, item) {
      this.loadingShow = true;
      let data = {
        id: item.id,
        fileId: fileId
      };
      this.$api.process.process.deleteTaskFile(data).then((res) => {
        if (res.Status == 'OK') {
          this.getListTask();
        }
      });
    },
    closeReply(isUpdate) {
      if (isUpdate) {
        this.getListTask();
      }
      this.isShowReplyDialog = false;
    }
  },
  computed: {},
  watch: {
    config: {
      handler(val) {
        val && this.initData(val);
      },
      immediate: true,
      deep: true
    },
    actionConfig: {
      handler(val) {
        if (val) {
          val.createtask && (this.isCreatetask = true);
        } else {
          this.isCreatetask = false;
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.subtask-detail {
  .item-main {
    margin-top: 8px;
    .item-list{
      border: 1px solid;
      border-radius: 10px;
      margin-bottom: 12px;
      .text-title {
        margin-right: 10px;
      }
      .operations{
        position: relative;
        text-align: right;
      }
      .content-main {
        display: flex;
      }
    }
  }
  .task-user{
    display: flex;
    align-items: center;
  }
  .inline-block{
    display: inline-block;
  }
}
</style>
