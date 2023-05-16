<template>
  <div ref="changeBox" class="change-detail" @click.stop>
    <div class="change-top">
      <div v-if="newChangeStepList && newChangeStepList.length > 0">
        <span class="text-grey top-title">{{ title }}</span>
        <span class="tsfont-edit text-action" style="position: relative">
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
                    <Button type="text" size="small" @click="cancelAllUser">{{ $t('page.cancel') }}</Button>
                    <Button
                      type="primary"
                      size="small"
                      style="margin: 0"
                      @click="changeAllUser"
                    >{{ $t('page.confirm') }}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </span>
        <div class="top-right">
          <span class="tsfont-trash-o text-action" @click="clearSetting">{{ $t('page.clear') }}</span>
        </div>
      </div>
      <div v-else>
        <span class="tsfont-plus text-href" @click="addStep">{{ $t('term.process.step') }}</span>
      </div>
    </div>
    <div v-if="newChangeStepList && newChangeStepList.length > 0" class="change-main card-wrapper">
      <!-- <changeTreeview :children="newChangeStepList" :isSelectId="selectId" :width="changeWidth" @uptata="saveList"></changeTreeview> -->
      <div
        v-for="(cd, index) in newChangeStepList"
        :key="cd.uuid"
        :uuid="cd.uuid"
        :parentUuid="cd.parentUuid"
        :index="index"
        class="card-list"
      >
        <span class="sub-line"></span>
        <div class="card-item block-container" :class="isSelectId && isSelectId == cd.uuid ? 'bg-primary' : 'bg-block'" :style="{ 'margin-bottom': cd.isShow ? '0px' : '8px' }">
          <!-- <div class="move-icon">
            <i class="ts-bars move" draggable="true" @dragstart="onDragstartTable($event, cd)"></i>
          </div> -->
          <div class="content-block" @click="lookContent(cd)">
            <div class="title-block overflow">
              <div class="text-grey overflow" :title="cd.code">{{ cd.code }}</div>
              <span class="overflow" :title="cd.name">{{ cd.name }}</span>
            </div>
            <div v-if="cd.workerVo" class="work-block">
              <UserCard :uuid="cd.workerVo.uuid" :initType="cd.workerVo.initType"></UserCard>
            </div>
            <div class="data-block">
              <div class="text-grey">{{ $t('term.process.planstartdate') }}{{ cd.parentUuid }}</div>
              <div>
                {{ cd.planStartDate || '-' }}
              </div>
            </div>
            <div class="time-block">
              <div>
                <div class="text-grey">{{ $t('term.process.startTimeWindow') }}</div>
                <div v-if="cd.startTimeWindow || cd.endTimeWindow">
                  <span>{{ cd.startTimeWindow }}</span>
                  <span>-</span>
                  <span>{{ cd.endTimeWindow }}</span>
                </div>
                <div v-else>-</div>
              </div>
            </div>
            <div class="files-block" style="position: relative">
              <div class="text-grey">{{ $t('page.accessory') }}</div>
              <div v-if="cd.fileIdList && cd.fileIdList.length" class="text-action" @click.stop>
                <Dropdown trigger="click">
                  <span>{{ cd.fileIdList.length }}</span>
                  <DropdownMenu slot="list" class="dropdown">
                    <DropdownItem v-for="f in cd.fileList" :key="f.id">
                      <span v-download="downurl('/api/binary/file/download', f.id)" class="tsfont-attachment text-action">{{ f.name }}</span>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <span v-else>-</span>
            </div>
            <div class="btn-list">
              <ul class="action-group no-line">
                <li class="action-item tsfont-edit" @click.stop="editsStep('edit', cd)"></li>
                <li class="action-item tsfont-plus" @click.stop="editsStep('add', cd, index)"></li>
                <li class="action-item tsfont-trash-o" @click.stop="delStep(cd.uuid, cd.name, cd)"></li>
              </ul>
            </div>
          </div>
        </div>
        <div v-if="cd.isShow" class="content-box dividing-color radius-sm">
          <div class="text-grey content-top">
            <ul class="order-tabs-title">
              <li class="active">
                <div class="title-box">
                  {{ $t('page.description') }}
                </div>
              </li>
            </ul>
          </div>
          <div v-if="(cd.fileList && cd.fileList.length) || cd.content" class="content-text">
            <div>
              {{ cd.content }}
            </div>
            <div v-if="cd.fileList && cd.fileList.length">
              <div v-for="f in cd.fileList" :key="f.id">
                <span v-download="downurl('/api/binary/file/download', f.id)" class="tsfont-attachment text-action">{{ f.name }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-grey content-text">{{ $t('page.notarget', { target: $t('page.description') }) }}</div>
        </div>
      </div>
    </div>
    <StepDialog
      v-if="stepDialog"
      :isShow="stepDialog"
      :dialogTitle="dialogStepTitle"
      :config="stepConfig"
      @close="closeDialog"
      @save="saveStepObj"
    ></StepDialog>
  </div>
</template>
<script>
import StepDialog from './step-dialog.vue';
import UserSelect from '@/resources/components/UserSelect/UserSelect';
import download from '@/resources/directives/download.js';
import UserCard from 'components/UserCard/UserCard';

export default {
  name: 'ChangeStepEdit',
  components: {
    StepDialog,
    UserSelect,
    UserCard
  },
  directives: { download },
  props: {
    changeStepList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isSelectId: null,
      title: this.$t('term.process.stepinfor'),
      addType: 'step',
      stepDialog: false,
      dialogStepTitle: this.$t('dialog.title.addtarget', { target: this.$t('term.process.step') }),
      ChangeStepConfig: {}, //添加步骤数据
      selectId: null,
      // changeWidth: 700,
      worker: '', //批量处理人
      allWorkerVo: null,
      groupList: ['user', 'team'],
      visible: false,
      validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', { target: this.$t('term.process.dealwithuser') }) }],
      newChangeStepList: [],
      stepConfig: null, //步骤信息
      character: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z']
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.$route.query.uuid) {
      // 从变量引用列表跳转过来
      let uuid = this.$route.query.uuid;
      this.$nextTick(() => {
        this.stepConfig = this.changeStepList.find(e => e.uuid === uuid);
        if (this.stepConfig) {
          this.stepDialog = true;
        }
      });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addStep() {
      //添加步骤
      this.stepDialog = true;
    },
    clearSetting() {
      //删除条件节点规则
      this.$createDialog({
        title: this.$t('dialog.title.clearconfirm'),
        content: this.$t('dialog.content.clearconfirm', { target: this.$t('term.process.noderules') }),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          this.newChangeStepList.splice(0);
          // this.$Notice.success({
          //   title: '清除成功',
          //   duration: 1.5
          // });
        }
      });
    },
    cancleForm() {
      this.stepDialogForm.forEach(e => {
        e.value = '';
      });
      this.draftFile.splice(0);
      this.fileUuidList.splice(0);
    },
    saveStepObj(obj) {
      if (obj) {
        let select = this.newChangeStepList.find(c => c.uuid === obj.uuid);
        if (select) {
          let newList = this.newChangeStepList.map(d => {
            return d.uuid === obj.uuid ? obj : d;
          });
          this.newChangeStepList = newList;
        } else {
          this.newChangeStepList.splice(this.stepIndex, 0, obj);
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
      }
    },
    saveData() {
      //保存步骤数据
      return this.newChangeStepList;
    },
    delStep(id, name, cd) {
      //删除步骤
      let _this = this;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: name }),
        btnType: 'error',
        'on-ok': vnode => {
          let index = this.newChangeStepList.map(item => item.uuid).indexOf(id);
          this.newChangeStepList.splice(index, 1);
          vnode.isShow = false;
        }
      });
    },
    editsStep(type, obj, index) {
      this.dialogParentUuid = null;
      if (type == 'edit') {
        this.dialogStepTitle = this.$t('dialog.title.edittarget', { target: this.$t('term.process.step') });
        this.stepConfig = obj || null;
      } else {
        this.dialogStepTitle = this.$t('dialog.title.addtarget', { target: this.$t('term.process.step') });
        this.dialogParentUuid = obj.parentUuid;
        this.stepIndex = index - 0 + 1;
      }
      this.stepDialog = true;
    },
    closeDialog(needRefresh) {
      this.stepConfig = null;
      this.stepDialog = needRefresh;
    },
    lookContent(obj) {
      if (obj.isShow) {
        this.$set(obj, 'isShow', false);
      } else {
        this.$set(obj, 'isShow', true);
      }
    },
    onDragstartTable(event, item) {
      // debugger;
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
          this.newChangeStepList = val;
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
  .change-top {
    position: relative;
    height: 22px;
    line-height: 22px;
    .top-right {
      position: absolute;
      right: 0;
      top: 0;
    }
    .top-title {
      padding-right: 8px;
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
    .card-top {
      position: relative;
      padding: 0 8px 0;
      .action {
        text-align: center;
      }
    }
    .card-item {
      height: 56px;
      // line-height: 56px;
      padding: 0 18px;
      margin-bottom: 8px;
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
    .content-block {
      position: relative;
      // top: 0;
      // right: 0;
      width: 100%;
      height: 56px;
      // min-width: 700px;
    }
    .btn-list {
      min-width: 130px;
      padding-top: 18px;
      position: absolute;
      top: 0;
      right: 0;
      .action-group > .action-item:after {
        top: 0;
        bottom: 0;
      }
    }
  }
  .work-block {
    display: inline-block;
    min-width: 50px;
    padding-top: 10px;
    width: 15%;
  }
  .title-block {
    display: inline-block;
    // min-width: 50px;
    padding-top: 10px;
    width: 20%;
  }
  .data-block {
    display: inline-block;
    // min-width: 70px;
    padding-top: 8px;
    width: 15%;
  }
  .time-block {
    display: inline-block;
    // min-width: 100px;
    padding-top: 8px;
    width: 15%;
  }
  .files-block {
    display: inline-block;
    // min-width: 80px;
    padding-top: 8px;
    width: 10%;
  }
  .content-box {
    width: 100%;
    min-height: 100px;
    // max-height: 260px;
    border: 1px solid;
    margin-bottom: 10px;
    .content-top {
      line-height: 40px;
      font-size: 14px;
      padding: 0 16px;
      .title-box {
        margin: 0;
        margin-right: 16px;
      }
      .active {
        .title-box {
          border-bottom: 2px solid;
          display: inline-block;
          cursor: pointer;
        }
      }
    }
    .content-text {
      padding: 8px 16px;
      max-height: 200px;
      overflow: auto;
      line-height: 24px;
    }
  }
}
</style>
