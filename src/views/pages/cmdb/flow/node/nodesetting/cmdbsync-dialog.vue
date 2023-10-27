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
            <div>起始模型</div>
            <div class="action-btn">
              <span class="text-tip-active" :class="isShow ? 'tsfont-down' : 'tsfont-up'" @click="isShow=!isShow"></span>
            </div>
          </div>
          <div v-show="isShow" class="cmdbsync-content border-color padding">
            <Loading :loadingShow="loadingShow" type="fix"></Loading>
            <div class="pl-lg">
              <TsFormItem label="配置模型" labelPosition="left">
                <TsFormSelect
                  v-model="ciData.ciId"
                  v-bind="ciConfig"
                  @on-change="changeCiId"
                ></TsFormSelect>
              </TsFormItem>
              <div v-if="ciData.ciId">
                <TsFormItem label="配置项数量" labelPosition="left">
                  <TsFormRadio
                    v-model="ciData.createPolicy"
                    :dataList="createPolicyDataList"
                  ></TsFormRadio>
                </TsFormItem>
                <TsFormItem label="属性映射" labelPosition="top">
                  <div class="pt-sm">
                    <CmdbsyncEdit
                      v-if="!loadingShow"
                      ref="cmdbsyncEdit"
                      :allFormitemList="allFormitemList"
                      :ciEntityQueue="ciEntityQueue"
                      @new="addNewCiEntity"
                      @edit="editNewCiEntity"
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
    CmdbsyncEdit: resolve => require(['./cmdbsync-edit.vue'], resolve)
  },
  props: {
    configList: Array
  },
  data() {
    return {
      loadingShow: false,
      ciData: { 
        ciId: null,
        ciName: '',
        createPolicy: 'single', 
        attrEntityData: {}, 
        relEntityData: {}, 
        globalAttrEntityData: {} 
      },
      isShow: true,
      ciConfig: {
        url: 'api/rest/cmdb/ci/list',
        search: true,
        params: {
          isAbstract: 0,
          isVirtual: 0
        },
        transfer: true
      },
      createPolicyDataList: [
        {
          value: 'single',
          text: '添加一条数据'
        },
        {
          value: 'batch',
          text: '添加多条数据'
        }
      ],
      ciEntityQueue: [], //记录配置项添加队列
      tmpCiEntityData: {}, //临时数据，用于取消修改时还原
      saveCiEntityMap: {} //最后需要保存的配置项列表
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
      if (!this.$utils.isEmpty(this.configList)) {
        this.ciData = this.configList[0];
        this.getCiEntityById();
      }
    },
    okDialog() {
      let data = this.save();
      this.$emit('close', data);
    },
    closeDialog() {
      this.$emit('close');
    },
    changeCiId(val, item) {
      this.saveCiEntityMap = {};
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
              uuid: this.$utils.setUuid(),
              ciId: this.ciData.ciId,
              ciName: ci.name,
              ciLabel: ci.label,
              ciIcon: ci.icon,
              createPolicy: 'single',
              attrEntityData: {},
              relEntityData: {},
              globalAttrEntityData: {},
              mappingList: []
            };
            cientity['_elementList'] = await this.getElementByCiId(this.ciData.ciId);
            cientity['_uniqueAttrList'] = await this.getCiUniqueByCiId(this.ciData.ciId);
            cientity['_description'] = { type: 'description', label: this.$t('term.cmdb.changememo'), elementList: [
              {
                type: 'des',
                element: {
                  label: this.$t('term.cmdb.changememo'),
                  type: 'textarea',
                  maxlength: 500
                }
              }
            ], isShow: true };
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
        const ciId = rel._ciId;
        const relId = rel.id;
        const direction = rel.direction == 'from' ? 'to' : 'from'; //目标关系需要取反
        this.$api.cmdb.ci.getCiById(ciId).then(async res => {
          if (res.Return) {
            const ci = res.Return;
            //获取当前配置项数据
            const currentCiEntity = this.ciEntityQueue[this.ciEntityQueue.length - 1];
            const newCiEntity = {
              uuid: this.$utils.setUuid(),
              _relId: relId, //记录来自哪个关系，自动填上配置项
              _direction: rel.direction, //记录关系方向
              ciId: ciId,
              rootCiId: this.propRootCiId,
              ciName: ci.name,
              ciLabel: ci.label,
              ciIcon: ci.icon,
              attrEntityData: {},
              relEntityData: {},
              globalAttrEntityData: {},
              _disableRel: 'rel' + direction + '_' + relId //标记哪个关系不允许添加或选择
            };
            newCiEntity['_elementList'] = await this.getElementByCiId(ciId);
            newCiEntity['_uniqueAttrList'] = await this.getCiUniqueByCiId(ciId);
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
            newCiEntity['_description'] = { type: 'description', label: this.$t('term.cmdb.changememo'), elementList: [
              {
                type: 'des',
                element: {
                  label: this.$t('term.cmdb.changememo'),
                  type: 'textarea',
                  maxlength: 500
                }
              }
            ], isShow: true };
            this.ciEntityQueue.push(newCiEntity);
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      } else if (type === 'attr') {
        const attr = item;
        const ciId = attr.targetCiId;
        const attrId = attr.id;
        const attrType = attr.type;
        const attrConfig = attr.config;
        if (ciId) {
          this.$api.cmdb.ci.getCiById(ciId).then(async res => {
            if (res.Return) {
              const ci = res.Return;
              //获取当前配置项数据
              const newCiEntity = {
                uuid: this.$utils.setUuid(),
                _attrId: attrId, //记录来自哪个属性，自动填上配置项
                _attrType: attrType,
                _attrConfig: attrConfig,
                rootCiId: this.propRootCiId,
                name: this.$t('term.cmdb.newcientity'),
                ciId: ciId,
                ciName: ci.name,
                ciLabel: ci.label,
                ciIcon: ci.icon,
                attrEntityData: {},
                relEntityData: {},
                globalAttrEntityData: {}
              };
              newCiEntity['_elementList'] = await this.getElementByCiId(ciId);
              newCiEntity['_uniqueAttrList'] = await this.getCiUniqueByCiId(ciId);
              newCiEntity['_description'] = { type: 'description', label: this.$t('term.cmdb.changememo'), elementList: [
                {
                  type: 'des',
                  element: {
                    label: this.$t('term.cmdb.changememo'),
                    type: 'textarea',
                    maxlength: 500
                  }
                }
              ], isShow: true };
              this.ciEntityQueue.push(newCiEntity);
            }
          }).finally(() => {
            this.loadingShow = false;
          });
        }
      }
    },
    back() {
      const cientity = this.ciEntityQueue.pop();
      if (cientity._isnew) {
        this.$set(this.saveCiEntityMap, cientity.uuid, this.tmpCiEntityData);
      }
      this.tmpCiEntityData = null;
    },
    cancelNewCiEntity() {
      if (this.ciEntityQueue && this.ciEntityQueue.length > 1) {
        this.back();
      } else {
        this.closeDialog();
      }
    },
    editNewCiEntity(uuid) {
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
          this.ciEntityQueue.push(this.saveCiEntityMap[uuid]);
        }
      }
    },
    saveNewCiEntity() {
      let isValid = true;
      if (this.$refs.cmdbsyncEdit) {
        isValid = this.$refs.cmdbsyncEdit.valid();
      }
      if (!isValid) {
        return; 
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
          } else if (cientity['_attrId']) {
            if (!currentCiEntity['attrEntityData']['attr_' + cientity._attrId]) {
              const tmp = {};
              tmp['attr_' + cientity._attrId] = {};
              Object.assign(currentCiEntity['attrEntityData'], tmp);
              Object.assign(currentCiEntity['attrEntityData']['attr_' + cientity._attrId], { type: cientity['_attrType'], config: cientity['_attrConfig'], valueList: [], actualValueList: [] });
            }
            //加上type=new，后台需要这个属性将uuid转换成id
            // currentCiEntity['attrEntityData']['attr_' + cientity._attrId]['valueList'].push(cientity);
            const pos = currentCiEntity['attrEntityData']['attr_' + cientity._attrId]['valueList'].length;
            this.$set(currentCiEntity['attrEntityData']['attr_' + cientity._attrId]['valueList'], pos, cientity);
          }
        } else {
          //更新临时数据时，需要更新attr的数据，因为显示字段可能有变化，而关系用不到可能发生变化的字段，所以暂时不用更新，将来可能要补充
          if (cientity['_attrId']) {
            if (!currentCiEntity['attrEntityData']['attr_' + cientity._attrId]) {
              const k = {};
              k['attr_' + cientity._attrId] = { type: cientity['_attrType'], config: cientity['_attrConfig'], valueList: [] };
              this.$set(currentCiEntity, 'attrEntityData', k);
            }
            for (let index = 0; index < currentCiEntity['attrEntityData']['attr_' + cientity._attrId]['valueList'].length; index++) {
              const d = currentCiEntity['attrEntityData']['attr_' + cientity._attrId]['valueList'][index];
              if (d.uuid && d.uuid === cientity.uuid) {
                this.$set(currentCiEntity['attrEntityData']['attr_' + cientity._attrId]['valueList'], index, cientity);
              }
            }
          }
        }
        //标记为已保存的新配置项，用于点击“取消”后判断是否需要删除数据
        cientity._isnew = true;
        this.saveCiEntityMap[cientity.uuid] = cientity;
      } else if (this.ciEntityQueue.length == 1) {
        const cientity = this.ciEntityQueue[0];
        this.saveCiEntityMap[cientity.uuid] = cientity;
        const ciEntityList = [];
        for (let uuid in this.saveCiEntityMap) {
          ciEntityList.push(this.saveCiEntityMap[uuid]);
        }
        return ciEntityList;
      }
      console.log(this.saveCiEntityMap);
    },
    save() {
      let data = {};
      let configList = this.saveNewCiEntity();
      console.log(configList, 'configList');
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
