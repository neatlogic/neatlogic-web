<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.displayrange') }}</label>
      <div class="ivu-form-item-content">
        <TsFormRadio
          :value="config.viewLevel.level"
          :true-value="true"
          :false-value="false"
          :dataList="[
            { value: 'country', text: $t('term.report.country') },
            { value: 'province', text: $t('term.report.province') },
            { value: 'city', text: $t('term.report.city') }
          ]"
          @change="
            val => {
              setConfigValue('viewLevel.level', val);
              changeDistrict(val);
            }
          "
        ></TsFormRadio>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.area') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSelect
          :value="config.viewLevel.accode"
          :dataList="districtList"
          @change="
            val => {
              setConfigValue('viewLevel.accode', val);
            }
          "
        ></TsFormSelect>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: { config: { type: Object } },
  data() {
    return {
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
        { value: 'inner', text: this.$t('term.report.positions.inner') },
        { value: 'outer', text: this.$t('term.report.positions.outer') }
      ],
      districtList: []
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
    changeDistrict(level) {
      if (level == 'country') {
        this.setConfigValue('viewLevel.accode', 100000);
      } else if (level == 'province') {
        this.$api.report.reportdata.searchDistrict({parent: 100000}).then(res => {
          this.districtList = res.Return;
        });
      }
    },
    setConfigValue(attrName, attrValue) {
      if (attrName) {
        this.$emit('setConfig', attrName, attrValue);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
