<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('page.fontsize') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSelect
          :value="config.fontsize"
          :dataList="dataList"
          transfer
          border="border"
          @on-change="val => {
            setConfigValue('fontsize', val);
          }"
        ></TsFormSelect>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('page.fontcolor') }}</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :value="config.fontcolor"
          :transfer="true"
          recommend
          format="hex"
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => {
            setConfigValue('fontcolor', val);
          }"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    config: { type: Object }
  },
  data() {
    return {
      dataList: [
        {
          text: this.$t('term.report.chartsetting.small12px'),
          value: 12
        },
        {
          text: this.$t('term.report.chartsetting.medium16px'),
          value: 16
        },
        {
          text: this.$t('term.report.chartsetting.large20px'),
          value: 20
        }
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
  methods: {
    setConfigValue(attrName, attrValue) {
      if (attrName) {
        this.$emit('setConfig', attrName, attrValue);
      }
    }
  },
  filter: {},
  computed: {
  },
  watch: {
  }
};
</script>
<style lang="less">
</style>
