<template>
  <div>
    <TsForm
      ref="layoutForm"
      v-model="currentWidget"
      :item-list="layoutFormConfig"
      labelPosition="top"
    >
      <template v-slot:padding>
        <div class="pl-md pr-md">
          <Slider
            v-model="currentWidget.padding"
            :min="0"
            :max="50"
            :step="1"
            show-tip="never"
          ></Slider>
        </div>
      </template>
      <template v-slot:color>
        <ColorPicker
          :transfer="true"
          alpha
          recommend
          :value="currentWidget.color"
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => setWidgetValue('color', val)"
        />
      </template>
      <template v-slot:accentColor>
        <ColorPicker
          :transfer="true"
          alpha
          recommend
          :value="currentWidget.accentColor"
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => setWidgetValue('accentColor', val)"
        />
      </template>
      <template v-slot:borderConfig>
        <BorderConfig
          v-if="getBorderComponentByName(currentWidget.border)"
          :config="getCurrentWidgetBorderConfig()"
          :type="currentWidget.border"
          @setConfig="setBorderConfig"
        ></BorderConfig>
      </template>
    </TsForm>
  </div>
</template>
<script>
import { BORDER_LIST } from './widgetborders/border-list.js';
import { isTitleTemplate } from './widgets/original/text-title-template.js';

export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    BorderConfig: () => import('./widgetborderconfigs/widget-border-config.vue')
  },
  props: {
    currentWidget: {type: Object},
    currentWidgetComponent: {type: Object}
  },
  data() {
    return {
      layoutFormConfig: {
        x: {
          type: 'number',
          label: this.$t('term.report.axis.xcoordinate'),
          onChange: val => {
            this.$set(this.currentWidget, 'x', val);
          }
        },
        y: {
          type: 'number',
          label: this.$t('term.report.axis.ycoordinate'),
          onChange: val => {
            this.$set(this.currentWidget, 'y', val);
          }
        },
        width: {
          type: 'number',
          label: this.$t('page.width'),
          onChange: val => {
            this.$set(this.currentWidget, 'width', val);
          }
        },
        height: {
          type: 'number',
          label: this.$t('page.height'),
          onChange: val => {
            this.$set(this.currentWidget, 'height', val);
          }
        },
        padding: {
          type: 'slot',
          label: this.$t('page.margin'),
          onChange: val => {
            this.$set(this.currentWidget, 'padding', val);
          }
        },
        // 统一外观配置放在布局里，便于大屏组件跟随主题换肤。
        color: {
          type: 'slot',
          label: '主色',
          isHidden: true
        },
        accentColor: {
          type: 'slot',
          label: '强调色',
          isHidden: true
        },
        border: {
          type: 'select',
          label: this.$t('page.border'),
          transfer: true,
          valueName: 'name',
          textName: 'label',
          dataList: BORDER_LIST,
          onChange: (val, item, selectObj) => {
            this.$set(this.currentWidget, 'border', val);
            this.$set(this.currentWidget, 'borderConfig', selectObj && selectObj.config);
          }
        },
        borderConfig: {
          type: 'slot',
          hideLabel: true
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.syncAppearanceFormConfig();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getCurrentWidgetBorderConfig() {
      if (this.currentWidget.border && !this.currentWidget.borderConfig) {
        this.$set(this.currentWidget, 'borderConfig', this.getBorderComponentByName(this.currentWidget.border).config);
      }
      return this.currentWidget.borderConfig;
    },
    getBorderComponentByName(borderName) {
      return BORDER_LIST.find(d => d.name === borderName);
    },
    setWidgetValue(attrName, attrValue) {
      this.$set(this.currentWidget, attrName, attrValue);
    },
    syncAppearanceFormConfig() {
      const isHidden = !this.isSupportAppearanceColor;
      this.$set(this.layoutFormConfig.color, 'isHidden', isHidden);
      this.$set(this.layoutFormConfig.accentColor, 'isHidden', isHidden);
    },
    setBorderConfig(config) {
      if (this.currentWidget) {
        Object.assign(this.currentWidget.borderConfig, config);
      }
    }
  },
  filter: {},
  computed: {
    isSupportAppearanceColor() {
      if (this.currentWidget && this.currentWidget.type === 'text') {
        return isTitleTemplate(this.currentWidget.config && this.currentWidget.config.titleTemplate);
      }
      return !!(this.currentWidgetComponent && this.currentWidgetComponent.supportAppearanceColor);
    }
  },
  watch: {
    currentWidgetComponent: {
      handler() {
        this.syncAppearanceFormConfig();
      },
      deep: true
    },
    currentWidget: {
      handler() {
        this.syncAppearanceFormConfig();
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
