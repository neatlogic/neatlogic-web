<template>
  <div>
    <TsFormItem label="关联组件" labelPosition="top">
      <TsFormSelect
        v-model="config.relatedComponentValue"
        :dataList="dataList"
        transfer
        textName="label"
        valueName="uuid"
        border="border"
        @on-change="change"
      ></TsFormSelect>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  extends: base,
  props: {},
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
    change(val) {
      console.log('返回的值', val);
    }
  },
  filter: {},
  computed: {
    dataList() {
      let componentList = this.formItemList.filter((v) => v.handler != 'formmultipletables');
      return componentList;
    }
  },
  watch: {}
};
</script>
