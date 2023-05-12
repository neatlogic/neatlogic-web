
<template>
  <Row :gutter="6">
    <!-- 属性 -->
    <Col span="8">
      <TsFormSelect
        v-model="dataConfig.attr"
        :dataList="attrList"
        valueName="attribute"
        textName="attribute"
        placeholder="属性"
        @change-label="attrChangeLabel"
      ></TsFormSelect>
    </Col>
    <!-- 表达式 -->
    <Col v-if="dataConfig.attr" span="6">
      <TsFormSelect v-model="dataConfig.expression" :dataList="ruleList" placeholder="表达式"></TsFormSelect>
    </Col>
    <!-- 值 -->
    <Col v-if="dataConfig.attr" span="10">
      <CellComponent :setting="config"></CellComponent>
    </Col>
  </Row>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import CellComponent from '@/resources/components/FormMaker/formedit/view/staticList/staticList-components.vue';
import {dateRuleList, timeRuleList} from './rule.js';
export default {
  name: '',
  components: {
    TsFormSelect,
    CellComponent
  },
  filters: {
  },
  props: {
    attrList: Array,
    dataConfig: Object//{attr:'',expression:'empty',value:'value'}
  },
  data() {
    return {
      ruleList: dateRuleList,
      config: {}
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
    attrChangeLabel(label, json) {
      this.config = this.$utils.deepClone(json);
    }
  },
  computed: {
  },
  watch: {}
};
</script>
