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

    <!-- start_切换组件 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">切换组件</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="handletype" class="col-3" @on-change="changeHandler">
          <Radio label="formselect">下拉框</Radio>
          <Radio label="formradio">单选框</Radio>
          <Radio label="formcheckbox">复选框</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- end_切换组件 -->

    <!-- start_多选 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        多选
        <i-switch v-model="setting.isMultiple" class="label-right" />
      </label>
    </div>
    <!-- end_多选 -->
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
            :dataList="defaultValueDataList" 
            v-bind="defaultSelfJson" 
            :multiple="setting.isMultiple" 
            :showName="setting.dataSource == 'matrix' ? 'html' : 'text'" 
            search 
            transfer
          >
          </TsFormSelect>
          <!-- 引用 -->
          <TsFormSelect
            v-else-if="setting.defaultValueType == 'quote'"
            v-model="setting.quoteUuid"
            transfer
            :dataList="getComponentList"
            placeholder="请选择引用组件"
          ></TsFormSelect>
        </div>
      </div>
    </div>
    <!-- end_默认值 -->
    <!-- start_输入提示 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">输入提示</label>
      <div class="formsetting-text">
        <TsFormInput
          v-model="setting.placeholder"
          type="text"
          width="100%"
          maxlength="50"
        ></TsFormInput>
      </div>
    </div>
    <!-- end_输入提示 -->
  </div>
</template>
<script>
import dataSource from './dataSource/dataSource.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import sheetCompontMixins from '@/resources/mixins/sheetCompontMixins.js';
let _this;
export default {
  name: 'FormeditSelect',
  components: { dataSource, TsFormSelect, TsFormInput},
  mixins: [sheetCompontMixins],
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },

  data() {
    let _this = this;
    return {
      handletype: 'formselect', //组件类型切换，默认下拉框
      defaultValueDataList: []
    };
  },
  mounted() {
    this.$nextTick(function() {
      this.setDefaultJson(true);
    });
  },
  created() {},
  destroyed() {},
  methods: {
    newcreate(q) {
      console.log(q);
    },
    changeHandler(val) {
      this.$parent.updateOwnsetting('handler', val);
    },
    changeDefaultValueType(val) {
      //改变默认值类型
      this.setting.defaultValueList = '';
      this.setting.quoteUuid = '';
      if (this.setting.isMultiple) {
        this.setting.defaultValueList = [];
      }
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
        !isInit && !refresh && (this.setting.defaultValueList = '');
        if (this.setting.mapping.value && this.setting.mapping.text) {
          let param = { matrixUuid: _this.setting.matrixUuid };
          param.keywordColumn = this.setting.mapping.text;
          param.valueField = this.setting.mapping.value;
          param.textField = this.setting.mapping.text;
          this.defaultSelfJson.rootName = 'dataList';
          this.defaultSelfJson.params = param;
          this.defaultSelfJson.dynamicUrl = this.defaultSelfJson.defaultUrl;
          this.defaultSelfJson.showName = 'html';
        } else {
          this.defaultSelfJson.dynamicUrl = '';
          this.defaultSelfJson.showName = '';
        }
      } else if (this.setting.defaultValueType == 'self' && this.setting.dataSource == 'static') {
        !isInit && (this.setting.defaultValueList = []);
        this.defaultValueDataList = this.setting.dataList ? this.setting.dataList.filter(d => d && d.value.toString().trim() != '') : [];
        this.defaultSelfJson.dynamicUrl = '';
        this.defaultSelfJson.showName = '';
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
    uuid: function(newValue) {
      this.setDefaultJson(true);
    }
  }
};
</script>
<style lang="less"></style>
