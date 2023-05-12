<template>
  <div>
    <div v-if="handlers[attrConfig.type + 'attr']">
      <component
        :is="attrConfig.type + 'attr'"
        v-if="!attrConfig.isPrivate"
        ref="component"
        :valueList="valueList || valueListLocal"
        :attrConfig="attrConfig"
      ></component>
      <component
        :is="attrConfig.type + 'attr'"
        v-else
        ref="component"
        :issueData="issueData"
        :valueList="valueList"
        :attrConfig="attrConfig"
      ></component>
    </div>
    <div v-else>
      <div v-if="valueList && valueList.length > 0">
        <span v-for="(v, index) in valueList" :key="index" v-html="format(v)"></span>
      </div>
    </div>
  </div>
</template>
<script>
import * as handlers from './index.js';
export default {
  name: '',
  components: {
    ...handlers
  },
  props: {
    issueData: { type: Object }, //issue数据
    attrConfig: { type: Object }, //属性设置
    valueList: { type: Array }
  },
  data() {
    return {
      handlers: handlers,
      valueListLocal: null
    };
  },
  beforeCreate() {},
  created() {
    if (this.issueData && this.issueData.attrList) {
      const attrData = this.issueData.attrList.find(d => d.attrId === this.attrConfig.id);
      if (attrData) {
        this.valueListLocal = attrData.valueList;
      }
    }
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
    format(value) {
      //处理\n换行符
      if (value != null && typeof value != 'undefined') {
        value = value.toString();
        value = value.trim();
        return value.replace(/\n/g, '<br>');
      }
      return '';
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
