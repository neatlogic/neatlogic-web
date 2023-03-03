<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">显示标题</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch v-model="myConfig.title.visible" :true-value="true" :false-value="false"></TsFormSwitch>
      </div>
    </div>
    <div v-if="myConfig.title.visible" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">标题内容</label>
      <div class="ivu-form-item-content">
        <TsFormInput
          v-model="myConfig.title.text"
        ></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">显示说明</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch v-model="myConfig.description.visible" :true-value="true" :false-value="false"></TsFormSwitch>
      </div>
    </div>
    <div v-if="myConfig.description.visible" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">说明内容</label>
      <div class="ivu-form-item-content">
        <TsFormInput
          v-model="myConfig.description.text"
        ></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">Y轴字段别名</label>
      <div class="ivu-form-item-content">
        <TsFormInput v-model="myConfig.meta.yField.alias"></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">X轴字段别名</label>
      <div class="ivu-form-item-content">
        <TsFormInput v-model="myConfig.meta.xField.alias"></TsFormInput>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    //TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    //TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: { config: { type: Object } },
  data() {
    return {
      myConfig: {
        //legend: { visible: true, position: 'bottom-center' },
        //label: { visible: false, type: 'outer' },
        title: { visible: false, text: '' },
        description: { visible: false, text: '' },
        meta: {xField: {alias: 'X轴字段'}, yField: {alias: 'Y轴字段'}}
      },
      layoutList: [
        { value: 'horizontal', text: '横向布局' },
        { value: 'vertical', text: '纵向布局' }
      ],
      positionList: [
        { value: 'top-left', text: '上居左' },
        { value: 'top', text: '上居中' },
        { value: 'top-right', text: '上居右' },
        { value: 'bottom-left', text: '下居左' },
        { value: 'bottom', text: '下居中' },
        { value: 'bottom-right', text: '下居右' },
        { value: 'left-top', text: '左上角' },
        { value: 'left', text: '左居中' },
        { value: 'left-bottom', text: '左下角' },
        { value: 'right-top', text: '右上角' },
        { value: 'right', text: '右居中' },
        { value: 'right-bottom', text: '右下角' }
      ],
      labelTypeList: [
        { value: 'inner', text: '内部' },
        { value: 'outer', text: '外部' }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {},
  watch: {
    myConfig: {
      handler(val) {
        this.$emit('setConfig', val);
      },
      deep: true
    },
    config: {
      handler(val) {
        if (val) {
          Object.assign(this.myConfig, val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
