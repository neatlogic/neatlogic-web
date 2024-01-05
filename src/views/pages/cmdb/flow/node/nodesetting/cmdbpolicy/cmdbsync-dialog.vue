<template>
  <div>
    <TsDialog
      title="录入配置"
      type="slider"
      width="large"
      :isShow="true"
      className="cmdbsync-dialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div class="cmdbsync-main bg-op radius-sm mb-sm">
          <div class="title">
            <div>
              <Breadcrumb v-if="ciEntityQueue && ciEntityQueue.length > 0" separator="<span class='tsfont-arrow-right'></span>">
                <BreadcrumbItem v-for="(entity, index) in ciEntityQueue" :key="index">
                  <span v-if="index == ciEntityQueue.length - 2" style="font-size: 15px">
                    <a href="javascript:void(0)" class="text-info" @click="back()">
                      <span :class="entity.ciIcon"></span>
                      <span>{{ entity.ciLabel }}({{ entity.ciName }})</span>
                    </a>
                  </span>
                  <span v-else-if="index == ciEntityQueue.length - 1" style="font-size: 15px">
                    <span :class="entity.ciIcon"></span>
                    <span>{{ entity.ciLabel }}({{ entity.ciName }})</span>
                  </span>
                  <span v-else class="text-grey" style="font-size: 15px">
                    <span :class="entity.ciIcon"></span>
                    <span>{{ entity.ciLabel }}({{ entity.ciName }})</span>
                  </span>
                </BreadcrumbItem>
              </Breadcrumb>
            </div>
            <div class="action-btn">
              <span class="text-tip-active" :class="isShow ? 'tsfont-down' : 'tsfont-up'" @click="isShow=!isShow"></span>
            </div>
          </div>
          <div v-show="isShow" class="cmdbsync-content border-color padding">
            <Loading :loadingShow="loadingShow" type="fix"></Loading>
            <div class="pl-lg">
              <TsFormItem :label="$t('term.cmdb.asyncpolicy')" labelPosition="left">
                <TsFormRadio
                  v-model="ciData.editMode"
                  :dataList="editModeList"
                  :disabled="isInherit"
                  @on-change="(val)=>{
                    changeEditMode(val)
                  }"
                ></TsFormRadio>
              </TsFormItem>
              <TsFormItem
                v-if="ciEntityQueue.length < 2"
                :label="$t('term.deploy.configurationmodel')"
                labelPosition="left"
                required
              >
                <TsFormSelect
                  ref="ciConfig"
                  v-model="ciData.ciId"
                  v-bind="ciConfig"
                  @on-change="(val)=>{
                    changeCiId(val)
                  }"
                ></TsFormSelect>
              </TsFormItem>
              <div v-if="ciData.ciId">
                <TsFormItem :label="$t('term.cmdb.ciconfignumber')" labelPosition="left">
                  <TsFormRadio
                    v-model="ciData.createPolicy"
                    :dataList="ciEntityQueue.length <= 1?createPolicyDataList:createRelDataList"
                    :disabled="isInherit"
                    @on-change="(val)=>{
                      changePolicy(val)
                    }"
                  ></TsFormRadio>
                </TsFormItem>
                <TsFormItem
                  v-if="ciEntityQueue.length > 1 && !currentCiEntity.isChildren"
                  :label="$t('term.cmdb.relaction')"
                  labelPosition="left"
                  required
                >
                  <TsFormRadio
                    :dataList="actionDataList"
                    :value="ciData.action"
                    :disabled="isInherit"
                    @on-change="(val)=>{
                      setConfig(val,'action')
                    }"
                  ></TsFormRadio>
                </TsFormItem>
                <template v-if="ciData.createPolicy==='batch'">
                  <TsFormItem v-if="ciData.createPolicy==='batch'" :label="$t('page.foreachobj')" labelPosition="left">
                    <TsRow :gutter="8">
                      <Col span="12">
                        <TsFormSelect
                          ref="batchDataSourceType"
                          :value="ciData.batchDataSource && ciData.batchDataSource.type"
                          :dataList="batchComponentList"
                          :validateList="validateList"
                          :disabled="isDisabledType || isInherit"
                          transfer
                          @on-change="(val)=>{
                            setBatchDataSource(val,'type')
                          }"
                        ></TsFormSelect>
                      </Col>
                      <Col span="12">
                        <TsFormSelect
                          ref="batchDataSourceAttr"
                          :value="ciData.batchDataSource && ciData.batchDataSource.attributeUuid"
                          :dataList="getFormTableComponent()"
                          textName="label"
                          valueName="uuid"
                          :validateList="validateList"
                          :firstSelect="false"
                          transfer
                          border="border"
                          :disabled="isInherit"
                          @on-change="(val)=>{
                            setBatchDataSource(val,'attributeUuid')
                          }"
                        ></TsFormSelect>
                      </Col>
                    </TsRow>
                  </TsFormItem>
                  <TsFormItem v-if="ciData.createPolicy==='batch'" :label="$t('term.dashboard.datafilter')" labelPosition="left">
                    <FilterList
                      ref="filterList"
                      :defaultFilterList="ciData.batchDataSource && ciData.batchDataSource.filterList"
                      :dataList="getAttrList(ciData.batchDataSource)"
                      :disabled="isInherit"
                      @setConfig="(val)=> setBatchDataSource(val,'filterList')"
                    ></FilterList>
                  </TsFormItem>
                </template>
                <CmdbsyncEdit
                  v-if="!loadingShow"
                  ref="cmdbsyncEdit"
                  :allFormitemList="allFormitemList"
                  :ciEntityQueue="ciEntityQueue"
                  :ciData="ciData"
                  :subFormComponentList="getTreeSubFormComponent()"
                  :tableComponentAttrList="getTableAttrList()"
                  :saveCiEntityMap="saveCiEntityMap"
                  @new="addNewCiEntity"
                  @edit="editNewCiEntity"
                  @remove="removeNewCiEntity"
                ></CmdbsyncEdit>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="cancelNewCiEntity()">{{ $t('page.cancel') }}</Button>
        <Button
          v-if="ciEntityQueue.length > 1"
          ghost
          type="primary"
          @click="saveNewCiEntity()"
        >{{ $t('page.confirm') }}</Button>
        <Button
          v-else
          type="primary"
          @click="okDialog()"
        >{{ $t('page.save') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import {store} from '@/views/pages/process/flow/flowedit/floweditState.js';
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    CmdbsyncEdit: resolve => require(['./cmdbsync-edit.vue'], resolve),
    FilterList: resolve => require(['./filter-list.vue'], resolve)
  },
  props: {
    configList: Array
  },
  data() {
    return {
      loadingShow: false,
      ciData: { //当前配置
        ciId: null,
        ciName: '',
        createPolicy: 'single', 
        batchDataSource: {},
        mappingList: [],
        relEntityData: {}
      },
      isShow: true,
      ciConfig: {
        url: 'api/rest/cmdb/ci/list',
        search: true,
        params: {
          isVirtual: 0
        },
        validateList: ['required'],
        transfer: true
      },
      createPolicyDataList: [
        {
          value: 'single',
          text: this.$t('term.cmdb.addonedata')
        },
        {
          value: 'batch',
          text: this.$t('term.cmdb.addmoredata')
        }
      ],
      createRelDataList: [
        {
          value: 'single',
          text: this.$t('term.cmdb.addonerel')
        },
        {
          value: 'batch',
          text: this.$t('term.cmdb.addmorerel')
        }
      ],
      actionDataList: [
        {
          value: 'append',
          text: this.$t('page.append')
        },
        {
          value: 'replace',
          text: this.$t('page.replace')
        }
      ],
      validateList: ['required'],
      ciEntityQueue: [], //记录配置项添加队列
      tmpCiEntityData: {}, //临时数据，用于取消修改时还原
      saveCiEntityMap: {}, //最后需要保存的配置项列表
      descriptionConfig: { type: 'description', label: this.$t('term.cmdb.changememo'), elementList: [
        {
          type: 'des',
          element: {
            label: this.$t('term.cmdb.changememo'),
            type: 'textarea',
            maxlength: 500
          }
        }
      ], isShow: true },
      batchComponentList: [
        {
          text: this.$t('term.process.formtableitem'),
          value: 'formTableComponent'
        },
        {
          text: this.$t('term.framework.formsubassembly'),
          value: 'formSubassemblyComponent'
        }
      ],
      currentFormItemList: [], //当前表单组件（当配置项数量为多数据且遍历对象为子表单添加关系时，当前关系模型可选的表单组件为子表单内组件）
      tableList: [], //遍历对象，选择表格组件
      editModeList: [
        {
          text: this.$t('page.global'),
          value: 'global',
          description: this.$t('term.cmdb.globaleditmodetip')
        },
        {
          text: this.$t('page.partial'),
          value: 'partial',
          description: this.$t('term.cmdb.partialeditmodetip')
        }
      ],
      isInherit: false, //判断子模型需要继承根模型的策略
      subCiUuidList: [] //子模型临时数据(标识)
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
      this.saveCiEntityMap = {};
      if (!this.$utils.isEmpty(this.configList)) {
        let findItem = this.configList.find(c => c.isStart);
        if (findItem) {
          this.ciData = this.$utils.deepClone(findItem);
        }
        this.configList.forEach(item => {
          this.$set(this.saveCiEntityMap, item.uuid, item);
        });
        this.getCiEntityById();
        this.currentFormItemList = this.$utils.deepClone(this.allFormitemList);
      }
    },
    initValue(cientity, preCiEntity, rel) {
      this.subCiUuidList = rel && rel.subCiUuidList || [];
      this.isInherit = false;
      let findItem = this.saveCiEntityMap[cientity.uuid];
      if (findItem) {
        Object.keys(findItem).forEach(key => {
          if (key === 'mappingList') {
            if (!this.$utils.isEmpty(findItem.mappingList)) {
              findItem.mappingList.forEach(m => {
                if (m.key.indexOf('rel') > -1) {
                  this.$set(cientity.relEntityData, m.key, m);
                } else {
                  this.$set(cientity.allAttrEntityData, m.key, m);
                }
              });
            }
          } else {
            if (cientity.hasOwnProperty(key)) {
              this.$set(cientity, key, findItem[key]);
            }
          }
        });
        //标记为已保存的，用于点击“取消”后判断是否需要删除数据
        cientity._isnew = true;
      }
      if (preCiEntity && preCiEntity.batchDataSource && preCiEntity.batchDataSource.type && 
      cientity.batchDataSource && cientity.batchDataSource.type && 
      preCiEntity.batchDataSource.type !== cientity.batchDataSource.type) {
        this.$set(cientity.batchDataSource, 'type', preCiEntity.batchDataSource.type);
        this.$set(cientity.batchDataSource, 'attributeUuid', '');
        this.$set(cientity.batchDataSource, 'filterList', []);
        Object.keys(cientity.allAttrEntityData).forEach(key => {
          if (cientity.allAttrEntityData[key].mappingMode === 'formTableComponent' || cientity.allAttrEntityData[key].mappingMode === 'formSubassemblyComponent' &&
           cientity.allAttrEntityData[key].mappingMode != cientity.batchDataSource.type) {
            this.$set(cientity.allAttrEntityData[key], 'mappingMode', '');
            this.$set(cientity.allAttrEntityData[key], 'valueList', []);
          }
        });
      }
      //子模型
      if (rel && rel._rootId) {
        if (rel.isChildren) {
          //初始模型是抽象模型
          let rootConfig = this.ciEntityQueue[0];
          if (rootConfig) {
            this.$set(cientity, 'action', rootConfig.action);
            this.$set(cientity, 'batchDataSource', rootConfig.batchDataSource);
            this.$set(cientity, 'editMode', rootConfig.editMode);
            this.$set(cientity, 'createPolicy', rootConfig.createPolicy);
          }
          this.isInherit = true;
        } else if (rel._rootId != cientity.ciId) {
          if (this.saveCiEntityMap[rel._rootUuid]) {
            let rootConfig = this.saveCiEntityMap[rel._rootUuid];
            this.$set(cientity, 'action', rootConfig.action);
            this.$set(cientity, 'batchDataSource', rootConfig.batchDataSource);
            this.$set(cientity, 'editMode', rootConfig.editMode);
            this.$set(cientity, 'createPolicy', rootConfig.createPolicy);
          }
          this.isInherit = true;
        }
      }
    },
    okDialog() {
      if (!this.valid()) {
        return false; 
      }
      let data = this.save();
      this.$emit('close', data);
    },
    closeDialog() {
      this.$emit('close');
    },
    changeCiId(val) {
      this.saveCiEntityMap = {};
      this.ciEntityQueue = [];
      this.currentFormItemList = this.$utils.deepClone(this.allFormitemList);
      this.$set(this.ciData, 'createPolicy', 'single');
      this.$set(this.ciData, 'batchDataSource', {});
      if (val) {
        this.getCiEntityById();
      }
    },
    getCiEntityById() {
      this.loadingShow = true;
      this.$api.cmdb.ci.getCiForprocessmapping({id: this.ciData.ciId}).then(res => {
        if (res.Return) {
          const ci = res.Return;
          if (ci.isVirtual == 0) {
            const cientity = {
              isStart: 1,
              uuid: this.ciData.uuid || this.$utils.setUuid(),
              ciId: this.ciData.ciId,
              ciName: ci.name,
              ciLabel: ci.label,
              ciIcon: ci.icon,
              editMode: this.ciData.editMode || 'global',
              createPolicy: 'single',
              batchDataSource: {},
              relEntityData: {},
              allAttrEntityData: {},
              isAbstract: ci.isAbstract
            };
            if (ci.isAbstract) {
              this.$set(cientity, 'children', []);
            }
            cientity['_elementList'] = this.getElementByCiId(ci);
            cientity['_uniqueAttrList'] = ci.uniqueAttrIdList;
            cientity['_description'] = this.descriptionConfig;
            this.initValue(cientity);
            this.ciEntityQueue = [cientity];
            this.ciData = cientity;
          } else {
            if (ci.isVirtual == 1) {
              this.error = this.$t('message.cmdb.virtualmodel');
            }
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getElementByCiId(data) {
      const attrList = data.attrList || [];
      const relList = data.relList || [];
      const globalAttrList = data.globalAttrList || [];
      const ciViewList = data.viewList || [];
      const elementList = [];
      ciViewList.forEach((e, index) => {
        if (e.type === 'attr') {
          const attr = attrList.find(a => a.id == e.itemId);
          if (attr) {
            elementList.push({ type: 'attr', element: attr });
          }
        } else if (e.type === 'relfrom') {
          const rel = relList.find(a => a.direction == 'from' && a.id == e.itemId);
          if (rel) {
            elementList.push({ type: 'rel', element: rel });
          }
        } else if (e.type === 'relto') {
          const rel = relList.find(a => a.direction == 'to' && a.id == e.itemId);
          if (rel) {
            elementList.push({ type: 'rel', element: rel });
          }
        } else if (e.type === 'global') {
          const globalattr = globalAttrList.find(a => a.id == e.itemId);
          if (globalattr) {
            elementList.push({ type: 'global', element: globalattr });
          }
        }
      });
      return elementList;
    },
    addNewCiEntity(item) {
      if (!this.valid()) {
        return;
      }
      this.loadingShow = true;
      const rel = item;
      const ciId = rel.ciId;
      const relId = rel._relId;
      const direction = rel.direction == 'from' ? 'to' : 'from'; //目标关系需要取反
      const uuid = rel.ciEntityUuid || this.$utils.setUuid(); //新的配置项标识
      const rootId = rel._rootId || null;
      this.$api.cmdb.ci.getCiForprocessmapping({id: ciId, rootId: rootId}).then(res => {
        if (res.Return) {
          const ci = res.Return;
          //获取当前配置项数据
          const currentCiEntity = this.ciEntityQueue[this.ciEntityQueue.length - 1];
          const newCiEntity = {
            uuid: uuid,
            _relId: relId, //记录来自哪个关系，自动填上配置项
            _direction: rel.direction, //记录关系方向
            ciId: ciId,
            ciName: ci.name,
            ciLabel: ci.label,
            ciIcon: ci.icon,
            editMode: 'global',
            createPolicy: 'single',
            batchDataSource: {},
            action: 'append',
            relEntityData: {},
            _disableRel: 'rel' + direction + '_' + relId, //标记哪个关系不允许添加或选择
            allAttrEntityData: {}, //所有的属性
            isAbstract: ci.isAbstract,
            isChildren: !!rel.isChildren
          };
          newCiEntity['_elementList'] = this.getElementByCiId(ci);
          newCiEntity['_uniqueAttrList'] = ci.uniqueAttrIdList;
          newCiEntity['_description'] = this.descriptionConfig;
          if (!rel.isChildren) {
            newCiEntity['relEntityData']['rel' + direction + '_' + relId] = {
              valueList: [
                {
                  ciEntityUuid: currentCiEntity.uuid,
                  ciEntityName: currentCiEntity.ciLabel,
                  ciId: ciId,
                  type: 'from'
                }
              ]
            };
          }
          this.initValue(newCiEntity, currentCiEntity, rel);
          this.ciData = newCiEntity;
          this.ciEntityQueue.push(newCiEntity);
          if (!rel.isChildren) {
            this.updateCurrentFormItemList(rel);
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    removeNewCiEntity(item) {
      if (item._relId) { //关系删除
        const relentity = item;
        if (relentity.ciEntityUuid) {
          this.$delete(this.saveCiEntityMap, relentity.ciEntityUuid);
        }
      }
    },
    back() {
      this.isInherit = false;
      const cientity = this.ciEntityQueue.pop();
      if (cientity._isnew) {
        this.$set(this.saveCiEntityMap, cientity.uuid, this.tmpCiEntityData);
      }
      this.ciData = this.ciEntityQueue[this.ciEntityQueue.length - 1];
      this.tmpCiEntityData = null;
      this.updateCurrentFormItemList();
    },
    cancelNewCiEntity() {
      if (this.ciEntityQueue && this.ciEntityQueue.length > 1) {
        this.back();
      } else {
        this.closeDialog();
      }
    },
    editNewCiEntity(rel) {
      let uuid = rel.ciEntityUuid;
      if (this.saveCiEntityMap[uuid]) {
        this.tmpCiEntityData = this.$utils.deepClone((this.saveCiEntityMap[uuid]));
        let index = -1;
        for (let i = 0; i < this.ciEntityQueue.length; i++) {
          if (this.ciEntityQueue[i].uuid == uuid) {
            index = i;
            break;
          }
        }
        if (index > -1) {
          this.ciEntityQueue = this.ciEntityQueue.slice(0, index + 1);
          this.updateCurrentFormItemList();
        } else {
          //需要通过接口获取数据回显
          this.addNewCiEntity(rel);
        }
      }
    },
    setConfig(val, attr) {
      this.$set(this.ciEntityQueue[this.ciEntityQueue.length - 1], attr, val);
    },
    setBatchDataSource(val, attr) {
      let ciEntity = this.ciEntityQueue[this.ciEntityQueue.length - 1];
      if (ciEntity) {
        if (!ciEntity.batchDataSource) {
          this.$set(ciEntity, 'batchDataSource', {});
        }
        this.$set(ciEntity.batchDataSource, attr, val);
        if (attr === 'type') {
          this.$set(ciEntity.batchDataSource, 'attributeUuid', '');
          this.$set(ciEntity.batchDataSource, 'filterList', []);
          Object.keys(ciEntity.allAttrEntityData).forEach(key => {
            //改变遍历对象时，需要清空属性中与之不匹配的mappingMode
            if (!val || (val === 'formSubassemblyComponent' && ciEntity.allAttrEntityData[key].mappingMode === 'formTableComponent') || (val === 'formTableComponent' && ciEntity.allAttrEntityData[key].mappingMode === 'formSubassemblyComponent')) {
              this.$set(ciEntity.allAttrEntityData[key], 'mappingMode', '');
              this.$set(ciEntity.allAttrEntityData[key], 'valueList', []);
              this.$set(ciEntity.allAttrEntityData[key], 'filterList', []);
            }
          });
        }
        if (attr === 'attributeUuid') {
          this.$set(ciEntity.batchDataSource, 'filterList', []);
          Object.keys(ciEntity.allAttrEntityData).forEach(key => {
            if (ciEntity.allAttrEntityData[key].mappingMode === 'formTableComponent' || ciEntity.allAttrEntityData[key].mappingMode === 'formSubassemblyComponent') {
              this.$set(ciEntity.allAttrEntityData[key], 'valueList', []);
              this.$set(ciEntity.allAttrEntityData[key], 'filterList', []);
            }
          });
        }
        this.$set(this.ciData, 'batchDataSource', ciEntity.batchDataSource);
      }
    },
    changePolicy(val) {
      let ciEntity = this.ciEntityQueue[this.ciEntityQueue.length - 1];
      if (ciEntity) {
        this.$set(ciEntity, 'batchDataSource', {});
        this.$set(ciEntity, 'createPolicy', val);
        this.$set(this.ciData, 'batchDataSource', {});
        if (val === 'batch') {
          //继承父级的遍历对象类型
          if (this.preCiEntity && this.preCiEntity.batchDataSource && this.preCiEntity.batchDataSource.type && this.preCiEntity.batchDataSource.attributeUuid) {
            this.$set(this.ciData.batchDataSource, 'type', this.preCiEntity.batchDataSource.type);
          }
        }
        Object.keys(ciEntity.allAttrEntityData).forEach(key => {
          if (val === 'batch' && ciEntity.allAttrEntityData[key].mappingMode === 'formTableComponent') {
            this.$set(ciEntity.allAttrEntityData[key], 'valueList', []);
            this.$set(ciEntity.allAttrEntityData[key], 'filterList', []);
          }
        });
      }
    },
    valid() {
      let isValid = true;
      if (this.$refs.ciConfig && !this.$refs.ciConfig.valid()) {
        isValid = false;
      }
      if (this.$refs.batchDataSourceType && !this.$refs.batchDataSourceType.valid()) {
        isValid = false;
      }
      if (this.$refs.batchDataSourceAttr && !this.$refs.batchDataSourceAttr.valid()) {
        isValid = false;
      }
      if (this.$refs.filterList && !this.$refs.filterList.valid()) {
        isValid = false;
      }
      if (this.$refs.cmdbsyncEdit && !this.$refs.cmdbsyncEdit.valid()) {
        isValid = false;
      }
      return isValid; 
    },
    saveNewCiEntity() {
      if (!this.valid()) {
        return false; 
      }
      this.isInherit = false;
      //队列只剩一个配置项时才写入数据库
      if (this.ciEntityQueue.length > 1) {
        const cientity = this.ciEntityQueue.pop();
        //获取当前配置项数据，将临时关系加入当前配置项，如果是属性，则加入属性信息
        const currentCiEntity = this.currentCiEntity;
        if (!this.saveCiEntityMap[cientity.uuid]) {
          if (cientity['_relId']) {
            const newRelEntity = {
              _relId: cientity['_relId'],
              ciEntityUuid: cientity.uuid,
              ciEntityName: cientity.ciLabel,
              ciId: cientity.ciId,
              type: 'new'
            };
            if (!currentCiEntity['relEntityData']) {
              currentCiEntity['relEntityData'] = {};
            }
            if (!currentCiEntity['relEntityData']['rel' + cientity._direction + '_' + cientity._relId]) {
              currentCiEntity['relEntityData']['rel' + cientity._direction + '_' + cientity._relId] = { valueList: [] };
            }
            currentCiEntity['relEntityData']['rel' + cientity._direction + '_' + cientity._relId]['valueList'].push(newRelEntity);
          } else if (this.currentCiEntity.children) {
            currentCiEntity.children.push({
              ciEntityUuid: cientity.uuid,
              ciEntityName: cientity.ciLabel,
              ciId: cientity.ciId
            });
          }
        }
        //标记为已保存的新配置项，用于点击“取消”后判断是否需要删除数据
        cientity._isnew = true;
        this.saveCiEntityMap[cientity.uuid] = cientity;
        this.ciData = this.ciEntityQueue[this.ciEntityQueue.length - 1];
        this.updateCurrentFormItemList();
        this.updateSubCiData(cientity);
      } else if (this.ciEntityQueue.length == 1) {
        const cientity = this.ciEntityQueue[0];
        this.saveCiEntityMap[cientity.uuid] = cientity;
        const ciEntityList = [];
        for (let uuid in this.saveCiEntityMap) {
          ciEntityList.push(this.saveCiEntityMap[uuid]);
        }
        return ciEntityList;
      }
    },
    save() {
      let data = {};
      let configList = [];
      let list = this.saveNewCiEntity();
      list.forEach(item => {
        let config = {
          uuid: item.uuid,
          ciIcon: item.ciIcon,
          ciId: item.ciId,
          ciLabel: item.ciLabel,
          ciName: item.ciName,
          editMode: item.editMode,
          createPolicy: item.createPolicy,
          batchDataSource: item.batchDataSource || {},
          mappingList: []
        };
        if (item.hasOwnProperty('isStart')) {
          config.isStart = item.isStart;
          //抽象模型的子模型
          if (item.hasOwnProperty('children')) {
            config.children = item.children;
          }
        }
        if (item.hasOwnProperty('action')) {
          config.action = item.action;
        }
        if (item.hasOwnProperty('allAttrEntityData')) {
          if (!this.$utils.isEmpty(item.allAttrEntityData)) {
            Object.keys(item.allAttrEntityData).forEach(key => {
              if (!this.$utils.isEmpty(item.allAttrEntityData[key].mappingMode) && !this.$utils.isEmpty(item.allAttrEntityData[key].valueList)) {
                let objectData = {
                  key: key,
                  mappingMode: item.allAttrEntityData[key].mappingMode,
                  valueList: item.allAttrEntityData[key].valueList 
                };
                if (item.allAttrEntityData[key].hasOwnProperty('filterList')) {
                  objectData.filterList = item.allAttrEntityData[key].filterList;
                }
                config.mappingList.push(objectData);
              }
            });
          }
          if (!this.$utils.isEmpty(item.relEntityData)) {
            Object.keys(item.relEntityData).forEach(key => {
              if (!this.$utils.isEmpty(item.relEntityData[key].valueList)) {
                config.mappingList.push({
                  key: key,
                  mappingMode: 'new',
                  valueList: item.relEntityData[key].valueList
                });
              }
            });
          }
        } else {
          config.mappingList = item.mappingList || [];
        }
        configList.push(config);
      });
      this.$set(data, 'configList', configList);
      return data;
    },
    getFormTableComponent() { //获取表单table组件
      let dataList = [];
      if (this.currentCiEntity) {
        if (this.currentCiEntity.batchDataSource) {
          if (this.currentCiEntity.batchDataSource.type === 'formTableComponent') {
            if (!this.isInherit && this.preCiEntity && this.preCiEntity.batchDataSource && this.preCiEntity.batchDataSource.attributeUuid) {
              let findTable = this.allFormitemList.find(item => item.uuid === this.preCiEntity.batchDataSource.attributeUuid);
              if (findTable && findTable.config && findTable.config.dataConfig) {
                findTable.config.dataConfig.forEach(d => {
                  if (d.handler === 'formtable') {
                    dataList.push({
                      label: d.label,
                      uuid: d.uuid
                    });
                  }
                });
              }
            } else {
            //table组件（表格输入组件、表单选择组件）
              dataList = this.currentFormItemList.filter(item => {
                return item.handler === 'formtableselector' || item.handler === 'formtableinputer';
              });
            }
          } else if (this.currentCiEntity.batchDataSource.type === 'formSubassemblyComponent') {
          //表单子组件
            dataList = this.currentFormItemList.filter(item => {
              return item.handler === 'formsubassembly';
            });
          }
        }
      }
      return dataList;
    },
    getAttrList(batchDataSource) { //过滤条件，属性选择列表
      let dataList = [];
      let uuid = null;
      if (batchDataSource && batchDataSource.type && batchDataSource.attributeUuid) {
        uuid = batchDataSource.attributeUuid;
        if (batchDataSource.type === 'formTableComponent') { //表单table组件，属性列表
          let findTable = this.allFormitemList.find(item => item.uuid === uuid);
          if (!findTable) {
            if (this.preCiEntity && this.preCiEntity.batchDataSource && this.preCiEntity.batchDataSource.type === 'formTableComponent') {
              let preTable = this.allFormitemList.find(item => item.uuid === this.preCiEntity.batchDataSource.attributeUuid);
              if (preTable) {
                findTable = preTable.config.dataConfig.find(item => item.uuid === uuid);
              }
            }
          }
          if (findTable && findTable.config && findTable.config.dataConfig) {
            findTable.config.dataConfig.forEach(d => {
              if (d.handler !== 'formtable') {
                dataList.push({
                  text: d.label,
                  value: d.uuid
                });
              }
            });
          }
        } else if (batchDataSource.type === 'formSubassemblyComponent') { //子表单组件列表
          let find = this.currentFormItemList.find(item => item.uuid === uuid);
          if (find && find.formData && find.formData.formConfig) {
            find.formData.formConfig.tableList.forEach(item => {
              if (!this.$utils.isEmpty(item.component)) {
                if (item.component.hasValue) {
                  if (item.component.handler !== 'formsubassembly' && item.component.handler !== 'formtableselector' && item.component.handler !== 'formtableinputer') {
                    dataList.push({
                      text: item.component.label,
                      value: item.component.uuid
                    });
                  }
                } else if ((item.component.handler === 'formtab' || item.component.handler === 'formcollapse') && !this.$utils.isEmpty(item.component.component)) {
                  item.component.component.forEach(c => {
                    dataList.push({
                      text: c.label,
                      value: c.uuid
                    });
                  });
                }
              }
            });
          }
        }
      }
      return dataList;
    },
    getFormComponent(tableList) { //当前层子表单普通组件
      let list = [];
      tableList.forEach(item => {
        if (!this.$utils.isEmpty(item.component)) {
          if (item.component.hasValue) {
            list.push(item.component);
          } else if (item.component.handler === 'formtab' || item.component.handler === 'formcollapse') {
            if (!this.$utils.isEmpty(item.component.component)) {
              list.push(...item.component.component);
            }
          }
        }
      });
      return list;
    },
    updateCurrentFormItemList() { //如果上层模型为多条数据，且遍历对象是子表单组件，需要更新当前表单组件列表
      let uuidList = [];
      if (this.ciEntityQueue.length > 1) {
        for (let i = this.ciEntityQueue.length - 2; i >= 0; i--) {
          if (this.ciEntityQueue[i].batchDataSource &&
          this.ciEntityQueue[i].batchDataSource.type === 'formSubassemblyComponent' &&
          this.ciEntityQueue[i].batchDataSource.attributeUuid) {
            uuidList.unshift(this.ciEntityQueue[i].batchDataSource.attributeUuid);
          } else {
            break;
          }
        }
      }
      if (!this.$utils.isEmpty(this.preCiEntity) && uuidList.length > 0) {
        this.getSubformComponent(this.allFormitemList, this.preCiEntity.batchDataSource.attributeUuid);
      } else {
        this.currentFormItemList = this.$utils.deepClone(this.allFormitemList);
      }
    },
    getSubformComponent(list, uuid) { //获取子表单组件列表
      for (let i = 0; i < list.length; i++) {
        if (list[i].uuid === uuid) {
          this.currentFormItemList = this.getFormComponent(list[i].formData.formConfig.tableList);
          break;
        } else if (list[i].handler === 'formsubassembly') {
          let subformList = this.getFormComponent(list[i].formData.formConfig.tableList);
          this.getSubformComponent(subformList, uuid);
        }
      }
    },
    getTableAttrList() { //过滤对象为表格组件时，属性映射可选的表格属性
      let list = [];
      if (this.currentCiEntity && 
      this.currentCiEntity.batchDataSource && 
      this.currentCiEntity.batchDataSource.type === 'formTableComponent' && 
      this.currentCiEntity.batchDataSource.attributeUuid) {
        let uuidList = [];
        for (let i = this.ciEntityQueue.length - 1; i >= 0; i--) {
          if (this.ciEntityQueue[i].batchDataSource && this.ciEntityQueue[i].batchDataSource.attributeUuid) {
            uuidList.unshift(this.ciEntityQueue[i].batchDataSource.attributeUuid);
          } else {
            break;
          }
        }
        if (uuidList.length > 0) {
          let findItem = this.allFormitemList.find(item => item.uuid === uuidList[0]);
          if (findItem && findItem.config.dataConfig) {
            list = this.getTreeAttrList(findItem.config.dataConfig, uuidList, 'formTableComponent');
          }
        }
      }
      return list;
    },
    getTreeSubFormComponent() { //过滤对象为子表单, 属性映射可选的子表单组件
      let list = [];
      if (this.currentCiEntity && 
      this.currentCiEntity.batchDataSource && 
      this.currentCiEntity.batchDataSource.type === 'formSubassemblyComponent' && 
      this.currentCiEntity.batchDataSource.attributeUuid) {
        let subformUuidList = [];
        for (let i = this.ciEntityQueue.length - 1; i >= 0; i--) {
          if (this.ciEntityQueue[i].batchDataSource && this.ciEntityQueue[i].batchDataSource.attributeUuid) {
            subformUuidList.unshift(this.ciEntityQueue[i].batchDataSource.attributeUuid);
          } else {
            break;
          }
        }
        if (subformUuidList.length > 0) {
          let findItem = this.allFormitemList.find(item => item.uuid === subformUuidList[0]);
          if (findItem) {
            let formComponentList = this.getFormComponent(findItem.formData.formConfig.tableList);
            list = this.getTreeAttrList(formComponentList, subformUuidList, 'formSubassemblyComponent');
          }
        }
      }
      return list;
    },
    getTreeAttrList(formItemList, uuidList, type) { //表单子组件和表格组件，拼接成级联下拉的格式
      let treeList = [];
      formItemList.forEach(f => {
        if (type === 'formSubassemblyComponent') {
          if (f.handler !== 'formtableselector' && f.handler !== 'formtableinputer' && f.handler !== 'formsubassembly') {
            treeList.push(
              {
                value: f['uuid'],
                label: f['label']
              }
            );
          } else if (uuidList.includes(f.uuid)) {
            let obj = {
              value: f['uuid'],
              label: f['label']
            };
            let currentComponentList = this.getFormComponent(f.formData.formConfig.tableList);
            let children = this.getTreeAttrList(currentComponentList, uuidList, type);
            this.$set(obj, 'children', children);
            treeList.push(obj);
          }
        } else if (type === 'formTableComponent') {
          if (f.handler !== 'formtable') {
            treeList.push(
              {
                value: f['uuid'],
                label: f['label']
              }
            );
          } else if (uuidList.includes(f.uuid)) {
            let obj = {
              value: f['uuid'],
              label: f['label']
            };
            let children = this.getTreeAttrList(f.config.dataConfig, uuidList, type);
            this.$set(obj, 'children', children);
            treeList.push(obj);
          }
        }
      });
      return treeList;
    },
    changeEditMode(val) {
      let ciEntity = this.ciEntityQueue[this.ciEntityQueue.length - 1];
      if (ciEntity) {
        this.$set(ciEntity, 'editMode', val);
      }
    },
    updateSubCiData(cientity) { 
      //抽象模型修改遍历对象的时候，子模型，映射到旧的遍历对象的哪些属性，全部清空
      if (!this.$utils.isEmpty(this.subCiUuidList)) {
        this.subCiUuidList.forEach(uuid => {
          if (this.saveCiEntityMap[uuid]) {
            this.$set(this.saveCiEntityMap[uuid], 'editMode', cientity.editMode);
            this.$set(this.saveCiEntityMap[uuid], 'action', cientity.action);
            if (cientity.createPolicy != this.saveCiEntityMap[uuid].createPolicy ||
            (!this.$utils.isEmpty(cientity.batchDataSource) && (cientity.batchDataSource.type != this.saveCiEntityMap[uuid].batchDataSource.type) || (cientity.batchDataSource.attributeUuid != this.saveCiEntityMap[uuid].batchDataSource.attributeUuid))
            ) {
              if (!this.$utils.isEmpty(this.saveCiEntityMap[uuid].allAttrEntityData)) {
                Object.keys(this.saveCiEntityMap[uuid].allAttrEntityData).forEach(key => {
                  let config = this.saveCiEntityMap[uuid].allAttrEntityData[key];
                  if (config.mappingMode === 'formTableComponent' || config.mappingMode === 'formSubassemblyComponent') {
                    this.$set(config, 'valueList', []);
                  }
                });
              } else if (!this.$utils.isEmpty(this.saveCiEntityMap[uuid].mappingList)) {
                let mappingList = this.saveCiEntityMap[uuid].mappingList.filter(item => {
                  return item.mappingMode !== 'formTableComponent' && item.mappingMode !== 'formSubassemblyComponent';
                });
                this.$set(this.saveCiEntityMap[uuid], 'mappingList', mappingList);
              }
            }
            this.$set(this.saveCiEntityMap[uuid], 'createPolicy', cientity.createPolicy);
            this.$set(this.saveCiEntityMap[uuid], 'batchDataSource', cientity.batchDataSource);
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    currentCiEntity() {
      return this.ciEntityQueue[this.ciEntityQueue.length - 1];
    },
    preCiEntity() {
      if (this.ciEntityQueue && this.ciEntityQueue.length > 1) {
        return this.ciEntityQueue[this.ciEntityQueue.length - 2];
      }
      return {};
    },
    allFormitemList() { //表单组件
      return store.allFormitemList;
    },
    isDisabledType() {
      let isDisabled = false;
      if (this.preCiEntity && this.preCiEntity.batchDataSource && this.preCiEntity.batchDataSource.type && this.preCiEntity.batchDataSource.attributeUuid) {
        isDisabled = true;
      }
      return isDisabled;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.cmdbsync-dialog {
  .cmdbsync-main {
    &:hover {
      .action-btn {
        opacity: 1;
      }
    }
    .action-btn {
      opacity: 0;
    }
    .title {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
    }
    .cmdbsync-content {
      border-top: 1px solid;
    }
  }
}
</style>
