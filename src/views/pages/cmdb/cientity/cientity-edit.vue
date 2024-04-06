<template>
  <div>
    <TsContain :hideHeader="hideHeader" :mode="mode" :hasContentPadding="padding">
      <template v-if="mode != 'dialog'" v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back('/ci-view/' + ciId)">{{ $getFromPage($t('term.cmdb.cientitylist')) }}</span>
      </template>
      <template v-slot:topLeft>
        <div v-if="ciEntityData && ciEntityData.id" class="action-group">
          <span class="title-name">{{ ciEntityData.name }}</span>
        </div>
      </template>
      <div slot="content" class="content border-color">
        <Loading
          v-if="isLoading"
          :text="$t('page.saving')"
          :loadingShow="isLoading"
          type="fix"
        ></Loading>
        <CiEntityEditCore
          v-if="!error"
          ref="CiEntityEditCore"
          :padding="padding"
          :ciEntityQueue="ciEntityQueue"
          :saveMode="saveMode"
          :mode="mode"
          :labelPosition="labelPosition"
          :hideButton="hideButton"
          @new="addNewCiEntity"
          @edit="editNewCiEntity"
          @cancel="cancelNewCiEntity"
          @back="back"
          @save="saveNewCiEntity"
          @remove="removeNewCiEntity"
        ></CiEntityEditCore>
        <div v-if="error" class="padding-lr">
          <Alert>
            <!-- 提示 -->
            <template slot="desc">{{ error }}</template>
          </Alert>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
