<template>
  <div v-if="mode == 'simple'">
    <div class="grid">
      <div>
        <TsFormSelect
          ref="searchInputer"
          transfer
          v-bind="config"
          border="border"
          :value="conditionData && conditionData.valueList"
          :validateList="[{ name: 'required', message: ' ' }]"
          :firstSelect="false"
          @change="change"
        ></TsFormSelect>
      </div>
      <div>
        <TsFormSwitch
          :value="isFilterForm"
          :trueValue="true"
          :falseValue="false"
          @on-change="toggleForm"
        >{{ $t('term.process.formfilter') }}</TsFormSwitch>
      </div>
      <div v-if="!(value instanceof Array && value.length > 1)"><span class="text-grey">{{ $t('term.process.formfilter') }}</span></div>
    </div>
    <label v-if="isFilterForm && !(value instanceof Array && value.length > 1) && formConditionList && formConditionList.length > 0" class="text-grey">{{ $t('page.attribute') }}</label>
    <div v-if="isFilterForm && !(value instanceof Array && value.length > 1) && formConditionList && formConditionList.length > 0">
      <TsFormSelect
        :dataList="formConditionList"
        textName="handlerName"
        valueName="handler"
        border="border"
        :value="workcenterFormConditionUuidList"
        transfer
        multiple
        :validateList="['required']"
        @change="changeFormAttribute"
      ></TsFormSelect>
      <!-- 解决index作为key，导致删除对应属性，属性对应值还是上一个的问题 -->
      <div v-for="(formcondition) in workcenterFormConditionList" :key="formcondition.uuid">
        <div v-if="getFormConditionByName(formcondition.name)">
          <label class="text-grey">{{ getFormConditionByName(formcondition.name).handlerName }}</label>
          <div>
            <SearchInputer
              mode="simple"
              :condition="getFormConditionByName(formcondition.name)"
              :workcenterConditionData="workcenterConditionData"
              :isCustomValue="isCustomValue"
              :isCustomPanel="true"
              @change="changeFromCondition"
            ></SearchInputer>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else></div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    SearchInputer: resolve => require(['../search-inputer.vue'], resolve)
  },
  props: {
    mode: { type: String, default: 'simple' },
    conditionData: { type: Object }, //当前组件在工单中心配置中的数据
    condition: { type: Object },
    workcenterConditionData: { type: Object }, //工单中心所有条件数据
    isCustomValue: {
      // 是否自定义值，单个字符串(value:1)可以自定义返回{text:1,value:1}，数组[1]可以自定义返回[{text:1,value:1}]
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      config: this.condition.config,
      value: this.conditionData && this.conditionData.valueList,
      isFilterForm: false,
      formConditionList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.isFilterForm = this.hasFormCondition;
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    valid() {
      if (this.$refs['searchInputer']) {
        return this.$refs['searchInputer'].valid();
      }
      return true;
    },
    changeFormAttribute(formAttr, formAttrOption) {
      const conditionGroupList = this.workcenterConditionData?.conditionGroupList;
      if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
        const conditionList = conditionGroupList[0].conditionList;
        for (let i = conditionList.length - 1; i >= 0; i--) {
          const condition = conditionList[i];
          if (condition.type == 'form' && !formAttr.includes(condition.name)) {
            //删除表单属性
            conditionList.splice(i, 1);
          }
        }
        formAttr.forEach((attr, index) => {
          if (!conditionList.find(d => d.type === 'form' && d.name === attr)) {
            const formAttr = this.formConditionList.find(d => d.handler === attr);
            if (formAttr) {
              //增加表单属性
              conditionList.push({
                expression: 'include',
                valueList: [],
                name: attr,
                type: 'form',
                label: formAttrOption[index].text,
                uuid: this.$utils.setUuid(),
                handler: formAttr.formHandler //表单属性专有属性
              });
            }
          }
        });
      }
    },
    change(val, option) {
      this.value = val;
      this.$emit('change', val, this.getOptionText(option));
    },
    changeFromCondition(formCondition, val, textStr) {
      this.$emit('changeWithCondition', formCondition, val, textStr);
    },
    getOptionText(option) {
      let text = '';
      if (option) {
        if (option instanceof Array) {
          option.forEach(d => {
            if (text) {
              text += '、';
            }
            text += d.text;
          });
        } else {
          text += option.text;
        }
      }
      return text;
    },
    toggleForm(val) {
      this.isFilterForm = val;
    },
    getFormByChannelUuid() {
      if (this.value) {
        this.$api.process.process.channelForm({ channelUuidList: this.value, conditionModel: 'simple' }).then(res => {
          this.formConditionList = [];
          //把数据转换成和工单中心条件的格式一致
          if (res.Return && res.Return.length > 0) {
            res.Return.forEach(d => {
              const newD = {};
              newD['handler'] = d.label; //属性中文名
              newD['handlerName'] = d.label; //属性中文名
              newD['handlerType'] = d.handlerType; //ex:select
              newD['formHandler'] = d.handler; //ex:formselect
              newD['type'] = 'form';
              try {
                newD['config'] = JSON.parse(d.config);
              } catch (e) {
                console.error(e);
              }
              this.formConditionList.push(newD);
            });
          }
        });
      }
    },
    getFormConditionByName(name) {
      if (this.formConditionList && this.formConditionList.length > 0) {
        return this.formConditionList.find(d => d.handler == name);
      }
    }
  },
  filter: {},
  computed: {
    hasFormCondition() {
      const conditionGroupList = this.workcenterConditionData?.conditionGroupList;
      if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
        if (conditionGroupList[0].conditionList.filter(d => d.type === 'form')) {
          return true;
        }
      }
      return false;
    },
    //工单中心已保存的表单条件的名称（用于下拉框回显）
    workcenterFormConditionUuidList() {
      //使用表单属性的label作为下拉组件的key，这是和后端的约定
      const conditionGroupList = this.workcenterConditionData?.conditionGroupList;
      if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
        return conditionGroupList[0].conditionList.filter(d => d.type === 'form').map(d => d.name);
      }
      return [];
    },
    //工单中心已保存的表单条件
    workcenterFormConditionList() {
      //使用表单属性的label作为下拉组件的key，这是和后端的约定
      const conditionGroupList = this.workcenterConditionData?.conditionGroupList;
      if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
        return conditionGroupList[0].conditionList.filter(d => d.type === 'form');
      }
      return [];
    }
  },
  watch: {
    value: {
      handler: function(val) {
        if (val && val.length > 0) {
          this.getFormByChannelUuid();
        } else {
          this.formConditionList = [];
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 20px 60px;
  grid-gap: 10px;
}
</style>
