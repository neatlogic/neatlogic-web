<template>
  <div v-if="mode == 'simple'">
    <div :class="[isChannelSingleValue?'grid':'', (isFilterForm || isFilterStep)?'pb-sm':'']">
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
      <div v-if="isChannelSingleValue">
        <TsFormSwitch
          :value="isFilterForm"
          :trueValue="true"
          :falseValue="false"
          @on-change="toggleForm"
        >{{ $t('term.process.formfilter') }}</TsFormSwitch>
      </div>
      <div v-if="isChannelSingleValue"><span class="text-grey">{{ $t('term.process.formfilter') }}</span></div>
      <div v-if="isChannelSingleValue">
        <TsFormSwitch
          :value="isFilterStep"
          :trueValue="true"
          :falseValue="false"
          @on-change="toggleStep"
        >{{ $t('term.process.stepfilter') }}</TsFormSwitch>
      </div>
      <div v-if="isChannelSingleValue"><span class="text-grey">{{ $t('term.process.stepfilter') }}</span></div>
    </div>
    <div v-if="isChannelSingleValue">
      <label v-if="isFilterStep" class="text-grey">{{ $t('term.process.stepfilter') }}</label>
      <Tooltip
        v-if="isFilterStep"
        placement="top-start"
        max-width="400"
        theme="light"
        transfer
      >
        <span class="tsfont-info-o cursor text-grey" style="vertical-align: super;padding-left: 4px;"></span>
        <div slot="content" style="max-height: 400px;overflow:auto;">{{ $t('term.process.stepdesc') }}</div>
      </Tooltip>
      <div v-if="isFilterStep">
        <TsFormSelect
          v-model="processStepUuidList"
          v-bind="processStepConfig"
          border="border"
          transfer
          multiple
          class="pb-sm"
          :validateList="['required']"
          @change="changeProcessStep"
        ></TsFormSelect>
      </div>
      <label v-if="isFilterForm && formConditionList && formConditionList.length > 0" class="inline-block text-grey pb-sm">{{ $t('page.attribute') }}</label>
      <div v-if="isFilterForm && formConditionList && formConditionList.length > 0" class="inner-attr-list">
        <TsFormSelect
          :dataList="formConditionList"
          textName="handlerName"
          valueName="handler"
          border="border"
          :value="workcenterFormConditionUuidList"
          transfer
          multiple
          class="pb-sm"
          :validateList="['required']"
          @change="changeFormAttribute"
        ></TsFormSelect>
        <!-- 解决index作为key，导致删除对应属性，属性对应配置信息还是上一个的问题 -->
        <div v-for="(formcondition) in workcenterFormConditionList" :key="formcondition.uuid" class="pb-sm">
          <div v-if="getFormConditionByName(formcondition.name)">
            <label class="inline-block text-grey pb-sm">{{ getFormConditionByName(formcondition.name).handlerName }}</label>
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
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    SearchInputer: () => import('../search-inputer.vue')
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
      processStepUuidList: [],
      config: this.condition.config,
      value: this.conditionData && this.conditionData.valueList,
      isFilterForm: false,
      isFilterStep: false,
      formConditionList: [],
      isChannelSingleValue: false,
      processStepConfig: {
        url: 'api/rest/process/step/list',
        search: true,
        params: {
        },
        textName: 'name',
        valueName: 'uuid',
        validateList: ['required'],
        transfer: true
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.isFilterForm = this.hasFormCondition;
    this.isFilterStep = this.hasProcessStepCondition;
    this.initProcessStepUuidList();
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
    changeProcessStep(procesStep, procesStepOption) {
      console.log(procesStep);
      console.log(procesStepOption);
      const conditionGroupList = this.workcenterConditionData?.conditionGroupList;
      if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
        const conditionList = conditionGroupList[0].conditionList;
        for (let i = conditionList.length - 1; i >= 0; i--) {
          const condition = conditionList[i];
          if (condition.type == 'common' && condition.name === 'processStep') {
            //删除表单属性
            conditionList.splice(i, 1);
          }
        }
        
        //增加表单属性
        conditionList.push({
          expression: 'include',
          valueList: procesStep,
          name: 'processStep',
          type: 'common',
          label: this.$t('term.process.stepfilter'),
          text: procesStepOption.map(item => item.text).join('、'),
          uuid: this.$utils.setUuid()
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
      this.clearFormCondition();
    },
    toggleStep(val) {
      this.isFilterStep = val;
      this.clearProcessStepCondition();
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
                newD['config'] = d.config;
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
    },
    initProcessStepUuidList() {
      this.processStepConfig.value = [];
      const conditionGroupList = this.workcenterConditionData?.conditionGroupList;
      if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
        this.processStepUuidList = conditionGroupList[0].conditionList.filter(d => d.type === 'common' && d.name === 'processStep').map(d => d.valueList)[0];
      }
    },
    clearFormCondition() {
      const conditionGroupList = this.workcenterConditionData?.conditionGroupList;
      if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
        const conditionList = conditionGroupList[0].conditionList;
        for (let i = conditionList.length - 1; i >= 0; i--) {
          const condition = conditionList[i];
          if (condition.type == 'form') {
            //删除表单属性
            conditionList.splice(i, 1);
          }
        }
      }
    },
    clearProcessStepCondition() {
      const conditionGroupList = this.workcenterConditionData?.conditionGroupList;
      if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
        const conditionList = conditionGroupList[0].conditionList;
        for (let i = conditionList.length - 1; i >= 0; i--) {
          const condition = conditionList[i];
          if (condition.type == 'common' && condition.name === 'processStep') {
            conditionList.splice(i, 1);
          }
        }
      }
      if (this.value instanceof Array && this.value.length == 1) {
        this.processStepConfig.params = {
          channelUuid: this.value[0]
        };
      }
      this.processStepUuidList = [];
    }
  },
  filter: {},
  computed: {
    hasFormCondition() {
      const conditionGroupList = this.workcenterConditionData?.conditionGroupList;
      if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
        let formConditionList = conditionGroupList[0].conditionList.filter(d => d.type === 'form');
        if (formConditionList && formConditionList.length > 0) {
          return true;
        }
      }
      return false;
    },
    hasProcessStepCondition() {
      const conditionGroupList = this.workcenterConditionData?.conditionGroupList;
      if (conditionGroupList && conditionGroupList.length > 0 && conditionGroupList[0].conditionList) {
        let stepConditionList = conditionGroupList[0].conditionList.filter(d => d.name === 'processStep');
        if (stepConditionList && stepConditionList.length > 0) {
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
        if (val && val instanceof Array && val.length == 1) {
          this.getFormByChannelUuid();
          this.isChannelSingleValue = true;
          this.processStepConfig.params.channelUuid = this.value[0];
        } else {
          this.isFilterForm = false;
          this.formConditionList = [];
          this.clearProcessStepCondition();
          this.isChannelSingleValue = false;
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
  grid-template-columns: auto 20px 60px 20px 60px;
  grid-gap: 10px;
  align-items: center;
}
.inline-block {
  display: inline-block;
}
.inner-attr-list div:last-child {
  padding-bottom: 0;
}
</style>
