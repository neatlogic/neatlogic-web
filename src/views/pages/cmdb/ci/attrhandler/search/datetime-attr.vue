<template>
  <div v-if="mode === 'search'" style="display: grid; grid-template-columns: 47% 6% 47%; grid-gap: 0px">
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
    <div style="text-align: center">~</div>
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
  <div v-else-if="mode === 'condition'">
    <div class="item mr-xs"><TsFormInput
      type="number"
      :value="valueBNumber"
      :width="60"
      :step="1"
      border="border"
      @on-change="setDataBefore"
    ></TsFormInput></div>
    <div class="item mr-xs">天前</div>
    <div class="item mr-xs">~</div>
    <div class="item mr-xs"><TsFormInput
      type="number"
      :width="60"
      :step="1"
      border="border"
      :value="valueANumber"
      @on-change="setDataAfter"
    ></TsFormInput></div>
    <div class="item">天后</div>
    <div class="item"><Tooltip max-width="200" :transfer="true" content="以合规检查执行的时间为基准，向前和向后生成时间区间，判断属性是否处于时间区间之内，偏差天数可以是负数，时间区间可以是开区间">
      <span class="tsfont-question-o"></span>
    </Tooltip></div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker')
  },
  props: {
    mode: { type: String },
    propConfig: { type: Object },
    attrData: { type: Object },
    valueList: { type: Array }
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
    /*formatDate(val) {
      const d = new Date(val);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const hour = d.getHours();
      const min = d.getMinutes();
      const sec = d.getSeconds();
      return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day) + ' ' + (hour < 10 ? '0' + hour : hour) + ':' + (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
    },*/
    setDataBefore(val) {
      if (val === null) {
        val = '';
      }
      this.valueBefore = val;
      let v = this.valueBefore + '~' + this.valueAfter;
      if (v == '~') {
        v = '';
      }
      this.$emit('setData', [v]);
      this.$emit('setValue', [v]);
    },
    setDataAfter(val) {
      if (val === null) {
        val = '';
      }
      this.valueAfter = val;
      let v = this.valueBefore + '~' + this.valueAfter;
      if (v == '~') {
        v = '';
      }
      this.$emit('setData', [v]);
      this.$emit('setValue', [v]);
    },
    init() {}
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
    },
    valueBNumber: function() {
      if (this.valueList && this.valueList.length > 0) {
        if (this.valueList[0].indexOf('~') > -1) {
          if (this.valueList[0].split('~')[0] !== '') {
            return parseInt(this.valueList[0].split('~')[0]);
          }
        }
      }
      console.log('here');
      return '';
    },
    valueANumber: function() {
      if (this.valueList && this.valueList.length > 0) {
        if (this.valueList[0].indexOf('~') > -1) {
          if (this.valueList[0].split('~')[1] !== '') {
            return parseInt(this.valueList[0].split('~')[1]);
          }
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
<style lang="less" scoped>
.item {
  display: inline-block;
}
</style>
