<template>
  <div style="display:grid;grid-template-columns: 47% 6% 47%;grid-gap: 0px;">
    <div>
      <TsFormDatePicker
        ref="handler"
        border="border"
        :value="valueB"
        type="datetime"
        format="yyyy-MM-dd HH:mm:ss"
        :transfer="true"
        @change="setDataBefore"
      ></TsFormDatePicker>
    </div>
    <div style="text-align:center">~</div>
    <div>
      <TsFormDatePicker
        ref="handler"
        border="border"
        :value="valueA"
        type="datetime"
        :transfer="true"
        format="yyyy-MM-dd HH:mm:ss"
        @change="setDataAfter"
      ></TsFormDatePicker>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: resolve =>
      require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve)
  },
  props: {
    propConfig: {type: Object},
    attrData: {type: Object},
    valueList: {type: Array}
  },
  data() {
    return {
      valueBefore: '',
      valueAfter: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
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
      return year + '-' + 
        (month < 10 ? '0' + month : month) + '-' + 
        (day < 10 ? '0' + day : day) + ' ' + 
        (hour < 10 ? '0' + hour : hour) + ':' + 
        (min < 10 ? '0' + min : min) + ':' + 
        (sec < 10 ? '0' + sec : sec);
    },
    setDataBefore(val) {
      this.valueBefore = this.formatDate(val);
      let v = this.valueBefore + '~' + this.valueAfter;
      if (v == '~') {
        v = '';
      }
      this.$emit('setData', [v]);
      this.$emit('setValue', [v]);
    },
    setDataAfter(val) {
      this.valueAfter = this.formatDate(val);
      let v = this.valueBefore + '~' + this.valueAfter;
      if (v == '~') {
        v = '';
      }
      this.$emit('setData', [v]);
      this.$emit('setValue', [v]);
    },
    init() {
    }
  },
  filter: {},
  computed: {
    valueB: function() {
      if (this.valueList && this.valueList.length > 0) {
        if (this.valueList[0].indexOf('~') > -1) {
          return this.valueList[0].split('~')[0];
        }
      } 
      return '';
    },
    valueA: function() {
      if (this.valueList && this.valueList.length > 0) {
        if (this.valueList[0].indexOf('~') > -1) {
          return this.valueList[0].split('~')[1];
        }
      } 
      return '';
    }
  },
  watch: {
    valueB: {
      handler: function(val) {
        this.valueBefore = val;
      },
      immediate: true
    },
    valueA: {
      handler: function(val) {
        this.valueAfter = val;
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
