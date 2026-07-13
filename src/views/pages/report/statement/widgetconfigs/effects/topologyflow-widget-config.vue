<template>
  <div>
    <TsFormItem :label="$t('term.report.displaymode')" labelPosition="top">
      <TsFormSelect
        :value="getConfigValue('renderMode', 'normal')"
        :dataList="renderModeList"
        :transfer="true"
        @change="changeRenderMode"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.enableanimation')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('enabled', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('enabled', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.topologytemplate')" labelPosition="top">
      <TsFormSelect
        :value="getConfigValue('preset', 'ops')"
        :dataList="presetList"
        :transfer="true"
        @change="val => setConfigValue('preset', val)"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.flowdirection')" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('direction', 'forward')"
        :dataList="directionList"
        @change="val => setConfigValue('direction', val)"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.flowspeed')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('speed', 8)"
          :min="1"
          :max="30"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('speed', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.flowlightlength')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('flowLength', 10)"
          :min="4"
          :max="28"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('flowLength', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem v-if="!isAmbientMode" :label="$t('term.report.flowlightdensity')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('flowDensity', 1)"
          :min="1"
          :max="3"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('flowDensity', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.linestyle')" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('lineStyle', 'solid')"
        :dataList="lineStyleList"
        @change="val => setConfigValue('lineStyle', val)"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.linecap')" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('lineCap', 'round')"
        :dataList="lineCapList"
        @change="val => setConfigValue('lineCap', val)"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.linewidth')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('lineWidth', 2)"
          :min="1"
          :max="10"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('lineWidth', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.baselineopacity')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('baseOpacity', isAmbientMode ? 0.12 : 0.24)"
          :min="0.05"
          :max="1"
          :step="0.05"
          show-tip="never"
          @on-change="val => setConfigValue('baseOpacity', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <template v-if="!isAmbientMode">
      <TsFormItem :label="$t('term.report.shownodes')" labelPosition="top">
        <TsFormSwitch
          :value="getConfigValue('showNodes', true)"
          :true-value="true"
          :false-value="false"
          @change="val => setConfigValue('showNodes', val)"
        ></TsFormSwitch>
      </TsFormItem>
      <TsFormItem v-if="getConfigValue('showNodes', true)" :label="$t('term.report.nodestyle')" labelPosition="top">
        <TsFormRadio
          :value="getConfigValue('nodeStyle', 'dot')"
          :dataList="nodeStyleList"
          @change="val => setConfigValue('nodeStyle', val)"
        ></TsFormRadio>
      </TsFormItem>
      <TsFormItem v-if="getConfigValue('showNodes', true)" :label="$t('term.report.nodesize')" labelPosition="top">
        <div class="pl-sm pr-sm">
          <Slider
            :value="getConfigValue('nodeSize', 4)"
            :min="2"
            :max="12"
            :step="1"
            show-tip="never"
            @on-change="val => setConfigValue('nodeSize', val)"
          ></Slider>
        </div>
      </TsFormItem>
      <TsFormItem v-if="getConfigValue('showNodes', true)" :label="$t('term.report.nodeopacity')" labelPosition="top">
        <div class="pl-sm pr-sm">
          <Slider
            :value="getConfigValue('nodeOpacity', 1)"
            :min="0.1"
            :max="1"
            :step="0.05"
            show-tip="never"
            @on-change="val => setConfigValue('nodeOpacity', val)"
          ></Slider>
        </div>
      </TsFormItem>
      <TsFormItem :label="$t('term.report.lowperformancemode')" labelPosition="top">
        <TsFormSwitch
          :value="getConfigValue('lowPerformance', false)"
          :true-value="true"
          :false-value="false"
          @change="val => setConfigValue('lowPerformance', val)"
        ></TsFormSwitch>
      </TsFormItem>
    </template>
  </div>
</template>
<script>
import { WidgetBaseConfig } from '../original/base-config.js';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  extends: WidgetBaseConfig,
  props: { config: { type: Object } },
  data() {
    return {
      renderModeList: [
        { value: 'normal', text: this.$t('term.report.normal') },
        { value: 'ambient', text: this.$t('term.report.ambient') }
      ],
      presetList: [
        { value: 'ops', text: this.$t('term.report.opspath') },
        { value: 'mesh', text: this.$t('term.report.meshpath') },
        { value: 'hub', text: this.$t('term.report.hubspoke') },
        { value: 'pipeline', text: this.$t('term.report.pipeline') },
        { value: 'vertical', text: this.$t('term.report.verticalpath') },
        { value: 'ring', text: this.$t('term.report.ringflow') }
      ],
      directionList: [
        { value: 'forward', text: this.$t('term.report.forward') },
        { value: 'reverse', text: this.$t('term.report.reverse') }
      ],
      lineStyleList: [
        { value: 'solid', text: this.$t('term.report.solidline') },
        { value: 'dashed', text: this.$t('term.report.dashedline') }
      ],
      lineCapList: [
        { value: 'round', text: this.$t('term.report.roundcap') },
        { value: 'butt', text: this.$t('term.report.buttcap') }
      ],
      nodeStyleList: [
        { value: 'dot', text: this.$t('term.report.dot') },
        { value: 'ring', text: this.$t('term.report.halo') },
        { value: 'pulse', text: this.$t('term.report.pulse') }
      ]
    };
  },
  methods: {
    setConfigValue(attrName, attrValue) {
      this.$emit('setConfig', attrName, attrValue);
    },
    changeRenderMode(val) {
      this.setConfigValue('renderMode', val);
      if (val === 'ambient') {
        this.setConfigValue('showNodes', false);
        this.setConfigValue('flowDensity', 1);
        this.setConfigValue('lowPerformance', true);
        this.setConfigValue('baseOpacity', Math.min(Number(this.getConfigValue('baseOpacity', 0.12)) || 0.12, 0.12));
      }
    }
  },
  computed: {
    isAmbientMode() {
      return this.getConfigValue('renderMode', 'normal') === 'ambient';
    }
  }
};
</script>
