<template>
  <div>
    <component :is="itemMap[conditionItem.type]" v-bind="conditionItem.config" @on-change="changeValue"></component>
  </div>
</template>
<script>
import * as handlers from '@/resources/components/Condition/item-list.js';

export default {
  name: '',
  components: {
    ...handlers
  },
  props: {
    conditionItem: { type: Object }
  },
  data() {
    return {
      itemMap: {
        text: 'TsFormInput', //text类型
        textarea: 'TsFormInput', //textarea
        password: 'TsFormInput', //password
        number: 'TsFormInput', //number
        url: 'TsFormInput', //url
        email: 'TsFormInput', //email
        tel: 'TsFormInput', //tel
        select: 'TsFormSelect', //下拉选择框
        radio: 'TsFormRadio', //radio
        switch: 'TsFormSwitch', //
        checkbox: 'TsFormCheckbox',
        date: 'TsFormDatePicker', //年-月-日 时：分：秒
        datetime: 'TsFormDatePicker', //年-月-日 时：分：秒
        daterange: 'TsFormDatePicker', //年-月-日   范围
        datetimerange: 'TsFormDatePicker', //年-月-日 时：分：秒   范围
        year: 'TsFormDatePicker', //年
        month: 'TsFormDatePicker', //月
        time: 'TsFormDatePicker', //时间 时：分：秒
        timerange: 'TsFormDatePicker', //时间 时：分：秒  范围
        userselect: 'UserSelect', //用户授权
        timeselect: 'TimeSelect'
      }
    };
  },
  beforeCreate() {},
  created() {
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
    changeValue() {
      console.log('changeValue', ...arguments);
      this.$emit('change', ...arguments);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
