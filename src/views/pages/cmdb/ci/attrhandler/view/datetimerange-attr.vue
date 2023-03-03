<template>
  <div>{{ value }}</div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  directives: {download},
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
   
  },
  filter: {},
  computed: {
    value: function() {
      if (this.attrEntity.valueList && this.attrEntity.valueList.length > 0 && this.attrEntity.config) {
        if ((this.attrEntity.config.type == 'datetime' || this.attrEntity.config.type == 'time')) {
          return this.attrEntity.valueList[0];
        } else if (this.attrEntity.config.type == 'datetimerange' || this.attrEntity.config.type == 'timerange') {
          try {
            const v = this.attrEntity.valueList[0].split(',');
            if (v.length == 2) {
              return v[0] + ' ~ ' + v[1];
            } 
          } catch (e) {
            console.error('日期区间值：' + this.attrEntity.valueList[0] + '转换异常');
          }
        }
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
