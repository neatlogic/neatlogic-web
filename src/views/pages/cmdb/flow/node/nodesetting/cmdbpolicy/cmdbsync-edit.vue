<template>
  <div>
    <!-- 写入模型 -->
    <TargetCi
      v-if="ciEntityData.isAbstract"
      ref="targetCi"
      :ciId="ciData.ciId"
      :ciEntityData="ciEntityData"
      :mappingModeList="getMappingDataList()"
      :formCommonComponentList="getFormComponent('formCommonComponent')"
      :tableComponentAttrList="tableComponentAttrList"
      :subFormComponentList="subFormComponentList"
    ></TargetCi>
    <!-- 子模型 -->
    <ChildrenCi
      v-if="ciEntityData.isStart && ciEntityData.isAbstract"
      :ciId="ciData.ciId"
      :ciEntityData="ciEntityData"
      @newCiEntity="(data)=>{
        $emit('new', data);
      }"
      @editNewRelEntity="(data)=>{
        $emit('edit', data);
      }"
      @remove="(relentity)=>{
        $delete(saveCiEntityMap, relentity.ciEntityUuid);
      }"
    ></ChildrenCi>
    <div>
      <TsFormItem :label="$t('term.cmdb.attrmapping')" labelPosition="top">
        <div class="pt-sm">
          <div class="tsForm tsForm-border-border ivu-form-label-right">
            <Collapse v-model="openPanel" simple>
              <Panel v-for="elementType in elementTypeList" :key="elementType.type" :name="elementType.type">
                {{ elementType.label }}
                <div
                  v-if="elementType.elementList.length > 0"
                  slot="content"
                  class="pt-nm"
                >
                  <template v-for="(e, index) in elementType.elementList">
                    <TsRow
                      v-if="e.type !== 'attr' || (e.type === 'attr' && e.element.canInput)"
                      :key="index"
                      :gutter="8"
                      class="pb-sm"
                    >
                      <Col span="4">
                        <template v-if="e.type == 'rel'">
                          <div class="text-title overflow" :title="e.element.direction === 'from' ? e.element.toLabel : e.element.fromLabel" :class="{'require-label':!!((e.element.direction == 'from' && e.element.toIsRequired) || (e.element.direction == 'to' && e.element.fromIsRequired))}">
                            {{ e.element.direction === 'from' ? e.element.toLabel : e.element.fromLabel }}
                          </div>
                        </template>
                        <template v-else>
                          <div class="text-title overflow" :class="{'require-label': e.type === 'attr' && !!e.element.isRequired}" :title="e.element.label">
                            {{ e.element.label }}
                          </div>
                        </template>
                      </Col>
                      <Col span="20">
                        <div v-if="e.type == 'rel'">  
                          <div v-if="isRelShow(e.element, ciEntityData)">
                            <a
                              href="javascript:void(0)"
                              :disabled="disabledFn('rel' + e.element.direction + '_' + e.element.id)"
                              @click.stop="addNewRelEntity(e.element)"
                            >
                              <i class="tsfont-plus"></i>
                              {{ $t('page.choose') }}
                            </a>
                            <Poptip
                              v-model="isRelPopShow[e.element.id + '_' + e.element.direction]"
                              placement="right"
                              trigger="hover"
                              :transfer="true"
                              :width="620"
                              word-wrap
                            >
                              <a></a>
                              <div slot="content">
                                <div v-if="relCiList" :style="'overflow:auto;max-height:300px;'">
                                  <Alert show-icon>{{ $t('term.cmdb.abstractcireltip') }}</Alert>
                                  <div
                                    v-for="relci in relCiList"
                                    :key="relci.id"
                                    style="text-align: center; float: left; width: 90px"
                                    class="pr-sm"
                                    :class="isRelDisabled(e.element, relCiList, relci)?'text-disabled':'text-href'"
                                    @click="()=>{
                                      if(!isRelDisabled(e.element, relCiList, relci)) {
                                        newCiEntity(e.element, relci.id)
                                      }
                                    }"
                                  >
                                    <div>
                                      <span><i style="font-size: 20px" :class="relci.icon"></i></span>
                                    </div>
                                    <div class="overflow" :title="relci.label">
                                      <span>{{ relci.label }}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Poptip>
                          </div>
                          <div v-if="ciEntityData.relEntityData && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id] && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id]['valueList']">
                           
                            <Tag
                              v-for="(relentity, reindex) in ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id]['valueList']"
                              :key="reindex"
                              :color="getTagType(relentity)"
                              type="dot"
                              size="large"
                              :closable="!disabledFn('rel' + e.element.direction + '_' + e.element.id) && ((relentity.ciEntityId || relentity.type == 'new') ? true : false ) && isClosableCi(ciEntityData.relEntityData, e.element, relentity)"
                              :style="getTagType(relentity) == 'success' ? 'cursor:pointer' : ''"
                              @click.native="
                                element => {
                                  element.stopPropagation();
                                  editNewRelEntity(relentity, e.element);
                                }
                              "
                              @on-close="delRelEntity('rel' + e.element.direction + '_' + e.element.id, relentity, ciEntityData || '')"
                            >
                              <span>{{ relentity.ciEntityName }}</span>
                            </Tag>
                          </div>
                        </div>
                        <TsRow v-else :gutter="8">
                          <Col span="6">
                            <TsFormSelect
                              ref="attrHandler"
                              :value="getValue(ciEntityData.allAttrEntityData, e, 'mappingMode')"
                              :dataList="getMappingDataList() "
                              :firstSelect="false"
                              transfer
                              border="border"
                              :validateList="getValidList(e.type, e.element)"
                              @change="(val)=>{
                                changeMappingMode(val,e)
                              }"
                            ></TsFormSelect>
                          </Col>
                          <Col span="18">
                            <template v-if="getValue(ciEntityData.allAttrEntityData, e, 'mappingMode') == 'constant'">
                              <div v-if="e.type === 'attr'">
                                <AttrInputer
                                  ref="attrHandler"
                                  :allowBatchAdd="true"
                                  :attrEntity="ciEntityData.allAttrEntityData['attr_' + e.element.id]"
                                  :disabled="disabledFn('attr_' + e.element.id)"
                                  :attrData="e.element"
                                  :valueList="getValue(ciEntityData.allAttrEntityData, e, 'valueList')"
                                  @setData="setConfig(arguments[0],'valueList', e)"
                                  @delete="deleteAttrEntity('attr_' + e.element.id, $event)"
                                  @select="selectAttrEntity(e, 'attr_' + e.element.id, $event)"
                                ></AttrInputer>
                              </div>
                              <div v-else-if="e.type === 'global'">
                                <TsFormRadio
                                  v-if="!e.element.isMultiple"
                                  :value="getGlobalValueList(ciEntityData.allAttrEntityData, 'global_' + e.element.id)?getGlobalValueList(ciEntityData.allAttrEntityData, 'global_' + e.element.id)[0]:null"
                                  :allowToggle="true"
                                  :dataList="e.element.itemList"
                                  valueName="id"
                                  textName="value"
                                  :validateList="getValidList(e.type, e.element)"
                                  @change="
                                    (val, opt) => {
                                      if (opt) {
                                        setGlobalAttrData(e.element, [opt], e);
                                      } else {
                                        setGlobalAttrData(e.element, [], e);
                                      }
                                    }
                                  "
                                ></TsFormRadio>
                                <TsFormCheckbox
                                  v-if="!!e.element.isMultiple"
                                  :value="getGlobalValueList(ciEntityData.allAttrEntityData, 'global_' + e.element.id)"
                                  :dataList="e.element.itemList"
                                  valueName="id"
                                  textName="value"
                                  :validateList="getValidList(e.type, e.element)"
                                  @change="(val, opt) => setGlobalAttrData(e.element, opt, e)"
                                ></TsFormCheckbox>
                              </div>
                              <div v-else>
                                <TsFormInput
                                  :value="getValue(ciEntityData.allAttrEntityData, e, 'valueList')?getValue(ciEntityData.allAttrEntityData, e, 'valueList')[0]:null"
                                  type="textarea"
                                  maxlength="500"
                                  :validateList="getValidList(e.type, e.element)"
                                  @change="(val)=>setConfig(val,'valueList',e)"
                                ></TsFormInput>
                              </div>
                            </template>
                            <template v-if="getValue(ciEntityData.allAttrEntityData, e, 'mappingMode') === 'formCommonComponent'">
                              <TsFormSelect
                                ref="attrHandler"
                                :value="getValue(ciEntityData.allAttrEntityData, e, 'valueList')?getValue(ciEntityData.allAttrEntityData, e, 'valueList')[0]:null"
                                :dataList="getFormComponent('formCommonComponent')"
                                textName="label"
                                valueName="uuid"
                                :firstSelect="false"
                                border="border"
                                :validateList="getValidList(e.type, e.element)"
                                transfer
                                @change="(val)=>setConfig(val,'valueList',e)"
                              ></TsFormSelect>
                            </template>
                            <template v-else-if="getValue(ciEntityData.allAttrEntityData, e, 'mappingMode') === 'formTableComponent'">
                              <TsRow :gutter="8">
                                <Col :span="24">
                                  <div class="formTableComponent pr-lg">
                                    <TsFormCascader
                                      ref="attrHandler"
                                      :value="getValue(ciEntityData.allAttrEntityData, e, 'valueList')"
                                      :dataList="tableComponentAttrList"
                                      :validateList="getValidList(e.type, e.element)"
                                      :firstSelect="false"
                                      transfer
                                      border="border"
                                      @change="(val)=>setConfig(val,'valueList',e)"
                                    ></TsFormCascader>
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
                            <template v-else-if="getValue(ciEntityData.allAttrEntityData, e, 'mappingMode') === 'formSubassemblyComponent'">
                              <TsRow :gutter="8">
                                <Col :span="24">
                                  <TsFormCascader
                                    ref="attrHandler"
                                    :value="getValue(ciEntityData.allAttrEntityData, e, 'valueList')"
                                    :dataList="subFormComponentList"
                                    :validateList="getValidList(e.type, e.element)"
                                    :firstSelect="false"
                                    transfer
                                    border="border"
                                    @change="(val)=>setConfig(val,'valueList',e)"
                                  ></TsFormCascader>
                                </Col>
                              </TsRow>
                            </template>
                          </Col>
                        </TsRow>
                      </Col>
                    </TsRow>
                  </template>
                </div>
              </Panel>
            </Collapse>
          </div>
        </div>
      </TsFormItem>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormCheckbox: resolve => require(['@/resources/plugins/TsForm/TsFormCheckbox'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    AttrInputer: resolve => require(['@/views/pages/cmdb/cientity/attr-inputer.vue'], resolve),
    TsFormCascader: resolve => require(['@/resources/plugins/TsForm/TsFormCascader.vue'], resolve),
    TargetCi: resolve => require(['./target-ci.vue'], resolve),
    ChildrenCi: resolve => require(['./children-ci.vue'], resolve)
  },
  props: {
    ciData: Object,
    allFormitemList: Array,
    ciEntityQueue: { //配置项添加队列
      type: Array,
      default: () => {
        return [];
      }
    },
    subFormComponentList: Array,
    tableComponentAttrList: Array,
    saveCiEntityMap: Object
  },
  data() {
    return {
      openPanel: ['global', 'unique', 'manual', 'description'],
      relCiList: [], //关系的所有下游模型列表
      isRelPopShow: {},
      mappingModeList: [
        {
          text: this.$t('page.constant'),
          value: 'constant'
        },
        {
          text: this.$t('term.process.formcommonitem'),
          value: 'formCommonComponent'
        },
        {
          text: this.$t('term.process.formtableitem'),
          value: 'formTableComponent'
        },
        {
          text: this.$t('term.framework.formsubassembly'),
          value: 'formSubassemblyComponent'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getValue(data, e, attr) {
      let value = null;
      let key = null;
      if (e.type === 'des') {
        key = 'description';
      } else {
        key = e.type + '_' + e.element.id;
      }
      if (data && data[key]) {
        value = data[key][attr];
      }
      return value;
    },
    getGlobalValueList(data, key) {
      let value = null;
      if (data && data[key] && data[key]['valueList']) {
        value = data[key]['valueList'].map(d => d.id);
      }
      return value;
    },
    disabledFn(elementId) {
      if (this.ciEntityData.editableAttrRelIdList && this.ciEntityData.editableAttrRelIdList.length > 0 && !this.ciEntityData.editableAttrRelIdList.includes(elementId)) {
        return true;
      }
      return false;
    },
    isRelShow(rel) {
      if (this.ciEntityData['_disableRel'] && this.ciEntityData['_disableRel'] == 'rel' + rel.direction + '_' + rel.id) {
        return false;
      }
      return true;
    },
    getTagType(relentity) {
      if (relentity.ciEntityId) {
        return 'primary';
      } else if (relentity.ciEntityUuid) {
        if (this.fromCiEntityData && relentity.ciEntityUuid == this.fromCiEntityData.uuid) {
          return 'warning';
        } else {
          return 'success';
        }
      }
    },
    ciEntityDatafn(key, relentity, rowdata) {
      if (this.ciEntityData.relEntityData[key] && this.ciEntityData.relEntityData[key]['valueList']) {
        for (let i = this.ciEntityData.relEntityData[key]['valueList'].length - 1; i >= 0; i--) {
          if (this.ciEntityData.relEntityData[key]['valueList'][i] == relentity) {
            this.$delete(this.ciEntityData.relEntityData[key]['valueList'], i);
            this.$forceUpdate();
            this.$emit('remove', relentity); //删除新配置项数据，如果是引用已存在配置项，此操作什么都不做
            break;
          }
        }
      }
    },
    delRelEntity(key, relentity, rowdata) {
      this.ciEntityDatafn(key, relentity, rowdata);
    },
    editNewRelEntity(rel, config) {
      if (this.getTagType(rel) == 'success') {
        let data = this.$utils.deepClone(rel);
        data.direction = config.direction;
        if (config.direction === 'from') {
          data._rootId = config.toCiId;
        } else {
          data._rootId = config.fromCiId;
        }
        //存在抽象模型和子模型的标识
        let abstractCiList = this.ciEntityData.relEntityData['rel' + config.direction + '_' + config.id]['valueList'] || [];
        if (abstractCiList && abstractCiList.length > 1) {
          if (data.ciId === data._rootId) {
            let subCiList = abstractCiList.filter((item) => {
              return item.ciId !== data._rootId;
            });
            data.subCiUuidList = this.$utils.mapArray(subCiList, 'ciEntityUuid');
          } else if (data.ciId != data._rootId) {
            data._rootUuid = abstractCiList[0].ciEntityUuid;
          }
        }
        this.$emit('edit', data);
      }
    },
    addNewRelEntity(rel) {
      this.relCiList = [];
      for (const k in this.isRelPopShow) {
        this.isRelPopShow[k] = false;
      }
      const ciId = rel.direction == 'from' ? rel.toCiId : rel.fromCiId;
      let relEntityData = this.ciEntityData.relEntityData && this.ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id];
      let relValueList = [];
      if (relEntityData && relEntityData['valueList'] && relEntityData['valueList'].length > 0) {
        relValueList = relEntityData['valueList'];
      }
      this.$api.cmdb.ci.getDownwardCiList(ciId).then(res => {
        let relCiList = res.Return || [];
        if (relCiList && relCiList.length > 0) {
          if (relCiList[0].isAbstract) {
            //过滤除第一个以外的抽象模型
            this.relCiList = relCiList.filter(item => {
              return (item.isAbstract && item.id === ciId) || !item.isAbstract;
            });
          } else {
            //如果没有抽象模型，只留下第一个模型
            this.relCiList.push(relCiList[0]);
          }
        }
        if (this.relCiList.length > 1) {
          this.isRelPopShow[rel.id + '_' + rel.direction] = true;
        } else if (this.relCiList.length == 1) {
          this.isRelPopShow[rel.id + '_' + rel.direction] = false;
          if (relValueList.length > 0) {
            this.editNewRelEntity(relValueList[0], rel);
          } else {
            this.newCiEntity(rel, this.relCiList[0].id);
          }
        }
      });
    },
    newCiEntity(rel, ciId) {
      rel.ciId = ciId;
      rel._relId = rel.id;
      this.isRelPopShow[rel.id + '_' + rel.direction] = false;
      if (rel.direction === 'from') {
        rel._rootId = rel.toCiId;
      } else {
        rel._rootId = rel.fromCiId;
      }
      //存在抽象模型和子模型的标识
      if (this.ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id]) {
        let abstractCiList = this.ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id]['valueList'] || [];
        if (abstractCiList && abstractCiList.length > 0) {
          if (ciId != rel._rootId) {
            rel._rootUuid = abstractCiList[0].ciEntityUuid;
          }
        }
      }
      this.$emit('new', rel);
    },
    //删除选中的属性
    deleteAttrEntity(key, attrentity) {
      //删除引用属性
      if (this.ciEntityData.allAttrEntityData[key]) {
        let valueList = this.ciEntityData.allAttrEntityData[key]['valueList'];
        if (valueList) {
          let j = -1;
          valueList.forEach((v, i) => {
            if (typeof v == 'string' || typeof v == 'number') {
              if (v == attrentity.uuid || v == attrentity.id) {
                j = i;
              }
            } else if (typeof v == 'object') {
              if (v.uuid == attrentity.uuid || v.id == attrentity.id) {
                j = i;
              }
            }
          });
          if (j > -1) {
            this.$delete(this.ciEntityData.allAttrEntityData[key]['valueList'], j);
          }
        }
      }
    },
    //选择引用属性
    selectAttrEntity(item, key, attrentity) {
      if (!this.ciEntityData.allAttrEntityData[key]) {
        Object.assign(this.ciEntityData.allAttrEntityData, key, {});
      }
      if (!this.ciEntityData.allAttrEntityData[key]['valueList']) {
        this.$set(this.ciEntityData.allAttrEntityData[key], 'valueList', []);
      }
      this.$nextTick(() => {
        let valueList = this.ciEntityData.allAttrEntityData[key]['valueList'];
        if (valueList.findIndex(v => (typeof v == 'object' && (v.uuid == attrentity.uuid || v.id == attrentity.id)) || (typeof v == 'number' && v == attrentity.id)) == -1) {
          this.ciEntityData.allAttrEntityData[key]['valueList'].push(attrentity);
        }
      });
    },
    getValidList(type, data) {
      let validateList = [];
      if (type == 'rel' && (data.direction == 'from' && data.toIsRequired) || (data.direction == 'to' && data.fromIsRequired)) {
        validateList = ['required'];
      } else if (type === 'attr' && !!data.isRequired) {
        validateList = ['required'];
      }
      return validateList;
    },
    valid() {
      const attrHandlers = this.$refs['attrHandler'];
      let isValid = true;
      if (attrHandlers) {
        attrHandlers.forEach(element => {
          if (element.valid) {
            if (!element.valid()) {
              isValid = false;
            }
          }
        });
      }
      if (this.$refs.targetCi && !this.$refs.targetCi.valid()) {
        isValid = false;
      }
      return isValid;
    },
    setGlobalAttrData(attr, opt, item) {
      if (!this.ciEntityData.allAttrEntityData) {
        this.ciEntityData.allAttrEntityData = {};
      }
      if (!this.ciEntityData.allAttrEntityData['global_' + attr.id]) {
        this.ciEntityData.allAttrEntityData['global_' + attr.id] = {};
      }
      this.$set(this.ciEntityData.allAttrEntityData['global_' + attr.id], 'valueList', opt);
      this.setConfig(opt, 'valueList', item);
    },
    setConfig(value, attrName, item) {
      if (!this.ciEntityData.allAttrEntityData) {
        this.ciEntityData.allAttrEntityData = {};
      }
      let key = null;
      if (item.type === 'des') {
        key = 'description';
      } else {
        key = item.type + '_' + item.element.id;
      }
      if (!this.ciEntityData.allAttrEntityData[key]) {
        this.$set(this.ciEntityData.allAttrEntityData, key, {});
      }
      if (!this.ciEntityData.allAttrEntityData[key]) {
        this.$set(this.ciEntityData.allAttrEntityData, key, {});
      }
      if (attrName === 'valueList') {
        if (Array.isArray(value)) {
          this.$set(this.ciEntityData.allAttrEntityData[key], attrName, value);
        } else {
          this.$set(this.ciEntityData.allAttrEntityData[key], attrName, [value]);
        }
      } else {
        this.$set(this.ciEntityData.allAttrEntityData[key], attrName, value);
      }
    },
    changeMappingMode(val, e) {
      this.setConfig(val, 'mappingMode', e);
      this.setConfig([], 'valueList', e);
    }
  },
  filter: {},
  computed: {
    elementTypeList() {
      const typeList = [];
      if (this.ciEntityData) {
        const uniqueList = this.ciEntityData['_uniqueAttrList'] || [];
        const elementList = this.ciEntityData['_elementList'];
        //流程节点中，模型映射，下框和table不能新增
        elementList.forEach(e => {
          if (e.element.type === 'select' || e.element.type === 'table') {
            e.element.config && this.$delete(e.element.config, 'mode');
          }
        });
        const globalObj = { type: 'global', label: this.$t('term.cmdb.globalattr'), elementList: [], isShow: true };
        globalObj.elementList = elementList.filter(d => d.type === 'global');
        if (globalObj.elementList.length > 0) {
          typeList.push(globalObj);
        }
        const uniqueObj = { type: 'unique', label: this.$t('term.cmdb.uniquerule'), elementList: [], isShow: true };
        uniqueObj.elementList = elementList.filter(d => d.type === 'attr' && uniqueList.includes(d.element.id));
        if (uniqueObj.elementList.length > 0) {
          typeList.push(uniqueObj);
        }
        const manualObj = { type: 'manual', label: this.$t('term.cmdb.manualinput'), elementList: [], isShow: false };
        manualObj.elementList = elementList.filter(d => !uniqueList.includes(d.element.id) && d.element.inputType === 'mt');
        if (manualObj.elementList.length > 0) {
          typeList.push(manualObj);
        }
        const autoObj = { type: 'auto', label: this.$t('page.autocollect'), elementList: [], isShow: true };
        autoObj.elementList = elementList.filter(d => !uniqueList.includes(d.element.id) && d.element.inputType === 'at');
        if (autoObj.elementList.length > 0) {
          //自动采集不需要校验必填，处理必填属性
          autoObj.elementList.forEach(e => {
            if (e.type === 'rel') {
              e.element.direction == 'from' && this.$set(e.element, 'toIsRequired', 0);
              e.element.direction == 'to' && this.$set(e.element, 'fromIsRequired', 0);
            } else if (e.type === 'attr') {
              this.$set(e.element, 'isRequired', 0);
            }
          });
          typeList.push(autoObj);
        }
        const desConfig = this.ciEntityData['_description'];
        typeList.push(desConfig);
      }
      return typeList;
    },
    ciEntityData() {
      return this.ciEntityQueue[this.ciEntityQueue.length - 1];
    },
    fromCiEntityData() {
      //来自哪个配置项
      if (this.ciEntityQueue.length > 1) {
        return this.ciEntityQueue[this.ciEntityQueue.length - 2];
      }
      return null;
    },
    getFormComponent() {
      return (type) => {
        let dataList = [];
        if (this.allFormitemList && this.allFormitemList.length > 0) {
          if (type === 'formCommonComponent') { //表单普通组件
            dataList = this.allFormitemList.filter(item => {
              return item.handler != 'formtableselector' && item.handler != 'formtableinputer' && item.handler != 'formsubassembly';
            });
          } else if (type === 'formTableComponent') { //table组件（表格数据组件、表单选择组件）
            dataList = this.allFormitemList.filter(item => {
              return item.handler === 'formtableselector' || item.handler === 'formtableinputer';
            });
          }
        }
        return dataList;
      };
    },
    getMappingDataList() { 
      return () => {
        let dataList = this.$utils.deepClone(this.mappingModeList);
        //添加多条数据，遍历对象与普通属性保持一致
        if (this.ciData.createPolicy === 'batch' && this.ciData.batchDataSource.type) {
          dataList = dataList.filter(item => {
            return (this.ciData.batchDataSource.type === 'formTableComponent' && item.value != 'formSubassemblyComponent') || (this.ciData.batchDataSource.type === 'formSubassemblyComponent' && item.value != 'formTableComponent');
          });
        } else {
          dataList = dataList.filter(item => {
            return (item.value === 'constant') || (item.value === 'formCommonComponent');
          });
        }
        return dataList;
      };
    },
    isRelDisabled() { //关系模型选择
      return (rel, relCiList, relCi) => {
        let isDisabled = false;
        if (!this.$utils.isEmpty(relCiList)) {
          let findItem = null;
          let abstractCi = relCiList.find(item => item.isAbstract); //抽象模型
          let relEntityData = this.ciEntityData.relEntityData && this.ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id];
          let relValueList = [];
          if (relEntityData && relEntityData['valueList'] && relEntityData['valueList'].length > 0) {
            relValueList = relEntityData['valueList'];
          }
          if (!this.$utils.isEmpty(relValueList)) {
            findItem = relValueList.find(item => item.ciId === relCi.id); //保存的抽象模型
          }
          if (findItem) {
            isDisabled = true;
          } else if (!relCi.isAbstract) {
            let findAbstractCi = abstractCi && relValueList.find(item => item.ciId === abstractCi.id);
            if (!findAbstractCi) { //存在抽象模型，其他子模型才能编辑
              isDisabled = true;
            }
          }
        }
        return isDisabled;
      };
    },
    isClosableCi() { //存在子模型，抽象模型不能删除
      return (relEntityData, rel, subRel) => {
        let isCan = true;
        if (relEntityData['rel' + rel.direction + '_' + rel.id]['valueList'] && 
        relEntityData['rel' + rel.direction + '_' + rel.id]['valueList'].length > 1
        ) {
          if ((rel.direction === 'from' && rel['toCiId'] === subRel.ciId) || 
          (rel.direction === 'to' && rel['formCiId'] === subRel.ciId)) {
            isCan = false;
          }
        }
        return isCan;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.ivu-form-item {
  margin-bottom: 24px !important;
}
/deep/.tstabs {
  .tstable-main {
    max-height: initial !important;
  }
}
/deep/.ivu-collapse {
  border-top: 0px;
  border-bottom: 0px;
}
/deep/.ivu-collapse-header {
  border-bottom: 0px;
}
.formTableComponent {
  position: relative;
  .formTableComponent-tip {
    position: absolute;
    right: 0;
    top: 0;
  }
}
.tip-eg {
  display: flex;
  align-items: center;
  .center-text {
    position: relative;
    border-bottom: 1px solid;
    margin: 0 16px;
    min-width: 50px;
    &:after {
      font-family: 'tsfont';
      content: '\e899';
      position: absolute;
      bottom: -15px;
      font-size: 18px;
      right: -11px;
    }
  }
}
</style>
