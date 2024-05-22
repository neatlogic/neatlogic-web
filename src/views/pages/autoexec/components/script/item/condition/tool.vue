<template>
  <div class="">
    <div class="pb-sm">
      <span class="text-title pr-sm">{{ title }}</span>
      <span v-if="canEdit" class="tsfont-plus text-href" @click="isAdd = true">{{ $t('term.autoexec.tool') }}</span>
    </div>

    <div v-if="phaseOperationList&& phaseOperationList.length" class="config-list">
      <ConditionToolList
        ref="conditionToolList"
        :phaseOperationList="phaseOperationList"
        :canEdit="canEdit"
        :stepIndex="prevStepList && prevStepList.length||0"
        :prevStepList="prevStepList"
        :combopConfig="combopConfig"
        :paramList="paramList"
        :paramsTypeList="paramsTypeList"
        :failPolicyOption="failPolicyOption"
        :inputTypeList="inputTypeList"
        :execMode="execMode"
        @sortList="sortList"
      ></ConditionToolList>
    </div>
    <AddOperation
      v-if="isAdd"
      :type="execMode"
      :isShow="isAdd"
      :excludeList="excludeList"
      :selectedOption="getSelected(phaseOperationList)"
      @close="close"
    ></AddOperation>
  </div>
</template>
<script>
import itemmixin from '@/views/pages/autoexec/components/script/item/itemmixin.js';
export default {
  name: '',
  components: {
    ConditionToolList: () => import('./condition-tool-list'),
    AddOperation: () => import('@/views/pages/autoexec/detail/actionDetail/step/edit/operation-add')
  },
  mixins: [itemmixin],
  model: {
    prop: 'list',
    event: 'change'
  },
  props: {
    title: String,
    list: Array // 工具列表
  },
  data() {
    return {
      isAdd: false,
      phaseOperationList: [],
      excludeList: []
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
    async close(list) {
      this.isAdd = false;
      if (list && list.length) {
        list.forEach(async(l) => {
          let prevlength = this.phaseOperationList.filter(p => { return p.id == l.id; });
          let defaulParam = [];
          if (l.inputParamList && l.inputParamList.length) {
            let profileParamVoList = [];
            if (l.defaultProfileId) { //预设参数集列表
              let res = await this.$api.autoexec.profile.getProfileDetailById(l.defaultProfileId);
              profileParamVoList = res.Return.profileParamVoList || [];
            }
            defaulParam = l.inputParamList.map(i => {
              let mappingMode = !this.$utils.isEmpty(i.defaultValue) ? (i.mappingMode ? i.mappingMode : 'constant') : (i.isRequired ? 'constant' : 'isempty');
              let value = i.defaultValue || '';
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
          if (l.defaultProfileId) {
            this.$set(item.config, 'profileId', l.defaultProfileId);
          }
          this.phaseOperationList.push(item);
        });
      }
    },
    sortList(list) {
      if (list && list.length) {
        this.phaseOperationList = list;
      } else {
        this.phaseOperationList = [];
      }
    },
    valid() {
      this.$refs.conditionToolList && this.$refs.conditionToolList.valid();
    }
  },
  filter: {},
  computed: {
    getSelected() {
      return function(list) {
        if (list && list.length) {
          return list.map(l => {
            return l.id;
          });
        } else {
          return [];
        }
      };
    }
  },
  watch: {
    phaseOperationList: {
      handler: function(val) {
        if (val) {
          let isSame = this.$utils.isSame(val, this.list);
          !isSame && this.$emit('changeOperation', this.$utils.deepClone(val));
        }
      },
      deep: true
    },
    config: {
      handler(val) {
        if (val) {
          this.excludeList = [val.operationId];
        }
      },
      immediate: true,
      deep: true
    },
    list: {
      handler(val) {
        if (val && !this.$utils.isSame(val, this.phaseOperationList)) {
          this.phaseOperationList = val;
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
