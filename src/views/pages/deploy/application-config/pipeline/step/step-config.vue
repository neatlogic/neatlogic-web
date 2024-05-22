<template>
  <div class="script-container">
    <div v-if="phaseOperationList&& phaseOperationList.length" class="config-list">
      <ScriptList
        ref="list"
        :phaseOperationList="phaseOperationList"
        :canEdit="canEdit"
        :stepIndex="prevStepList && prevStepList.length||0"
        :prevStepList="getPrev(prevStepList)"
        :combopConfig="getCombopConfig(currentStepConfig)"
        :paramList="runtimeParamList"
        :paramsTypeList="inputTypeList"
        :failPolicyOption="failPolicyOption"
        :inputTypeList="inputTypeList"
        :execMode="currentStepConfig.execMode"
        @sortList="sortList"
      ></ScriptList>
    </div>
    <div v-if="canEdit" class="add-bar">
      <span class="text-href tsfont-plus" @click="addOperation">
        {{ $t('dialog.title.addtarget', {target: $t('term.autoexec.tool')}) }}
      </span>
    </div>
    <AddOperation
      v-if="isAdd"
      :type="currentStepConfig.execMode"
      :isShow="isAdd"
      :selectedOption="getSelected(phaseOperationList)"
      @close="close"
    ></AddOperation>
  </div>
</template>
<script>
export default {
  name: 'StepConfig',
  components: {
    ScriptList: () => import('@/views/pages/autoexec/components/script/script-list.vue'),
    AddOperation: () => import('@/views/pages/deploy/application-config/pipeline/step/type/operation-add.vue')
  },
  filters: {},
  props: {
    canEdit: {
      type: Boolean,
      default: true
    },
    currentStepConfig: Object, //阶段详情数据
    prevStepList: Array,
    runtimeParamList: Array, //作业参数
    list: Array, //工具列表
    failPolicyOption: Array, //失败策略下拉列表
    inputTypeList: Array //输入参数映射下拉
  },
  data() {
    return {
      isAdd: false,
      phaseOperationList: [],
      finnalList: [],
      stepConfig: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {
  },
  activated() {
  },
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      this.stepConfig = this.$utils.deepClone(this.currentStepConfig);
      if (this.stepConfig && this.stepConfig.config) {
        this.phaseOperationList = this.stepConfig.config.phaseOperationList || [];
      } else {
        this.phaseOperationList = [];
      }
      if (this.$refs.list) {
        this.$refs.list.updateList(this.phaseOperationList);
      }
    },
    addOperation() {
      this.isAdd = true;
    },
    close(list) {
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
                value: value
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
          this.$emit('changeOperation', this.$utils.deepClone(this.phaseOperationList));
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
      this.$emit('changeOperation', this.$utils.deepClone(this.phaseOperationList));
    },
    valid() {
      if (!this.phaseOperationList || !this.phaseOperationList.length) {
        return this.$t('term.deploy.chooseatleastonetool');
      } else {
        if (this.$refs.list) {
          return this.$refs.list.valid();
        } else {
          return true;
        }
      }
    }
  },
  computed: {
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
              if (l.config && l.config.phaseOperationList && l.config.phaseOperationList.length > 0) {
                l.config.phaseOperationList.forEach(p => {
                  if (!this.$utils.isEmpty(p.operation) && p.operation.outputParamList && p.operation.outputParamList.length > 0) {
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
                  } else if (p.operationName == 'native/IF-Block') {
                    if (p.config) {
                      if (p.config.ifList && p.config.ifList.length > 0) {
                        let ifList = p.config.ifList;
                        ifList.forEach(ifItem => {
                          if (ifItem.operation.outputParamList && ifItem.operation.outputParamList.length > 0) {
                            let item = ifItem.operation.outputParamList;
                            item.forEach(i => {
                              allPrevOutputList.push({
                                ...i,
                                combopName: l.name,
                                combopId: l.id,
                                combopUuid: l.uuid,
                                operationId: ifItem.operationId,
                                operationName: ifItem.operationName,
                                operationUuid: ifItem.uuid,
                                operationLetter: ifItem.letter || null,
                                operationDes: ifItem.description
                              });
                            });
                          }
                        });
                      }
                      if (p.config.elseList && p.config.elseList.length > 0) {
                        let elseList = p.config.elseList;
                        elseList.forEach(elseItem => {
                          if (elseItem.operation.outputParamList && elseItem.operation.outputParamList.length > 0) {
                            let item = elseItem.operation.outputParamList;
                            item.forEach(i => {
                              allPrevOutputList.push({
                                ...i,
                                combopName: l.name,
                                combopId: l.id,
                                combopUuid: l.uuid,
                                operationId: elseItem.operationId,
                                operationName: elseItem.operationName,
                                operationUuid: elseItem.uuid,
                                operationLetter: elseItem.letter || null,
                                operationDes: elseItem.description
                              });
                            });
                          }
                        });
                      }
                    }
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
    currentStepConfig: {
      handler: function(val, oldVal) {
        if (val) {
          let isSame = this.$utils.isSame(val, this.stepConfig);
          if (!isSame) {
            this.initData();
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
  .add-bar{
    width: 100%;
  }
}
</style>
