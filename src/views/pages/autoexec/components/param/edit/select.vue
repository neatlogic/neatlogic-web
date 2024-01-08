/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div>
    <div class="source-main">
      <div class="item">
        <Button
          type="primary"
          ghost
          :disabled="disabled"
          @click="editSourc()"
        >{{ $t('dialog.title.edittarget', {target: $t('page.datasource')}) }}</Button>
      </div>
      <div v-if="matrixconfig.matrixUuid || staticConfig.dataList.length>0" class="source-content overflow">
        <div class="item-text overflow bg-op border-color">
          <TsFormSelect
            v-if="dataSource == 'matrix'"
            ref="matrix"
            :value="matrixconfig.matrixUuid"
            v-bind="matrixConfig"
            :readonly="true"
          >
          </TsFormSelect>
          <div v-else>{{ $t('term.autoexec.static') }}</div>
        </div>  
        <div v-if="sourcDefaultValue" class="item-text overflow bg-op border-color">
          <TsFormSelect 
            v-model="sourcDefaultValue"
            v-bind="defaultValueConfig" 
            :multiple="multiple"
            :readonly="true"
            border="border"
          >
          </TsFormSelect>
        </div>
      </div>
    </div>
    <transition name="fade">
      <slot name="validMessage">
        <span
          v-if="validMesage != '' && (!matrixconfig.matrixUuid || !staticConfig.dataList.length)"
          class="form-error-tip"
          :title="validMesage"
          v-html="validMesage"
        ></span>
      </slot>
    </transition>
    <DataSource
      v-if="isShow"
      :sourcConfig="sourcConfig"
      :isShow="isShow"
      :multiple="multiple"
      @saveSourc="saveSourc"
      @close="close"
    ></DataSource> 
  </div>
</template>
<script>
import comMixin from './editmixin.js';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect,
    DataSource: resolve => require(['./dataSource/dataSource.vue'], resolve)
  },
  filters: {},
  mixins: [comMixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {},
  data() {
    return {
      matrixConfig: { //矩阵
        dynamicUrl: '/api/rest/matrix/search', 
        rootName: 'tbodyList', 
        textName: 'name', 
        valueName: 'uuid', 
        multiple: false
      },
      dataSource: 'matrix', //数据源类型：static（静态数据源）、matrix（矩阵）
      isShow: false,
      staticConfig: {//静态数据源
        dataList: []
      },
      matrixconfig: {//矩阵
        matrixUuid: null, 
        mapping: {text: '', value: ''}
      },
      sourcConfig: {}, //当前展示数据源
      validMesage: '',
      defaultValueConfig: { //矩阵默认值设置
        dynamicUrl: '/api/rest/matrix/column/data/search/forselect', 
        rootName: 'dataList', 
        param: null
      },
      sourcDefaultValue: '', //数据源默认值
      multiple: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getDataConfig();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init(data) {
      let config = {};
      this.sourcConfig = {};
      this.sourcDefaultValue = '';
      if (data) {
        data.defaultValue && (this.sourcDefaultValue = data.defaultValue);
        data.dataSource && (this.dataSource = data.dataSource);
        if (this.sourcDefaultValue) {
          config.defaultValue = this.sourcDefaultValue;
        }
        config.dataSource = this.dataSource;
        if (this.dataSource == 'matrix') {
          data.matrixUuid && (this.matrixconfig.matrixUuid = data.matrixUuid);
          data.mapping && this.$set(this.matrixconfig, 'mapping', data.mapping);
          Object.assign(config, this.matrixconfig);
        } else if (this.dataSource == 'static') {
          data.dataList && (this.staticConfig.dataList = data.dataList);
          Object.assign(config, this.staticConfig);
        }
      }
      Object.assign(this.sourcConfig, config);
      return config;
    },
    getDataConfig() {
      this.$emit('change', this.sourcDefaultValue);
      this.$emit('getConfig', this.sourcConfig);
    },
    valid() {
      let isValid = true;
      this.validMesage = '';
      if (this.sourcConfig.dataSource == 'matrix') {
        if (!this.sourcConfig.matrixUuid) {
          isValid = false;
          this.validMesage = this.$t('form.validate.adddatasource');
        }
      } else if (this.sourcConfig.dataSource == 'static') {
        if (!this.sourcConfig.dataList.length) {
          isValid = false;
          this.validMesage = this.$t('form.validate.adddatasource');
        }
      }
      return isValid;
    },
    editSourc() { //编辑数据源
      this.isShow = true;
    },
    saveSourc(data) { //保存数据源
      this.init(data);
      this.uptateSetting();
      this.getDataConfig();
    },
    close() {
      this.isShow = false;
    },
    uptateSetting() { //更新默认值设置
      if (this.dataSource == 'static') {
        this.defaultValueConfig.dataList = this.sourcConfig.dataList || [];
        this.defaultValueConfig.params = null;
        this.defaultValueConfig.dynamicUrl = null;
      } else {
        if (this.sourcConfig.matrixUuid) {
          let keywordColumn = '';
          let valueField = null;
          let textField = null;
          if (this.sourcConfig.mapping && this.sourcConfig.mapping.value && this.sourcConfig.mapping.text) {
            valueField = this.sourcConfig.mapping.value;
            textField = this.sourcConfig.mapping.text;
            keywordColumn = this.sourcConfig.mapping.text;
          }
          let param = { matrixUuid: this.config.matrixUuid, keywordColumn: keywordColumn, valueField: valueField, textField: textField };  
          if (this.sourcDefaultValue) {
            if (Array.isArray(this.sourcDefaultValue)) {
              this.sourcDefaultValue.length && (param.defaultValue = this.sourcDefaultValue);
            } else {
              param.defaultValue = [this.sourcDefaultValue];
            }
          } else {
            this.$set(param, 'defaultValue', []);
          }
          this.defaultValueConfig.params = param;
          this.defaultValueConfig.dynamicUrl = '/api/rest/matrix/column/data/search/forselect';
        }
      }
    }
  },
  computed: {},
  watch: {
    config: {
      handler(val, oldVale) {
        if (val && !this.$utils.isSame(val, oldVale)) {
          let defaultConfig = this.$utils.deepClone(val);
          defaultConfig.dataSource && (this.dataSource = defaultConfig.dataSource);
          if (defaultConfig.type == 'checkbox' || defaultConfig.type == 'multiselect') {
            this.multiple = true;
          } else {
            this.multiple = defaultConfig.multiple || false;
          }
          this.init(defaultConfig);
          this.uptateSetting();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.source-main{
  display: flex;
  align-items: center;
  justify-content: space-between;
  .item {
    margin-right: 10px;
  }
  .source-content{
    display: flex;
    justify-content: flex-start;
    flex: 1;
  }
  .item-text{
    flex: 1;
    width: 50%;
    text-align: center;
    border: 1px solid;
    border-radius: 4px;
    &:not(:last-child){
      margin-right: 8px
    }
    /deep/ .tsform-readonly{
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      cursor: text;
      display:block;
      span {
        display: inline-flex !important;
      }
    }
  }
}
</style>
