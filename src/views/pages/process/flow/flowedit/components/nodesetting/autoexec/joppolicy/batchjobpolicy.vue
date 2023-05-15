<template>
  <div v-if="autoexecConfig">
    <TsFormItem :label="$t('page.foreachtable')" labelPosition="left" required>
      <TsFormSelect
        ref="attributeUuid"
        v-model="batchJobDataSource.attributeUuid"
        :dataList="getFormComponent('formTableComponent')"
        textName="label"
        valueName="uuid"
        :validateList="validateList"
        :firstSelect="false"
        transfer
        border="border"
        @on-change="changeAttributeUuid"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('term.dashboard.datafilter')" labelPosition="left" required>
      <TsFormSwitch v-model="isActive" @on-change="changeActive"></TsFormSwitch>
      <div v-if="isActive">
        <TsRow v-for="(f,findex) in filterList" :key="findex" :gutter="8">
          <Col span="6">
            <TsFormSelect
              ref="formValid"
              v-model="f.column"
              :dataList="getAttrList(batchJobDataSource.attributeUuid)"
              :validateList="validateList"
              :firstSelect="false"
              transfer
              @on-change="changeFilter"
            ></TsFormSelect>
          </Col>
          <Col span="6">
            <TsFormSelect
              ref="formValid"
              v-model="f.expression"
              :dataList="expressionList"
              :validateList="validateList"
              :firstSelect="false"
              transfer
              @on-change="changeFilter"
            ></TsFormSelect>
          </Col>
          <Col span="12">
            <TsFormInput
              ref="formValid"
              v-model="f.value"
              :validateList="validateList"
              @on-change="changeFilter"
            ></TsFormInput>
          </Col>
        </TsRow>
      </div>
    </TsFormItem>
    <div v-if="autoexecConfig.executeParamList && autoexecConfig.executeParamList.length > 0">
      <div class="title pb-sm">
        <span>{{ $t('term.process.targetparamsvalue') }}</span>
        <span>
          <Tooltip
            placement="right"
            max-width="400"
            theme="light"
            transfer
          >
            <b class="tsfont-info-o text-href"></b>
            <div slot="content">
              <p>{{ $t('term.process.targetparamsvaluetip') }}</p>
            </div>
          </Tooltip>
        </span>
      </div>
      <TsRow
        v-for="(e,eindex) in autoexecConfig.executeParamList"
        :key="'execute_'+eindex"
        :gutter="8"
        class="item-list pb-sm"
      >
        <Col span="4">
          <div class="text-title" :class="{'require-label':e.isRequired}">{{ e.name }}</div>
        </Col>
        <template v-if="e.mappingMode==='constant'">
          <Col span="20">
            <ProtocolReadonly v-if="e.key=='protocolId'" :value="e.value" readonly></ProtocolReadonly>
            <ExecuteNodeReadonly
              v-else-if="e.key==='executeNodeConfig'"
              :value="e.value"
              :runtimeParamList="autoexecConfig.runtimeParamList"
              readonly
            ></ExecuteNodeReadonly>
            <div v-else-if="e.key==='roundCount'">
              {{ getRoundCountText(e.value) }}
            </div>
            <div v-else>{{ e.value }}</div>
          </Col>
        </template>
        <div v-else-if="e.mappingMode=='runtimeparam'">
          <span class="text-tip pr-sm">{{ $t('term.autoexec.jobparam') }}</span>
          <span>{{ getruntimeParamListText(e.value) }}</span>
        </div>
        <template v-else>
          <Col span="8">
            <TsFormSelect
              ref="formValid"
              v-model="e.mappingMode"
              :dataList="executeMappingModeList(e.key)"
              :validateList="e.isRequired?validateList:[]"
              :firstSelect="false"
              transfer
              border="border"
              @on-change="(val)=>{changeMappingMode(e,val)}"
            ></TsFormSelect>
          </Col>
          <Col span="12">
            <template v-if="e.mappingMode === 'formCommonComponent'">
              <TsFormSelect
                ref="formValid"
                v-model="e.value"
                :dataList="getFormComponent('formCommonComponent')"
                textName="label"
                valueName="uuid"
                :validateList="e.isRequired? validateList:[]"
                :firstSelect="false"
                transfer
                border="border"
              ></TsFormSelect>
            </template>
            <template v-else-if="e.mappingMode === 'formTableComponent'">
              <div class="formTableComponent">
                <TsFormSelect
                  ref="formValid"
                  v-model="e.column"
                  :dataList="getAttrList(e.value)"
                  :validateList="e.isRequired && e.value?validateList:[]"
                  :firstSelect="false"
                  transfer
                  border="border"
                ></TsFormSelect>
                <Tooltip
                  max-width="660"
                  theme="light"
                  placement="bottom-end"
                  transfer
                  class="formTableComponent-tip"
                >
                  <span class="text-href tsfont-info-o"></span>
                  <div slot="content">
                    <div class="pb-sm">{{ $t('message.process.jobpolicycolumn') }}</div>
                    <div class="tip-eg">
                      <div class="text-center">
                        <table border="1" style="border-collapse: collapse; width:50px;">
                          <tr>
                            <td>A</td>
                          </tr>
                          <tr>
                            <td>B</td>
                          </tr>
                          <tr>
                            <td>C</td>
                          </tr>
                        </table>
                      </div>
                      <div class="center-text"></div>
                      <div style="width:100px">
                        [A,B,C]
                      </div>
                    </div>
                  </div>
                </Tooltip>
              </div>
            </template>
            <template v-else>
              <TsFormInput
                ref="formValid"
                v-model="e.value"
                :validateList="e.isRequired?validateList:[]"
                border="border"
              ></TsFormInput>
            </template>
          </Col>
        </template>
      </TsRow>
    </div>
    <div v-if="autoexecConfig.runtimeParamList.length > 0">
      <div class="pb-sm">{{ $t('term.process.jobparamsvalue') }}</div>
      <div class="param-list">
        <TsRow
          v-for="(r,rindex) in autoexecConfig.runtimeParamList"
          :key="'run_'+rindex"
          :gutter="8"
          class="item-list pb-sm"
        >
          <Col span="4">
            <div class="text-title overflow" :class="{'require-label':r.isRequired}" :title="r.name">{{ r.name }}</div>
          </Col>
          <Col span="6">
            <TsFormSelect
              ref="formValid"
              v-model="r.mappingMode"
              :dataList="mappingModeList"
              :validateList="r.isRequired?validateList:[]"
              :firstSelect="false"
              transfer
              border="border"
              @on-change="(val)=>{changeMappingMode(r,val)}"
            ></TsFormSelect>
          </Col>
          <Col span="14">
            <template v-if="r.mappingMode === 'formCommonComponent'">
              <TsFormSelect
                ref="formValid"
                v-model="r.value"
                :dataList="getFormComponent('formCommonComponent')"
                textName="label"
                valueName="uuid"
                :validateList="r.isRequired? validateList:[]"
                :firstSelect="false"
                transfer
                border="border"
              ></TsFormSelect>
            </template>
            <template v-else-if="r.mappingMode === 'formTableComponent'">
              <div class="formTableComponent">
                <TsFormSelect
                  ref="formValid"
                  v-model="r.column"
                  :dataList="getAttrList(r.value,'batch')"
                  :validateList="r.isRequired && r.value?validateList:[]"
                  :firstSelect="false"
                  transfer
                  border="border"
                ></TsFormSelect>
                <Tooltip
                  max-width="660"
                  theme="light"
                  transfer
                  class="formTableComponent-tip"
                >
                  <span class="text-href tsfont-info-o"></span>
                  <div slot="content">
                    <div class="pb-sm">{{ $t('message.process.jobpolicycolumn') }}</div>
                    <div class="tip-eg">
                      <div class="text-center">
                        <table border="1" style="border-collapse: collapse; width:50px;">
                          <tr>
                            <td>A</td>
                          </tr>
                          <tr>
                            <td>B</td>
                          </tr>
                          <tr>
                            <td>C</td>
                          </tr>
                        </table>
                      </div>
                      <div class="center-text"></div>
                      <div style="width:100px">
                        [A,B,C]
                      </div>
                    </div>
                  </div>
                </Tooltip>
              </div>
            </template>
            <template v-else-if="r.mappingMode == 'constant'">
              <Edit
                :is="paramType(r.type,'Handler')"
                ref="formValid"
                v-model="r.value"
                :type="r.type"
                :config="r.config?r.config:{}"
                :isRequired="!!r.isRequired"
              ></Edit>
            </template>
            <template v-else>
              <TsFormInput
                ref="formValid"
                v-model="r.value"
                :validateList="r.isRequired?validateList:[]"
                border="border"
              ></TsFormInput>
            </template>
          </Col>
        </TsRow>
      </div>
    </div>
    <div>
      <div class="pb-sm">
        <span>{{ $t('term.process.formparamsvalue') }}</span>
        <span>
          <Tooltip
            placement="right"
            max-width="400"
            theme="light"
            transfer
          >
            <b class="tsfont-info-o text-href"></b>
            <div slot="content">
              <p>{{ $t('term.process.formparamsvaluetip') }}</p>
            </div>
          </Tooltip>
        </span>
      </div>
      <template v-if="autoexecConfig.formAttributeList.length > 0">
        <div class="pb-sm text-title">
          <TsRow :gutter="8">
            <Col span="12">
              <div>{{ $t('page.formparams') }}</div>
            </Col>
            <Col span="12">
              <div>{{ $t('term.process.exportparameters') }}</div>
            </Col>
          </TsRow>
        </div>
        <div v-for="(form,formIndex) in autoexecConfig.formAttributeList" :key="'form_'+formIndex" class="form-param-list">
          <TsRow :gutter="8">
            <Col span="12">
              <TsFormSelect
                v-model="form.key"
                :dataList="formDataList"
                textName="label"
                valueName="uuid"
                transfer
                border="border"
                @on-change="changeFormItem"
              ></TsFormSelect>
            </Col>
            <Col span="12">
              <TsFormSelect
                v-model="form.value"
                :dataList="autoexecConfig.exportParamList"
                :firstSelect="false"
                transfer
                border="border"
              ></TsFormSelect>
            </Col>
          </TsRow>
          <div class="del-btn tsfont-trash-o text-tip-active" @click="delFormParam(formIndex)"></div>
        </div>
      </template>
      <Button
        v-if="autoexecConfig.formAttributeList.length !== formDataList.length"
        type="primary"
        ghost
        @click="addFormParam()"
      >
        <span class="tsfont-plus pr4"></span><span>{{ $t('page.param') }}</span>
      </Button>
    </div>
  </div>
