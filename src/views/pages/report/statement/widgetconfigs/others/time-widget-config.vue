<template>
  <div>
    <TsFormItem :label="$t('term.report.horizontalalign')" labelPosition="top">
      <TsFormRadio
        :value="config.align || 'left'"
        :dataList="horizontalAlignList"
        @change="val => setConfigValue('align', val)"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.verticalalign')" labelPosition="top">
      <TsFormRadio
        :value="config.verticalAlign || 'top'"
        :dataList="verticalAlignList"
        @change="val => setConfigValue('verticalAlign', val)"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('page.fontsize')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="config.fontsize"
          :min="12"
          :max="50"
          :step="1"
          @on-change="
            val => {
              setConfigValue('fontsize', val);
            }
          "
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.fontcolor')" labelPosition="top">
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
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
  },
  props: {
    config: { type: Object }
  },
  data() {
    return {
      horizontalAlignList: [
        { value: 'left', text: this.$t('page.leftalign') },
        { value: 'center', text: this.$t('page.centeralign') },
        { value: 'right', text: this.$t('page.rightalign') }
      ],
      verticalAlignList: [
        { value: 'top', text: this.$t('term.report.top') },
        { value: 'middle', text: this.$t('term.report.middle') },
        { value: 'bottom', text: this.$t('term.report.bottom') }
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
