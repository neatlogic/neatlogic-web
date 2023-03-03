<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">显示范围</label>
      <div class="ivu-form-item-content">
        <TsFormRadio
          :value="config.viewLevel.level"
          :true-value="true"
          :false-value="false"
          :dataList="[
            { value: 'country', text: '国家' },
            { value: 'province', text: '省份' },
            { value: 'city', text: '城市' }
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
      <label class="ivu-form-item-label overflow">地区</label>
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
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: { config: { type: Object } },
  data() {
    return {
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
