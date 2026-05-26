<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('page.backgroundcolor') }}</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :value="getConfigValue('background.color.value', '')"
          :transfer="true"
          recommend
          format="hex"
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => {
            setConfigValue('background.color.value', val);
          }"
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">帧率上限</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="getConfigValue('fpsLimit', 30)"
            :min="15"
            :max="60"
            :step="5"
            @on-change="val => {
              setConfigValue('fpsLimit', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.particle.motion') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="getConfigValue('particles.move.enable', true)"
          :showStatus="true"
          :true-value="true"
          :false-value="false"
          @change="val => {
            setConfigValue('particles.move.enable', val);
          }"
        ></TsFormSwitch>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.particle.color') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="getConfigValue('particles.isRandomColor', true)"
          :showStatus="true"
          :trueText="$t('term.report.customcolor')"
          :falseText="$t('term.report.randomcolor')"
          :true-value="false"
          :false-value="true"
          @change="val => {
            setConfigValue('particles.isRandomColor', val);
          }"
        ></TsFormSwitch>
        <ColorPicker
          v-if="!getConfigValue('particles.isRandomColor', true)"
          :value="getConfigValue('particles.color.value', '')"
          :transfer="true"
          recommend
          format="hex"
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => {
            setConfigValue('particles.color.value', val);
          }"
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.particle.opacity') }}</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="getConfigValue('particles.opacity.value', 0.6)"
            :min="0.1"
            :max="1"
            :step="0.1"
            @on-change="val => {
              setConfigValue('particles.opacity.value', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.particle.count') }}</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="getConfigValue('particles.number.value', 10)"
            :min="1"
            :max="120"
            :step="1"
            @on-change="val => {
              setConfigValue('particles.number.value', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.particle.size') }}</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="getConfigValue('particles.size.value', 4)"
            :min="1"
            :max="40"
            :step="1"
            @on-change="val => {
              setConfigValue('particles.size.value', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.particle.autoconnect') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="getConfigValue('particles.links.enable', false)"
          :true-value="true"
          :false-value="false"
          @change="val => {
            setConfigValue('particles.links.enable', val);
          }"
        ></TsFormSwitch>
      </div>
    </div>
    <div v-if="getConfigValue('particles.links.enable', false)" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.particle.connectdistance') }}</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="getConfigValue('particles.links.distance', 100)"
            :min="10"
            :max="300"
            :step="10"
            @on-change="val => {
              setConfigValue('particles.links.distance', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div v-if="getConfigValue('particles.links.enable', false)" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.particle.connectcolor') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="getConfigValue('particles.links.isRandomColor', true)"
          :showStatus="true"
          :trueText="$t('term.report.customcolor')"
          :falseText="$t('term.report.randomcolor')"
          :true-value="false"
          :false-value="true"
          @change="val => {
            setConfigValue('particles.links.isRandomColor', val);
          }"
        ></TsFormSwitch>
        <ColorPicker
          v-if="!getConfigValue('particles.links.isRandomColor', true)"
          :value="getConfigValue('particles.links.color.value', '')"
          :transfer="true"
          recommend
          format="hex"
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => {
            setConfigValue('particles.links.color.value', val);
          }"
        />
      </div>
    </div>
    <div v-if="getConfigValue('particles.links.enable', false)" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.particle.connectopacity') }}</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="getConfigValue('particles.links.opacity', 0.4)"
            :min="0.1"
            :max="1"
            :step="0.1"
            @on-change="val => {
              setConfigValue('particles.links.opacity', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div v-if="getConfigValue('particles.links.enable', false)" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.particle.connectwidth') }}</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="getConfigValue('particles.links.width', 1)"
            :min="1"
            :max="5"
            :step="1"
            @on-change="val => {
              setConfigValue('particles.links.width', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { WidgetBaseConfig } from '../original/base-config.js';

export default {
  name: '',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  extends: WidgetBaseConfig,
  props: {
    config: { type: Object }
  },
  methods: {
    setConfigValue(attrName, attrValue) {
      if (attrName) {
        this.$emit('setConfig', attrName, attrValue);
      }
    }
  }
};
</script>
<style lang="less">
</style>
