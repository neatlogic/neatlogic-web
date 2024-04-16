<template>
  <div v-if="autoexecConfig">
    <div v-if="autoexecConfig.scenarioParamList && autoexecConfig.scenarioParamList.length > 0">
      <div class="pb-sm">{{ $t('term.process.jobscenariovalue') }}</div>
      <div class="param-list">
        <TsRow
          v-for="(r,sindex) in autoexecConfig.scenarioParamList"
          :key="'scenario_'+sindex"
          :gutter="8"
          class="item-list pb-sm"
        >
          <Col span="4">
            <div class="text-title overflow" :class="{'require-label':r.isRequired}" :title="r.name">{{ r.name }}</div>
          </Col>
          <Col span="20">
            <TsRow :gutter="8">
              <Col span="10">
                <TsFormSelect
                  ref="formValid"
                  v-model="r.mappingMode"
                  :dataList="mappingModeList"
                  :validateList="r.isRequired?validateList:[]"
                  :firstSelect="false"
                  transfer
                  border="border"
                  @on-change="changeMappingMode(r)"
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
                  <TsRow :gutter="8">
                    <Col span="12">
                      <TsFormSelect
                        ref="formValid"
                        v-model="r.value"
                        :dataList="getFormComponent('formTableComponent')"
                        textName="label"
                        valueName="uuid"
                        :validateList="r.isRequired? validateList:[]"
                        :firstSelect="false"
                        transfer
                        border="border"
                      ></TsFormSelect>
                    </Col>
                    <Col span="12">
                      <div class="formTableComponent pr-lg">
                        <TsFormSelect
                          ref="formValid"
                          v-model="r.column"
                          :dataList="getAttrList(r.value)"
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
                    </Col>
                  </TsRow>
                </template>
                <template v-else-if="r.mappingMode == 'constant'">
                  <TsFormSelect
                    ref="formValid"
                    v-model="r.value"
                    :dataList="autoexecConfig.scenarioList"
                    :validateList="r.isRequired? validateList:[]"
                    :firstSelect="false"
                    transfer
                    border="border"
                  ></TsFormSelect>
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
            <div v-if="r.mappingMode === 'formTableComponent'" class="filter-box pt-sm">
              <div class="filter-top pb-sm">
                <span class="pr-sm label">{{ $t('term.dashboard.datafilter') }}</span>
                <TsFormSwitch
                  v-model="r.isActive"
                  @on-change="(val)=>{
                    changeActive(val, r);
                  }"
                ></TsFormSwitch>
              </div>
              <div v-if="r.isActive" class="pb-sm">
                <TsRow v-for="(f,findex) in r.filterList" :key="findex" :gutter="8">
                  <Col span="10">
                    <TsFormSelect
                      ref="formValid"
                      v-model="f.column"
                      :dataList="getAttrList(r.value)"
                      :validateList="validateList"
                      :firstSelect="false"
                      transfer
                    ></TsFormSelect>
                  </Col>
                  <Col span="7">
                    <TsFormSelect
                      ref="formValid"
                      v-model="f.expression"
                      :dataList="expressionList"
                      :validateList="validateList"
                      :firstSelect="false"
                      transfer
                    ></TsFormSelect>
                  </Col>
                  <Col span="7">
                    <TsFormInput
                      ref="formValid"
                      v-model="f.value"
                      :validateList="validateList"
                    ></TsFormInput>
                  </Col>
                </TsRow>
              </div>
            </div>
          </Col>
        </TsRow>
      </div>
    </div>
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
          <Col span="20">
            <TsRow :gutter="8">
              <Col span="10">
                <TsFormSelect
                  ref="formValid"
                  v-model="e.mappingMode"
                  :dataList="executeMappingModeList(e.key)"
                  :validateList="e.isRequired?validateList:[]"
                  :firstSelect="false"
                  transfer
                  border="border"
                  @on-change="changeMappingMode(e)"
                ></TsFormSelect>
              </Col>
              <Col span="14">
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
                  <TsRow :gutter="8">
                    <Col span="12">
                      <TsFormSelect
                        ref="formValid"
                        v-model="e.value"
                        :dataList="getFormComponent('formTableComponent')"
                        textName="label"
                        valueName="uuid"
                        :validateList="e.isRequired? validateList:[]"
                        :firstSelect="false"
                        transfer
                        border="border"
                      ></TsFormSelect>
                    </Col>
                    <Col span="12">
                      <div class="formTableComponent pr-lg">
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
                    </Col>
                  </TsRow>
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
            </TsRow>
            <div v-if="e.mappingMode === 'formTableComponent'" class="filter-box pt-sm">
              <div class="filter-top pb-sm">
                <span class="pr-sm label">{{ $t('term.dashboard.datafilter') }}</span>
                <TsFormSwitch
                  v-model="e.isActive"
                  @on-change="(val)=>{
                    changeActive(val, e);
                  }"
                ></TsFormSwitch>
              </div>
              <div v-if="e.isActive" class="pb-sm">
                <TsRow v-for="(f,findex) in e.filterList" :key="findex" :gutter="8">
                  <Col span="10">
                    <TsFormSelect
                      ref="formValid"
                      v-model="f.column"
                      :dataList="getAttrList(e.value)"
                      :validateList="validateList"
                      :firstSelect="false"
                      transfer
                    ></TsFormSelect>
                  </Col>
                  <Col span="7">
                    <TsFormSelect
                      ref="formValid"
                      v-model="f.expression"
                      :dataList="expressionList"
                      :validateList="validateList"
                      :firstSelect="false"
                      transfer
                    ></TsFormSelect>
                  </Col>
                  <Col span="7">
                    <TsFormInput
                      ref="formValid"
                      v-model="f.value"
                      :validateList="validateList"
                    ></TsFormInput>
                  </Col>
                </TsRow>
              </div>
            </div>
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
            <div class="text-title overflow" :class="{'require-label':r.isRequired}" :title="r.name">
              <span>{{ r.name }}</span>
              <span v-if="r.type == 'text'">
                <Tooltip
                  placement="right"
                  max-width="450"
                  theme="light"
                  transfer
                >
                  <b class="tsfont-info-o text-href"></b>
                  <div slot="content">
                    <p v-html="$t('term.process.jobtextparamsvaluetip')"></p>
                  </div>
                </Tooltip>
              </span>
            </div>
          </Col>
          <Col span="20">
            <TsRow :gutter="8">
              <Col span="10">
                <TsFormSelect
                  ref="formValid"
                  v-model="r.mappingMode"
                  :dataList="mappingModeList"
                  :validateList="r.isRequired?validateList:[]"
                  :firstSelect="false"
                  transfer
                  border="border"
                  @on-change="changeMappingMode(r)"
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
                  <TsRow :gutter="8">
                    <Col span="12">
                      <TsFormSelect
                        ref="formValid"
                        v-model="r.value"
                        :dataList="getFormComponent('formTableComponent')"
                        textName="label"
                        valueName="uuid"
                        :validateList="r.isRequired? validateList:[]"
                        :firstSelect="false"
                        transfer
                        border="border"
                      ></TsFormSelect>
                    </Col>
                    <Col span="12">
                      <div class="formTableComponent pr-lg">
                        <TsFormSelect
                          ref="formValid"
                          v-model="r.column"
                          :dataList="getAttrList(r.value)"
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
                    </Col>
                  </TsRow>
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
            <div v-if="r.mappingMode === 'formTableComponent'" class="filter-box pt-sm">
              <div class="filter-top pb-sm">
                <span class="pr-sm label">{{ $t('term.dashboard.datafilter') }}</span>
                <TsFormSwitch
                  v-model="r.isActive"
                  @on-change="(val)=>{
                    changeActive(val, r);
                  }"
                ></TsFormSwitch>
              </div>
              <div v-if="r.isActive" class="pb-sm">
                <TsRow v-for="(f,findex) in r.filterList" :key="findex" :gutter="8">
                  <Col span="10">
                    <TsFormSelect
                      ref="formValid"
                      v-model="f.column"
                      :dataList="getAttrList(r.value)"
                      :validateList="validateList"
                      :firstSelect="false"
                      transfer
                    ></TsFormSelect>
                  </Col>
                  <Col span="7">
                    <TsFormSelect
                      ref="formValid"
                      v-model="f.expression"
                      :dataList="expressionList"
                      :validateList="validateList"
                      :firstSelect="false"
                      transfer
                    ></TsFormSelect>
                  </Col>
                  <Col span="7">
                    <TsFormInput
                      ref="formValid"
                      v-model="f.value"
                      :validateList="validateList"
                    ></TsFormInput>
                  </Col>
                </TsRow>
              </div>
            </div>
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
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.autoexecConfig.executeParamList && this.autoexecConfig.executeParamList.length > 0) {
        this.autoexecConfig.executeParamList.forEach(item => {
          if (item.mappingMode === 'formTableComponent') {
            if (!this.$utils.isEmpty(item.filterList)) {
              this.$set(item, 'isActive', 1);
            } else {
              this.$set(item, 'isActive', 0);
              this.$set(item, 'filterList', []);
            }
          }
        });
      }
      if (this.autoexecConfig.runtimeParamList && this.autoexecConfig.runtimeParamList.length > 0) {
        this.autoexecConfig.runtimeParamList.forEach(item => {
          if (item.mappingMode === 'formTableComponent') {
            if (!this.$utils.isEmpty(item.filterList)) {
              this.$set(item, 'isActive', 1);
            } else {
              this.$set(item, 'isActive', 0);
              this.$set(item, 'filterList', []);
            }
          }
        });
      }
      if (this.autoexecConfig.scenarioParamList && this.autoexecConfig.scenarioParamList.length > 0) {
        this.autoexecConfig.scenarioParamList.forEach(item => {
          if (item.mappingMode === 'formTableComponent') {
            if (!this.$utils.isEmpty(item.filterList)) {
              this.$set(item, 'isActive', 1);
            } else {
              this.$set(item, 'isActive', 0);
              this.$set(item, 'filterList', []);
            }
          }
        });
      }
    },
    valid() {
      let formValidList = this.$refs.formValid;
      let isValid = true;
      if (formValidList && formValidList.length > 0) {
        formValidList.forEach(v => {
          if (!v.valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    },
    changeActive(val, item) {
      if (val) {
        this.$set(item, 'filterList', [
          {
            'column': '',
            'expression': 'like',
            'value': ''
          }
        ]);
      } else {
        this.$set(item, 'filterList', []);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
