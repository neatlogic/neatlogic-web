<template>
  <div class="selectContent">
    <!-- start_必填 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <!-- end_必填 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">切换组件</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="changeRadio" class="col-3" @on-change="change">
          <Radio label="formselect">下拉框</Radio>
          <Radio label="formradio">单选框</Radio>
          <Radio label="formcheckbox">复选框</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- strat 排列方向 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">排列方向</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.direction" class="col-2">
          <Radio label="transverse">横向</Radio>
          <Radio label="portrait">纵向</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- end 排列方向 -->
    <dataSource
      ref="dataSource"
      :setting="setting"
      :uuid="uuid"
      @changeDefaultValue="setDefaultJson"
    ></dataSource>

    <!-- start_默认值 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">默认值</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.defaultValueType" class="col-2" @on-change="changeDefaultValueType">
          <Radio label="self">自定义</Radio>
          <Radio label="quote">引用</Radio>
        </RadioGroup>
        <!-- 自定义组件 -->
        <div style="padding-top:14px">
          <TsFormSelect
            v-if="setting.defaultValueType == 'self'"
            v-model="setting.defaultValueList"
            v-bind="defaultSelfJson"
            :dataList="defaultValueDataList"
            :showName="setting.dataSource == 'matrix' ? 'html' : 'text'"
            search
            transfer
          ></TsFormSelect>
          <!-- 引用 -->
          <TsFormSelect
            v-if="setting.defaultValueType == 'quote'"
            v-model="setting.quoteUuid"
            transfer
            :dataList="getComponentList"
            placeholder="请选择引用组件"
          ></TsFormSelect>
        </div>
      </div>
    </div>
    <!-- end_默认值 -->
  </div>
</template>
<script>
import dataSource from './dataSource/dataSource.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import sheetCompontMixins from '@/resources/mixins/sheetCompontMixins.js';
export default {
  name: 'Formradio',
  components: { dataSource, TsFormSelect },
  mixins: [sheetCompontMixins],
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },
  data() {
    let _this = this;
    return {
      changeRadio: 'formradio',
      defaultValueDataList: []
    };
  },
  created() {},
  mounted() {
    this.$nextTick(function() {
      this.setDefaultJson(true);
    });
  },
  methods: {
    change(val) {
      this.$parent.updateOwnsetting('handler', val);
    },
    changeDefaultValueType(val) {
      //改变默认值类型
      this.setting.defaultValueList = '';
      this.setting.quoteUuid = '';
    },
    dealDataByUrl(nodeList) {
      //当默认值的引用类型是自定义  处理默认值的数据结构
      return this.dealDataFilter(nodeList, this.setting);
    },
    setDefaultJson(isInit, refresh) {
      //当是矩阵数据源时，改变矩阵中的配置时，需要触发改变默认值
      let _this = this;
      this.defaultValueDataList = [];
      if (this.setting.defaultValueType == 'self' && this.setting.dataSource == 'matrix') {
        !isInit && !refresh && (this.setting.defaultValueList = []);
        if (this.setting.mapping.value && this.setting.mapping.text) {
          let param = { matrixUuid: _this.setting.matrixUuid };
          param.keywordColumn = this.setting.mapping.text;
          param.columnList = [this.setting.mapping.value, this.setting.mapping.text];
          this.defaultSelfJson.params = param;
          this.defaultSelfJson.url = this.defaultSelfJson.defaultUrl;
        }
      } else if (this.setting.defaultValueType == 'self' && this.setting.dataSource == 'static') {
        !isInit && (this.setting.defaultValueList = []);
        this.defaultValueDataList = this.setting.dataList;
        this.defaultSelfJson.url = null;
      }
    },
    validComponent() {
      let validList = [];
      if (this.$refs.dataSource && this.$refs.dataSource.validComponent) {
        validList = this.$refs.dataSource.validComponent();
      }
      return validList;
    }
  },
  computed: {
    getComponentList() {
      let changeJSON = ['formradio', 'formselect', 'formcheckbox'];
      return this.controllerList.filter(item => {
        return changeJSON.indexOf(item.handler) >= 0 && item.value != this.uuid;
      });
    },
    getMapping() {
      let _this = this;
      return function(type) {
        return _this.setting.mapping[type] || type;
      };
    }
  },
  watch: {
    uuid: function() {
      this.setDefaultJson(true);
    }
  }
};
</script>
<style lang="less"></style>
