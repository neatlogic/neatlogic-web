<template>
  <div style="max-width:600px;width:100%">
    <div v-for="(condition, index) in conditionList" :key="index">
      <label class="text-grey">{{ condition.handlerName }}</label>
      <div>
        <SearchInputer
          mode="simple"
          :condition="condition"
          :workcenterConditionData="workcenterConditionDataLocal"
          @change="change"
        ></SearchInputer>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    SearchInputer: resolve => require(['./search-inputer.vue'], resolve)
  },
  props: {
    workcenterConditionData: { type: Object },
    conditionList: {type: Array}
  },
  data() {
    return {
      mode: 'simple',
      //conditionList: {}
      /**
       * 工单中心的数据保存一份在本地，当点击搜索时再对外提供
       * 注意：传递到searchInputer的数据会使用workcenterConditionDataLocal，这样子控件可以直接修改数据而不会影响真正的搜索数据
       */
      workcenterConditionDataLocal: {conditionGroupList: [], conditionGroupRelList: []}//
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getWorkcenterConditionData(handler) {
      //simple模式的conditionGroupList有且只有一个成员
      const conditionGroupList = this.workcenterConditionDataLocal?.conditionGroupList;
      if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
        for (let i = 0; i < conditionGroupList[0].conditionList.length; i++) {
          if (conditionGroupList[0].conditionList[i].name === handler) {
            return conditionGroupList[0].conditionList[i];
          }
        }
      }
      return null;
    },
    /* getSearchData() {
      //组装conditionRelList数据
      this.workcenterConditionDataLocal.conditionRelList = [];
      return this.workcenterConditionDataLocal;
    },*/
    change(condition, val, textStr) {
      const workcenterCondition = this.getWorkcenterConditionData(condition.handler);
      if (this.$utils.isEmpty(val)) {
        if (workcenterCondition) {
          if (this.workcenterConditionDataLocal.conditionGroupList.length > 0) {
            const conditionGroup = this.workcenterConditionDataLocal.conditionGroupList[0];
            if (conditionGroup.conditionList) {
              const index = conditionGroup.conditionList.findIndex(d => d.uuid == workcenterCondition.uuid);
              if (index > -1) {
                conditionGroup.conditionList.splice(index, 1);
              }
              //如果是channel，需要删除表单条件
              if (workcenterCondition.name == 'channel') {
                for (let i = conditionGroup.conditionList.length - 1; i >= 0; i--) {
                  const c = conditionGroup.conditionList[i];
                  if (c.type == 'form') {
                    conditionGroup.conditionList.splice(i, 1);
                  }
                }
              }
            }
            //如果没有任何条件则直接清空conditionGroupList
            if (conditionGroup.conditionList.length == 0) {
              this.workcenterConditionDataLocal.conditionGroupList.pop();
            }
          }
        }
      } else {
        if (workcenterCondition) {
          this.$set(workcenterCondition, 'valueList', (val instanceof Array ? val : [val]));
          this.$set(workcenterCondition, 'text', textStr);
        } else {
          if (this.workcenterConditionDataLocal.conditionGroupList.length == 0) {
            const newConditionGroup = {};
            newConditionGroup['uuid'] = this.$utils.setUuid();
            newConditionGroup['conditionList'] = [];
            newConditionGroup['conditionRelList'] = [];
            newConditionGroup['channelUuidList'] = [];
            this.workcenterConditionDataLocal.conditionGroupList.push(newConditionGroup);
          }
          const newConditionGroup = this.workcenterConditionDataLocal.conditionGroupList[0];
          const conditionList = newConditionGroup.conditionList;
          const newCondition = {};
          newCondition['uuid'] = this.$utils.setUuid();
          newCondition['valueList'] = (val instanceof Array ? val : [val]);
          newCondition['text'] = textStr;
          newCondition['name'] = condition.handler;
          newCondition['label'] = condition.handlerName;
          newCondition['type'] = condition.type;
          newCondition['expression'] = 'include';
          //表单条件才有这个属性
          newCondition['handler'] = condition.formHandler;
          conditionList.push(newCondition);
        }
        //如果是channel，但成员大于1，也需要删除所有表单条件
        if (condition.handler == 'channel' && val.length > 1) {
          if (this.workcenterConditionDataLocal.conditionGroupList.length > 0) {
            const conditionGroup = this.workcenterConditionDataLocal.conditionGroupList[0];
            for (let i = conditionGroup.conditionList.length - 1; i >= 0; i--) {
              const c = conditionGroup.conditionList[i];
              if (c.type == 'form') {
                conditionGroup.conditionList.splice(i, 1);
              }
            }
          }
        }
      }
    },
    //外部点击查询时通过此方法获取查询条件
    getData() {
      if (this.workcenterConditionDataLocal.conditionGroupList.length > 1) {
        this.workcenterConditionDataLocal.conditionGroupList.length = 1;
      }
      if (this.workcenterConditionDataLocal.conditionGroupList.length == 1) {
        const conditionGroup = this.workcenterConditionDataLocal.conditionGroupList[0];
        conditionGroup['conditionRelList'] = [];
        for (let i = conditionGroup.conditionList.length - 1; i >= 0; i--) {
          //补充channelUuidList数据
          const condition = conditionGroup.conditionList[i];
          //删除valueList为空的数据
          if (!condition.valueList || condition.valueList.length == 0) {
            conditionGroup.conditionList.splice(i, 1);
            continue;
          }
          if (condition.name == 'channel') {
            conditionGroup['channelUuidList'] = condition.valueList;
          }
          //生成conditionRelList数据，简单模式都是用and串联
          if (i > 0) {
            const from = conditionGroup.conditionList[i - 1];
            const to = conditionGroup.conditionList[i];
            conditionGroup['conditionRelList'].push({joinType: 'and'});
          }
        }
      }

      this.workcenterConditionDataLocal.handlerType = 'simple';
      return this.workcenterConditionDataLocal;
    },
    valid() {
      //校验条件输入框方法，供外部调用，简单模式返回true即可
      return true;
    }
  },
  filter: {},
  computed: {},
  watch: {
    workcenterConditionData: {
      handler: function(val) {
        this.workcenterConditionDataLocal = this.$utils.deepClone(val);
        //如果搜索模式和当前模式不一致，先清空数据
        if (this.workcenterConditionDataLocal.handlerType != this.mode) {
          this.workcenterConditionDataLocal.handlerType = this.mode;
          this.workcenterConditionDataLocal.conditionGroupList = [];
          this.workcenterConditionDataLocal.conditionGroupRelList = [];
        }
      }, 
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
