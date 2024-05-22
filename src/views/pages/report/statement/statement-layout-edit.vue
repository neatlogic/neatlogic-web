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
        border: {
          type: 'select',
          label: this.$t('page.border'),
          transfer: true,
          valueName: 'name',
          textName: 'label',
          dataList: BORDER_LIST,
          onChange: val => {
            this.$set(this.currentWidget, 'border', val);
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
  mounted() {},
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
    setBorderConfig(config) {
      if (this.currentWidget) {
        Object.assign(this.currentWidget.borderConfig, config);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
