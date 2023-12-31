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
  <div class="matrix-block">
    <TsFormItem :label="$t('term.autoexec.matrix')" :validateList="validateList" labelPosition="top">
      <div class="matrix-select">
        <TsFormSelect
          ref="matrix"
          v-model="matrixUuid"
          v-bind="matrixConfig"
          transfer
          :selectItemList.sync="dataSourceJson"
          border="border"
          @on-change="changeMatrix(true)"
        >
          <template v-slot:first-ul>
            <li class="tsfont-plus text-href first-slot" @click="$utils.matrixDataSourceRedirect()">{{ $t('term.autoexec.datasource') }}</li>
          </template>
        </TsFormSelect>
        <div class="action-group">
          <span
            v-if="matrixUuid"
            class="tsfont-edit text-tip-active"
            :title="$t('page.edittarget', {target: $t('term.autoexec.datasource')})"
            @click="$utils.matrixDataSourceRedirect(matrixUuid,dataSourceJson)"
          ></span>
          <span class="tsfont-refresh text-tip-active" :title="$t('page.refreshtarget', {target: $t('term.autoexec.datasource')})" @click="refreshDataSource()"></span>
        </div>
      </div>
    </TsFormItem>
    <TsFormItem
      :label="$t('term.autoexec.fieldmapping')"
      labelPosition="top"
      :validateList="validateList"
    >
      <div>
        <DataMapping
          ref="dataMapping"
          :dataList="dataList"
          :mapping="mapping"
          @updateMapping="updateMapping"
        ></DataMapping>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.defaultvalue')" labelPosition="top">
      <TsFormSelect
        v-model="defaultValue" 
        v-bind="defaultSelfJson"
        :multiple="multiple"
        border="border"
        transfer
      ></TsFormSelect>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    DataMapping: resolve => require(['../dataMapping.vue'], resolve)
  },
  filters: {
  },
  props: {
    sourcConfig: Object,
    multiple: Boolean
  },
  data() {
    let _this = this;
    return {
      matrixConfig: { 
        dynamicUrl: '/api/rest/matrix/search', 
        rootName: 'tbodyList', 
        textName: 'name', 
        valueName: 'uuid', 
        multiple: false,
        validateList: ['required'],
        transfer: true
      },
      matrixUuid: null,
      dataSourceJson: null, //选中矩阵数据
      validateList: ['required'],
      dataList: [],
      mapping: {text: '', value: ''},
      defaultValue: null,
      config: null,
      defaultSelfJson: {
        dynamicUrl: '/api/rest/matrix/column/data/search/forselect/new',
        rootName: 'tbodyList',
        params: null,
        dealDataByUrl: _this.dealDataByUrl
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.changeMatrix();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeMatrix(isClearData) {
      //改变矩阵数据
      if (isClearData) {
        this.clearData();
      }
      if (this.matrixUuid) {
        this.$api.autoexec.action.getMatrixAttributeByUuid({ matrixUuid: this.matrixUuid }).then(res => {
          //获取矩阵的属性
          if (res.Status == 'OK') {
            this.dataList = res.Return.tbodyList || [];
          }
        });
      }
    },
    refreshDataSource() {
      //刷新数据源
      this.matrixConfig.dynamicUrl = '/api/rest/matrix/search?refuuid=' + this.$utils.setUuid();
      this.changeMatrix();
      this.$Message.success(this.$t('message.content.refreshsuccess'));
    },
    changeDefaultValue(val) {
      let data = {
        matrixUuid: this.matrixUuid,
        mapping: this.mapping,
        defaultValue: val
      };
      this.$emit('update', data);
    },
    dealDataByUrl(nodeList) {
      //当默认值的引用类型是自定义  处理默认值的数据结构
      return this.dealDataFilter(nodeList, this.config);
    },
    dealDataFilter(nodeList, config) {
      //当默认值的引用类型是自定义  处理默认值的数据结构
      let columlist = [];
      config = config || null;
      if (config.mapping.value && config.mapping.text && nodeList) {
        if (nodeList && nodeList.length > 0) {
          nodeList.forEach(co => {
            if (co[config.mapping.text]) {
              columlist.push({
                text: co[config.mapping.text].text,
                value: co[config.mapping.value].value + '&=&' + co[config.mapping.text].text,
                html: co[config.mapping.text].text
              });
            }
          });
        }
      }
      return columlist;
    },
    updateMapping() {
      if (this.matrixUuid && this.mapping.value && this.mapping.text) {
        this.defaultSelfJson.dynamicUrl = '/api/rest/matrix/column/data/search/forselect/new';
        this.defaultSelfJson.dealDataByUrl = this.dealDataByUrl;
        this.config.mapping = this.mapping;
        let param = { matrixUuid: this.matrixUuid };
        param.keywordColumn = this.mapping.text;
        param.columnList = [this.mapping.value, this.mapping.text];
        this.defaultSelfJson.params = param;
      } else {
        this.defaultSelfJson.dynamicUrl = '';
        this.defaultSelfJson.dealDataByUrl = null;
      }
    },
    getData() {
      let data = {
        matrixUuid: this.matrixUuid,
        mapping: this.mapping,
        defaultValue: this.defaultValue

      };
      return data;
    },
    valid() {
      let isValid = true;
      if (!this.matrixUuid) {
        isValid = false;
      }
      if (!this.$refs.dataMapping.validComponent()) {
        isValid = false;
      }
      return isValid;
    },
    clearData() {
      this.dataSourceJson = null;
      this.dataList = [];
      this.mapping = {text: '', value: ''};
      this.defaultValue = null;
    }
  },
  computed: {},
  watch: {
    sourcConfig: {
      handler(val) {
        if (val) {
          let config = this.$utils.deepClone(val);
          this.config = config;
          this.matrixUuid = config.matrixUuid;
          this.defaultValue = config.defaultValue;
          config.mapping && (this.mapping = config.mapping);
          this.updateMapping();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.matrix-select {
  position: relative;
  .action-group {
    position: absolute;
    top: -16px;
    right: 0;
    line-height: 1;
    .tsfont-edit {
      padding-right: 4px;
    }
  }
}
</style>
