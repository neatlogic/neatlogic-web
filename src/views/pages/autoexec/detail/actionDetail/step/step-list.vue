<template>
  <div :class="'step-container edit_' + canEdit" :style="isRunner ? 'padding:10px;' : ''">
    <div
      id="stepUl"
      class="step-main"
      :style="transformStyle"
      style="padding-top:1px"
    ><!--为了让上边框可以显示，需要加1pxpadding-->
      <draggable
        v-if="stepList && stepList.length"
        class="stepList clearfix"
        :class="'step-' + canEdit"
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
            :class="{ edit: canEdit }"
            class="border-color"
          >
            <span
              class="stepIndex border-color tsfont bg-op"
              :class="{ 'text-primary border-primary': ary.find(item => item.uuid == value) }"
              :data-index="sindex + 1"
              :title="canEdit ? $t('term.deploy.dragtochangetheorder') : ''"
              @click.stop
            ></span>
            <ul>
              <li
                v-for="step in ary"
                :id="step.uuid == value ? 'stepActive' : ''"
                :key="step.uuid"
                class="cursor-pointer step-li radius-sm border-color"
                :class="{ edit: canEdit }"
                @click="selectStep(step)"
              >
                <div class="radius-lg padding-sm" :class="step.uuid == value ? 'active bg-selected' : 'border border-color'">
                  <div class="stepName name overflow text-action" :class="{ 'text-primary': step.uuid == value }" :title="step.name && step.name.length > 9 ? step.name : ''">{{ step.name || '-' }}</div>
                  <!-- <div class="text-grey overflow" style="line-height:2">{{ step.name || '-' }}</div> -->
                  <div class="stepType">
                    <span class="text-grey fz10">{{ getExecModeText(step.execMode) }}</span>
                  </div>
                  <div v-if="canEdit" class="stepBtn" @click.stop>
                    <div class="action-group line radius-lg" :class="step.uuid == value ?'bg-selected':'bg-grey'">
                      <span class="tsfont-plus action-item" @click="editStep(null, sindex, step.groupUuid)">{{ $t('page.phase') }}</span>
                      <span class="tsfont-edit action-item" @click="editStep(step, sindex, step.groupUuid)">{{ $t('page.edit') }}</span>
                      <span class="tsfont-trash-o action-item" @click="delStep(step, sindex)">{{ $t('page.delete') }}</span>
                    </div>
                  </div>
                  <div v-else-if="!canEdit || isRunner" class="stepBtn" @click.stop>
                    <div class="tsfont-eye pt-xs pb-xs radius-lg text-action" :class="step.uuid == value ?'bg-selected':'bg-grey'" @click.stop="editStep(step, null, step.groupUuid)">
                      {{ $t('page.view') }}
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </template>
      </draggable>
    </div>
    <div
      v-if="canEdit"
      class="block-add text-href"
      :class="{ 'margin-md': !stepList || !stepList.length }"
      @click="editStep()"
    >
      <i class="tsfont-plus bg-op btn-add"></i>
      {{ !stepList || !stepList.length ? $t('dialog.title.addtarget', {target: $t('page.phase')}) : '' }}
    </div>
    <StepEdit
      v-if="isEdit"
      :id="id"
      :config="editConfig"
      :canEdit="canEdit"
      :stepList="list"
      :isShow="isEdit"
      :scriptLength="editScriptLength"
      :execModeList="execModeList"
      :groupConfig="groupConfig"
      :prevStepList="getPrev(editConfig, stepList)"
      :runtimeParamList="runtimeParamList"
      @close="close"
    ></StepEdit>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import StepEdit from './edit/step-edit.vue';
