<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.showtitle') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormSwitch v-model="myConfig.title.visible" :true-value="true" :false-value="false"></TsFormSwitch>
      </div>
    </div>
    <div v-if="myConfig.title.visible" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.titlecontent') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormInput
          v-model="myConfig.title.text"
        ></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.showexplain') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormSwitch v-model="myConfig.description.visible" :true-value="true" :false-value="false"></TsFormSwitch>
      </div>
    </div>
    <div v-if="myConfig.description.visible" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.explaincontent') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormInput
          v-model="myConfig.description.text"
        ></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.yfieldalias') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormInput v-model="myConfig.meta.yField.alias"></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.xfieldalias') }}
      </label>
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
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    //TsFormSelect:()=>import('@/resources/plugins/TsForm/TsFormSelect'),
    //TsFormRadio:()=>import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: { config: { type: Object } },
  data() {
    return {
      myConfig: {
        //legend: { visible: true, position: 'bottom-center' },
        //label: { visible: false, type: 'outer' },
        title: { visible: false, text: '' },
        description: { visible: false, text: '' },
        meta: {xField: {alias: this.$t('term.report.axis.xfield')}, yField: {alias: this.$t('term.report.axis.yfield')}}
      },
      layoutList: [
        { value: 'horizontal', text: this.$t('term.report.horizontallayout') },
        { value: 'vertical', text: this.$t('term.report.verticallayout') }
      ],
      positionList: [
        { value: 'top-left', text: this.$t('term.report.positions.topleft') },
        { value: 'top', text: this.$t('term.report.positions.top') },
        { value: 'top-right', text: this.$t('term.report.positions.topright') },
        { value: 'bottom-left', text: this.$t('term.report.positions.bottomleft') },
        { value: 'bottom', text: this.$t('term.report.positions.bottom') },
        { value: 'bottom-right', text: this.$t('term.report.positions.bottomright') },
        { value: 'left-top', text: this.$t('term.report.positions.lefttop') },
        { value: 'left', text: this.$t('term.report.positions.left') },
        { value: 'left-bottom', text: this.$t('term.report.positions.leftbottom') },
        { value: 'right-top', text: this.$t('term.report.positions.righttop') },
        { value: 'right', text: this.$t('term.report.positions.right') },
        { value: 'right-bottom', text: this.$t('term.report.positions.rightbottom') }
      ],
      labelTypeList: [
        { value: 'inner', text: this.$t('term.report.positions.inner')},
        { value: 'outer', text: this.$t('term.report.positions.outer')}
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
