<template>
  <div class="script-container" :class="{edit:!canEdit && !isRunner}">
    <div :style="getHeight(height,totalheight)">
      <div v-if="phaseOperationList&& phaseOperationList.length &&(config.uuid == currentStep)" class="config-list">
        <ScriptList
          ref="list"
          :phaseOperationList="phaseOperationList"
          :canEdit="canEdit"
          :stepIndex="prevStepList && prevStepList.length||0"
          :prevStepList="getPrev(prevStepList)"
          :combopConfig="getCombopConfig(config)"
          :paramList="paramList"
          :paramsTypeList="paramsTypeList"
          :failPolicyOption="failPolicyOption"
          :inputTypeList="inputTypeList"
          :execMode="execMode"
          :operationType="operationType"
          @sortList="sortList"
        ></ScriptList>
      </div>
      <NoData v-else-if="!canEdit"></NoData>
    </div>
    <div v-if="canEdit && operationType=='combop'" class="add-bar">
      <Button type="primary" ghost @click.native="addOperation">
        <span class="text-href tsfont-plus add-text">
          {{ $t('term.autoexec.tool') }}
        </span>
      </Button>
    </div>
    <AddOperation
      v-if="isAdd"
      :type="execMode"
      :isShow="isAdd"
      :selectedOption="getSelected(phaseOperationList)"
      @close="close"
    ></AddOperation>
  </div>
