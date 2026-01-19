<template>
  <div>
    <draggable
      v-if="phaseOperationList && phaseOperationList.length"
      class="phaseOperationList"
      :class="'drag_' + dragStatus + ' edit_' + (canEdit && operationType=='combop')"
      tag="ul"
      forceFallback
      :list="list"
      handle=".item-sort"
      dragClass="hide-li"
      allbackOnBody
      :disabled="!(canEdit && operationType=='combop')"
      @start="changeDragStatus('start')"
      @end="changeDragStatus('end')"
    >
      <li v-for="(step, sindex) in list" :id="'id_' + combopConfig.combopUuid + '_' + step.uuid" :key="sindex+'_'+step.uuid">
        <div v-if="step.operation" class="inner-block radius-lg" :class="{'hide-li':dragStatus == 'start' || !phaseShowMap[step.uuid], 'show-li': phaseShowMap[step.uuid], 'bg-op': step.operationName != 'native/IF-Block' && step.operationName != 'native/LOOP-Block', 'border-base': step.operationName == 'native/IF-Block' || step.operationName == 'native/LOOP-Block'}">
          <div class="script-title border-color cursor-pointer" @click="toggleshow(step)">
            <div class="overflow">
              【{{ typeText(step.operationType) }}】
              <span class="text-action name" :title="step.operationName" @click.stop="gotoDateil(step)">{{ step.operationName }}</span>
              <RiskItem v-if="step.operation.riskVo" :text="step.operation.riskVo.name" :color="step.operation.riskVo.color"></RiskItem>
            </div>
            <div class="text-tip description overflow">
              <span v-if="step.description" :title="step.description">{{ step.description }}</span>
              <span v-else-if="!canEdit">-</span>
              <i v-if="canEdit" class="text-action edit-des tsfont-edit" @click.stop="editDescription(step)"></i>
            </div>
            <i v-if="canEdit && operationType=='combop'" class="item-sort tsfont-bar"></i>
            <i class="item-index text-tip">#{{ sindex+1 }}</i>
            <span class="item-actionIcon" @click.stop>
              <i v-if="canEdit && operationType=='combop'" class="item-copy tsfont-copy text-tip" @click="copyScript(step)"></i>
              <i v-if="canEdit && operationType=='combop'" class="item-delete tsfont-close text-tip" @click="deleteScript(step,sindex)"></i>
              <i class="item-toggle tsfont text-tip" @click="toggleshow(step)"></i>
            </span>
          </div>
          <item
            :is="geScriptType(step)"
            v-if="phaseShowMap[step.uuid]"
            :ref="'toolDetail'+step.uuid"
            :config="step"
            :canEdit="canEdit"
            :isFirst="getFirstStatus(stepIndex, sindex)"
            :prevList="getPrev(sindex, prevStepList)"
            :paramList="paramList"
            :paramsTypeList="paramsTypeList"
            :failPolicyOption="failPolicyOption"
            :inputTypeList="inputTypeList"
            :combopConfig="combopConfig"
            :prevStepList="prevStepList"
            :execMode="execMode"
            :operationType="operationType"
            @change="val=>{changeStep(val,step.uuid)}"
          ></item>
        </div>
        <div v-else class="inner-block radius-lg hide-li" :class="{'bg-op': step.operationName != 'native/IF-Block' && step.operationName != 'native/LOOP-Block', 'border-base': step.operationName == 'native/IF-Block'&& step.operationName != 'native/LOOP-Block'}">
          <div class="script-title border-color">
            <div class="overflow">
              【{{ typeText(step.operationType) }}】
              <span class="name" :title="step.operationName">{{ step.operationName }}</span>
            </div>
            <div class="text-error pt-xs">【{{ $t('term.autoexec.tooldeleted') }}】</div>
            <i v-if="canEdit && operationType=='combop'" class="item-sort tsfont-bar"></i>
            <i class="item-index text-tip">#{{ sindex+1 }}</i>
            <span class="item-actionIcon">
              <i v-if="canEdit && operationType=='combop'" class="item-delete tsfont-close text-tip" @click="deleteScript(step,sindex)"></i>
            </span>
          </div>
        </div>
      </li>
    </draggable>
    <div v-else class="text-tip line-2">{{ $t('page.notarget', {target: $t('page.script')}) }}</div>
    <TsDialog
      :title="$t('term.autoexec.tooldescription')"
      type="modal"
      :isShow.sync="showDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsFormItem :label="$t('page.description')" labelWidth="80">
            <TsFormInput v-model="description" :maxlength="256" border="border"></TsFormInput>
          </TsFormItem>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import item from '@/views/pages/autoexec/components/script/item/index.js';
