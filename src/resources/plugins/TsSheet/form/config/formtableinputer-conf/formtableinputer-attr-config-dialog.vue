<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="formitem_formConfig" v-model="propertyLocal" :item-list="formConfig">
          <template v-slot:isRequired>
            <TsFormSwitch
              v-model="propertyLocal.config.isRequired"
              :trueValue="true"
              :falseValue="false"
            ></TsFormSwitch>
          </template>
          <template v-slot:isReadOnly>
            <TsFormSwitch
              v-model="propertyLocal.config.isReadOnly"
              :trueValue="true"
              :falseValue="false"
              :disabled="propertyLocal.handler === 'formexpression'? true : false"
            ></TsFormSwitch>
          </template>
          <template v-if="['formtext', 'formtextarea', 'formpassword'].includes(propertyLocal.handler)" v-slot:config>
            <TsFormItem v-if="propertyLocal.handler=== 'formtext'" :label="$t('form.placeholder.checkrule')">
              <TsFormSelect
                v-model="propertyLocal.config.validate"
                :dataList="ruleList"
                transfer
                border="border"
              ></TsFormSelect>
            </TsFormItem>
            <TsFormItem :label="$t('page.inputtip')">
              <TsFormInput v-model="propertyLocal.config.placeholder" :maxlength="50"></TsFormInput>
            </TsFormItem>
            <TsFormItem :label="$t('page.defaultvalue')" style="margin-bottom:16px">
              <!--由于最后一个formitem去掉了margin-bottom，这里补充回来-->
              <TsFormInput v-model="propertyLocal.config.defaultValue" :validateList="propertyLocal.config.validate? [propertyLocal.config.validate]:[]" :type="propertyLocal.handler.replace('form', '')"></TsFormInput>
            </TsFormItem>
            <TsFormItem v-if="propertyLocal.handler === 'formpassword'" :label="$t('page.viewtarget',{'target':$t('page.auth')})">
              <UserSelect
                :value="propertyLocal.config.viewPasswordAuthorityList"
                :multiple="true"
                :transfer="true"
                :groupList="['user', 'role', 'team']"
                @on-change="val => {
                  $set(propertyLocal.config, 'viewPasswordAuthorityList', val)

                }"
              ></UserSelect>
            </TsFormItem>
          </template>
          <template v-else-if="['formselect', 'formradio', 'formcheckbox'].includes(propertyLocal.handler)" v-slot:config>
            <TsFormItem v-if="propertyLocal.handler !== 'formradio'" :label="$t('page.multipleselection')">
              <TsFormSwitch v-model="propertyLocal.config.isMultiple" :trueValue="true" :falseValue="false"></TsFormSwitch>
            </TsFormItem>
            <TsFormItem
              v-if="propertyLocal.handler === 'formselect'"
              :label="$t('page.isdefaultselectd')"
              :tooltip="$t('page.defaultselectdonlyvalue')"
            >
              <TsFormSwitch
                :value="propertyLocal.config.isAutoSelectdOnlyValue || false"
                :trueValue="true"
                :falseValue="false"
                @change="(val)=>{
                  $set(propertyLocal.config, 'isAutoSelectdOnlyValue', val);
                }"
              ></TsFormSwitch>
            </TsFormItem>
            <TsFormItem :label="$t('page.datasource')" required>
              <TsFormSelect
                ref="formitem_datasource"
                v-model="propertyLocal.config.dataSource"
                :validateList="validateList"
                :dataList="getDataSourceList(propertyLocal.handler)"
                transfer
                border="border"
                @on-change="(val)=>{
                  changeDataSource(val);
                }"
              ></TsFormSelect>
            </TsFormItem>
            <TsFormItem v-if="propertyLocal.config.dataSource === 'static'" :label="$t('page.dropdownoption')">
              <StaticDataEditor v-model="propertyLocal.config.dataList"></StaticDataEditor>
            </TsFormItem>
            <template v-else-if="propertyLocal.config.dataSource === 'matrix'">
              <TsFormItem :label="$t('page.matrix')" required>
                <TsFormSelect
                  ref="formitem_matrixuuid"
                  v-model="propertyLocal.config.matrixUuid"
                  :validateList="validateList"
                  dynamicUrl="/api/rest/matrix/search"
                  rootName="tbodyList"
                  textName="name"
                  valueName="uuid"
                  transfer
                  @on-change="(val)=>{
                    changeMatrixUuid(val);
                  }"
                ></TsFormSelect>
              </TsFormItem>
              <TsFormItem v-if="propertyLocal.config.matrixUuid && mappingDataList.length > 0" :label="$t('page.fieldmapping')">
                <div class="bg-block padding-md radius-md">
                  <Row :gutter="10">
                    <Col span="12">
                      <label class="text-grey require-label">{{ $t('page.value') }}</label>
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
                      <label class="text-grey require-label">{{ $t('page.displaytext') }}</label>
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
              <TsFormItem :label="$t('page.hiddenattr')">
                <TsFormSelect
                  ref="hiddenFieldList"
                  :value="propertyLocal.config.hiddenFieldList || []"
                  :dataList="getAttrList(mappingDataList,propertyLocal.config.mapping.value)"
                  :transfer="true"
                  multiple
                  isCustomValue
                  @change="(val)=>{
                    changeHiddenFieldList(val);
                  }"
                ></TsFormSelect>
              </TsFormItem>
              <TsFormItem v-if="propertyLocal.config.matrixUuid && tableMatrixColumnList.length > 0" :label="$t('page.filtercondition')">
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
                          ref="formitem_column"
                          v-model="sourceColumn.column"
                          :dataList="extraPropertyMatrixColumnList"
                          :validateList="validateList"
                          transfer
                          border="border"
                        ></TsFormSelect>
                      </Col>
                      <Col span="2" style="text-align:center" class="text-grey">{{ $t('term.expression.eq') }}</Col>
                      <Col span="10"><TsFormSelect
                        ref="formitem_valueColumn"
                        v-model="sourceColumn.valueColumn"
                        :dataList="tableMatrixColumnList"
                        :validateList="validateList"
                        transfer
                        border="border"
                      ></TsFormSelect></Col>
                      <Col span="2" style="text-align:center"><span class="tsfont-trash-o text-action" @click="removeSourceColumn(index)"></span></Col>
                    </Row>
                  </div>
                  <Button @click="addSourceColumn"><span class="tsfont-plus">{{ $t('page.filtercondition') }}</span></Button>
                </div>
              </TsFormItem>
            </template>
            <template v-else-if="propertyLocal.config.dataSource === 'formtableinputer'">
              <FormtableinputDataSource
                ref="formitem_formtableinputsource"
                :propertyLocal="propertyLocal"
                :formItemUuid="formItemUuid"
                :formItemList="formItemList"
              ></FormtableinputDataSource>
            </template>
            <TsFormItem v-if="propertyLocal.handler === 'formselect'" :label="$t('page.inputtip')">
              <TsFormInput v-model="propertyLocal.config.placeholder" :maxlength="50"></TsFormInput>
            </TsFormItem>
            <TsFormItem :label="$t('page.defaultvalue')">
              <div>
                <TsFormSelect
                  v-model="propertyLocal.config.defaultValue"
                  v-bind="defaultValueSetting"
                  :isCustomValue="true"
                  search
                  transfer
                ></TsFormSelect>
              </div>
            </TsFormItem>
          </template>
          <template v-else-if="['formdate', 'formtime'].includes(propertyLocal.handler)" v-slot:config>
            <TsFormItem :label="$t('page.format')" required>
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
            <TsFormItem :label="$t('page.defaultvalue')">
              <TsFormDatePicker
                v-model="propertyLocal.config.defaultValue"
                transfer
                :type="propertyLocal.handler.replace('form', '')"
                :format="propertyLocal.config.format"
              ></TsFormDatePicker>
            </TsFormItem>
          </template>
          <template v-else-if="propertyLocal.handler === 'formtable'" v-slot:config>
            <TsFormItem :label="$t('term.framework.thsetting')" required>
              <TableConfig
                ref="formitem_table"
                :formItemList="allFormItemList"
                :config="propertyLocal.config"
                :source="source"
                @setDataConfig="(dataConfig)=>{
                  $set(propertyLocal.config, 'dataConfig', dataConfig);
                }"
              ></TableConfig>
            </TsFormItem>
          </template>
          <template v-else-if="propertyLocal.handler === 'formexpression'" v-slot:config>
            <TsFormItem :label="$t('term.cmdb.expression')">
              <ExpressionSetting
                ref="formitem_expression"
                :formItemList="formItemList"
                :formItemUuid="formItemUuid"
                :attrUuid="propertyLocal.uuid"
                :value="propertyLocal.config.expression"
                isRequired
                @setConfig="(val)=>{
                  $set(propertyLocal.config, 'expression', val)
                }"
              ></ExpressionSetting>
            </TsFormItem>
          </template>
          <template v-slot:reaction>
            <Tabs v-if="propertyLocal.reaction && isReady">
              <TabPane
                v-for="(key) in Object.keys(reactionTabList)"
                :key="key"
                :label="getReactionLabel(key)"
                :name="key"
              >
                <div v-if="key === 'filter'">
                  <ReactionFilter
                    :ref="'formitem_' + key"
                    :value="propertyLocal.reaction[key]"
                    :martixAttrList="mappingDataList"
                    :formItem="propertyLocal"
                    :formItemList="allFormItemList"
                    @input="
                      rule => {
                        setReaction(key, rule);
                      }
                    "
                  ></ReactionFilter>
                </div>
                <ConditionGroup
                  v-else
                  :ref="'formitem_' + key"
                  :reactionKey="key"
                  :value="propertyLocal.reaction[key]"
                  :formItemList="allFormItemList"
                  :formItem="propertyLocal"
                  @reactionValid="(isValid)=>{
                    reactionValid(key, isValid)
                  }"
                  @input="
                    rule => {
                      setReaction(key, rule);
                    }
                  "
                ></ConditionGroup>
                <div v-if="key === 'setvalue' && !$utils.isEmpty(propertyLocal.reaction[key])">
                  <div class="mt-sm text-grey">{{ $t('term.framework.assignment') }}</div>
                  <!--isDynamicValue: 是否可以动态赋值  -->
                  <div v-if="propertyLocal.isDynamicValue" class="pb-sm">
                    <TsFormRadio
                      :value="propertyLocal.reaction[key].type || 'static'"
                      :dataList="typeDataList"
                      @change="
                        val => {
                          $set(propertyLocal.reaction[key], 'type', val);
                          $set(propertyLocal.reaction[key], 'value', null);
                        }
                      "
                    ></TsFormRadio>
                  </div>
                  <!--dynamic:动态赋值  -->
                  <TsFormSelect
                    v-if="propertyLocal.reaction[key].type === 'dynamic'"
                    :value="propertyLocal.reaction[key].value"
                    :dataList="hasValueFormItemList"
                    valueName="uuid"
                    textName="label"
                    border="border"
                    transfer
                    @on-change="
                      val => {
                        $set(propertyLocal.reaction[key], 'value', val);
                      }
                    "
                  ></TsFormSelect>
                  <FormItem
                    v-else
                    ref="assignmentValue"
                    :formItem="assignmentValueConfig"
                    :value="propertyLocal.reaction[key].value"
                    mode="defaultvalue"
                    :showStatusIcon="false"
                    isCustomValue
                    @change="
                      val => {
                        $set(propertyLocal.reaction[key], 'value', val);
                      }
                    "
                  ></FormItem>
                </div>
                <div v-else-if="key === 'setValueOther'">
                  <ReactionSetValueOtherSetting
                    v-if="propertyLocal && propertyLocal.config.hiddenFieldList && !$utils.isEmpty(propertyLocal.reaction[key])"
                    ref="setValueOther_valueList"
                    :value="propertyLocal.reaction[key].valueList"
                    :hiddenFieldList="propertyLocal.config.hiddenFieldList"
                    :attrList="formItemConfig.dataConfig"
                    :currentAttrUuid="propertyLocal.uuid"
                    @change="
                      val => {
                        $set(propertyLocal.reaction[key], 'valueList', val);
                      }"
                  ></ReactionSetValueOtherSetting>
                </div>
              </TabPane>
            </Tabs>
          </template>
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    StaticDataEditor: () => import('../common/static-data-editor.vue'),
    ConditionGroup: () => import('@/resources/plugins/TsSheet/form/config/common/condition-group.vue'),
    TableConfig: () => import('./formtableinputer-table-config.vue'),
    FormItem: () => import('@/resources/plugins/TsSheet/form-item.vue'),
    ReactionFilter: () => import('@/resources/plugins/TsSheet/form/config/common/reaction-filter.vue'),
    FormtableinputDataSource: () => import('./formtableinput-data-source.vue'),
    ExpressionSetting: () => import('@/resources/plugins/TsSheet/form/config/common/expression-setting.vue'),
    ReactionSetValueOtherSetting: () => import('@/resources/plugins/TsSheet/form-item-reaction-setvalueother-setting.vue')
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
    },
    formItemList: { //表格外部的组件
      type: Array,
      default: () => []
    },
    formItemUuid: String,
    source: { type: String, default: '' } //表单组件配置来源：scene(场景)
  },
  data() {
    return {
      isReady: true,
      propertyLocal: null,
      reaction: { 
        mask: {}, 
        hide: {},
        display: {},
        readonly: {},
        disable: {},
        required: {},
        clearValue: {},
        setvalue: {},
        setValueOther: {}
      },
      reactionName: {
        mask: this.$t('page.invisible'),
        hide: this.$t('page.hide'),
        display: this.$t('page.display'),
        readonly: this.$t('page.readonly'),
        disable: this.$t('page.disable'),
        required: this.$t('page.require'),
        filter: this.$t('page.filters'),
        clearValue: this.$t('page.clear'),
        setvalue: this.$t('term.framework.conditionassignment'),
        setValueOther: this.$t('term.framework.linkageassignment')
      },
      reactionError: {}, //交互异常信息
      errorMap: {},
      validateList: [{ name: 'required', message: ' ' }],
      mappingDataList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large',
        title: '表格属性设置'
      },
      dataSourceList: [
        { value: 'static', text: this.$t('page.staticdatasource') },
        { value: 'matrix', text: this.$t('page.matrix') },
        { value: 'formtableinputer', text: this.$t('term.framework.formtableinputercomponent') }
      ],
      formConfig: [
        {
          type: 'text',
          name: 'key',
          label: this.$t('page.englishname'),
          maxlength: 50,
          validateList: ['required',
            {
              name: 'regex',
              pattern: /^[A-Za-z\d_]+$/,
              message: this.$t('message.plugin.enName')
            }
          ],
          onChange: (val) => {
            this.valieKey();
          }
        },
        {
          name: 'label',
          label: this.$t('page.name'),
          type: 'text',
          maxlength: 50,
          validateList: ['required']
        },
        {
          name: 'handler',
          label: this.$t('term.framework.inputtype'),
          type: 'select',
          transfer: true,
          dataList: [
            { text: this.$t('page.input'), value: 'formtext' },
            { text: this.$t('page.textfield'), value: 'formtextarea' },
            { text: this.$t('page.password'), value: 'formpassword' },
            { text: this.$t('page.select'), value: 'formselect' },
            { text: this.$t('page.radio'), value: 'formradio' },
            { text: this.$t('page.checkbox'), value: 'formcheckbox' },
            { text: this.$t('page.date'), value: 'formdate' },
            { text: this.$t('page.time'), value: 'formtime' },
            { text: this.$t('page.uploadattachment'), value: 'formupload' },
            { text: this.$t('term.cmdb.expression'), value: 'formexpression' }
          ],
          validateList: ['required']
        },
        {
          name: 'isRequired',
          label: this.$t('page.require'),
          type: 'slot'
        },
        {
          name: 'isReadOnly',
          label: this.$t('page.readonly'),
          type: 'slot'
        },
        {
          name: 'config',
          hideLabel: true,
          type: 'slot'
        },
        {
          name: 'reaction',
          label: this.$t('page.eachother'),
          type: 'slot',
          isHidden: !this.isNeedReaction
        }
      ],
      ruleList: [
        {
          text: this.$t('page.letter'),
          value: 'unique_ident'
        },
        {
          text: this.$t('page.lowercaseletter'),
          value: 'lowercase'
        },
        {
          text: this.$t('page.capitalletter'),
          value: 'uppercase'
        },
        {
          text: this.$t('page.number'),
          value: 'number'
        },
        {
          text: this.$t('page.lettersandnumbers'),
          value: 'enchar'
        },
        {
          text: this.$t('page.emailaddress'),
          value: 'mail'
        },
        {
          text: this.$t('page.phonenumber'),
          value: 'phone'
        },
        {
          text: this.$t('page.ip'),
          value: 'ip'
        },
        {
          text: this.$t('page.port'),
          value: 'port'
        },
        {
          text: 'URL',
          value: 'url'
        }
      ],
      typeDataList: [
        {
          text: this.$t('term.autoexec.static'),
          value: 'static'
        },
        {
          text: this.$t('page.dynamicvalue'),
          value: 'dynamic'
        }
      ],
      filterComponentList: ['formtableselector', 'formtableinputer', 'formsubassembly'] //过滤不参与规则的组件
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      this.propertyLocal = this.property;
      if (!this.propertyLocal.config) {
        this.$set(this.propertyLocal, 'config', {
          isRequired: false,
          isReadOnly: false,
          isMask: false,
          isHide: false
        });
      }
      if (this.propertyLocal.handler === 'formselect') {
        const config = this.propertyLocal.config;
        if (config.dataSource === 'formtableinputer') {
          //选择表单输入组件
          let findItem = this.formItemList.find(item => item.uuid === config.formtableinputerUuid);
          if (!findItem) {
            this.$set(config, 'formtableinputerUuid', null);
            this.$set(config, 'mapping', {});
          } else {
            if (findItem.config && findItem.config.dataConfig) {
              const valueUuid = config.mapping.value.split('##')[0];
              const textUuid = config.mapping.text.split('##')[0];
              if (!findItem.config.dataConfig.find(d => d.uuid === valueUuid)) {
                this.$set(config.mapping, 'value', null);
              }
              if (!findItem.config.dataConfig.find(d => d.uuid === textUuid)) {
                this.$set(config.mapping, 'text', null);
              }
            }
          }
        }
      }

      if (!this.propertyLocal.reaction) {
        this.$set(this.propertyLocal, 'reaction', this.$utils.deepClone(this.reaction));
        if (['formselect', 'formradio', 'formcheckbox'].includes(this.propertyLocal.handler)) {
          this.$set(this.propertyLocal.reaction, 'filter', {});
        }
      } else {
        Object.keys(this.reaction).forEach((key) => {
          if (!this.propertyLocal.reaction.hasOwnProperty(key)) {
            this.$set(this.propertyLocal.reaction, key, {});
          }
        });
      }
      if (this.isNeedTable) {
        let findFormItem = this.formConfig.find(item => item.name === 'handler');
        if (findFormItem) {
          findFormItem.dataList.push({ text: 'table', value: 'formtable' });
        }
      }
      if (this.propertyLocal.handler != 'formtable') {
        this.$set(this.reactionName, 'setvalue', this.$t('term.framework.conditionassignment'));
        this.$set(this.propertyLocal.reaction, 'setvalue', this.propertyLocal.reaction.setvalue || {});
      }
    },
    close() {
      this.$emit('close');
    },
    async save() {
      let isValid = true;
      this.reactionError = {};
      if (this.$refs) {
        for (let key in this.$refs) {
          if (key.startsWith('formitem_')) {
            const arrKey = key.split('_');
            const item = this.$refs[key];
            if (item) {
              if (Array.isArray(item) && item.length) {
                item.forEach(k => {
                  if (k.valid && !k.valid()) {
                    isValid = false;
                    this.$set(this.reactionError, arrKey[1], true);
                  }
                });
              } else {
                if (item.valid && !item.valid()) {
                  isValid = false;
                  this.$set(this.reactionError, arrKey[1], true);
                }
              }
            } 
          } else if (key === 'assignmentValue') {
            let formitem = null;
            if (this.$refs[key] instanceof Array) {
              formitem = this.$refs[key][0];
            } else {
              formitem = this.$refs[key];
            }
            if (formitem) {
              const err = await formitem.validData();
              if (err && err.length > 0) {
                isValid = false;
                this.$set(this.reactionError, 'setvalue', true);
              }
            }
          } else if (key === 'setValueOther_valueList') {
            let setValueOtherValueList = null;
            if (this.$refs[key] instanceof Array) {
              setValueOtherValueList = this.$refs[key][0];
            } else {
              setValueOtherValueList = this.$refs[key];
            }
            if (setValueOtherValueList && !setValueOtherValueList.valid()) {
              isValid = false;
              this.$set(this.reactionError, 'setValueOther', true);
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
    },
    changeHandler(val) {
      this.propertyLocal.reaction = null;
      this.$nextTick(() => {
        this.$set(this.propertyLocal, 'reaction', this.$utils.deepClone(this.reaction));
        this.$set(this.propertyLocal, 'value', null);
        if (val === 'formexpression') {
          this.$set(this.propertyLocal.config, 'isReadOnly', true);
        }
        if (val === 'formtext' || val === 'formtextarea') {
          // 联动规则(赋值)：是否可以动态赋值
          this.$set(this.propertyLocal, 'isDynamicValue', true);
        } else {
          this.$set(this.propertyLocal, 'isDynamicValue', false);
        }
        if (val != 'formtable') {
          this.$set(this.reactionName, 'setvalue', this.$t('term.framework.conditionassignment'));
          this.$set(this.propertyLocal.reaction, 'setvalue', {});
        } else {
          this.$delete(this.reactionName, 'setvalue');
          this.$delete(this.propertyLocal.reaction, 'setvalue');
        }
        this.isReady = false;
        this.$nextTick(() => {
          this.isReady = true;
        });
      });
    },
    changeMatrixUuid(val) {
      this.$set(this.propertyLocal.config, 'defaultValue', null);
      this.$set(this.propertyLocal.config, 'mapping', {});
      if (val) {
        this.$set(this.propertyLocal.reaction, 'filter', {});
      } else {
        this.$delete(this.propertyLocal.reaction, 'filter');
      }
      this.isReady = false;
      this.$nextTick(() => {
        this.isReady = true;
      });
    },
    changeDataSource() {
      this.$set(this.propertyLocal.config, 'matrixUuid', null);
      this.$set(this.propertyLocal.config, 'formtableinputerUuid', null);
      this.$set(this.propertyLocal.config, 'mapping', {});
      this.$delete(this.propertyLocal.reaction, 'filter');
      this.isReady = false;
      this.$nextTick(() => {
        this.isReady = true;
      });
    },
    valieKey() { //校验英文名称唯一
      let isValid = true;
      if (this.propertyLocal && this.propertyLocal.key) {
        let findKeyItem = this.formItemConfig.dataConfig.find(item => item.uuid != this.propertyLocal.uuid && item.key === this.propertyLocal.key);
        this.formConfig.forEach(item => {
          if (item.name === 'key') {
            if (findKeyItem) {
              this.$set(item, 'errorMessage', this.$t('message.targetisexists', {'target': this.$t('term.framework.compkeyname')}));
              isValid = false;
            } else {
              this.$set(item, 'errorMessage', '');
            }
          } 
        });
      }
      return isValid;
    },
    changeHiddenFieldList(val) {
      this.isReady = false;
      this.$set(this.propertyLocal.config, 'hiddenFieldList', val);
      this.$nextTick(() => {
        this.isReady = true;
      });
    },           
    reactionValid(key, isValid) {
      this.$set(this.reactionError, key, !isValid);
    }
    
  },
  filter: {},
  computed: {
    allFormItemList() {
      //表格输入组件和表格外组件
      return this.formItemConfig.dataConfig.concat(this.formItemList);
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
      if (config.dataSource === 'matrix' && config.matrixUuid) {
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
        setting.dataList = config.dataList || [];
      }
      return setting;
    },
    assignmentValueConfig() {
      let item = this.$utils.deepClone(this.propertyLocal);
      if (item.config) {
        this.$set(item.config, 'isRequired', false);
      }
      return item;
    },
    getAttrList() {
      return (mappingDataList, value) => {
        let list = [];
        if (!this.$utils.isEmpty(mappingDataList)) {
          list = mappingDataList.map(i => {
            return {
              value: i.uuid,
              text: i.name,
              uuid: i.uuid,
              name: i.name,
              uniqueIdentifier: i.uniqueIdentifier,
              label: i.label
            };
          });
        }
        return list;
      };
    },
    hasValueFormItemList() {
      let list = this.allFormItemList.filter(d => d.hasValue && (!this.propertyLocal || (this.propertyLocal && d.uuid != this.propertyLocal.uuid)) && !this.filterComponentList.includes(d.handler));
      let newList = [];
      list.forEach(item => {
        let obj = {
          label: item.label,
          uuid: item.uuid
        };
        let children = [];
        if (!this.$utils.isEmpty(item.config.hiddenFieldList)) {
          item.config.hiddenFieldList.forEach(a => {
            children.push({
              label: item.label + '.' + a.text,
              uuid: item.uuid + '#' + a.value
            });
          });
        }
        newList.push(obj);
        if (!this.$utils.isEmpty(children)) {
          newList.push(...children);
        }
      });
      return newList;
    },
    getDataSourceList() {
      return (handler) => {
        let list = this.$utils.deepClone(this.dataSourceList);
        if (handler && handler != 'formselect') {
          list = list.filter(item => item.value != 'formtableinputer');
        }
        return list;
      };
    },
    reactionTabList() {
      const reaction = this.$utils.deepClone(this.propertyLocal.reaction);
      if (this.propertyLocal && this.$utils.isEmpty(this.propertyLocal.config.hiddenFieldList)) {
        this.$delete(reaction, 'setValueOther');
      }
      return this.$utils.sortByObj(reaction);
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
        if (val === 'matrix' || val === 'formtableinputer') {
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
          this.changeHandler(newVal);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped></style>
