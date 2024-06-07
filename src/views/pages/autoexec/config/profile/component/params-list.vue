<template>
  <div class="params-list-box bg-op radius-lg padding">
    <Row v-if="!isShowLoading && list && list.length > 0" type="flex">
      <Col v-for="(data ,index) in list" :key="index" :span="24">
        <TsFormItem
          :required="data.isRequired ? true : false"
          :label="data.name || data.key"
          :des="data.description"
          :labelWidth="160"
          :title="data.key"
          itemWidth="100%"
          labelPosition="left"
        >
          <div class="params-list-box-flex">
            <TsFormSelect
              v-model="data.mappingMode"
              :dataList="data.invokeTypeList"
              :width="100"
              transfer
              class="pr-md"
              @change="(currentValue, valueObj) => handleChange(currentValue, valueObj, data, index)"
            ></TsFormSelect>
            <TsFormSelect
              v-if="data.mappingMode == 'globalparam'"
              v-model="data.defaultValue"
              dynamicUrl="/api/rest/autoexec/global/param/search"
              :params="{typeList: [data.type]}"
              :dealDataByUrl="dealDataByUrl"
              :transfer="true"
              :search="true"
              rootName="tbodyList"
              :style="{width:'100%'}"
            >
            </TsFormSelect>
            <Component
              :is="handleType(data.type)"
              v-else
              ref="item"
              v-model="data.defaultValue"
              class="item"
              :isRequired="data.isRequired"
              :defaultValue="data.defaultValue"
              :config="itemConfig[data.key]"
            ></Component>
          </div>
        </TsFormItem>
      </Col>
    </Row>
    <div v-else-if="!isShowLoading" class="text-tip tips">{{ $t('page.notarget', {target: $t('page.inputparam')}) }}</div>
    <Loading v-else-if="isShowLoading"></Loading>
  </div>
</template>
<script>
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import Component from '@/views/pages/autoexec/components/param/view/index.js';
export default {
  name: '',
  components: {
    TsFormItem,
    ...Component,
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  filters: {},
  props: {
    paramList: Array
  },
  data() {
    return {
      isShowLoading: true,
      itemConfig: {}, //所以组件对应的渲染config集合
      list: [],
      invokeTypeList: [] // 引用类型列表，全局参数/常量
    };
  },
  beforeCreate() {},
  async created() {
    await this.getParamInvokeTypeList();
  },
  beforeMount() {},
  mounted() {
    this.getParamList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    dealDataByUrl(nodeList) {
      let dataList = [];
      if (nodeList && !this.$utils.isEmpty(nodeList)) {
        nodeList.forEach(item => {
          dataList.push({
            value: item.key,
            text: item.defaultValue ? `${item.name}[${item.defaultValue}]` : item.name
          });
        });
      }
      return dataList;
    },
    async getParamInvokeTypeList() {
      let params = {
        enumClass: 'neatlogic.framework.autoexec.constvalue.AutoexecProfileParamInvokeType'
      };
      await this.$api.autoexec.globalParams.getTypeList(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.invokeTypeList = res.Return || [];
        }
      });
    },
    getParamList() {
      this.isShowLoading = false;
      this.list = this.$utils.deepClone(this.paramList);
      this.list && this.list.forEach((item) => {
        item.mappingMode = item.mappingMode == 'globalparam' ? 'globalparam' : 'constant';
        item.invokeTypeList = this.$utils.deepClone(this.invokeTypeList);
      });
      this.initConfig();
    },
    handleValueList(list) {
      // 处理后端所需要的参数
      let valueList = this.$utils.deepClone(list);
      for (let key in valueList) {
        if (key && valueList[key]) {
          delete valueList[key]['invokeTypeList'];
        }
      }
      return valueList;
    },
    valid() {
      let isValid = true;
      this.$refs.item && this.$refs.item.forEach(item => {
        if (item.valid) {
          isValid = item.valid() ? isValid : false;
        }
      });
      return isValid;
    },
    getValueList() {
      return this.handleValueList(this.list);
    },
    initConfig() {
      this.itemConfig = {};
      this.list instanceof Array && this.list.forEach(data => {
        let config = Object.assign({}, data.config ? data.config : data);
        config.desc = data.description;
        config.type = data.type == 'phase' ? 'text' : data.type;
        if (data.type == 'node' || data.type == 'file') {
          config.showNumber = 6;
        }
        this.$set(this.itemConfig, data.key, config);
      });
    },
    handleChange(value, valueObject, row, index) {
      if (row && row.defaultValue && row.mappingMode == 'globalparam') {
        // 编辑时，重置全局参数值
        row.defaultValue = '';
        row.valueInvokeVoList = [];
      }
      this.$set(this.list, index, row);
    }
  },
  computed: {
    handleType() {
      return (value) => {
        let type = (value == 'phase' ? 'text' : value) + 'Handler'; // 作业参数是阶段时，需要将下拉框改成文本框
        type = Component[type] ? type : 'defaultInput';
        return type;
      };
    }

  },
  watch: {
    paramList: {
      async handler() {
        await this.getParamInvokeTypeList();
        this.getParamList();
      },
      deep: true
    }
  }

};
</script>
<style lang='less' scoped>
.params-list-box{
  .params-list-box-flex {
    display: flex;
  }
  .item {
    display: inline-block;
    width: 85%;
  }
}

</style>