import RiskItem from '@/views/pages/autoexec/components/risk-item.vue';
import { storeScript, mutationsScript } from './script-state.js';
export default {
  name: '',
  inject: {
    renderHeight: {
      default: () => {}
    }
  },
  components: {
    draggable,
    ...item,
    RiskItem,
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  filters: {},
  props: {
    canEdit: {
      //是否可以编辑 ，允许改变顺序、编辑修改、新增
      type: [Boolean],
      default: true
    },
    phaseOperationList: {
      //脚本列表
      type: [Array],
      default() {
        return [];
      }
    },
    prevStepList: {
      //前面的节点数据
      type: [Array]
    },
    combopConfig: {
      //当前阶段的数据
      type: [Object]
    },
    stepIndex: {
      type: [Number]
    },
    paramList: {
      type: Array,
      default() {
        return [];
      }
    },
    paramsTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    failPolicyOption: {
      type: Array,
      default() {
        return [];
      }
    },
    inputTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    execMode: String,
    operationType: {
      type: String,
      default: 'combop'
    },
    validPhaseOperationUuidList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    parentPrevOperationList: { //父级上游工具列表
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      list: [],
      dragStatus: 'end', //标志拖拽状态，用于做拖拽时收起的效果
      isValid: true,
      showDialog: false,
      currentStep: null,
      description: '',
      isUpdateSort: false //是否更新排序
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
    changeDragStatus(type) {
      this.dragStatus = type;
      if (type == 'end') {
        this.updatedSort();
      }
    },
    updatedSort() {
      this.isUpdateSort = true;
      let list = this.$utils.deepClone(this.list);
      list.forEach((item, index) => {
        this.$set(item, 'sort', index);
      });
      if (!this.$utils.isSame(list, this.list)) {
        this.list = list;
      }
    },
    toggleshow(item) {
      mutationsScript.setCombopPhaseShowMap(item.uuid);
      this.renderHeight && this.renderHeight();
    },
    deleteScript(item, index) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deletetargetconfirm', {target: item.operationName}),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          this.$nextTick(() => {
            this.list.splice(index, 1);
            this.updatedSort();
            this.$Message.success(this.$t('message.deletesuccess'));
          });
        }
      });
    },
    copyScript(item) {
      let newitem = this.$utils.deepClone(item);
      let prevlength = this.list.filter(p => { return p.operationId == newitem.operationId; });
      this.$delete(newitem, 'id');
      Object.assign(newitem, {
        uuid: this.$utils.setUuid(),
        letter: prevlength.length ? this.$utils.translateNumber(parseInt(prevlength.length), 'en') : null
      });
      this.updateCopyUuid(newitem);
      this.list.push(newitem);
      this.updatedSort();
      this.$forceUpdate();
    },
    updateCopyUuid(item) { //更新复制的脚本的uuid
      if (item.config) {
        if (!this.$utils.isEmpty(item.config.ifList)) {
          this.updatePhaseOperationUuidList(item.config.ifList);
        }
        if (!this.$utils.isEmpty(item.config.elseList)) {
          this.updatePhaseOperationUuidList(item.config.elseList);
        }
        if (!this.$utils.isEmpty(item.config.operations)) {
          this.updatePhaseOperationUuidList(item.config.operations);
        }
      }
    },
    updatePhaseOperationUuidList(phaseOperationList) {
      phaseOperationList.forEach(p => {
        this.$delete(p, 'id');
        this.$set(p, 'uuid', this.$utils.setUuid());
        if (!this.$utils.isEmpty(p.config.paramMappingList)) {
          p.config.paramMappingList.forEach(param => {
            if (param.mappingMode == 'prenodeoutputparam' || param.mappingMode == 'prenodeoutputparamkey') {
              this.$set(param, 'value', null);
            }
          });
        }
        if (p.config) {
          if (!this.$utils.isEmpty(p.config.ifList)) {
            this.updatePhaseOperationUuidList(p.config.ifList);
          }
          if (!this.$utils.isEmpty(p.config.elseList)) {
            this.updatePhaseOperationUuidList(p.config.elseList);
          }
          if (!this.$utils.isEmpty(p.config.operations)) {
            this.updatePhaseOperationUuidList(p.config.operations);
          }
        }
      });
    },
    updateList(list) {
      this.list = list.map((v, vindex) => {
        return {
          ...v,
          uuid: v.uuid || this.$utils.setUuid(),
          sort: vindex
        };
      });
      this.$forceUpdate();
    },
    valid() {
      this.isValid = true;
      //预置参数集
      if (this.$el.querySelectorAll('.profile-param').length) {
        if (this.validStep('.profile-param')) {
          this.isValid = false;
        }
      }
      //inputParam,输入参数
      if (this.$el.querySelectorAll('.input-param').length) {
        this.isValid = this.validStep('.input-param');
      }
      //自由参数
      if (this.$el.querySelectorAll('.argument-param').length) {
        if (this.validStep('.argument-param')) {
          this.isValid = false;
        }
      }
      //条件
      if (this.$el.querySelectorAll('.condition-param').length) {
        if (this.validStep('.condition-param')) {
          this.isValid = false;
        }
      }
      if (this.$el.querySelectorAll('.condition-tool-param').length) {
        if (this.validStep('.condition-tool-param')) {
          this.isValid = false;
        }
      }
      return this.isValid;
    },
    changeStep(config, id) {
      this.isUpdateSort = false;
      this.list.forEach(l => {
        if (l.uuid == id) {
          Object.assign(l, config);
        }
      });
    },
    gotoDateil(item) {
      if (item.operationType == 'script') {
        this.$router.push({
          path: '/script-detail',
          query: {
            scriptId: item.operationId
          }
        });
      } else if (item.operationType == 'tool') {
        this.$router.push({
          path: '/tool-detail',
          query: {
            id: item.operationId
          }
        });
      }
    },
    validStep(className) { //校验阶段(包括：输入参数，自由参数，预置参数集)
      let isValid = true;
      if (this.$el.querySelectorAll(className).length) {
        let childrendom = this.$el.querySelectorAll(className);
        if (childrendom && childrendom.length > 0) {
          childrendom.forEach(children => {
            if (children.__vue__ && children.__vue__.valid) {
              if (!children.__vue__.valid()) {
                this.setShowStep(children.__vue__.$options.parent);
                isValid = false;
              }
            }
          });
        }
        return isValid;
      }
    },
    setShowStep(parent) { //设置父级的显示
      if (parent) {
        if (parent.step) {
          mutationsScript.setCombopPhaseShowMap(parent.step.uuid, true);
        } else {
          if (parent.$options.parent) {
            this.setShowStep(parent.$options.parent);
          }
        }
      }
    },
    refreshProfile() {
      if (this.phaseOperationList && this.phaseOperationList.length) {
        this.phaseOperationList.forEach(item => {
          if (item.config && item.config.profileId) {
            this.$refs['toolDetail' + item.uuid] && this.$refs['toolDetail' + item.uuid][0].refreshProfile(item.config.profileId);
          }
        });
      }
    },
    editDescription(step) {
      this.currentStep = step;
      this.description = step.description;
      this.showDialog = true;
    },
    okDialog() {
      this.isUpdateSort = false;
      this.list.forEach(item => {
        if (item.uuid === this.currentStep.uuid) {
          this.$set(item, 'description', this.description);
        }
      });
      this.closeDialog();
    },
    closeDialog() {
      this.currentStep = null;
      this.description = '';
      this.showDialog = false;
    },
    getPrevOperation(list) {
      let operationList = [];
      list.forEach(item => {
        operationList.push(item);
        if (item.config && !this.$utils.isEmpty(item.config.ifList)) {
          operationList.push(...item.config.ifList);
          operationList.push(...this.getPrevOperation(item.config.ifList));
        } 
        if (item.config && !this.$utils.isEmpty(item.config.elseList)) {
          operationList.push(...item.config.elseList);
          operationList.push(...this.getPrevOperation(item.config.elseList));
        } 
        if (item.config && !this.$utils.isEmpty(item.config.operations)) {
          operationList.push(...item.config.elseList);
          operationList.push(...this.getPrevOperation(item.config.operations));
        }
      });
      return operationList;
    }
  },
  computed: {
    phaseShowMap() {
      return storeScript.phaseShowMap || {};
    },
    getPrev() {
      return function(index, prevStepList) {
        let list = [];
        let newList = [];
        if (!this.$utils.isEmpty(this.parentPrevOperationList)) {
          list.push(...this.parentPrevOperationList);
        }
        //当前阶段的前面的所有输出参数
        if (prevStepList && prevStepList.length) {
          list.push(...prevStepList);
        }
        //同一个阶段的前面的脚本
        newList = this.list.filter((l, lindex) => {
          return lindex < index;
        });
        newList = this.getPrevOperation(newList);
        newList.forEach(n => {
          if (n.operation && n.operation.outputParamList && n.operation.outputParamList.length) {
            let item = n.operation.outputParamList;
            item.forEach(i => {
              list.push({
                ...i,
                ...this.combopConfig,
                operationId: n.operationId,
                operationName: n.operationName,
                operationUuid: n.uuid,
                operationLetter: n.letter || null,
                operationDes: n.description
              });
            });
          }
        });
        return list;
      };
    },
    getFirstStatus() {
      return function(stepIndex, scriptIndex) {
        //判断当前脚本是否第一个阶段的第一个脚本或者父级工具不存在上游工具，此时没有选择上游输出参数的选项
        return !stepIndex && !scriptIndex && this.$utils.isEmpty(this.parentPrevOperationList);
      };
    },
    typeText() {
      return type => {
        let text = this.$t('term.autoexec.toollibrary');
        if (type == 'script') {
          text = this.$t('page.custom');
        } else if (type == 'tool') {
          text = this.$t('term.autoexec.toollibrary');
        }
        return text;
      };
    },
    geScriptType() {
      return (step) => {
        let type = 'common';
        if (step.operationName == 'native/IF-Block') {
          type = 'ConditionTool';
        } else if (step.operationName == 'native/LOOP-Block') {
          type = 'LoopBlock';
        }
        return type;
      };
    }
  },
  watch: {
    phaseOperationList: {
      handler(val) {
        //判断是否相等
        if (val && !this.$utils.isSame(val, this.list)) {
          this.list = val.map((v, vindex) => {
            if (v.config) {
              if (v.operationName != 'native/IF-Block' && v.operationName != 'native/LOOP-Block') {
                this.$set(v.config, 'profileId', v.config.profileId || null);
              }
            }
            return {
              ...v,
              uuid: v.uuid || this.$utils.setUuid()
            };
          });
          this.updatedSort();
        }
      },
      deep: true,
      immediate: true
    },
    list: {
      handler(val) {
        if (this.canEdit) {
          this.$emit('sortList', val, this.isUpdateSort);
        }
      },
      deep: true
    },
    validPhaseOperationUuidList: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          val.forEach(item => {
            mutationsScript.setCombopPhaseShowMap(item, true);
          });
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.phaseOperationList {
  > li {
    padding: 0 0 10px;
    // &:last-of-type{
    //   padding-bottom: 0px;
    // }
    .inner-block {
      padding: 16px 16px 10px;
      .script-title {
        width: 100%;
        padding-left: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid;
        .item-actionIcon{
          position: absolute;
          top: 0;
          right: 0;
          opacity: 0;
        }
        .item-index{
          position: absolute;
          top: 2px;
          left: 0;
          font-style: normal;
          font-size: 80%;
        }
        .item-toggle{
          cursor: pointer;
          width: 16px;
          display: inline-block;
          &:before {
            content: '\e9d5'; // tsfont-up
          }
        }
      }
      ::v-deep .script-detail {
        padding: 0 16px;
        .failPolicy-item{
          .ivu-radio-wrapper:not(:last-of-type){
            margin-right: 30px;
          }
        }
      }
      &:hover{
        .item-actionIcon{
          opacity: 1;
        }
      }
    }
  }

  &.drag_start li .show-li,
  li .hide-li {
    &.inner-block {
      .item-toggle {
        &:before {
          content: '\e892'; // tsfont-down
        }
      }
      .script-title {
        border-color: transparent !important;
        padding-bottom: 6px;
      }
      ::v-deep .script-detail {
        display: none;
      }
    }
  }
  &.edit_true{
    .script-title{
      .item-sort{
        position: absolute;
        top: 2px;
        left: 0;
        cursor: move;
        width: 16px;
        opacity: 0;
      }
      .item-index{
        cursor: move;
      }

    }
    >li:hover{
      .item-sort{
        opacity: 1 !important;
      }
      .item-index{
        display: none;
      }
    }
  }
}
::v-deep .list-title {
  margin: 16px 0;
}
.script-title {
  display: block;
  text-align: left;
  position: relative;
  padding-right: 64px;
  &:before{
    margin-right: 4px;
    font-size: 120%;
  }
  .item-delete,.item-copy{
    cursor: pointer;
    width: 16px;
    text-align: center;
    margin-right: 8px;
    display: inline-block;
    // opacity: 0;
  }
  .name{
    padding-right: 10px;
    // font-weight: 550;
  }
  .description{
    position: relative;
    max-width: 100%;
    padding-top: 6px;
    padding-left: 6px;
    font-size: 12px;
    display: inline-block;
    padding-right: 20px;
    min-height: 24px;
    .edit-des{
      position: absolute;
      right: 0;
    }
  }
}
</style>
