<template>
  <div v-if="value">{{ value }}</div>
  <div v-else class="text-grey">-</div>
</template>
<script>
import { AttrBase } from './base-attr.js';
export default {
  name: '',
  components: {
  },
  extends: AttrBase,
  props: {
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    formatDate(val) {
      const format = (this.attrConfig.config && this.attrConfig.config.format) || 'yyyy-MM-dd HH:mm:ss';
      const d = new Date(val);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const hour = d.getHours();
      const min = d.getMinutes();
      const sec = d.getSeconds();
      let ds = year + '-' + 
        (month < 10 ? '0' + month : month) + '-' + 
        (day < 10 ? '0' + day : day);
      if (format.includes('HH')) {
        ds += ' ' + (hour < 10 ? '0' + hour : hour); 
      }
      if (format.includes('mm')) {
        ds += ':' + (min < 10 ? '0' + min : min); 
      }
      if (format.includes('ss')) {
        ds += ':' + (sec < 10 ? '0' + sec : sec);
      }
      return ds;
    }
  },
  filter: {},
  computed: {
    value: function() {
      if (this.valueList && this.valueList.length > 0) {
        const val = this.valueList[0];
        return this.formatDate(val);
      }
      return '';
    }
    
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
</style>
