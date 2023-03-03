<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">百分比模式</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.isPercent ? true : false"
          :true-value="true"
          :false-value="false"
          @change="
            val => {
              setConfigValue('isPercent', val);
            }
          "
        ></TsFormSwitch>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">显示图例</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.legend.visible"
          :true-value="true"
          :false-value="false"
          @change="
            val => {
              setConfigValue('legend.visible', val);
            }
          "
        ></TsFormSwitch>
      </div>
    </div>
    <div v-if="config.legend.visible" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">图例位置</label>
      <div class="ivu-form-item-content">
        <TsFormSelect
          :value="config.legend.position"
          :transfer="true"
          :clearable="false"
          :dataList="positionList"
          @change="
            val => {
              setConfigValue('legend.position', val);
            }
          "
        ></TsFormSelect>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">显示数据</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.label ? true : false"
          :true-value="true"
          :false-value="false"
          @change="
            val => {
              if (val) {
                setConfigValue('label', {
                  position: 'middle',
                  content: item => {
                    return item.yField && Math.floor(item.yField * 100) / 100;
                  }
                });
              } else {
                setConfigValue('label', val);
              }
            }
          "
        ></TsFormSwitch>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">柱子宽度</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.columnWidthRatio"
            :min="0.1"
            :max="0.9"
            :step="0.1"
            show-tip="never"
            @on-change="
              val => {
                setConfigValue('columnWidthRatio', val);
              }
            "
          ></Slider>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
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
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
