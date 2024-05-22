<template>
  <div ref="changeBox" class="change-detail" @click.stop>
    <div class="from-list">
      <div class="change-top">
        <div v-if="newChangeStepList && newChangeStepList.length > 0">
          <div class="text-title top-title">{{ title }}</div>
          <div class="change-action-list">
            <div>
              <span v-if="isComplete" class="text-action add-user">
                <span class="tsfont-edit icon-font" @click="editUser">{{ $t('term.process.batchedituser') }}</span>
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
                            :validateList="validateList.user"
                            :onChange="getUserText"
                          ></UserSelect>
                        </div>
                        <div class="btn-user">
                          <Button type="text" size="small" @click="cancelAllUser">{{ $t('page.cancel') }}</Button>
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
              </span>
              <span v-if="isComplete" class="tsfont-modules text-action" @click="selectChangeTemplate">{{ $t('page.selecttemp') }}</span>
            </div>
            <div v-if="isComplete">
              <span class="tsfont-trash-o text-action" @click="clearSetting">{{ $t('page.clear') }}</span>
            </div>
          </div>
        </div>
        <div v-else>
          <span
            v-if="isComplete"
            class="tsfont-plus text-href"
            style="padding-right:16px;"
            @click="selectChangeTemplate"
          >{{ $t('term.process.changetemp') }}</span>
          <span v-if="isComplete" class="tsfont-plus text-href" @click="addStep">{{ $t('term.process.step') }}</span>
          <!-- <div v-if="isComplete" class="tsfont-plus text-href add-template" @click="selectChangeTemplate">{{ $t('term.process.changetemp') }}</div>
          <div v-if="isComplete" class="tsfont-plus text-href" @click="addStep">步骤</div> -->
        </div>
      </div>
      <div v-if="newChangeStepList && newChangeStepList.length>0" class="change-main card-wrapper">
        <div
          v-for="(cd,index) in newChangeStepList"
          :key="cd.uuid"
          :uuid="cd.uuid"
          :parentUuid="cd.parentUuid"
          :index="index"
          class="card-list"
        >
          <span class="sub-line"></span>
          <div class="card-item radius-sm" :class="isSelectId && isSelectId == cd.uuid?'bg-primary':'bg-grey-hover'" :style="{ 'margin-bottom':cd.isShow?'0px':'8px' }">
            <div class="content-block" @click="lookContent(cd)">
              <div class="title-block overflow">
                <div class="text-grey" :title="cd.code">{{ cd.code }}</div>
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
              <div class="files-block" style="position: relative;">
                <div class="text-grey">{{ $t('page.accessory') }}</div>
                <div v-if="cd.fileIdList && cd.fileIdList.length" class="text-action" @click.stop>
                  <Dropdown trigger="click">
                    <span>{{ cd.fileIdList.length }}</span>
                    <DropdownMenu slot="list" class="dropdown">
                      <DropdownItem v-for="f in cd.fileList" :key="f.id">
                        <span v-download="downurl('/api/binary/file/download',f.id)" class="tsfont-attachment text-action">{{ f.name }}<i class="tsfont-download"></i></span>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <span v-else>-</span>
              </div>
              <div v-if="isComplete" class="btn-list">
                <ul class="action-group no-line">
                  <li class="action-item tsfont-edit" @click.stop="editsStep('edit',cd)"></li>
                  <li class="action-item tsfont-plus" @click.stop="editsStep('add',cd,index)"></li>
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
                  <span v-download="downurl('/api/binary/file/download',f.id)" class="tsfont-attachment text-action">{{ f.name }}<i class="tsfont-download"></i></span>
                </div>
              </div>
            </div>
            <div v-else class="text-grey content-text">{{ $t('page.notarget',{target:$t('page.description')}) }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="newChangeStepList.length>0 && changeParamList.length>0" id="changeParam" class="from-list input-border">
      <div class="title text-grey top-title require-label">{{ $t('term.process.templatereplace') }}</div>
      <div class="param-box">
        <TsRow class="block-div">
          <Col
            v-for="(param, paramIndex) in changeParamList"
            :key="paramIndex"
            class="col-span param-flex"
            span="8"
          >
            <span class="param-col-1" style="word-break: break-all;">{{ param.name }}</span>
            <span class="param-col-1" style="text-align: center;">
              <img src="~@/resources/assets/images/itsm/btn-relevance.png" />
            </span>
            <span class="param-col-2">
              <TsFormInput
                ref="paramInput"
                v-model="param.value"
                :data-param="param.name"
                :validateList="validateList.paramInput"
                size="small"
                :readonly="isComplete?false:true"
              />
            </span>
          </Col>
        </TsRow>
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
    <TsDialog
      type="modal"
      :isShow.sync="changeTemplateDialog"
      :title="$t('term.process.selectchangetemplate')"
      @on-ok="okChangeTemplate"
      @on-close="closeChangeTemplate"
    >
      <template>
        <TsForm
          ref="changeTemplateForm"
          :itemList="changeTemplateForm"
          type="type"
          :labelWidth="80"
        >
          <template v-slot:template>
            <div>
              <div class="template-btn">
                <span v-if="changeTemplateId" class="tsfont-edit text-tip-active" @click="toEditChangeTemplate"></span>
                <span class="tsfont-rotate-right text-tip-active" @click="changeTemplateList('refresh')"></span>
              </div>
              <TsFormSelect
                ref="templateSelect"
                v-model="changeTemplateId"
                :validateList="validateList.template"
                :dataList="templateList"
                valueName="id"
                textName="name"
                transfer
                style="width:90%"
              ></TsFormSelect>
            </div>
          </template>
        </TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import StepDialog from './changecreatestep-dialog.vue';
import UserSelect from '@/resources/components/UserSelect/UserSelect';
import download from '@/resources/directives/download.js';
export default {
  name: 'ChangeDetail',
  components: {
    StepDialog,
    UserSelect,
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    UserCard: () => import('components/UserCard/UserCard')
  },
  directives: { download },
  props: {
    handlerStepInfo: Object,
    isComplete: { //处理页流转权限
      type: Boolean,
      default: true
    }
  },
  data() {
    let _this = this;
    return {
      isSelectId: null,
      title: this.$t('term.process.changestep'),
      addType: 'step',
      stepDialog: false,
      dialogStepTitle: this.$t('dialog.title.addtarget', {target: this.$t('term.process.step')}),
      ChangeStepConfig: {}, //添加步骤数据
      selectId: null,
      // changeWidth: 700,
      worker: '', //批量处理人
      allWorkerVo: null,
      groupList: ['user', 'team'],
      visible: false,
      validateList: {
        user: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.dealwithuser')}) }],
        template: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.template')}) }],
        paramInput: ['required']
      },
      newChangeStepList: [],
      stepConfig: null, //步骤信息
      character: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'],
      changeTemplateDialog: false,
      changeTemplateForm: [
        {
          type: 'userselect',
          name: 'authority',
          value: '',
          label: this.$t('page.group'),
          width: '90%',
          multiple: false,
          groupList: ['team'],
          transfer: true,
          onChange() {
            _this.changeTemplateId = null;
            _this.changeTemplateList();
          }
        },
        {
          type: 'select',
          name: 'type',
          value: '',
          label: this.$t('page.type'),
          width: '90%',
          transfer: true,
          dataList: [],
          onChange() {
            _this.changeTemplateId = null;
            _this.changeTemplateList();
          }
        },
        {
          type: 'slot',
          name: 'template',
          label: this.$t('page.template'),
          validateList: ['required']
        }
      ],
      changeTemplateId: null,
      changeParamList: [],
      templateList: [],
      paramDataMap: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    // if (this.$refs.changeBox) {
    //   this.changeWidth = this.$refs.changeBox.clientWidth - 16;
    //   window.onresize = () => {
    //     return (() => {
    //       if (this.$refs.changeBox) {
    //         this.changeWidth = this.$refs.changeBox.clientWidth - 16;
    //       }
    //     })();
    //   };
    // }
    this.changeTemplateList();
    this.getTemplateType();
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
        content: this.$t('dialog.content.clearconfirm', {target: this.$t('page.config')}),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          this.newChangeStepList.splice(0);
          this.changeTemplateId = null;
          this.changeParamList.splice(0);
          this.paramDataMap = null;
          this.closeChangeTemplate();
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
    saveChangeStepData() {
      //保存步骤数据
      let data = {
        changeTemplateId: this.changeTemplateId || null,
        changeStepList: this.newChangeStepList,
        paramDataMap: this.paramDataMap || null
      };
      if (this.changeParamList.length > 0) {
        let paramDataMap = {};
        this.changeParamList.forEach(e => {
          this.$set(paramDataMap, e.name, e.value || null);
        });
        this.$set(data, 'paramDataMap', paramDataMap);
      }
      return data;
    },
    delStep(id, name, cd) {
      //删除步骤
      let _this = this;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
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
        this.dialogStepTitle = this.$t('dialog.title.edittarget', {target: this.$t('term.process.step')});
        this.stepConfig = obj || null;
      } else {
        this.dialogStepTitle = this.$t('dialog.title.addtarget', {target: this.$t('term.process.step')});
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
    },
    getTemplateType() {
      let data = {};
      this.$api.process.change.changeTemplateTypeList(data).then(res => {
        if (res.Status == 'OK') {
          let dataList = res.Return.changeTemplateTypeList;
          this.changeTemplateForm[1].dataList = dataList;
        }
      });
    },
    getChangeStepList() {
      //获取变更模板步骤和变量
      let data = {
        changeTemplateId: this.changeTemplateId
      };
      this.$api.process.change.getChangeStepList(data).then(res => {
        if (res.Status == 'OK') {
          let changeData = res.Return;
          this.newChangeStepList = changeData.changeStepList || [];
          this.changeParamList = changeData.changeParamList || [];
          if (this.changeParamList.length > 0) {
            this.changeParamList.forEach(e => {
              if (this.paramDataMap) {
                this.$set(e, 'value', this.paramDataMap[e.name]);
              } else {
                this.$set(e, 'value', '');
              }
            });
          }
        }
      });
    },
    selectChangeTemplate() {
      this.changeTemplateDialog = true;
    },
    okChangeTemplate() {
      let templateSelect = this.$refs.templateSelect;
      if (templateSelect.valid()) {
        this.getChangeStepList();
        this.changeTemplateDialog = false;
      }
    },
    changeTemplateList(type) {
      //模板列表
      let _this = this;
      let data = {
        isActive: 1,
        authority: _this.changeTemplateForm[0].value || null,
        type: _this.changeTemplateForm[1].value || null
      };
      this.$api.process.change.getChangeTemplateList(data).then(res => {
        if (res.Status == 'OK') {
          let changeData = res.Return;
          this.templateList = changeData.changeTemplateList;
          if (type) {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        }
      });
    },
    toEditChangeTemplate() {
      window.open(HOME + '/process.html#/change-edit?id=' + this.changeTemplateId, '_blank');
    },
    validParam() {
      let validList = [];
      let paramInputList = this.$refs.paramInput;
      if (paramInputList && paramInputList.length > 0) {
        paramInputList.forEach(e => {
          if (!e.valid()) {
          // this.$set(e, 'valid', true);
            let o = {
              focus: '#changeParam',
              msg: this.$t('term.process.variablerequire', {target: e.$attrs['data-param']})
            };
            validList.push(o);
          }
        });
      }
      return validList;
    },
    closeChangeTemplate() {
      this.changeTemplateForm.forEach(e => {
        e.value = null;
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
    handlerStepInfo: {
      handler(val) {
        if (val) {
          let handlerStepInfo = this.$utils.deepClone(val);
          this.newChangeStepList = handlerStepInfo.changeStepList || [];
          this.paramDataMap = handlerStepInfo.paramDataMap || null;
          this.changeTemplateId = handlerStepInfo.changeTemplateId || null;
          if (this.paramDataMap) {
            let changeParamList = [];
            for (let i in this.paramDataMap) {
              let obj = {};
              this.$set(obj, 'name', i);
              this.$set(obj, 'value', this.paramDataMap[i]);
              changeParamList.push(obj);
            }
            this.changeParamList = changeParamList;
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
.change-detail {
  .change-top {
    padding-top: 10px;
    position: relative;
    .top-title {
      padding-bottom: 10px;
    }
    .change-action-list{
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .add-template{
      padding-bottom: 10px;
    }
    .add-user{
      padding-right: 16px;
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
    .btn-user{
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
      // height: 56px;
      // line-height: 56px;
      padding: 8px;
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
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      >div{
        flex-grow: 1;
      }
    }
    .btn-list {
      text-align: right;
      .action-group > .action-item:after {
        top: 0;
        bottom: 0;
      }
    }
  }
  .work-block {
    width: 80px;
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
    width: 200px;
  }
  .data-block,
  .time-block {
    width: 110px;
  }
  .content-box {
    width: 100%;
    min-height: 100px;
    // max-height: 260px;
    margin-bottom: 10px;
    border: 1px solid;
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
  .icon-font {
    &:before {
      display: inline-block;
      padding-right: 4px;
    }
  }
  .param-box {
    .param-flex {
      display: flex;
      align-items: center;
      padding-bottom: 10px;
      .param-col-1 {
        flex: 1;
      }
      .param-col-2 {
        flex: 2;
      }
    }
  }
}
.template-btn {
  position: absolute;
  right: 0;
  > span {
    padding-left: 8px;
  }
}
</style>
