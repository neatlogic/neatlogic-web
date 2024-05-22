<template>
  <div style="display:grid;grid-template-columns: 47% 6% 47%;grid-gap: 0px;">
    <div>
      <TsFormDatePicker
        ref="handler"
        border="border"
        :value="valueB"
        type="date"
        format="yyyy-MM-dd"
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
        type="date"
        format="yyyy-MM-dd"
        :transfer="true"
        @change="setDataAfter"
      ></TsFormDatePicker>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker')
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
    setDataBefore(val) {
      this.valueBefore = val;
      let v = this.valueBefore + '~' + this.valueAfter;
      if (v == '~') {
        v = '';
      }
      this.$emit('setData', [v]);
      this.$emit('setValue', [v]);
    },
    setDataAfter(val) {
      this.valueAfter = val;
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
