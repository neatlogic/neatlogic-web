<template>
  <div>
    <Row :gutter="10" class="mb-sm">
      <Col :span="10" class="text-grey">{{ $t('page.attribute') }}</Col>
      <Col :span="2" class="text-grey"></Col>
      <Col :span="10" class="text-grey">{{ $t('term.framework.compval') }}</Col>
      <Col :span="2" class="text-grey"></Col>
    </Row>
    <Row
      v-for="(item, index) in filter.ruleList"
      :key="index"
      :gutter="10"
      class="mb-sm"
    >
      <Col :span="10" style="text-align:center">
        <TsFormSelect
          ref="select"
          border="border"
          transfer
          :value="item.matrixAttrUuid"
          valueName="uuid"
          textName="name"
          :dataList="updateDataList(martixAttrList)"
          :validateList="validateList"
          @on-change="
            val => {
              $set(item, 'matrixAttrUuid', val);
            }
          "
        ></TsFormSelect>
      </Col>
      <Col :span="2" style="text-align:center;line-height:30px">{{ $t('term.expression.eq') }}</Col>
      <Col :span="10">
        <TsFormSelect
          ref="select"
          transfer
          :value="item.formItemUuid"
          border="border"
          :dataList="otherFormItemList"
          valueName="uuid"
          textName="label"
          :validateList="validateList"
          @on-change="
            val => {
              $set(item, 'formItemUuid', val);
            }
          "
        ></TsFormSelect>
      </Col>
      <Col :span="2">
        <div class="tsfont-close-o text-tip-active pt-sm" @click="delFilterRule(item,index)"></div>
      </Col>
    </Row>
    <div class="text-href tsfont-plus" @click="addFilterRule">{{ $t('page.filtercondition') }}</div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    value: { type: Object },
    formItem: { type: Object }, //当前表单组件
    formItemList: { type: Array },
    martixAttrList: { type: Array }
  },
  data() {
    return {
      filter: this.value || {},
      validateList: [{ name: 'required', message: ' ' }]
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
    addFilterRule() {
      if (!this.filter.ruleList) {
        this.$set(this.filter, 'ruleList', []);
      }
      let rule = {
        matrixAttrUuid: '',
        formItemUuid: ''
      };
      this.filter.ruleList.push(rule);
      this.$emit('input', this.filter);
    },
    delFilterRule(rule, index) {
      this.filter.ruleList.splice(index, 1);
      if (this.$utils.isEmpty(this.filter.ruleList)) {
        this.$delete(this.filter, 'ruleList');
      }
      this.$emit('input', this.filter);
    },
    valid() {
      let isValid = true;
      if (this.$refs['select']) {
        this.$refs['select'].forEach(element => {
          if (!element.valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    }
  },
  filter: {},
  computed: {
    otherFormItemList() {
      return this.formItemList.filter(d => d.uuid !== this.formItem.uuid && ['formselect', 'formradio', 'formcheckbox'].includes(d.handler));
    },
    updateDataList() {
      return (dataList) => {
        let list = this.$utils.deepClone(dataList);
        list.forEach(item => {
          if (this.filter.ruleList) {
            let findItem = this.filter.ruleList.find(f => f.matrixAttrUuid === item.uuid);
            if (findItem) {
              this.$set(item, '_disabled', true);
            } else {
              this.$set(item, '_disabled', false);
            }
          }
        });
        return list;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
