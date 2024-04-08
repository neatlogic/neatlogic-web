<template>
  <div>
    <TsFormDatePicker
      ref="handler"
      border="border"
      :transfer="true"
      :value="value"
      :disabled="disabled"
      :validateList="validateList"
      type="datetime"
      :format="format"
      @change="setData"
    ></TsFormDatePicker>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve)
  },
  props: {
    disabled: { type: Boolean, default: false },
    attrData: { type: Object },
    valueList: { type: Array }
  },
  data() {
    return {
      validateList: [],
      format: this.attrData.config.format || 'yyyy-MM-dd HH:mm:ss'
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
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    formatDate(val) {
      const d = new Date(val);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const hour = d.getHours();
      const min = d.getMinutes();
      const sec = d.getSeconds();
      return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day) + ' ' + (hour < 10 ? '0' + hour : hour) + ':' + (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
    },
    setData(val) {
      if (val) {
        //TsFormDatePicker在format为全格式的情况下，会直接返回时间戳，所以需要再转换一次
        const timestr = this.formatDate(val);
        this.$emit('setData', [timestr]);
        this.$emit('setValue', [timestr]);
      } else {
        this.$emit('setData', []);
        this.$emit('setValue', []);
      }
    },
    valid() {
      //验证数据合法性
      const handler = this.$refs['handler'];
      return handler.valid();
    }
  },
  filter: {},
  computed: {
    value: function() {
      if (this.valueList && this.valueList.length > 0) {
        return this.valueList[0];
      }
      return null;
    }
  },
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
<style lang="less"></style>