</template>
<script>
import base from './base.vue';
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      isActive: 0,
      batchJobDataSource: {
        attributeUuid: '',
        filterList: []
      },
      filterList: [],
      expressionList: [
        {
          value: 'like',
          text: this.$t('term.expression.like')
        },
        {
          value: 'notlike',
          text: this.$t('term.expression.notlike')
        },
        {
          value: 'equal',
          text: this.$t('term.expression.eq')
        },
        {
          value: 'unequal',
          text: this.$t('term.expression.ne')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.isActive = 0;
    if (this.config && !this.$utils.isEmpty(this.config.batchJobDataSource)) {
      this.batchJobDataSource = this.config.batchJobDataSource;
      if (!this.$utils.isEmpty(this.batchJobDataSource.filterList)) {
        this.filterList = this.batchJobDataSource.filterList;
        this.isActive = 1;
      }
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeAttributeUuid(val) {
      if (this.autoexecConfig.executeParamList && this.autoexecConfig.executeParamList.length > 0) {
        this.autoexecConfig.executeParamList.forEach(item => {
          if (item.mappingMode === 'formTableComponent') {
            this.$set(item, 'value', val);
          }
        });
      }
      if (this.autoexecConfig.runtimeParamList && this.autoexecConfig.runtimeParamList.length > 0) {
        this.autoexecConfig.runtimeParamList.forEach(item => {
          if (item.mappingMode === 'formTableComponent') {
            this.$set(item, 'value', val);
          }
        });
      }
      this.$set(this.autoexecConfig, 'batchJobDataSource', this.batchJobDataSource);
    },
    changeActive(val) {
      if (val) {
        this.filterList = [
          {
            'column': '',
            'expression': 'like',
            'value': ''
          }
        ];
      } else {
        this.filterList = [];
      }
      this.$set(this.batchJobDataSource, 'filterList', this.filterList);
      this.$set(this.autoexecConfig, 'batchJobDataSource', this.batchJobDataSource);
    },
    changeFilter() {
      this.$set(this.autoexecConfig, 'batchJobDataSource', this.batchJobDataSource);
    },
    valid() {
      let isValid = true;
      let formValidList = this.$refs.formValid;
      if (this.$refs.attributeUuid) {
        isValid = this.$refs.attributeUuid.valid();
      }
      if (formValidList && formValidList.length > 0) {
        formValidList.forEach(v => {
          if (!v.valid()) {
            isValid = false;
          }
        });
      }
      if (!this.batchJobDataSource.attributeUuid) {
        isValid = false;
      }
      return isValid;
    },
    validTable() { //校验表格组件,参数至少需要选择一个表格组件
      let isValid = false;
      if (this.autoexecConfig.autoexecCombopId && (this.autoexecConfig.runtimeParamList || this.autoexecConfig.executeParamList)) {
        let runtimeParamList = this.autoexecConfig.runtimeParamList || [];
        let executeParamList = this.autoexecConfig.executeParamList || [];
        let paramsList = runtimeParamList.concat(executeParamList);
        if (paramsList.length > 0) {
          for (let i = 0; i < paramsList.length; i++) {
            if (paramsList[i].mappingMode === 'formTableComponent') {
              isValid = true;
              break;
            }
          }
        }
      }
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
