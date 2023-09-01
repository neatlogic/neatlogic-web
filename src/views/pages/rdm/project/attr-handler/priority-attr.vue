<template>
  <div>
    <TsFormSelect
      ref="select"
      :dataList="priorityList"
      :value="priority"
      valueName="id"
      textName="name"
      :readonly="readonly"
      transfer
      :border="border"
      :validateList="validateList"
      @change="
        (val, opt) => {
          $emit('setValue', 'priority', val, opt.text);
        }
      "
      @change-label="(text, selectedList) => $emit('changeLabel', text, selectedList)"
    ></TsFormSelect>
  </div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  extends: AttrBase,
  props: {},
  data() {
    return {
      priorityList: [],
      priority: (this.issueData && this.issueData.priority) || (this.valueList && this.valueList.length > 0 && this.valueList[0])
    };
  },
  beforeCreate() {},
  created() {
    this.getPriorityList();
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
    valid() {
      return this.$refs['select'].valid();
    },
    getPriorityList() {
      this.$api.rdm.priority.getPriorityList().then(res => {
        this.priorityList = res.Return;
      });
    }
  },
  filter: {},
  computed: {
    validateList() {
      if (this.mode === 'input' && this.attrConfig.isRequired) {
        return [{ name: 'required', message: ' ' }];
      }
      return [];
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
