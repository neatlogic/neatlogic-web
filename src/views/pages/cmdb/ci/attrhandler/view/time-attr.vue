<template>
  <div>{{ value }}</div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    mode: {type: String, default: 'list'},
    attrEntity: {type: Object}
  },
  data() {
    return {
      fileData: {}
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
      const format = (this.attrEntity.config && this.attrEntity.config.format) || 'HH:mm:ss';
      const d = new Date(val);
      const hour = d.getHours();
      const min = d.getMinutes();
      const sec = d.getSeconds();
      let ds = hour;
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
      if (this.attrEntity.valueList && this.attrEntity.valueList.length > 0) {
        const val = this.attrEntity.valueList[0];
        //return this.formatDate(val);
        return val;
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
