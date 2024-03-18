
<template>
  <div class="readonly-main">
    <div class="readonly-name overflow">
      <span :title="config.name" class="overflow"> {{ config.name }}</span>
      <template v-if="config.description">
        <span>
          <Tooltip
            placement="top"
            theme="light"
            transfer
            max-width="500"
            :content="config.description"
          >
            <i class="tsfont-info-o text-tip fz10"></i>
          </Tooltip>
        </span>
      </template>
    </div>
    <div class="readonly-type overflow" :title="getTypeName(value.mappingMode)">{{ getTypeName(value.mappingMode) }}</div>
    <div v-if="value.value" class="readonly-value text-tip">
      <span v-if="value.mappingMode == 'constant'" class="overflow">
        <div
          :is="value.component + 'Handler'"
          :value="value.value"
          :config="getConfig(value,paramsTypeList)"
          readonly
          disabled
          :phaseList="phaseList"
        ></div>
      </span>
      <span v-else-if="value.mappingMode == 'runtimeparam'" class="overflow">
        <TsFormSelect
          :value="value.value"
          :dataList="getParamList(paramList, value.component)"
          textName="name"
          valueName="key"
          :readonly="true"
        ></TsFormSelect>
      </span>
      <span v-else-if="value.mappingMode.indexOf('prenode')==0" class="overflow">
        <TsFormCascader
          :value="value.value"
          :dataList="prenodeDataList"
          :format="format"
          :readonly="true"
        ></TsFormCascader>
      </span>
      <!-- 预置参数集 -->
      <span v-else-if="value.mappingMode == 'profile'" span="12">
        <template v-if="getProfileParamConfig(profileParamVoList,config).mappingMode == 'constant'">
          <div
            :is="value.component + 'Handler'"
            :value="getProfileParamConfig(profileParamVoList,config).defaultValue"
            :config="getConfig(value,paramsTypeList)"
            readonly
            disabled
            :phaseList="phaseList"
          ></div>
        </template>
        <div v-else-if="getProfileParamConfig(profileParamVoList,config).mappingMode == 'globalparam'">
          <Globalparam v-model="getProfileParamConfig(profileParamVoList,config).defaultValue" :params="{typeList: [config.type]}" :readonly="true"></Globalparam>
        </div>
      </span>
      <!-- 全局参数 -->
      <span v-else-if="value.mappingMode == 'globalparam'" span="12">
        <Globalparam v-model="value.value" :params="{typeList: [config.type]}" :readonly="true"></Globalparam>
      </span>
    </div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
import items from '@/views/pages/autoexec/components/param/readonly/index.js';
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve),
    TsFormSelect,
    ...items,
    Globalparam: resolve => require(['./globalparam.vue'], resolve),
    TsFormCascader: resolve => require(['@/resources/plugins/TsForm/TsFormCascader'], resolve)
  },
  filters: {
  },
  props: {
    value: Object,
    config: Object,
    paramList: Array,
    inputTypeList: Array,
    paramsTypeList: Array,
    prevList: Array,
    phaseList: Array, //阶段列表
    profileParamVoList: Array, //预置参数集：参数列表
    prenodeDataList: Array
  },
  data() {
    return {
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
    format(labels, selectedData) {
      let data = selectedData && selectedData.length > 1 ? selectedData[1] : false;
      let text = '';
      if (labels && labels.length > 0) {
        text = labels[labels.length - 1] + (data && data.operationDes ? '[' + data.operationDes + ']' : '');
      }
      return text;
    }
  },
  computed: {
    getTypeName() {
      return function(type) {
        let currentItem = this.inputTypeList.find(t => {
          return t.value == type;
        });
        return currentItem ? currentItem.text : '';
      };
    },
    getConfig() {
      return function(com, paramsTypeList) { //直接使用带过来的数据，因为带过来的数据含有矩阵相关的配置
        let item = com.config;
        item = item || paramsTypeList.find(p => {
          return p.value == com.component;
        });
        return item || {};
      };
    },
    getParamList() {
      return function(list, type) {
        //需要过滤掉类型不同类的
        if (list && list.length) {
          return list.filter(l => {
            return l.type == type;
          });
        } else {
          return [];
        }
      };
    },
    getPrevList() {
      return function(list, type) {
        if (list && list.length) {
          let li = list.filter(l => {
            return l.type == type;
          });
          return li && li.length
            ? li.map(l => {
              return {
                text: l.name + '(' + this.$t('page.phase') + +l.combopName + '_' + this.$t('term.autoexec.tool') + l.operationName + '' + (l.operationLetter ? ('_' + l.operationLetter) : '') + ')',
                value: l.combopUuid + '&&' + l.operationName + '&&' + l.operationUuid + '&&' + l.key
              };
            })
            : [];
        } else {
          return [];
        }
      };
    },
    getProfileParamConfig() {
      return (profileParamVoList, item) => {
        let config = '';
        profileParamVoList.forEach(p => {
          if (p.key == item.key && p.type == item.type) {
            config = p;
          }
        });
        return config;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.readonly-main{
  display: flex;
  justify-content: flex-start;
  align-items: center;
  .readonly-name{
    display: flex;
    width: 120px;
    padding-right: 16px;
  }
  .readonly-value {
    display: flex;
    flex: 1;
    width: 0;
  }
  .readonly-type{
    padding-right: 16px;
  }
}
</style>
