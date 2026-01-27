<template>
  <div>
    <div class="pb-sm">
      <span class="tsfont-plus text-href" @click="addData()">{{ $t('page.condition') }}</span>
    </div>
    <div v-for="(item, index) in list" :key="index" class="bg-op mb-sm padding radius-md setvalue-list">
      <ConditionGroup
        :ref="'condition_setvalue'"
        reactionKey="setvalue"
        :value="item"
        :formItemList="formItemList"
        :formItem="formItem"
        @input="
          rule => {
            setReaction(rule, index);
          }
        "
      ></ConditionGroup>
      <template v-if="!$utils.isEmpty(item)">
        <div class="mt-sm mb-sm text-grey">{{ $t('term.framework.assignment') }}</div>
        <!--isDynamicValue: 是否可以动态赋值  -->
        <div v-if="formItem.isDynamicValue" class="pb-sm">
          <TsFormRadio
            :value="item.type || 'static'"
            :dataList="typeDataList"
            @change="
              val => {
                $set(item, 'type', val);
                $set(item, 'value', null);
              }
            "
          ></TsFormRadio>
        </div>
        <!--dynamic:动态赋值  -->
        <TsFormSelect
          v-if="item.type === 'dynamic'"
          ref="setValue_value"
          :value="item.value"
          :dataList="hasValueFormItemList"
          valueName="uuid"
          textName="label"
          border="border"
          :validateList="validateList"
          transfer
          @on-change="
            val => {
              $set(item, 'value', val);
            }
          "
        ></TsFormSelect>
        <FormItem
          v-else
          ref="setValue_value"
          :formItem="getFormItem()"
          :value="item.value"
          mode="condition"
          :showStatusIcon="false"
          isCustomValue
          :isNeedVadliValidate="true"
          @change="
            val => {
              $set(item, 'value', val);
            }
          "
        ></FormItem>
      </template>
      <div class="del-item text-tip-active" @click="delItem(index)">
        <i class="tsfont-close"></i>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ConditionGroup: () => import('@/resources/plugins/TsSheet/form/config/common/condition-group.vue'),
    FormItem: () => import('@/resources/plugins/TsSheet/form-item.vue'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    value: {
      type: [Array, Object],
      default: null
    },
    formItem: {
      type: Object,
      default: () => {}
    },
    formItemList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      typeDataList: [
        {
          text: this.$t('term.autoexec.static'),
          value: 'static'
        },
        {
          text: this.$t('page.dynamicvalue'),
          value: 'dynamic'
        }
      ],
      list: [],
      validateList: ['required']
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (!this.$utils.isEmpty(this.value)) {
        const value = this.$utils.deepClone(this.value);
        if (Array.isArray(value)) {
          this.list = value;
        } else {
          this.list.push(value);
        }
      }
    },
    addData() {
      let rule = {
        conditionGroupRelList: [],
        conditionGroupList: []
      };
      let group = {
        uuid: this.$utils.setUuid(),
        conditionList: [
          {
            uuid: this.$utils.setUuid(),
            formItemUuid: null,
            expression: '',
            valueList: []
          }
        ],
        conditionRelList: []
      };
      rule.conditionGroupList.push(group);
      this.list.push(rule);
    },
    setReaction(rule, index) {
      if (!this.$utils.isSame(rule, this.list[index])) {
        this.list[index] = rule;
      }
      if (this.$utils.isEmpty(rule)) {
        this.list.splice(index, 1);
      }
    },
    valid() {
      let isValid = true;
      for (let key in this.$refs) {
        this.$refs[key].forEach(condition => {
          if (condition && condition.valid && !condition.valid()) {
            isValid = false;
          } 
        });
      }
      return isValid;
    },
    getFormItem() {
      let findItem = this.$utils.deepClone(this.formItem);
      findItem.config.isRequired = true;
      return findItem;
    },
    delItem(index) {
      this.list.splice(index, 1);
    }
  },
  filter: {},
  computed: {
    hasValueFormItemList() {
      let list = this.formItemList.filter(d => d.hasValue && (!this.formItem || (this.formItem && d.uuid != this.formItem.uuid)) && !d.excludedFromCondition);
      let newList = [];
      list.forEach(item => {
        let obj = {
          label: item.label,
          uuid: item.uuid
        };
        let children = [];
        if (!this.$utils.isEmpty(item?.config?.hiddenFieldList)) {
          item.config.hiddenFieldList.forEach(a => {
            children.push({
              label: item.label + '.' + a.text,
              uuid: item.uuid + '#' + a.value
            });
          });
        }
        newList.push(obj);
        if (!this.$utils.isEmpty(children)) {
          newList.push(...children);
        }
      });
      return newList;
    }
  },
  watch: {
    list: {
      handler(newVal, oldVal) {
        this.$emit('input', newVal);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.setvalue-list {
  position: relative;
  .del-item {
    position: absolute;
    top: 0;
    right: 6px;
  }
}
</style>
