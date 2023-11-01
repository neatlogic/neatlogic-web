<template>
  <div>
    <Loading
      v-if="isLoading"
      :text="$t('page.validating')"
      :loadingShow="isLoading"
      type="fix"
    ></Loading>
    <div>
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
                      <div v-if="isRelShow(e.element, ciEntityData) && !(ciEntityData.relEntityData && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id] && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id]['valueList'] && ciEntityData.relEntityData['rel' + e.element.direction + '_' + e.element.id]['valueList'].length > 0 && ((e.element.direction == 'to' && e.element.fromRule == 'O') || (e.element.direction == 'from' && e.element.toRule == 'O')))">
                        <a
                          v-if="((e.element.direction == 'from' && e.element.toAllowInsert) || (e.element.direction == 'to' && e.element.fromAllowInsert))"
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
                        >
                          <a></a>
                          <div slot="content">
                            <div v-if="relCiList" :style="'overflow:auto;max-height:300px;width:' + Math.min(550, relCiList.length * 90) + 'px'">
                              <div
                                v-for="relci in relCiList"
                                :key="relci.id"
                                style="text-align: center; margin-right: 10px; float: left; cursor: pointer; width: 80px"
                                @click="newCiEntity(e.element, relci.id)"
                              >
                                <div>
                                  <a href="javascript:void(0)"><i style="font-size: 20px" :class="relci.icon"></i></a>
                                </div>
                                <div class="overflow" :title="relci.label">
                                  <a href="javascript:void(0)">{{ relci.label }}</a>
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
                          :closable="!disabledFn('rel' + e.element.direction + '_' + e.element.id) && (relentity.ciEntityId || relentity.type == 'new') ? true : false"
                          :style="getTagType(relentity) == 'success' ? 'cursor:pointer' : ''"
                          @click.native="
                            e => {
                              e.stopPropagation();
                              editNewRelEntity(relentity);
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
                          :value="getValue(ciEntityData.allCiEntityValue, e, 'mappingMode')"
                          :dataList="mappingModeList"
                          :firstSelect="false"
                          transfer
                          border="border"
                          :validateList="getValidList(e.type, e.element)"
                          @change="(val)=>setConfig(val,'mappingMode',e)"
                        ></TsFormSelect>
                      </Col>
                      <Col span="18">
                        <template v-if="getValue(ciEntityData.allCiEntityValue, e, 'mappingMode') == 'constant'">
                          <div v-if="e.type === 'attr'">
                            <AttrInputer
                              ref="attrHandler"
                              :allowBatchAdd="true"
                              :attrEntity="ciEntityData.attrEntityData['attr_' + e.element.id]"
                              :disabled="disabledFn('attr_' + e.element.id)"
                              :attrData="e.element"
                              :valueList="getValue(ciEntityData.allCiEntityValue, e, 'valueList')"
                              @setData="setAttrData(e, e.element, arguments[0], arguments[1])"
                              @delete="deleteAttrEntity('attr_' + e.element.id, $event)"
                              @select="selectAttrEntity(e, 'attr_' + e.element.id, $event)"
                            ></AttrInputer>
                          </div>
                          <div v-else-if="e.type === 'global'">
                            <TsFormRadio
                              v-if="!e.element.isMultiple"
                              :value="getGlobalValueList(ciEntityData.allCiEntityValue, 'global_' + e.element.id)?getGlobalValueList(ciEntityData.allCiEntityValue, 'global_' + e.element.id)[0]:null"
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
                              :value="getGlobalValueList(ciEntityData.allCiEntityValue, 'global_' + e.element.id)"
                              :dataList="e.element.itemList"
                              valueName="id"
                              textName="value"
                              :validateList="getValidList(e.type, e.element)"
                              @change="(val, opt) => setGlobalAttrData(e.element, opt, e)"
                            ></TsFormCheckbox>
                          </div>
                          <div v-else>
                            <TsFormInput
                              :value="getValue(ciEntityData.allCiEntityValue, e, 'valueList')?getValue(ciEntityData.allCiEntityValue, e, 'valueList')[0]:null"
                              type="textarea"
                              maxlength="500"
                              :validateList="getValidList(e.type, e.element)"
                              @change="(val)=>setConfig(val,'valueList',e)"
                            ></TsFormInput>
                          </div>
                        </template>
                        <template v-if="getValue(ciEntityData.allCiEntityValue, e, 'mappingMode') === 'formCommonComponent'">
                          <TsFormSelect
                            ref="attrHandler"
                            :value="getValue(ciEntityData.allCiEntityValue, e, 'valueList')?getValue(ciEntityData.allCiEntityValue, e, 'valueList')[0]:null"
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
                        <template v-else-if="getValue(ciEntityData.allCiEntityValue, e, 'mappingMode') === 'formTableComponent'">
                          <TsRow :gutter="8">
                            <Col span="12">
                              <TsFormSelect
                                ref="attrHandler"
                                :value="getValue(ciEntityData.allCiEntityValue, e, 'valueList')?getValue(ciEntityData.allCiEntityValue, e, 'valueList')[0]:null"
                                :dataList="getFormComponent('formTableComponent')"
                                textName="label"
                                valueName="uuid"
                                :validateList="getValidList(e.type, e.element)"
                                :firstSelect="false"
                                transfer
                                border="border"
                                @change="(val)=>setConfig(val,'valueList',e)"
                              ></TsFormSelect>
                            </Col>
                            <Col span="12">
                              <div class="formTableComponent pr-lg">
                                <TsFormSelect
                                  ref="attrHandler"
                                  :value="getValue(ciEntityData.allCiEntityValue, e, 'column')"
                                  :dataList="getAttrList(ciEntityData.allCiEntityValue, e)"
                                  :validateList="getValidList(e.type, e.element)"
                                  :firstSelect="false"
                                  transfer
                                  border="border"
                                  @change="(val)=>setConfig(val,'column',e)"
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
                      </Col>
                    </TsRow>
                    <div v-if="ciData.createPolicy === 'single' && getValue(ciEntityData.allCiEntityValue, e, 'mappingMode') === 'formTableComponent'">
                      <FilterList
                        ref="attrHandler"
                        :defaultFilterList="getValue(ciEntityData.allCiEntityValue, e, 'filterList')"
                        :dataList="getAttrList(ciEntityData.allCiEntityValue, e)"
                        @setConfig="(val)=>setConfig(val,'filterList', e)"
                      ></FilterList>
                    </div>
                  </Col>
                </TsRow>
              </template>
            </div>
          </Panel>
        </Collapse>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormCheckbox: resolve => require(['@/resources/plugins/TsForm/TsFormCheckbox'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    AttrInputer: resolve => require(['@/views/pages/cmdb/cientity/attr-inputer.vue'], resolve),
    FilterList: resolve => require(['./cmdbpolicy/filter-list.vue'], resolve)
  },
  props: {
    ciData: Object,
    allFormitemList: Array,
    ciEntityQueue: {
      type: Array,
      default: () => {
        return [];
      }
    } //配置项添加队列
  },
  data() {
    return {
      openPanel: ['global', 'unique', 'manual', 'description'],
      relCiList: [], //关系的所有下游模型列表
      isRelPopShow: {},
      isLoading: false,
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
      } else {
        const rule = rel.direction == 'from' ? rel.toRule : rel.fromRule;
        if (rule == 'O' && this.ciEntityData.relEntityData && this.ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id] && this.ciEntityData.relEntityData['rel' + rel.direction + '_' + rel.id]['valueList'].length > 0) {
          return false;
        }
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
    editNewRelEntity(rel) {
      if (this.getTagType(rel) == 'success') {
        this.$emit('edit', rel.ciEntityUuid, rel);
      }
    },
    addNewRelEntity(rel) {
      //disabled 当有值的时候是为可编辑，这个字段是从表单里面过来的
      this.relCiList = [];
      for (const k in this.isRelPopShow) {
        this.isRelPopShow[k] = false;
      }
      const ciId = rel.direction == 'from' ? rel.toCiId : rel.fromCiId;
      this.$api.cmdb.ci.getDownwardCiList(ciId).then(res => {
        this.relCiList = res.Return;
        if (this.relCiList.length > 1) {
          this.isRelPopShow[rel.id + '_' + rel.direction] = true;
        } else if (this.relCiList.length == 1) {
          this.isRelPopShow[rel.id + '_' + rel.direction] = false;
          this.newCiEntity(rel, this.relCiList[0].id);
        }
      });
    },
    newCiEntity(rel, ciId) {
      rel.ciId = ciId;
      rel._relId = rel.id;
      this.isRelPopShow[rel.id + '_' + rel.direction] = false;
      this.$emit('new', 'rel', rel);
    },
    //删除选中的属性
    deleteAttrEntity(key, attrentity) {
      //删除引用属性
      if (this.ciEntityData.attrEntityData[key]) {
        let valueList = this.ciEntityData.attrEntityData[key]['valueList'];
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
            this.$delete(this.ciEntityData.attrEntityData[key]['valueList'], j);
          }
        }
        let actualValueList = this.ciEntityData.attrEntityData[key]['actualValueList'];
        if (actualValueList) {
          let j = -1;
          actualValueList.forEach((v, i) => {
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
            this.$delete(this.ciEntityData.attrEntityData[key]['actualValueList'], j);
          }
        }
        this.$emit('remove', attrentity);
      }
    },
    //选择引用属性
    selectAttrEntity(item, key, attrentity) {
      if (!this.ciEntityData.attrEntityData[key]) {
        const vo = {};
        vo[key] = { valueList: [], actualValueList: [] };
        Object.assign(this.ciEntityData.attrEntityData, vo);
      }
      if (!this.ciEntityData.attrEntityData[key]['valueList']) {
        this.$set(this.ciEntityData.attrEntityData[key], 'valueList', []);
      }
      if (!this.ciEntityData.attrEntityData[key]['actualValueList']) {
        this.$set(this.ciEntityData.attrEntityData[key], 'actualValueList', []);
      }
      this.$nextTick(() => {
        let valueList = this.ciEntityData.attrEntityData[key]['valueList'];
        if (valueList.findIndex(v => (typeof v == 'object' && (v.uuid == attrentity.uuid || v.id == attrentity.id)) || (typeof v == 'number' && v == attrentity.id)) == -1) {
          this.ciEntityData.attrEntityData[key]['valueList'].push(attrentity);
          this.ciEntityData.attrEntityData[key]['actualValueList'].push(attrentity);
        }
        this.setConfig(valueList, 'valueList', item);
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
      return isValid;
    },
    setGlobalAttrData(attr, opt, item) {
      if (!this.ciEntityData.globalAttrEntityData) {
        this.ciEntityData.globalAttrEntityData = {};
      }
      if (!this.ciEntityData.globalAttrEntityData['global_' + attr.id]) {
        this.ciEntityData.globalAttrEntityData['global_' + attr.id] = {};
      }
      this.$set(this.ciEntityData.globalAttrEntityData['global_' + attr.id], 'valueList', opt);
      this.setConfig(opt, 'valueList', item);
    },
    setAttrData(item, attr, value, actualValue) {
      if (!this.ciEntityData.attrEntityData) {
        this.ciEntityData.attrEntityData = {};
      }
      if (!this.ciEntityData.attrEntityData['attr_' + attr.id]) {
        this.ciEntityData.attrEntityData['attr_' + attr.id] = {};
      }
      this.$set(this.ciEntityData.attrEntityData['attr_' + attr.id], 'config', attr.config);
      this.$set(this.ciEntityData.attrEntityData['attr_' + attr.id], 'type', attr.type);
      this.$set(this.ciEntityData.attrEntityData['attr_' + attr.id], 'valueList', value);
      this.$set(this.ciEntityData.attrEntityData['attr_' + attr.id], 'actualValueList', actualValue);
      this.setConfig(value, 'valueList', item);
    },
    setConfig(value, attrName, item) {
      if (!this.ciEntityData.allCiEntityValue) {
        this.ciEntityData.allCiEntityValue = {};
      }
      let key = null;
      if (item.type === 'des') {
        key = 'description';
      } else {
        key = item.type + '_' + item.element.id;
      }
      if (!this.ciEntityData.allCiEntityValue[key]) {
        this.$set(this.ciEntityData.allCiEntityValue, key, {});
      }
      if (!this.ciEntityData.allCiEntityValue[key]) {
        this.$set(this.ciEntityData.allCiEntityValue, key, {});
      }
      if (attrName === 'valueList') {
        if (Array.isArray(value)) {
          this.$set(this.ciEntityData.allCiEntityValue[key], attrName, value);
        } else {
          this.$set(this.ciEntityData.allCiEntityValue[key], attrName, [value]);
        }
      } else {
        this.$set(this.ciEntityData.allCiEntityValue[key], attrName, value);
      }
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
              return item.handler != 'formtableselector' && item.handler != 'formtableinputer' && item.handler != 'formcube';
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
    getAttrList() {
      return (data, e) => {
        let dataList = [];
        let key = null;
        if (e.type === 'des') {
          key = 'description';
        } else {
          key = e.type + '_' + e.element.id;
        }
        let valueList = data[key] && data[key]['valueList'];
        if (this.allFormitemList && this.allFormitemList.length > 0) {
          let find = this.allFormitemList.find(item => valueList && item.uuid === valueList[0]);
          if (find && find.config && find.config.dataConfig) {
            find.config.dataConfig.forEach(d => {
              dataList.push({
                text: d.label,
                value: d.uuid
              });
            });
          }
        }
        return dataList;
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
