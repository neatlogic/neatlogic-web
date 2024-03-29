<template>
  <div>
    <TsFormItem :label="$t('term.framework.direction')" labelPosition="top">
      <TsFormRadio
        v-model="config.direction"
        :dataList="directionList"
        :disabled="disabled"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('page.datasource')" labelPosition="top">
      <TsFormRadio
        v-model="config.dataSource"
        :dataList="dataSourceList"
        :disabled="disabled"
        @change="changDataSource"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem
      v-if="config.dataSource === 'static'"
      :label="$t('page.dropdownoption')"
      labelPosition="top"
      required
    >
      <div class="radius-sm padding-md" :class="validClass('dataList')">
        <StaticDataEditor v-model="config.dataList" :disabled="disabled"></StaticDataEditor>
      </div>
    </TsFormItem>
    <TsFormItem
      v-if="config.dataSource === 'matrix'"
      :label="$t('page.matrix')"
      labelPosition="top"
      required
    >
      <div class="radius-sm padding-md" :class="validClass('matrixUuid')">
        <TsFormSelect
          v-model="config.matrixUuid"
          v-bind="matrixConfig"
          :selectItemList.sync="selectMatrixConfig"
          :disabled="disabled"
          @first="$utils.matrixDataSourceRedirect()"
          @on-change="changeMatrixUuid()"
        >
          <template v-slot:option="{item}">
            <div>{{ item.name }}<span v-if="item.type" class="text-grey cen-align">({{ item.type }})</span></div>
          </template>
        </TsFormSelect>
        <div v-if="!disabled" class="matrix-btn">
          <i
            v-if="config.matrixUuid"
            class="tsfont-edit pl-xs text-tip-active"
            :title="$t('page.edit')"
            @click="$utils.matrixDataSourceRedirect(config.matrixUuid, selectMatrixConfig)"
          ></i>
          <i class="tsfont-rotate-right pl-xs text-tip-active" :title="$t('page.refresh')" @click="refreshMatrixConfig(config.matrixUuid)"></i>
        </div>
      </div>
    </TsFormItem>
    <TsFormItem v-if="config.dataSource === 'matrix' && config.matrixUuid && mappingDataList.length > 0" labelPosition="top" :label="$t('page.fieldmapping')">
      <div class="padding-md radius-md" :class="validClass('mapping')">
        <Row :gutter="10">
          <Col span="12">
            <label class="text-grey require-label">{{ $t('page.value') }}</label>
            <div class="formsetting-text">
              <TsFormSelect
                ref="mappingValue"
                v-model="config.mapping.value"
                type="text"
                :validateList="['required']"
                :dataList="mappingDataList"
                valueName="uuid"
                textName="name"
                :transfer="true"
                :disabled="disabled"
              ></TsFormSelect>
            </div>
          </Col>
          <Col span="12">
            <label class="text-grey require-label">{{ $t('page.displaytext') }}</label>
            <div class="formsetting-text">
              <TsFormSelect
                ref="mappingText"
                v-model="config.mapping.text"
                type="text"
                :validateList="['required']"
                valueName="uuid"
                :dataList="mappingDataList"
                textName="name"
                :transfer="true"
                :disabled="disabled"
              ></TsFormSelect>
            </div>
          </Col>
        </Row>
      </div>
    </TsFormItem>
    <TsFormItem v-if="config.matrixUuid && config.dataSource === 'matrix' && selectMatrixConfig" labelPosition="top" :label="$t('page.filtercondition')">
      <div class="bg-block padding-md radius-md" :class="validClass('sourceColumnList')">
        <DataSourceFilter
          v-model="config.sourceColumnList"
          :dataList="mappingDataList"
          :matrixUuid="config.matrixUuid"
          :matrixType="selectMatrixConfig.type"
          :disabled="disabled"
        ></DataSourceFilter>
      </div>
    </TsFormItem>
    <!-- <TsFormItem v-if="(config.dataSource === 'matrix' && config.matrixUuid) || (config.dataSource === 'static' && validatedDataList.length > 0)" label="默认值" labelPosition="top">
      <TsFormSelect
        v-model="config.defaultValue"
        v-bind="defaultValueSetting"
        :multiple="true"
        search
        transfer
      ></TsFormSelect>
    </TsFormItem> -->
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    StaticDataEditor: resolve => require(['./common/static-data-editor.vue'], resolve),
    DataSourceFilter: resolve => require(['./common/data-source-filter.vue'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      dataSourceList: [
        { value: 'static', text: this.$t('page.staticdatasource')},
        { value: 'matrix', text: this.$t('page.matrix') }
      ],
      defaultValueTypeList: [
        { value: 'self', text: this.$t('page.custom') },
        { value: 'quote', text: this.$t('page.reference') }
      ],
      directionList: [{value: 'vertical', text: this.$t('page.vertical')}, {value: 'horizontal', text: this.$t('page.horizontal') }],
      mappingDataList: [],
      matrixConfig: {
        dynamicUrl: '/api/rest/matrix/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'uuid',
        firstLi: true,
        firstText: this.$t('page.datasource'),
        transfer: true
      },
      selectMatrixConfig: null,
      isFirst: true
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    refreshMatrixConfig(matrixUuid) {
      this.matrixConfig.dynamicUrl = '/api/rest/matrix/search?refuuid=' + this.$utils.setUuid();
      this.$Message.success('刷新成功');
      if (matrixUuid) {
        this.$api.framework.matrix.getMatrixAttributeByUuid({ matrixUuid: matrixUuid }).then(res => {
          if (res.Status == 'OK') {
            this.mappingDataList = res.Return.tbodyList;
          }
        });
      }
    },
    changDataSource() {
      this.$set(this.config, 'defaultValue', []);
      this.$set(this.config, 'dataList', []);
      this.$set(this.config, 'matrixUuid', '');
      this.$set(this.config.mapping, 'value', '');
      this.$set(this.config.mapping, 'text', '');
      this.$set(this.config, 'sourceColumnList', []);
    },
    changeMatrixUuid() {
      this.$set(this.config, 'defaultValue', null);
      this.$set(this.config.mapping, 'value', '');
      this.$set(this.config.mapping, 'text', '');
      this.$set(this.config, 'sourceColumnList', []);
    },
    getFilterList(val) {
      let filterList = [];
      if (val && val.length > 0) {
        val.forEach(item => {
          if (item.valueList && item.column && item.expression) {
            filterList.push({
              uuid: item.column,
              expression: item.expression,
              valueList: item.valueList
            });
          }
        });
      }
      if (filterList.length > 0) {
        this.$set(this.config, 'defaultValue', null);
      }
    }
  },
  filter: {},
  computed: {
    validatedDataList() {
      const dataList = [];
      if (this.config.dataList && this.config.dataList.length > 0) {
        this.config.dataList.forEach(d => {
          let isValid = false;
          const data = {};
          const value = (d.value || d.value === 0) ? d.value : null;
          const text = (d.text || d.text === 0) ? d.text : null;
          if (value != null && text != null) {
            data.value = value;
            data.text = text;
            isValid = true;
          } else if (value == null && text != null) {
            data.value = text;
            data.text = text;
            isValid = true;
          } else if (value != null && text == null) {
            data.value = value;
            data.text = value;
            isValid = true;
          }
          if (isValid && !dataList.find(dd => dd.value == data.value)) {
            dataList.push(data);
          }
        });
      }
      return dataList;
    },
    defaultValueSetting() {
      const setting = {};
      const config = this.config;
      if (config.isMultiple) {
        setting.multiple = config.isMultiple;
      }
      if (config.dataSource === 'matrix') {
        setting.dynamicUrl = '/api/rest/matrix/column/data/search/forselect';
        setting.rootName = 'dataList';
        const params = { matrixUuid: config.matrixUuid };
        if (this.config.mapping) {
          params.valueField = this.config.mapping.value;
          params.textField = this.config.mapping.text;
        }
        setting.params = params;
      } else {
        setting.dataList = this.validatedDataList;
      }
      return setting;
    },
    componentList() {
      const componentList = [];
      this.formItemList.forEach(d => {
        if (d.uuid != this.formItem.uuid && ['formselect', 'formradio', 'formcheckbox'].includes(d.handler)) {
          componentList.push({ value: d.uuid, text: d.label });
        }
      });
      return componentList;
    }
  },
  watch: {
    'config.matrixUuid': {
      handler: function(newVal, oldVal) {
        if (newVal) {
          if (oldVal && newVal != oldVal) {
            this.config.mapping.value = '';
            this.config.mapping.text = '';
          }
          this.$api.framework.matrix.getMatrixAttributeByUuid({ matrixUuid: newVal }).then(res => {
            if (res.Status == 'OK') {
              this.mappingDataList = res.Return.tbodyList;
            }
          });
        }
      },
      deep: true,
      immediate: true
    },
    'config.sourceColumnList': {
      handler(val, oldVal) {
        if (!this.isFirst && !this.$utils.isSame(val, oldVal)) {
          this.getFilterList(val);
        }
        this.isFirst = false;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.matrix-btn {
  position: absolute;
  right: 0;
  top: -30px;
}
</style>
