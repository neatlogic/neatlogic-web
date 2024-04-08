<template>
  <div>
    <TsFormRadio
      ref="handler"
      :value="value"
      :disabled="disabled"
      :validateList="validateList"
      :dataList="dataList"
      :allowToggle="true"
      @change="setData"
    ></TsFormRadio>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
  },
  props: {
    disabled: {type: Boolean, default: false},
    attrData: {type: Object},
    valueList: {type: Array}
  },
  data() {
    return {
      validateList: []
    };
  },
  beforeCreate() {},
  created() {
    if (this.attrData) {
      if (this.attrData.isRequired || this.attrData.isCiUnique) {
        this.validateList.push('required');
      }
    }
  },
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
    clear() {
      this.$emit('setData', []);
      this.$emit('setValue', []);
    },
    setData(val) {
      if (val) {
        this.$emit('setData', [val.toString()]);
        this.$emit('setValue', [val.toString()]);
      } else {
        this.$emit('setData', []);
        this.$emit('setValue', []);
      }
    },
    valid() { //验证数据合法性
      const handler = this.$refs['handler'];
      return handler.valid();
    }
  },
  filter: {},
  computed: {
    dataList: function() {
      const dataList = [];
      if (this.attrData.config && this.attrData.config.members) {
        this.attrData.config.members.forEach(element => {
          if (element && element.trim()) {
            dataList.push({text: element.trim(), value: element.trim()});
          }
        });
      }
      return dataList;
    },
    value: function() {
      if (this.valueList && this.valueList.length > 0) {
        return this.valueList[0];
      } 
      return null;
    }},
  watch: {
    /*attrData: {
      handler: function() {
        if (this.attrData) {
          if (this.attrData.isRequired == 1) {
            this.validateList.push('required');
          }
        }
      },
      deep: true,
      immediate: true
    }*/
  }
};
</script>
<style lang="less">
</style>
