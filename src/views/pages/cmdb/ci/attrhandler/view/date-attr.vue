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
      const format = (this.attrEntity.config && this.attrEntity.config.format) || 'yyyy-MM-dd';
      const d = new Date(val);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      let ds = year;
      if (format.includes('MM')) {
        ds += '-' + (month < 10 ? '0' + month : month);
      } 
      if (format.includes('dd')) {
        ds += '-' + (day < 10 ? '0' + day : day);
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
