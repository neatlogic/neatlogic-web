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
                  @on-change="changeCiId"
                ></TsFormSelect>
              </TsFormItem>
              <div v-if="ciData.ciId">
                <TsFormItem :label="$t('term.cmdb.ciconfignumber')" labelPosition="left">
                  <TsFormRadio
                    v-model="ciData.createPolicy"
                    :dataList="ciEntityQueue.length <= 1?createPolicyDataList:createRelDataList"
                    @on-change="(val)=>{
                      changePolicy(val)
                    }"
                  ></TsFormRadio>
                </TsFormItem>
                <TsFormItem
                  v-if="ciEntityQueue.length > 1"
                  :label="$t('term.cmdb.relaction')"
                  labelPosition="left"
                  required
                >
                  <TsFormRadio
                    :dataList="actionDataList"
                    :value="ciData.action"
                    @on-change="(val)=>{
                      setConfig(val,'action')
                    }"
                  ></TsFormRadio>
                </TsFormItem>
                <template v-if="ciData.createPolicy==='batch'">
                  <TsFormItem v-if="ciData.createPolicy==='batch'" :label="$t('page.foreachtable')" labelPosition="left">
                    <TsFormSelect
                      ref="attributeUuid"
                      :value="ciData.batchDataSource && ciData.batchDataSource.attributeUuid"
                      :dataList="getFormTableComponent()"
                      textName="label"
                      valueName="uuid"
                      :validateList="validateList"
                      :firstSelect="false"
                      transfer
                      border="border"
                      @on-change="(val)=>{
                        setBatchDataSource(val,'attributeUuid')
                      }"
                    ></TsFormSelect>
                  </TsFormItem>
                  <TsFormItem v-if="ciData.createPolicy==='batch'" :label="$t('term.dashboard.datafilter')" labelPosition="left">
                    <FilterList
                      ref="attrHandler"
                      :defaultFilterList="ciData.batchDataSource && ciData.batchDataSource.filterList"
                      :dataList="getAttrList(ciData.batchDataSource)"
                      @setConfig="(val)=> setBatchDataSource(val,'filterList')"
                    ></FilterList>
                  </TsFormItem>
                </template>
                <TsFormItem :label="$t('term.cmdb.attrmapping')" labelPosition="top">
                  <div class="pt-sm">
                    <CmdbsyncEdit
                      v-if="!loadingShow"
                      ref="cmdbsyncEdit"
                      :allFormitemList="allFormitemList"
                      :ciEntityQueue="ciEntityQueue"
                      :ciData="ciData"
                      @new="addNewCiEntity"
                      @edit="editNewCiEntity"
                      @remove="removeNewCiEntity"
                    ></CmdbsyncEdit>
                  </div>
                </TsFormItem>
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
          isAbstract: 0,
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
      ], isShow: true }
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
      }
    },
    initValue(cientity) {
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
      this.$set(this.ciData, 'uuid', null);
      if (val) {
        this.getCiEntityById();
      }
    },
    getCiEntityById() {
      this.loadingShow = true;
      this.$api.cmdb.ci.getCiById(this.ciData.ciId, true).then(async res => {
        if (res.Return) {
          const ci = res.Return;
          if (ci.isVirtual == 0 && ci.isAbstract == 0) {
            const cientity = {
              isStart: 1,
              uuid: this.ciData.uuid || this.$utils.setUuid(),
              ciId: this.ciData.ciId,
              ciName: ci.name,
              ciLabel: ci.label,
              ciIcon: ci.icon,
              createPolicy: 'single',
              batchDataSource: {},
              relEntityData: {},
              allAttrEntityData: {}
            };
            cientity['_elementList'] = await this.getElementByCiId(this.ciData.ciId);
            cientity['_uniqueAttrList'] = await this.getCiUniqueByCiId(this.ciData.ciId);
            cientity['_description'] = this.descriptionConfig;
            this.initValue(cientity);
            this.ciEntityQueue = [cientity];
          } else {
            if (ci.isVirtual == 1) {
              this.error = this.$t('message.cmdb.virtualmodel');
            } else if (ci.isAbstract == 1) {
              this.error = this.$t('message.cmdb.abstractmodel');
            }
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    async getCiUniqueByCiId(ciId) {
      let uniqueList = [];
      await this.$api.cmdb.ci.getCiUniqueByCiId(ciId).then(res => {
        uniqueList = res.Return;
      });
      return uniqueList;
    },
    async getElementByCiId(ciId) {
      const attrList = await this.getAttrByCiId(ciId);
      const relList = await this.getRelByCiId(ciId);
      const globalAttrList = await this.getGlobalAttr();
      const ciViewList = await this.getCiViewByCiId(ciId);
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
    async getGlobalAttr() {
      let globalAttrList;
      await this.$api.cmdb.globalattr.searchGlobalAttr({isActive: 1}).then(res => {
        globalAttrList = res.Return.tbodyList;
      });
      return globalAttrList;
    },
    async getAttrByCiId(ciId) {
      if (ciId) {
        let attrList;
        let allowEdit = 1;
        await this.$api.cmdb.ci.getAttrByCiId(ciId, { allowEdit: allowEdit }).then(res => {
          attrList = res.Return;
        });
        return attrList;
      }
    },
    async getRelByCiId(ciId) {
      if (ciId) {
        let relList;
        await this.$api.cmdb.ci.getRelByCiId(ciId, true, null, 1).then(res => {
          relList = res.Return;
        });
        return relList;
      }
    },
    async getCiViewByCiId(ciId) {
      if (ciId) {
        let ciViewList;
        await this.$api.cmdb.ci.getCiViewByCiId(ciId).then(res => {
          ciViewList = res.Return;
        });
        return ciViewList;
      }
    },
    addNewCiEntity(type, item) {
      this.loadingShow = true;
      if (type === 'rel') {
        const rel = item;
        const ciId = rel.ciId;
        const relId = rel._relId;
        const direction = rel.direction == 'from' ? 'to' : 'from'; //目标关系需要取反
        const uuid = rel.ciEntityUuid || this.$utils.setUuid(); //新的配置项标识
        this.$api.cmdb.ci.getCiById(ciId).then(async res => {
          if (res.Return) {
            const ci = res.Return;
            //获取当前配置项数据
            const currentCiEntity = this.ciEntityQueue[this.ciEntityQueue.length - 1];
            const newCiEntity = {
              uuid: uuid,
              _relId: relId, //记录来自哪个关系，自动填上配置项
              _direction: rel.direction, //记录关系方向
              ciId: ciId,
              rootCiId: this.propRootCiId,
              ciName: ci.name,
              ciLabel: ci.label,
              ciIcon: ci.icon,
              createPolicy: 'single',
              batchDataSource: {},
              action: 'append',
              relEntityData: {},
              _disableRel: 'rel' + direction + '_' + relId, //标记哪个关系不允许添加或选择
              allAttrEntityData: {} //所有的属性
            };
            newCiEntity['_elementList'] = await this.getElementByCiId(ciId);
            newCiEntity['_uniqueAttrList'] = await this.getCiUniqueByCiId(ciId);
            newCiEntity['_description'] = this.descriptionConfig;
            newCiEntity['relEntityData']['rel' + direction + '_' + relId] = {
              valueList: [
                {
                  ciEntityUuid: currentCiEntity.uuid,
                  ciEntityName: this.$t('term.cmdb.fromcientity'),
                  ciId: ciId,
                  type: 'from'
                }
              ]
            };
            this.initValue(newCiEntity);
            this.ciData = newCiEntity;
            this.ciEntityQueue.push(newCiEntity);
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      } 
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
      const cientity = this.ciEntityQueue.pop();
      if (cientity._isnew) {
        this.$set(this.saveCiEntityMap, cientity.uuid, this.tmpCiEntityData);
      }
      this.ciData = this.ciEntityQueue[this.ciEntityQueue.length - 1];
      this.tmpCiEntityData = null;
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
        this.tmpCiEntityData = JSON.parse(JSON.stringify(this.saveCiEntityMap[uuid]));
        let index = -1;
        for (let i = 0; i < this.ciEntityQueue.length; i++) {
          if (this.ciEntityQueue[i].uuid == uuid) {
            index = i;
            break;
          }
        }
        if (index > -1) {
          this.ciEntityQueue = this.ciEntityQueue.slice(0, index + 1);
        } else {
          //需要通过接口获取数据回显
          this.addNewCiEntity('rel', rel);
        }
      }
    },
    valid() {
      let isValid = true;
      if (this.$refs.ciConfig && !this.$refs.ciConfig.valid()) {
        isValid = false;
      }
      if (isValid && this.$refs.cmdbsyncEdit) {
        isValid = this.$refs.cmdbsyncEdit.valid();
      }
      return isValid; 
    },
    saveNewCiEntity() {
      if (!this.valid()) {
        return false; 
      }
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
              ciEntityName: this.$t('term.cmdb.newcientity'),
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
          }
        }
        //标记为已保存的新配置项，用于点击“取消”后判断是否需要删除数据
        cientity._isnew = true;
        this.saveCiEntityMap[cientity.uuid] = cientity;
        this.ciData = this.ciEntityQueue[this.ciEntityQueue.length - 1];
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
        this.$set(this.ciData, 'batchDataSource', ciEntity.batchDataSource);
        if (attr === 'attributeUuid') {
          Object.keys(ciEntity.allAttrEntityData).forEach(key => {
            if (ciEntity.allAttrEntityData[key].mappingMode === 'formTableComponent') {
              if (val) {
                this.$set(ciEntity.allAttrEntityData[key], 'valueList', [val]);
              } else {
                this.$set(ciEntity.allAttrEntityData[key], 'valueList', []);
              }
              this.$set(ciEntity.allAttrEntityData[key], 'column', '');
              this.$set(ciEntity.allAttrEntityData[key], 'filterList', []);
            }
          });
        }
      }
    },
    getFormTableComponent() { //获取表单table组件
      let dataList = [];
      if (this.allFormitemList && this.allFormitemList.length > 0) {
        //table组件（表格数据组件、表单选择组件）
        dataList = this.allFormitemList.filter(item => {
          return item.handler === 'formtableselector' || item.handler === 'formtableinputer';
        });
      }
      return dataList;
    },
    getAttrList(batchDataSource) { //表单table组件，属性列表
      let dataList = [];
      let uuid = null;
      if (batchDataSource && batchDataSource.attributeUuid) {
        uuid = batchDataSource.attributeUuid;
        if (this.allFormitemList && this.allFormitemList.length > 0) {
          let find = this.allFormitemList.find(item => item.uuid === uuid);
          if (find && find.config && find.config.dataConfig) {
            find.config.dataConfig.forEach(d => {
              dataList.push({
                text: d.label,
                value: d.uuid
              });
            });
          }
        }
      }
      return dataList;
    },
    changePolicy(val) {
      let ciEntity = this.ciEntityQueue[this.ciEntityQueue.length - 1];
      if (ciEntity) {
        this.$set(ciEntity, 'batchDataSource', {});
        this.$set(ciEntity, 'createPolicy', val);
        this.$set(this.ciData, 'batchDataSource', {});
        Object.keys(ciEntity.allAttrEntityData).forEach(key => {
          if (val === 'batch' && ciEntity.allAttrEntityData[key].mappingMode === 'formTableComponent') {
            this.$set(ciEntity.allAttrEntityData[key], 'valueList', []);
            this.$set(ciEntity.allAttrEntityData[key], 'column', '');
            this.$set(ciEntity.allAttrEntityData[key], 'filterList', []);
          }
        });
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
          createPolicy: item.createPolicy,
          batchDataSource: item.batchDataSource || {},
          mappingList: []
        };
        if (item.hasOwnProperty('isStart')) {
          config.isStart = item.isStart;
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
                if (item.allAttrEntityData[key].hasOwnProperty('column')) {
                  objectData.column = item.allAttrEntityData[key].column;
                }
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
    }
  },
  filter: {},
  computed: {
    currentCiEntity() {
      return this.ciEntityQueue[this.ciEntityQueue.length - 1];
    },
    allFormitemList() { //表单组件
      return store.allFormitemList;
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