import CiEntityEditCore from './cientity-edit-core.vue';
export default {
  name: '',
  components: {
    CiEntityEditCore
  },
  props: {
    padding: { type: Boolean, default: true }, //是否有白色底色和间距
    mode: { type: String, default: 'window' },
    propCiId: { type: Number }, //当前编辑的模型id
    propRootCiId: { type: Number }, //根模型id，用于ITSM回显时定位正确的模型位置
    propCiEntityData: { type: Object }, //表单编辑时通过此参数传入暂存的配置项数据
    propCiEntityId: { type: Number }, //资产修改时使用此参数传入配置项id，
    isForm: { type: Boolean, default: false }, // 解决表单兼容问题，显示所有字段
    isRequired: { type: Number }, //为true时只返回必填属性和关系，用于应用清单添加入口
    hideHeader: { type: Boolean, default: false },
    hideButton: {type: Boolean, default: false}, //隐藏按钮
    labelPosition: { type: String, default: 'left' },
    saveMode: { type: String, default: 'save' } //有save和emit两种模式，save直接写入数据库，emit调用外部emit函数
  },
  data() {
    return {
      ciId: null,
      isLoading: false,
      tmpCiEntityData: {}, //临时数据，用于取消修改时还原
      ciEntityId: null,
      ciEntityData: { attrEntityData: {}, relEntityData: {}, globalAttrEntityData: {} },
      activePanel: ['attr', 'rel'],
      isCiEntityChooseShow: false,
      targetCiId: null,
      currentRel: null,
      error: '', //异常
      ciEntityQueue: [], //记录配置项添加队列
      saveCiEntityMap: {} //最后需要保存的配置项列表
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.ciId = Math.floor(this.$route.params['ciId']) || this.propCiId;
    this.ciEntityId = (this.propCiEntityData && this.propCiEntityData.actionType == 'update' && this.propCiEntityData.id) || Math.floor(this.$route.params['id']) || this.propCiEntityId;
    this.getCiEntityById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toCiEntityList() {
      //加上isBack是为了让组件可以恢复历史数据
      this.$router.push({ path: '/ci-view/' + this.ciId + '?isBack=true' });
    },
    editNewCiEntity(uuid) {
      if (this.saveCiEntityMap[uuid]) {
        this.tmpCiEntityData = JSON.parse(JSON.stringify(this.saveCiEntityMap[uuid]));
        const ciEntityData = this.saveCiEntityMap[uuid];
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
    back() {
      const cientity = this.ciEntityQueue.pop();
      if (cientity._isnew) {
        this.$set(this.saveCiEntityMap, cientity.uuid, this.tmpCiEntityData);
      }
      this.tmpCiEntityData = null;
    },
    cancelNewCiEntity() {
      if (this.saveMode == 'save' || this.ciEntityQueue.length > 1) {
        this.back();
      } else {
        this.$emit('cancel');
      }
    },
    //关系或引用属性添加一个新的配置项
    addNewCiEntity(type, item) {
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
            this.ciEntityQueue.push(newCiEntity);
          }
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
              const currentCiEntity = this.currentCiEntity;
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
              this.ciEntityQueue.push(newCiEntity);
            }
          });
        }
      }
    },
    saveNewCiEntity(needCommit) {
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
        this.$set(this.saveCiEntityMap, cientity.uuid, cientity);
      } else if (this.ciEntityQueue.length == 1) {
        const cientity = this.ciEntityQueue[0];
        this.$set(this.saveCiEntityMap, cientity.uuid, cientity);
        const ciEntityList = [];
        for (let uuid in this.saveCiEntityMap) {
          ciEntityList.push(this.saveCiEntityMap[uuid]);
        }
        if (this.saveMode === 'save') {
          this.isLoading = true;
          this.$api.cmdb.cientity
            .batchSaveCiEntity({ ciEntityList: ciEntityList, needCommit: !!needCommit })
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.savesuccess'));
                if (this.$route.meta.isBack) {
                  history.go(-1);
                } else {
                  this.toCiEntityList();
                }
              }
            })
            .finally(() => {
              this.isLoading = false;
            });
        } else if (this.saveMode === 'emit') {
          this.$emit('save', ciEntityList);
        }
      }
    },
    addRelEntity(rel) {
      this.currentRel = rel;
      if (rel.direction == 'from') {
        //当前配置项在from位置
        this.targetCiId = rel.toCiId;
      } else if (rel.direction == 'to') {
        //当前配置项在to位置
        this.targetCiId = rel.fromCiId;
      }
      this.isCiEntityChooseShow = true;
    },
    //合并临时数据和从接口获取的数据，主要用在表单编辑场景
    mergePropCiEntityData(cientity) {
      if (this.propCiEntityData && !this.$utils.isEmptyObj(this.propCiEntityData)) {
        cientity.uuid = this.propCiEntityData.uuid; //恢复原来的uuid，否则每次保存都会添加一条
        cientity.actionType = this.propCiEntityData.actionType;
        cientity.editableAttrRelIdList = this.propCiEntityData.editableAttrRelIdList;
        cientity.maxAttrEntityCount = 9999999999; //必须定义，代表不限制引用属性数量，编辑时用这个覆盖从后台回来的maxAttrEntityCount
        cientity.maxRelEntityCount = 9999999999; //必须定义，代表不限制关系数量，编辑时用这个覆盖从后台回来的maxRelEntityCount
        if (!cientity.attrEntityData || Object.keys(cientity.attrEntityData).length === 0) {
          cientity.attrEntityData = this.propCiEntityData.attrEntityData || {};
        } else {
          if (this.propCiEntityData.attrEntityData) {
            for (let key in cientity.attrEntityData) {
              if (this.propCiEntityData.attrEntityData[key]) {
                cientity.attrEntityData[key].valueList = this.propCiEntityData.attrEntityData[key].valueList;
                cientity.attrEntityData[key].actualValueList = this.propCiEntityData.attrEntityData[key].actualValueList;
              }
            }
            for (let key in this.propCiEntityData.attrEntityData) {
              if (!cientity.attrEntityData[key]) {
                cientity.attrEntityData[key] = this.propCiEntityData.attrEntityData[key];
              }
            }
          }
        }
        if (!cientity.relEntityData || Object.keys(cientity.relEntityData).length === 0) {
          cientity.relEntityData = this.propCiEntityData.relEntityData || {};
        } else {
          if (this.propCiEntityData.relEntityData) {
            for (let key in cientity.relEntityData) {
              if (this.propCiEntityData.relEntityData[key]) {
                cientity.relEntityData[key].valueList = this.propCiEntityData.relEntityData[key].valueList;
              }
            }
            for (let key in this.propCiEntityData.relEntityData) {
              if (!cientity.relEntityData[key]) {
                cientity.relEntityData[key] = this.propCiEntityData.relEntityData[key];
              }
            }
          }
        }
        if (!cientity.globalAttrEntityData || Object.keys(cientity.globalAttrEntityData).length === 0) {
          cientity.globalAttrEntityData = this.propCiEntityData.globalAttrEntityData || {};
        } else {
          if (this.propCiEntityData.globalAttrEntityData) {
            for (let key in cientity.globalAttrEntityData) {
              if (this.propCiEntityData.globalAttrEntityData[key]) {
                cientity.globalAttrEntityData[key].valueList = this.propCiEntityData.globalAttrEntityData[key].valueList;
              }
            }
            for (let key in this.propCiEntityData.globalAttrEntityData) {
              if (!cientity.globalAttrEntityData[key]) {
                cientity.globalAttrEntityData[key] = this.propCiEntityData.globalAttrEntityData[key];
              }
            }
          }
        }
      }
    },
    async getCiEntityById() {
      this.error = '';
      if (this.ciEntityId) {
        this.$api.cmdb.cientity.getCiEntityById(this.ciId, this.ciEntityId, true, false, false).then(async res => {
          let cientity = res.Return;
          cientity['rootCiId'] = this.propRootCiId;
          //cientity['uuid'] = this.$utils.setUuid();//原来不知道为什么要更新uuid，如果uuid发生变化会导致表单临时数据匹配失败，先注释掉
          cientity['_elementList'] = await this.getElementByCiId(this.ciId);
          cientity['_uniqueAttrList'] = await this.getCiUniqueByCiId(this.ciId);
          this.mergePropCiEntityData(cientity);
          this.ciEntityQueue = [cientity];
        });
      } else {
        this.$api.cmdb.ci.getCiById(this.ciId, { needAction: true }).then(async res => {
          if (res.Return) {
            const ci = res.Return;
            if (ci.isVirtual == 0 && ci.isAbstract == 0) {
              const cientity = {
                uuid: this.$utils.setUuid(),
                ciId: this.ciId,
                rootCiId: this.propRootCiId,
                ciName: ci.name,
                ciLabel: ci.label,
                ciIcon: ci.icon,
                attrEntityData: {},
                relEntityData: {},
                globalAttrEntityData: {},
                authData: ci.authData,
                maxAttrEntityCount: 9999999999, //必须定义，代表不限制引用属性数量，否则会被ciEntityVo中的属性覆盖
                maxRelEntityCount: 9999999999 //必须定义，代表不限制关系数量，否则会被ciEntityVo中的属性覆盖
              };
              cientity['_elementList'] = await this.getElementByCiId(this.ciId);
              cientity['_uniqueAttrList'] = await this.getCiUniqueByCiId(this.ciId);
              this.mergePropCiEntityData(cientity);

              this.ciEntityQueue = [cientity];
            } else {
              if (ci.isVirtual == 1) {
                this.error = this.$t('message.cmdb.virtualmodel');
              } else if (ci.isAbstract == 1) {
                this.error = this.$t('message.cmdb.abstractmodel');
              }
            }
          }
        });
      }
    },
    setAttrData(attr, value) {
      if (!this.ciEntityData.attrEntityData) {
        this.ciEntityData.attrEntityData = {};
      }
      if (!this.ciEntityData.attrEntityData['attr_' + attr.id]) {
        this.ciEntityData.attrEntityData['attr_' + attr.id] = {};
      }
      this.ciEntityData.attrEntityData['attr_' + attr.id].valueList = value;
    },
    removeNewCiEntity(item) {
      if (item._relId) {
        const relentity = item;
        if (relentity.ciEntityUuid) {
          this.$delete(this.saveCiEntityMap, relentity.ciEntityUuid);
        }
      } else if (item._attrId) {
        const attrentity = item;
        if (attrentity.uuid) {
          this.$delete(this.saveCiEntityMap, attrentity.uuid);
        }
      }
    },
    async getGlobalAttrByCiId(ciId) {
      let globalAttrList;
      await this.$api.cmdb.ci
        .getGlobalAttrByCiId(ciId, {
          isActive: 1,
          allowEdit: 1,
          needAlias: 1
        })
        .then(res => {
          globalAttrList = res.Return;
        });
      return globalAttrList;
    },
    async getAttrByCiId(ciId) {
      if (ciId) {
        let attrList;
        // 兼容表单，所以要必须显示所有的字段
        await this.$api.cmdb.ci
          .getAttrByCiId(ciId, {
            allowEdit: 1,
            isRequired: this.isRequired,
            needAlias: 1
          })
          .then(res => {
            attrList = res.Return;
          });
        return attrList;
      }
    },
    async getRelByCiId(ciId) {
      if (ciId) {
        let relList;
        await this.$api.cmdb.ci
          .getRelByCiId(ciId, {
            needAction: true,
            allowEdit: 1,
            isRequired: this.isRequired,
            needAlias: 1
          })
          .then(res => {
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
      const globalAttrList = await this.getGlobalAttrByCiId(ciId);
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
    }
  },
  filter: {},
  computed: {
    currentCiEntity() {
      return this.ciEntityQueue[this.ciEntityQueue.length - 1];
    }
  },
  watch: {
    propCiId: {
      handler: function(val) {
        this.ciId = val;
        this.getCiEntityById();
      }
    },
    ciEntityQueue: {
      handler: function(val) {
        if (this.ciEntityQueue.length === 1) {
          const cientity = this.ciEntityQueue[0];
          this.$set(this.saveCiEntityMap, cientity.uuid, cientity);
        }
      },
      deep: true
    },
    saveCiEntityMap: {
      handler: function(val) {
        const ciEntityList = [];
        for (let uuid in this.saveCiEntityMap) {
          ciEntityList.push(this.saveCiEntityMap[uuid]);
        }
        this.$emit('change', ciEntityList);
      },
      deep: true
    }
  },
  beforeRouteEnter(to, from, next) {
    if (from && from.name) {
      if (from.name == 'cientity-view') {
        to.meta.isBack = true;
      }
    }
    next(true);
  }
};
</script>
<style lang="less" scoped>
/deep/.ivu-alert-with-desc {
  padding: 6px;
}
</style>