import { store, mutations } from '@/views/pages/autoexec/detail/actionDetail/actionState.js';
export default {
  name: 'StepList',
  components: {
    draggable,
    StepEdit
  },
  filters: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    id: [Number, String], //组合工具id
    canEdit: {
      //是否可以编辑 ，允许改变顺序、编辑修改、新增
      type: [Boolean],
      default: true
    },
    stepList: {
      //阶段数组
      type: Array
    },
    value: {
      type: [String, Boolean, Number],
      default: false
    },
    currentScriptLength: {
      type: Number,
      default: 0
    },
    scrollTop: Number,
    isRunner: {
      type: [Boolean],
      default: false
    },
    execModeList: {
      type: Array
    },
    scrollLeft: Number,
    runtimeParamList: Array
  },
  data() {
    return {
      list: [],
      isEdit: false,
      editConfig: null,
      editScriptLength: 0,
      editId: null, //当前编辑的步骤
      transformStyle: {},
      height: 200,
      groupConfig: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let _this = this;
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    selectStep(item) {
      this.$emit('change', item.uuid, item);
    },
    editStep(config, oindex, groupUuid) {
      this.editId = config ? config.uuid : null;
      this.isEdit = true;
      this.editConfig = config || { name: '', config: {} };
      this.editScriptLength = config ? config.scriptLength : 0;
      this.oindex = oindex;
      this.groupConfig = null;
      if (groupUuid) {
        let findItem = this.combopGroupList.find(item => item.uuid == groupUuid);
        findItem && (this.groupConfig = findItem);
      }
      if (config) {
        this.selectStep(config);
      }
    },
    delStep(config, oindex) {
      let _this = this;
      _this.$createDialog({
        title: _this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {target: config.name}),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          _this.list[oindex] = _this.list[oindex].filter(l => {
            return l.name != config.name;
          });
          _this.list[oindex].length == 0 && _this.list.splice(oindex, 1);
          if (_this.list.length) {
            _this.$emit('change', _this.list[0][0].uuid);
          } else {
            _this.$emit('change', null);
          }
          let stepList = this.getUpdateSort();
          this.updatedCombopGroupList(stepList);
          this.$emit('updateSort', stepList);
        }
      });
    },
    close(data, executeConfig) {
      if (data) {
        //如果有数据，要么是新增要么是修改
        if (data.name) {
          if (executeConfig) {
            data.executeConfig = executeConfig;
          }
          if (this.editId) {
            //修改
            Object.assign(this.editConfig, data);
            this.list[this.oindex] && this.list[this.oindex].forEach((i, index) => {
              if (i.uuid === this.editId) {
                this.$set(this.list[this.oindex], index, this.editConfig);
              } 
            });
          } else if (!this.$utils.isEmpty(this.oindex)) {
            //同组新增
            Object.assign(data, {
              uuid: this.$utils.setUuid(),
              sort: this.groupConfig && this.groupConfig.policy == 'oneShot' ? this.list[this.oindex][0].sort : this.list[this.oindex][0].sort + 1,
              groupSort: this.list[this.oindex][0].groupSort,
              groupUuid: this.list[this.oindex][0].groupUuid
            });
            this.list[this.oindex].push(data);
          } else {
            //增加分组
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
            mutations.setCombopGroupList(this.combopGroupList);
          }
        }
        this.$emit('updateSort', this.getUpdateSort());
        this.selectStep(data);
      }

      this.isEdit = false;
      this.editConfig = null;
      this.editScriptLength = 0;
      this.editId = null;
    },
    dragEnd() {
      let stepList = this.getUpdateSort();
      this.updatedCombopGroupList(stepList);
      this.$emit('updateSort', stepList);
    },
    getUpdateSort() {
      let stepUuidList = [];
      return this.list.reduce((list, data, index) => {
        let findItem = this.combopGroupList.find(c => c.uuid == data[0].groupUuid);
        data.forEach((item, subIndex) => {
          item.groupSort = index;
          stepUuidList.push(item.uuid);
          if (findItem) {
            findItem.policy == 'oneShot' && (item.sort = 0);
            findItem.policy == 'grayScale' && (item.sort = subIndex);
          }
          //阶段发生改变时，清空不存在的上游节点参数
          if (item.config) {
            if (!this.$utils.isEmpty(item.config.executeConfig) && !this.validExecutePreOutputList(item.config.executeConfig, stepUuidList)) {
              this.$set(item.config.executeConfig, 'executeNodeConfig', {});
            }
            this.updateToolPreOutputList(item.config.phaseOperationList, stepUuidList);
          }
        });
        list.push(...data);
        return list;
      }, []);
    },
    scroll(top) {
      if (this.$el) {
        this.$set(this, 'transformStyle', {
          overflow: 'auto'
        });
      } else {
        this.$set(this, 'transformStyle', {
          overflow: 'auto'
        });
      }
    },
    renderHeight() {
      this.totalheight = window.innerHeight || document.body.clientHeight;
      this.$el && (this.height = this.totalheight - this.$el.querySelector('#stepUl').getBoundingClientRect().top - 20);
      this.$set(this, 'transformStyle', {
        overflow: 'auto',
        height: this.height + 'px'
      });
    },
    updatedCombopGroupList(stepList) {
      //新的组列表
      let newList = [];
      stepList.forEach(item => {
        let findItem = this.combopGroupList.find(c => c.uuid == item.groupUuid);
        if (findItem) {
          findItem.sort = item.groupSort;
          newList.push(findItem);
        }
      });
      let combopGroupList = newList.reduce((list, item) => {
        if (list.findIndex(e => e.uuid == item.uuid) === -1) {
          list.push(item);
        }
        return list;
      }, []);
      combopGroupList.sort((a, b) => {
        return a.sort - b.sort;
      });
      mutations.setCombopGroupList(combopGroupList);
    },
    validExecutePreOutputList(executeConfig, stepUuidList) { //校验阶段上游节点参数
      let isValid = true;
      if (!this.$utils.isEmpty(executeConfig.executeNodeConfig) && 
          !this.$utils.isEmpty(executeConfig.executeNodeConfig.preOutputList) &&
          !stepUuidList.includes(executeConfig.executeNodeConfig.preOutputList[0])
      ) {
        isValid = false;
      }
      return isValid;
    },
    updateToolPreOutputList(phaseOperationList, stepUuidList) { //阶段发生改变时，清除不存在的工具上游节点参数
      if (phaseOperationList && phaseOperationList.length) {
        phaseOperationList.forEach(p => {
          if (p.config.paramMappingList && p.config.paramMappingList.length) {
            p.config.paramMappingList.forEach(m => {
              if ((m.mappingMode === 'prenodeoutputparam' || m.mappingMode === 'prenodeoutputparamkey') && (this.$utils.isEmpty(m.value) && !stepUuidList.includes(m.value[0]))) {
                this.$set(m, 'value', []);
              }
            });
          }
          if (p.config.argumentMappingList && p.config.argumentMappingList.length) {
            p.config.argumentMappingList.forEach(a => {
              if ((a.mappingMode === 'prenodeoutputparam' || a.mappingMode === 'prenodeoutputparamkey') && (this.$utils.isEmpty(a.value) && !stepUuidList.includes(a.value[0]))) {
                this.$set(a, 'value', []);
              }
            });
          }
        });
      }
    }
  },
  computed: {
    getExecModeText() {
      return function(value) {
        let currentItem = this.execModeList.find(li => {
          return li.value == value;
        });
        return currentItem ? currentItem.text : '';
      };
    },
    combopGroupList() {
      //组设置列表
      return store.combopGroupList; //使用Vue.observable()进行状态管理
    },
    getPrev() {
      return function(config, list) {
        let uk = config.uuid;
        let index = list.findIndex(l => {
          return l.uuid == uk;
        });
        if (index === -1) { 
          if (!this.$utils.isEmpty(this.oindex)) {
            //同组增加阶段
            index = this.oindex;
          } else {
            //增加分组
            index = list.length;
          }
        }
        let newList = list.filter((s, sindex) => {
          return sindex < index && s.groupUuid != config.groupUuid;
        });
        if (!newList || !newList.length) {
          return [];
        } else {
          let allPrevOutputList = [];
          if (newList && newList.length) {
            newList.forEach(l => {
              if (l.config && l.config.phaseOperationList && l.config.phaseOperationList.length) {
                l.config.phaseOperationList.forEach(p => {
                  if (p.operation.outputParamList && p.operation.outputParamList.length) {
                    let item = p.operation.outputParamList;
                    item.forEach(i => {
                      allPrevOutputList.push({
                        ...i,
                        combopName: l.name,
                        combopId: l.id,
                        combopUuid: l.uuid,
                        operationId: p.operationId,
                        operationName: p.operationName,
                        operationUuid: p.uuid,
                        operationLetter: p.letter || null,
                        operationDes: p.description
                      });
                    });
                  }
                });
              }
            });
          }
          return allPrevOutputList;
        }
      };
    }
  },
  watch: {
    stepList: {
      handler(val) {
        let isSame = this.$utils.isSame(val, this.oldliststr);
        this.oldliststr = val;
        if (!isSame) {
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
              arr.length && list.push(arr);
            }
          }
          this.list = list;
        }
      },
      deep: true,
      immediate: true
    },
    scrollTop: {
      handler(val) {
        this.scroll(val);
      },
      deep: true,
      immediate: true
    }
    /*点击时不想自动定位，先注释
    value: {
      handler(val) {
        if (val && !this.isRunner) {
          this.$nextTick(() => {
            if (this.$el && this.$el.querySelector('#stepUl') && this.$el.querySelector('#stepActive')) {
              //let scrollLeft = this.$el.querySelector('#stepActive').offsetLeft + 0.5 * this.$el.querySelector('#stepActive').clientWidth - this.$el.querySelector('#stepUl').scrollLeft;
              //if (scrollLeft > this.$el.querySelector('#stepUl').clientWidth) {
              try {
                this.$el.querySelector('#stepActive').scrollIntoView(true);
              } catch (e) {
                //
              }

              //}
            }
          });
        }
      },
      deep: true,
      immediate: true
    }*/
  }
};
</script>
<style lang="less" scoped>
@iconWidth: 24px;
.border {
  border-width: 1px;
  border-style: solid;
}
ul.stepList {
  word-break: keep-all;
  white-space: nowrap;
  > li {
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
        .stepIndex {
          cursor: ns-resize;
          &::before {
             content: '\e828'; // tsfont-bar
          }
        }
      }
    }
    .stepIndex {
      position: absolute;
      top: 1px;
      width: @iconWidth;
      height: @iconWidth;
      left: 0;
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
    margin-bottom: 16px;
    > ul {
      > li {
        margin-bottom: 6px;
        &:last-of-type {
          margin-bottom: 0px;
        }
      }
    }

    &.active {
      border: 0 none;
    }

    &.step-li {
      .stepName {
        padding-left: 4px;
      }
      .stepBtn {
        position: absolute;
        right: 0;
        bottom: 1px;
        width: 100%;
        padding: 0 1px;
        text-align: center;
        display: none;
        .action-group {
          display: flex;
          width: 100%;
          padding: 4px 0;
        }
        .action-item {
          padding: 0px 2px;
          flex: 1;
        }
      }
      &:hover {
        .stepBtn {
          display: block;
        }
      }
    }

    .stepName {
      height: @iconWidth;
      position: relative;
      .name {
        line-height: @iconWidth;
        max-width: 100%;
        display: inline-block;
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
  }
  &.step-false {
    > li:last-of-type:before {
      display: none;
    }
  }
}
.step-container {
  overflow: auto;
  height: 100%;
  &.edit_true {
    .step-main {
      max-height: calc(100% - 34px);
      overflow: auto;
    }
  }
}
.block-add {
  .btn-add {
    width: @iconWidth;
    height: @iconWidth;
    line-height: calc(@iconWidth - 1px);
    border-radius: 50%;
    border: 1px solid;
    display: inline-block;
    text-align: center;
    margin-top: 3px;
    &:before {
      margin-right: 0;
    }
  }
}
</style>