</template>
<script>
import ScriptList from '@/views/pages/autoexec/components/script/script-list.vue';
export default {
  name: 'StepConfig',
  components: {
    ScriptList,
    AddOperation: resolve => require(['./edit/operation-add.vue'], resolve)
  },
  filters: {},
  props: { 
    canEdit: {//是否可以编辑 ，允许改变顺序、编辑修改、新增
      type: [Boolean],
      default: true
    },
    list: [Object, Array],
    execMode: String,
    prevStepList: Array,
    currentStep: [String, Number],
    config: Object,
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
    isRunner: {
      type: [Boolean],
      default: false      
    },
    execModeList: {
      type: Array,
      default() {
        return [];
      }      
    },
    operationType: { //组合工具类型不是combop时，只能修改输入参数，预设参数、自由参数，不可对阶段信息进行修改
      type: String,
      default: 'combop'
    }
  },
  data() {
    return {
      isAdd: false,
      height: 100,
      totalheight: 200,
      phaseOperationList: [],
      finnalList: [],
      failPolicyOption: [],
      inputTypeList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getFailPolicyOption();
    await this.getInputTypeList();
    let _this = this;
    if (!this.isRunner) {
      this.totalheight = window.innerHeight || document.body.clientHeight;
      this.$nextTick(() => {
        this.height = this.$el.getBoundingClientRect().top;
      });
      window.addEventListener('resize', _this.renderHeight);
    }
  },
  beforeUpdate() {},
  updated() {
  },
  activated() {
  },
  deactivated() {},
  beforeDestroy() {
    let _this = this;
    if (!this.isRunner) {
      window.removeEventListener('resize', _this.renderHeight);
    }
  },
  destroyed() {},
  methods: {
    addOperation() {
      this.isAdd = true;
    },
    async close(list) {
      this.isAdd = false;
      if (list && list.length) {
        list.forEach(async(l) => {
          let prevlength = this.phaseOperationList.filter(p => { return p.operationId == l.operationId; });
          let defaulParam = [];
          if (l.inputParamList && l.inputParamList.length) {
            let profileParamVoList = [];
            if (l.defaultProfileId) { //预设参数集列表
              let res = await this.$api.autoexec.profile.getProfileDetailById(l.defaultProfileId);
              profileParamVoList = res.Return.profileParamVoList || [];
            }
            defaulParam = l.inputParamList.map(i => {
              let mappingMode = !this.$utils.isEmpty(i.defaultValue) ? (i.mappingMode ? i.mappingMode : 'constant') : (i.isRequired ? 'constant' : 'isempty');
              let value = !this.$utils.isEmpty(i.defaultValue) ? i.defaultValue : '';
              if (profileParamVoList.length > 0) { //选择工具，预设参数集列表
                let findItem = profileParamVoList.find(p => {
                  return p.key == i.key && p.type == i.type && !this.$utils.isEmpty(p.defaultValue);
                });
                if (findItem) {
                  mappingMode = 'profile';
                  value = findItem.defaultValue;
                }
              }
              return {
                mappingMode: mappingMode,
                key: i.key,
                value: value,
                type: i.type
              };
            });
          }
          let item = {
            'operationName': l.name,
            'operationType': l.operationType,
            'operationId': l.operationId,
            'failPolicy': 'stop',
            'config': {},
            'uuid': l.uuid || this.$utils.setUuid(),
            'letter': prevlength.length ? this.$utils.translateNumber(parseInt(prevlength.length), 'en') : null,
            'description': l.description,
            'operation': {
              'argument': l.argument || null, //自由参数
              'riskVo': l.riskVo,
              'inputParamList': l.inputParamList || [],
              'outputParamList': l.outputParamList || [],
              'description': l.description
            }
          };
          if (l.name == 'native/IF-Block') {
            this.$set(item.config, 'condition', '');
            this.$set(item.config, 'ifList', []);
            this.$set(item.config, 'elseList', []);
          } else {
            this.$set(item.config, 'paramMappingList', defaulParam);
            if (l.defaultProfileId) {
              this.$set(item.config, 'profileId', l.defaultProfileId);
            }
          }
          this.phaseOperationList.push(item);
          this.$nextTick(() => {
            this.$refs.list.updateList(this.phaseOperationList);
          });  
        });
      }
    }, 
    getOperationList() {
      if (this.phaseOperationList && this.phaseOperationList.length) {
        return this.phaseOperationList;
      } else {
        return [];
      }
    },
    sortList(list) {
      if (list && list.length) {
        this.phaseOperationList = list;
      } else {
        this.phaseOperationList = [];
      }
    },
    updateList() {
      this.phaseOperationList = this.$utils.deepClone(this.list);
      if (this.$refs.list) {
        this.$refs.list.updateList(this.phaseOperationList);
      }
    },
    renderHeight() {
      this.totalheight = window.innerHeight || document.body.clientHeight;
      this.$el && (this.height = this.$el.getBoundingClientRect().top);
    },
    valid() {
      if (!this.phaseOperationList || !this.phaseOperationList.length) {
        return this.$t('page.notarget', {target: this.$t('term.autoexec.tool')});
      } else {
        if (this.$refs.list) {
          return this.$refs.list.valid();
        } else {
          return true;
        }
      }
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
    refreshProfile() {
      this.$refs.list && this.$refs.list.refreshProfile();
    }
  },
  computed: {
    getHeight() {
      return function(height, totalheight) {
        if (!this.isRunner) {
          return {
            'overflow': 'auto',
            'max-height': typeof height == 'number' ? (this.canEdit ? (totalheight - height - 30 - 20) : (totalheight - height - 20)) + 'px' : height
          };
        } else {
          return {};
        }
      };
    },
    getSelected() {
      return function(list) {
        if (list && list.length) {
          return list.map(l => {
            return l.operationId;
          });
        } else {
          return [];
        }
      };
    },
    getPrev() {
      return function(list) {
        if (!list || !list.length) {
          return [];
        } else {
          let allPrevOutputList = [];
          if (list && list.length) {
            list.forEach(l => {
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
    },
    getCombopConfig() {
      return function(item) {
        if (item && Object.keys(item).length) {
          return {
            combopName: item.name,
            combopId: item.id,
            combopUuid: item.uuid
          };
        } else {
          return {};
        }
      };
    }
  },
  watch: {
    'phaseOperationList': {
      handler: function(val) {
        if (val) {
          let isSame = this.$utils.isSame(val, this.list);
          !isSame && this.$emit('changeOperation', this.$utils.deepClone(val));
        }
      },
      deep: true
    },
    list: {
      handler: function(val) {
        if (val) {
          let isSame = this.$utils.isSame(val, this.phaseOperationList);
          if (!isSame) {
            this.updateList();
          }
        }
      },
      deep: true,
      immediate: true
    }

  }

};
</script>
<style lang="less" scoped>
.script-container{
  position: relative;
  padding-top: 1px;
  &:not(.edit){
    padding-bottom: 30px;
    min-height: 34px;
  }
  .add-bar{
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
  }
}

</style>
