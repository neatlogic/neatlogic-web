<template>
  <div>
    <TsFormItem :label="$t('page.name')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <TsFormInput v-model="config.name" border="border" :maxlength="50"></TsFormInput>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.style')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <TsFormRadio v-model="config.style" :dataList="typeList"></TsFormRadio>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.animation')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <TsFormSwitch
          :value="config.animationTimes === -1"
          :trueValue="true"
          :falseValue="false"
          @on-change="
            val => {
              if (val) {
                setConfig('animationTimes', -1);
              } else {
                setConfig('animationTimes', 0);
              }
            }
          "
        ></TsFormSwitch>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.color')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <ColorPicker
          v-model="config.stroke"
          recommend
          transfer
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfig('stroke', val);
            }
          "
        />
      </div>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      typeList: [
        { value: 'solid', text: '实线' },
        { value: 'dotted', text: '虚线' }
      ],
      configLocal: this.config
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
    selectIcon(icon) {
      this.setConfig('icon', '#' + icon);
      this.isIconDialogShow = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.logo {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: inline-block;
  position: relative;
  border: 1px solid;
  top: -5px;
  text-align: center;
  line-height: 40px;
  .logo-icon {
    font-size: 20px;
    // position: absolute;
    // top: 4px;
    // left: 10px;
  }
  &::after {
    left: 44px;
    width: 40px;
    position: absolute;
    top: 2px;
  }
}
</style>
