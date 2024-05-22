<template>
  <div ref="stepContainer" class="step-container" @scroll="scrollStepList(fixedBtn)">
    <div
      id="stepUl"
      ref="stepUl"
      class="step-main"
    >
      <draggable
        v-if="stepList && stepList.length"
        class="stepList clearfix"
        :class="'step-' + (canEdit && !appModuleId && !envId)"
        tag="ul"
        :list="list"
        handle=".stepIndex"
        :disabled="!canEdit"
        @end="dragEnd"
      >
        <template v-for="(ary, sindex) in list">
          <li
            v-if="ary && ary.length"
            :key="sindex"
            class="border-color"
            :class="{edit:canEdit}"
          >
            <span
              class="stepIndex border-color tsfont bg-op"
              :class="{'text-primary border-primary':ary.find(item=>item.uuid==currentStep.uuid)}"
              :data-index="sindex + 1"
              :title="canEdit?$t('term.deploy.dragtochangetheorder'):''"
              @click.stop
            ></span>
            <ul>
              <li
                v-for="step in ary"
                :id="'step_' + step.uuid"
                :key="step.uuid"
                class="cursor-pointer step-li radius-sm border-color"
                @click="changeSelectStep(step)"
              >
                <div class="step-content radius-sm padding" :class="step.uuid == currentStep.uuid?'active border-primary':'border-color'" :style="{'padding-bottom':canEdit || !step.isShow?'16px':'0px'}">
                  <div>
                    <Tooltip
                      theme="light"
                      transfer
                      :content="step.isShow? $t('page.clickandputaway') :$t('page.clicktoexpand')"
                      :style="{'width': '100%'}"
                    >
                      <div class="step-content-top" @click="showStep(step)">
                        <div class="stepName name overflow" :class="{'text-primary':step.uuid == currentStep.uuid}" :title="step.name && step.name.length > 9 ? step.name : ''">
                          <span>{{ step.name || '-' }}</span>
                          <template v-if="appModuleId || envId">
                            <CommonStatus
                              v-if="step.hasOwnProperty('override') && step.override"
                              :statusName="$t('page.heavyload')"
                              statusValue="running"
                              class="pl-sm"
                            ></CommonStatus>
                            <CommonStatus
                              v-if="step.hasOwnProperty('isActive') && !step.isActive"
                              :statusName="$t('page.disable')"
                              statusValue="aborted"
                              class="pl-sm"
                            ></CommonStatus>
                          </template>
                        </div>
                        <div class="stepType">
                          <span class="text-grey fz10">{{ getExecModeText(step.execMode) }}</span>
                        </div>
                        <div class="stepBtn" @click.stop>
                          <!-- 阶段的增删：只能在应用层; 阶段的修改：应用层可以修改名称，模块层不能修改阶段，环境层只能修改执行目标 -->
                          <i v-if="canEdit && !appModuleId && !envId" class="tsfont-plus text-tip-active" @click="editStep('add', step, sindex)"></i>
                          <i v-if="canEdit && (envId || (appSystemId && !appModuleId && !envId))" class="tsfont-edit text-tip-active pl-md" @click="editStep('edit', step, sindex)"></i>
                          <i v-if="canEdit && !appModuleId && !envId" class="tsfont-trash-o text-tip-active pl-md" @click="delStep(step,sindex)"></i>
                          <i class="text-tip-active pl-md" :class="step.isShow? 'tsfont-up' : 'tsfont-down'" @click="showStep(step)"></i>
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                  <div v-if="step.isShow" class="pt-sm">
                    <div v-if="appModuleId || envId" class="pb-sm">
                      <div class="inherit bg-op radius-lg padding">
                        <div class="tsfont-jicheng inherit-title border-color">{{ step.source }}</div>
                        <div class="pr-nm">
                          <span class="pr-xs">{{ $t('page.heavyload') }}</span>
                          <span class="inline-block"><TsFormSwitch v-model="step.override" :disabled="!canEdit" @change="(val)=>{ changeOverride(val, step) }"></TsFormSwitch></span>

                        </div>
                        <div>
                          <span class="pr-xs">{{ $t('page.enable') }}</span>
                          <span class="inline-block"><TsFormSwitch v-model="step.isActive" :disabled="step.hasOwnProperty('parentIsActive') && !step.parentIsActive ? true : !canEdit"></TsFormSwitch></span>
                        </div>
                      </div>
                    </div>
                    <StepConfig
                      ref="stepConfig"
                      :canEdit="getCanEditStatus(canEdit, step)"
                      :currentStepConfig="step"
                      :runtimeParamList="runtimeParamList"
                      :list="step.config?step.config.phaseOperationList : []"
                      :prevStepList="getPrev(step,stepList)"
                      :failPolicyOption="failPolicyOption"
                      :inputTypeList="inputTypeList"
                      @changeOperation="(list)=>{changeOperation(list, step)}"
                    ></StepConfig>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </template>
      </draggable>
    </div>
    <div
      v-if="canEdit && !appModuleId && !envId"
      class="block-add text-href"
      :class="{'margin-md':!stepList || !stepList.length, 'fixed-btn': fixedBtn}"
      @click="addStep()"
    >
      <i class="tsfont-plus bg-op btn-add"></i>
      {{ !stepList || !stepList.length ? $t('dialog.title.addtarget', {target: $t('page.phase')}) : '' }}
    </div>
    <StepEdit
      v-if="isShow"
      :config="editConfig"
      :stepList="list"
      :scriptLength="editScriptLength"
      :groupConfig="groupConfig"
      :execModeList="execModeList"
      :appSystemId="appSystemId"
      :appModuleId="appModuleId"
      :envId="envId"
      :runtimeParamList="runtimeParamList"
      @close="closeStepEdit"
    ></StepEdit>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  provide() {
    return {
      renderHeight: this.renderHeight
    };
  },
  components: {
    draggable,
    StepConfig: () => import('./step-config.vue'),
    StepEdit: () => import('./step-edit.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue')
  },
  filters: {
  },
  props: {
    canEdit: {
      type: Boolean,
      default: true
    },
    stepList: Array, //阶段列表
    runtimeParamList: Array, //作业参数
    combopGroupList: Array,
    execModeList: Array, //执行方式
    currentStep: {//选中的阶段
      type: Object,
      default: () => {}
    },
    appSystemId: Number, //应用id
    appModuleId: Number, //模块id
    envId: Number //环境id
  },
  data() {
    return {
      isShow: false,
      list: [],
      fixedBtn: false,
      editScriptLength: 0,
      editConfig: null,
      groupConfig: null,
      failPolicyOption: [], //失败策略下拉列表
      inputTypeList: [], //输入参数映射下拉
      initStepList: [] //继承的阶段列表
    };
  },
  beforeCreate() {},
  created() {
    this.getFailPolicyOption();
    this.getInputTypeList();
  },
  beforeMount() {},
  mounted() {
    this.renderHeight();
    window.onresize = () => {
      return (() => {
        this.renderHeight();
      })();
    };
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    scrollStepList() {
      // this.renderHeight(this.fixedBtn);
    },
    renderHeight(fixedBtn) {
      if (fixedBtn) { //出现滚动条时，添加阶段按钮固定在底部
        return;
      }
      this.$nextTick(() => {
        let stepContainerHeight = this.$refs.stepContainer ? (this.$refs.stepContainer.offsetHeight - 30) : 0;
        let stepHeight = this.$refs.stepUl ? this.$refs.stepUl.offsetHeight : 0;
        if (stepHeight - stepContainerHeight > 0) {
          this.fixedBtn = true;
        } else {
          this.fixedBtn = false;
        }
      });
    },
    changeSelectStep(item) {
      this.$emit('change', item);
    },
    updateStepList() { //更新阶段
      let list = [];
      if (this.stepList.length) {
        for (let sort = 0, index = 0; index < this.stepList.length;) {
          let arr = [];
          this.stepList.filter(l => {
            if (l.groupSort == sort) {
              arr.push(l);
              index++;
              return true;
            }
          });
          sort++;
          list.push(arr);
        }
      }
      return list;
    },
    addStep() { //创建新的阶段和组
      this.editScriptLength = 0;
      this.editConfig = {name: '', config: {}};
      this.groupConfig = null;
      this.isShow = true;
    },
    editStep(type, stepConfig, oindex) { //同阶段组的新增阶段和编辑编辑
      this.oindex = oindex;
      let findItem = this.combopGroupList.find(item => item.uuid == stepConfig.groupUuid);
      this.groupConfig = findItem;
      if (type == 'add') {
        this.editId = null;
        this.editConfig = {name: '', config: {}};
        this.editScriptLength = 0;
      } else if (type == 'edit') {
        this.editConfig = stepConfig;
        this.editId = stepConfig.uuid;
        this.editScriptLength = stepConfig.scriptLength || 0;
      }
      this.isShow = true;
    },
    closeStepEdit(data) {
      if (data) {
        if (this.editId) { //修改
          Object.assign(this.editConfig, data);
        } else if (!this.$utils.isEmpty(this.groupConfig)) { //同组新增
          Object.assign(data, {
            uuid: this.$utils.setUuid(),
            sort: this.groupConfig && this.groupConfig.policy == 'oneShot' ? this.list[this.oindex][0].sort : this.list[this.oindex][0].sort + 1,
            groupSort: this.groupConfig.groupSort,
            groupUuid: this.groupConfig.groupUuid
          });
          this.list[this.oindex].push(data);
        } else { //增加分组
          Object.assign(data, {
            uuid: this.$utils.setUuid(),
            sort: 0,
            groupSort: this.list.length,
            groupUuid: this.$utils.setUuid()
          });
          this.list.push([data]);
          let itemConfig = {
            policy: 'oneShot',
            sort: data.groupSort,
            uuid: data.groupUuid,
            config: {}
          };
          this.combopGroupList.push(itemConfig);
        }
        this.$emit('updateSort', this.getUpdateSort());
        this.changeSelectStep(data);
      }
      this.isShow = false;
      this.editConfig = null;
      this.editScriptLength = 0;
      this.editId = null;
    },
    dragEnd() {
      this.$emit('updateSort', this.getUpdateSort());
    },
    changeOperation(list, step) {
      if (!step.config) {
        this.$set(step, 'config', {});
      }
      this.$set(step.config, 'phaseOperationList', list);
      this.$set(step, 'scriptLength', list.length);
      this.$emit('updateSort', this.getUpdateSort());
    },
    showStep(step) {
      let isShow = !step.isShow;
      this.$set(step, 'isShow', isShow);
    },
    delStep(config, oindex) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: config.name}),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          this.list[oindex] = this.list[oindex].filter(l => {
            return l.name != config.name;
          });
          this.list[oindex].length == 0 && this.list.splice(oindex, 1);
          let stepList = this.getUpdateSort();
          this.$emit('updateSort', stepList);
          if (config.uuid == this.currentStep.uuid) {
            this.changeSelectStep(stepList[0]);
          }
        }
      });
    },
    getUpdateSort() { //更新阶段和阶段组的排序
      return this.list.reduce((list, data, index) => {
        let findItem = this.combopGroupList.find(c => c.uuid == data[0].groupUuid);
        data.forEach((item, subIndex) => {
          item.groupSort = index;
          if (findItem) {
            findItem.policy == 'oneShot' && (item.sort = 0);
            findItem.policy == 'grayScale' && (item.sort = subIndex);
          }
        });
        list.push(...data);
        return list;
      }, []);
    },
    getFailPolicyOption() {
      //获取失败策略下拉
      let data = {enumClass: 'neatlogic.framework.autoexec.constvalue.FailPolicy'};
      return this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.failPolicyOption = res.Return;
        }
      });
    },
    getInputTypeList() {
      //获取输入参数映射下拉
      let data = {enumClass: 'neatlogic.framework.autoexec.constvalue.ParamMappingMode'};
      return this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.inputTypeList = res.Return;
        }
      });
    },
    valid() {
      let validList = this.$refs.stepConfig;
      validList && validList.forEach(item => {
        item.valid();
        // this.$utils.validForm(item.$el);
      });
    },
    async changeOverride(val, step) {
      if (!val && this.$utils.isEmpty(this.initStepList)) {
        //如果当前是环境层，取消重载时需要获取模块层的当前阶段
        //如果当前是模块层，取消重载时需要获取应用层的当前阶段
        let data = {
          appSystemId: this.appSystemId
        };
        if (this.envId) {
          this.$set(data, 'appModuleId', this.appModuleId);
        }
        let res = await this.$api.deploy.apppipeline.getAppPipeline(data);
        if (res.Status == 'OK') {
          this.initStepList = res.Return.config.combopPhaseList || [];
          let findItem = this.initStepList.find(s => s.uuid == step.uuid);
          this.$set(step, 'config', findItem.config);
        }
      }
    }
  },
  computed: {
    getPrev() {
      return (config, list) => {
        let uk = config.uuid;
        let index = list.findIndex((l) => {
          return l.uuid == uk;
        });
        return list.filter((s, sindex) => {
          return sindex < index;
        });
      };
    },
    getExecModeText() {
      return (value) => {
        let currentItem = this.execModeList.find(li => {
          return li.value == value;
        });
        return currentItem ? currentItem.text : '';
      };
    },
    getCanEditStatus() {
      return (canEdit, step) => {
        if (step.hasOwnProperty('override')) { //模块层和环境层重载之后才能编辑工具
          return (canEdit && !!step.override);
        } else { //应用层没有重载
          return canEdit;
        }
      };
    }
  },
  watch: {
    stepList: {
      handler(val, oldVal) {
        if (!this.$utils.isSame(val, oldVal)) {
          this.list = this.updateStepList();
          this.renderHeight();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@iconWidth: 24px;
ul.stepList {
  word-break: keep-all;
  white-space: nowrap;
  >li{
    padding-left: 30px;
    &:before {
        content: '';
        position: absolute;
        width: 0;
        top: 28px;
        left: 11px;
        border: 0 none;
        border-left: 1px solid;
        border-color: inherit;
        border-style: dashed;
        bottom: -15px;
      }
    .stepIndex {
      &::before {
        content: attr(data-index);
        display: block;
        min-width: auto;
      }
    }
    &.edit {
      &:hover {
        .stepIndex{
            cursor: ns-resize;
            &::before {
              content: '\e828'; // tsfont-bar
            }
          }
      }
    }
    .stepIndex {
      position: absolute;
      left: 0;
      top: 0;
      width: @iconWidth;
      height: @iconWidth;
      border-radius: 50%;
      border: 1px solid;
      text-align: center;
      line-height: calc(@iconWidth - 1px);
      font-size: 12px;
      &:before {
        margin-right: 0;
      }
    }
  }
  li {
    position: relative;
    display: block;
    min-height: 58px;
    margin-bottom:16px;
   >ul{
     >li{
       margin-bottom: 10px;
       &:last-of-type{
         margin-bottom: 0px;
       }
     }
   }

    &.active {
      border: 0 none;
    }

    &.step-li {
      .stepName {
        height: @iconWidth;
        position: relative;
        padding-right: 100px;
      }
      .stepBtn {
        position: absolute;
        right: 0;
        top: 0;
        display: none;
      }
      &:hover {
        .stepBtn {
          display: block;
        }
      }
    }
    .stepType {
      display: block;
      > span {
        display: inline-block;
        padding: 0px 4px;
        line-height: 20px;
      }
    }
    .step-content {
      border: 1px solid;
      .step-content-top {
        position: relative;
        width: 100%;
      }
    }
  }
  &.step-false {
    > li:last-of-type:before {
      display: none;
    }
  }
}
.step-container {
  overflow: auto;;
  height:100%;
  &.edit_true {
    .step-main {
      height: calc(100% - 34px);
      overflow: auto;
    }
  }
}
.block-add{
  .btn-add{
    width: @iconWidth;
    height: @iconWidth;
    line-height: calc(@iconWidth - 1px) ;
    border-radius: 50%;
    border: 1px solid;
    display: inline-block;
    text-align: center;
    margin-top: 3px;
    &:before{
      margin-right: 0;
    }
  }
  &.fixed-btn {
    position: absolute;
    bottom: 0;
    left: 0;
  }
}
.inherit {
  display: flex;
  .inherit-title {
    padding-right: 16px;
    border-right: 1px solid;
    margin-right: 16px;
  }
  .inline-block {
    display: inline-block;
  }
}
</style>
