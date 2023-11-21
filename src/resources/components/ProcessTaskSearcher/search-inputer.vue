<template>
  <div v-if="condition && condition.handlerType">
    <div v-if="handlers[condition.handler + '_' + mode + '_Handler']">
      <component
        :is="handlers[condition.handler + '_' + mode + '_Handler']"
        ref="searchHandler"
        :condition="condition"
        :workcenterConditionData="workcenterConditionData"
        :conditionData="getWorkcenterConditionData(condition.handler)"
        :mode="mode"
        :isCustomValue="isCustomValue"
        @change="change"
        @changeWithCondition="changeWithCondition"
      ></component>
    </div>
    <div v-else-if="handlers[condition.handlerType + 'TypeHandler']">
      <component
        :is="handlers[condition.handlerType + 'TypeHandler']"
        ref="searchHandler"
        :condition="condition"
        :conditionData="conditionData || getWorkcenterConditionData(condition.handler)"
        :mode="mode"
        :isCustomValue="isCustomPanel && isCustomValue"
        @change="change"
      ></component>
    </div>
    <div v-else>
      <TsFormInput
        ref="searchHandler"
        border="border"
        :value="getValue(condition.handler)"
        :validateList="[{ name: 'required', message: ' ' }]"
        :type="getFormInputType(condition.formHandler)"
        @change="
          val => {
            change(val, val);
          }
        "
      ></TsFormInput>
    </div>
  </div>
</template>
<script>
import * as handlers from './handlers/index.js';
export default {
  name: '',
  components: {
    ...handlers,
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    mode: { type: String, default: 'simple' },
    workcenterConditionData: { type: Object }, //全量的工单中心条件数据，主要提供给channelselect.vue使用，其他组件不需要用的此数据
    condition: { type: Object }, //默认条件
    conditionData: { type: Object }, //工单中心组件条件数据
    isCustomValue: {
      // 是否自定义值，单个字符串(value:1)可以自定义返回{text:1,value:1}，数组[1]可以自定义返回[{text:1,value:1}]
      type: Boolean,
      default: false
    },
    isCustomPanel: { // 用于简单模式下，表单过滤属性按钮打开之后，表单属性下拉框需要是{text:1,value:1}或者[{text:1,value:1}]
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      handlers: handlers
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
    valid() {
      if (this.$refs['searchHandler']) {
        return this.$refs['searchHandler'].valid();
      }
      return true;
    },
    change(val, textStr) {
      this.$emit('change', this.condition, val, textStr);
    },
    changeWithCondition(condition, val, textStr) { //由于表单属性是动态生成，此方法给表单属性使用
      this.$emit('change', condition, val, textStr);
    },
    getWorkcenterConditionData(handler) {
      //simple模式的conditionGroupList有且只有一个成员
      if (this.mode == 'simple') {
        const conditionGroupList = this.workcenterConditionData?.conditionGroupList;
        if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
          for (let i = 0; i < conditionGroupList[0].conditionList.length; i++) {
            if (conditionGroupList[0].conditionList[i].name === handler) {
              return conditionGroupList[0].conditionList[i];
            }
          }
        }
      }
      return null;
    },
    getValue(handler) {
      return this.getWorkcenterConditionData(handler) && this.getWorkcenterConditionData(handler).valueList && this.getWorkcenterConditionData(handler).valueList[0];
    }
  },
  filter: {},
  computed: {
    getFormInputType() {
      return (handler) => {
        let type = 'text';
        if (handler && handler == 'formtextarea') {
          type = 'textarea';
        }
        return type;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
