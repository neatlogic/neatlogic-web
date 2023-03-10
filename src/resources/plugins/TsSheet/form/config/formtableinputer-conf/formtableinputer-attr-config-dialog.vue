<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="formitem_formConfig" v-model="propertyLocal" :item-list="formConfig">
          <template v-slot:isRequired>
            <TsFormSwitch v-model="propertyLocal.config.isRequired" :trueValue="true" :falseValue="false"></TsFormSwitch>
          </template>
          <template v-if="['formtext', 'formtextarea'].includes(propertyLocal.handler)" v-slot:config>
            <TsFormItem label="默认值" style="margin-bottom:16px">
              <!--由于最后一个formitem去掉了margin-bottom，这里补充回来-->
              <TsFormInput v-model="propertyLocal.config.defaultValue" :type="propertyLocal.handler.replace('form', '')"></TsFormInput>
            </TsFormItem>
          </template>
          <template v-else-if="['formselect', 'formradio', 'formcheckbox'].includes(propertyLocal.handler)" v-slot:config>
            <TsFormItem v-if="propertyLocal.handler !== 'formradio'" label="多选">
              <TsFormSwitch v-model="propertyLocal.config.isMultiple" :trueValue="true" :falseValue="false"></TsFormSwitch>
            </TsFormItem>
            <TsFormItem label="数据源" required>
              <TsFormSelect
                ref="formitem_datasource"
                v-model="propertyLocal.config.dataSource"
                :validateList="validateList"
                :dataList="dataSourceList"
                transfer
                border="border"
              ></TsFormSelect>
            </TsFormItem>
            <TsFormItem v-if="propertyLocal.config.dataSource === 'static'" label="下拉选项">
              <StaticDataEditor v-model="propertyLocal.config.dataList"></StaticDataEditor>
            </TsFormItem>
            <TsFormItem v-if="propertyLocal.config.dataSource === 'matrix'" label="矩阵">
              <TsFormSelect
                ref="formitem_matrixuuid"
                v-model="propertyLocal.config.matrixUuid"
                :validateList="validateList"
                dynamicUrl="/api/rest/matrix/search"
                rootName="tbodyList"
                textName="name"
                valueName="uuid"
                transfer
              ></TsFormSelect>
            </TsFormItem>
            <TsFormItem v-if="propertyLocal.config.dataSource === 'matrix' && propertyLocal.config.matrixUuid && mappingDataList.length > 0" label="字段映射">
              <div class="bg-block padding-md radius-md">
                <Row :gutter="10">
                  <Col span="12">
                    <label class="text-grey require-label">值</label>
                    <div class="formsetting-text">
                      <TsFormSelect
                        ref="formitem_value"
                        v-model="propertyLocal.config.mapping.value"
                        :validateList="validateList"
                        :dataList="mappingDataList"
                        valueName="uuid"
                        textName="name"
                        :transfer="true"
                      ></TsFormSelect>
                    </div>
                  </Col>
                  <Col span="12">
                    <label class="text-grey require-label">显示文字</label>
                    <div class="formsetting-text">
                      <TsFormSelect
                        ref="formitem_text"
                        v-model="propertyLocal.config.mapping.text"
                        :validateList="validateList"
                        valueName="uuid"
                        :dataList="mappingDataList"
                        textName="name"
                        :transfer="true"
                      ></TsFormSelect>
                    </div>
                  </Col>
                </Row>
              </div>
            </TsFormItem>
            <TsFormItem v-if="propertyLocal.config.dataSource === 'matrix' && propertyLocal.config.matrixUuid && tableMatrixColumnList.length > 0" label="过滤条件">
              <div class="bg-block padding-md radius-md">
                <div v-if="propertyLocal.config.sourceColumnList && propertyLocal.config.sourceColumnList.length > 0">
                  <Row
                    v-for="(sourceColumn, index) in propertyLocal.config.sourceColumnList"
                    :key="index"
                    :gutter="10"
                    class="mb-xs"
                  >
                    <Col span="10">
                      <TsFormSelect
                        v-model="sourceColumn.column"
                        :dataList="extraPropertyMatrixColumnList"
                        transfer
                        border="border"
                      ></TsFormSelect>
                    </Col>
                    <Col span="2" style="text-align:center" class="text-grey">等于</Col>
                    <Col span="10"><TsFormSelect
                      v-model="sourceColumn.valueColumn"
                      :dataList="tableMatrixColumnList"
                      transfer
                      border="border"
                    ></TsFormSelect></Col>
                    <Col span="2" style="text-align:center"><span class="tsfont-trash-o text-action" @click="removeSourceColumn(index)"></span></Col>
                  </Row>
                </div>
                <Button @click="addSourceColumn"><span class="tsfont-plus">过滤条件</span></Button>
              </div>
            </TsFormItem>
            <TsFormItem label="默认值">
              <div>
                <TsFormSelect
                  v-model="propertyLocal.config.defaultValue"
                  v-bind="defaultValueSetting"
                  search
                  transfer
                ></TsFormSelect>
              </div>
            </TsFormItem>
          </template>
          <template v-else-if="['formdate', 'formtime'].includes(propertyLocal.handler)" v-slot:config>
            <TsFormItem label="格式" required>
              <TsFormSelect
                v-if="propertyLocal.handler === 'formdate'"
                ref="formitem_format"
                v-model="propertyLocal.config.format"
                :validateList="validateList"
                :dataList="[
                  { value: 'yyyy-MM-dd', text: 'yyyy-MM-dd' },
                  { value: 'yyyy-MM', text: 'yyyy-MM' },
                  { value: 'yyyy', text: 'yyyy' }
                ]"
                transfer
              ></TsFormSelect>
              <TsFormSelect
                v-else-if="propertyLocal.handler === 'formtime'"
                ref="formitem_format"
                v-model="propertyLocal.config.format"
                :validateList="validateList"
                :dataList="[
                  { value: 'HH:mm:ss', text: 'HH:mm:ss' },
                  { value: 'HH:mm', text: 'HH:mm' },
                  { value: 'HH', text: 'HH' }
                ]"
                transfer
              ></TsFormSelect>
            </TsFormItem>
            <TsFormItem label="默认值">
              <TsFormDatePicker
                v-model="propertyLocal.config.defaultValue"
                transfer
                :type="propertyLocal.handler.replace('form', '')"
                :format="propertyLocal.config.format"
              ></TsFormDatePicker>
            </TsFormItem>
          </template>
          <template v-else-if="propertyLocal.handler === 'formtable'" v-slot:config>
            <TsFormItem label="表头设置" required>
              <TableConfig
                ref="formitem_table"
                :config="propertyLocal.config"
                @setDataConfig="(dataConfig)=>{
                  $set(propertyLocal.config, 'dataConfig', dataConfig);
                }"
              ></TableConfig>
            </TsFormItem>
          </template>
          <template v-slot:reaction>
            <Tabs v-if="propertyLocal.reaction">
              <TabPane
                v-for="(r, key) in propertyLocal.reaction"
                :key="key"
                :label="getReactionLabel(key)"
                :name="key"
              >
                <ConditionGroup
                  :ref="'condition_' + key"
                  :value="r"
                  :formItemList="formItemList"
                  @input="
                    rule => {
                      setReaction(key, rule);
                    }
                  "
                ></ConditionGroup>
              </TabPane>
            </Tabs>
          </template>
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">取消</Button>
      <Button type="primary" @click="save()">确定</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    StaticDataEditor: resolve => require(['../common/static-data-editor.vue'], resolve),
    ConditionGroup: resolve => require(['@/resources/plugins/TsSheet/form/config/common/condition-group.vue'], resolve),
    TableConfig: resolve => require(['./formtableinputer-table-config.vue'], resolve)
  },
  props: {
    formItemConfig: { type: Object }, //表单组件配置
    property: { type: Object }, //属性配置
    isNeedTable: { //是否需要引用table
      type: Boolean,
      default: true
    },
    isNeedReaction: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const _this = this;
    return {
      propertyLocal: null,
      reactionName: {
        mask: '不可见',
        hide: '隐藏',
        display: '显示',
        readonly: '只读',
        disable: '禁用'
      },
      reactionError: {}, //交互异常信息
      errorMap: {},
      validateList: [{ name: 'required', message: ' ' }],
      mappingDataList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      dataSourceList: [
        { value: 'static', text: '静态数据源' },
        { value: 'matrix', text: '矩阵' }
      ],
      formConfig: [
        {
          name: 'label',
          label: '名称',
          type: 'text',
          maxlength: 50,
          validateList: ['required']
        },
        {
          name: 'handler',
          label: '输入控件',
          type: 'select',
          transfer: true,
          dataList: [
            { text: '文本框', value: 'formtext' },
            { text: '文本域', value: 'formtextarea' },
            { text: '下拉框', value: 'formselect' },
            { text: '单选框', value: 'formradio' },
            { text: '复选框', value: 'formcheckbox' },
            { text: '日期', value: 'formdate' },
            { text: '时间', value: 'formtime' }
          ],
          validateList: ['required']
        },
        {
          name: 'isRequired',
          label: '必填',
          type: 'slot'
        },
        {
          name: 'config',
          hideLabel: true,
          type: 'slot'
        },
        {
          name: 'reaction',
          label: '交互',
          type: 'slot',
          isHidden: !this.isNeedReaction
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.propertyLocal = this.property;
    if (!this.propertyLocal.config) {
      this.$set(this.propertyLocal, 'config', {
        isRequired: false,
        isMask: false,
        isHide: false
      });
    }
    if (!this.propertyLocal.reaction) {
      this.$set(this.propertyLocal, 'reaction', { mask: {}, hide: {}, display: {}, readonly: {}, disable: {} });
    }
    if (this.isNeedTable) {
      this.formConfig[1].dataList.push({ text: 'table', value: 'formtable' });
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    save() {
      let isValid = true;
      if (this.$refs) {
        for (let key in this.$refs) {
          if (key.startsWith('formitem_')) {
            if (this.$refs[key] && !this.$refs[key].valid()) {
              isValid = false;
            }
          }
        }
      }
      const config = this.propertyLocal.config;
      this.errorMap = {};
      if (config.dataSource === 'static' && (!config.dataList || config.dataList.filter(d => d.value).length === 0)) {
        this.$set(this.errorMap, 'dataList', true);
        isValid = false;
      }
      if (isValid) {
        this.$emit('close', this.propertyLocal);
      }
    },
    getReactionLabel(key) {
      return h => {
        const returnList = [h('span', this.reactionName[key])];
        if (this.reactionError[key]) {
          returnList.push(
            h('span', {
              class: ['tsfont-info-s', 'text-error']
            })
          );
        }
        if (this.propertyLocal.reaction[key] && !this.$utils.isEmpty(this.propertyLocal.reaction[key])) {
          returnList.push(
            h('span', {
              class: ['tsfont-lightning', 'text-warning']
            })
          );
        }
        return h('div', returnList);
      };
    },
    setReaction(key, rule) {
      this.$set(this.propertyLocal.reaction, key, rule);
    },
    //验证后的样式
    validClass(attrName) {
      const c = { 'bg-error-grey': !!this.errorMap[attrName], 'bg-block': !this.errorMap[attrName] };
      return c;
    },
    addSourceColumn() {
      if (!this.propertyLocal.config.sourceColumnList) {
        this.$set(this.propertyLocal.config, 'sourceColumnList', []);
      }
      this.propertyLocal.config.sourceColumnList.push({ column: '', valueColumn: '' });
    },
    removeSourceColumn(index) {
      this.propertyLocal.config.sourceColumnList.splice(index, 1);
    }
  },
  filter: {},
  computed: {
    formItemList() {
      //所有表单组件列表
      return this.formItemConfig.dataConfig;
    },
    //表格选择组件矩阵的字段
    tableMatrixColumnList() {
      const columnList = [];
      this.formItemConfig.dataConfig
        .filter(d => !d.isExtra)
        .forEach(d => {
          columnList.push({ value: d.uuid, text: d.label });
        });
      return columnList;
    },
    //扩展属性矩阵的字段
    extraPropertyMatrixColumnList() {
      const columnList = [];
      this.mappingDataList.forEach(d => {
        columnList.push({ value: d.uuid, text: d.name });
      });
      return columnList;
    },
    defaultValueSetting() {
      const setting = {};
      const config = this.propertyLocal.config;
      if (config.isMultiple) {
        setting.multiple = config.isMultiple;
      }
      if (config.dataSource === 'matrix') {
        setting.dynamicUrl = '/api/rest/matrix/column/data/search/forselect';
        setting.rootName = 'dataList';
        const params = { matrixUuid: config.matrixUuid };
        if (config.mapping) {
          params.keywordColumn = config.mapping.text;
          params.valueField = config.mapping.value;
          params.textField = config.mapping.text;
        }
        setting.params = params;
      } else {
        setting.dataList = config.dataList;
      }
      return setting;
    }
  },
  watch: {
    'propertyLocal.config.matrixUuid': {
      handler: function(val) {
        if (val) {
          this.$api.framework.matrix.getMatrixAttributeByUuid({ matrixUuid: val }).then(res => {
            if (res.Status == 'OK') {
              this.mappingDataList = res.Return.tbodyList;
            }
          });
        }
      },
      deep: true,
      immediate: true
    },
    'propertyLocal.config.dataSource': {
      handler: function(val) {
        if (val === 'matrix') {
          if (!this.propertyLocal.config.mapping) {
            this.$set(this.propertyLocal.config, 'mapping', {});
          }
        }
      },
      deep: true,
      immediate: true
    },
    'propertyLocal.handler': {
      handler: function(newVal, oldVal) {
        if (newVal && oldVal && oldVal != newVal) {
          this.$set(this.propertyLocal, 'config', {isRequired: true});
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped></style>
