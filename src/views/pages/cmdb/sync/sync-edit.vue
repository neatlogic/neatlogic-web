<template>
  <div>
    <TsDialog v-if="syncCiCollectionData" v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="syncCiCollectionData.id">{{ $t('dialog.title.edittarget',{'target':$t('page.config')}) }}：{{ syncCiCollectionData.ciLabel }}({{ syncCiCollectionData.ciName }})</div>
        <div v-if="!syncCiCollectionData.id">{{ $t('dialog.title.addtarget',{'target':$t('page.config')}) }}</div>
      </template>
      <template v-slot>
        <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
        <TsForm ref="ciForm" :item-list="formConfig">
          <template v-slot:attrMapping>
            <span v-if="matchAttrList.length == 0 && matchRelList.length == 0" class="mt-sm text-href" @click="autoMatch">{{ $t('term.cmdb.automatch') }}</span>
            <span v-else class="mt-sm text-href" @click="resetAutoMatch">{{ $t('term.cmdb.cancelautomatch') }}</span>
            <TsTable
              v-if="attrData"
              ref="tableAttr"
              :fixedHeader="false"
              v-bind="attrData"
              :showPager="false"
            >
              <template slot="attrId" slot-scope="{ row }">
                <div>
                  {{ row.attrLabel }}
                  <i v-if="row.isRequired" class="text-error">*</i>
                </div>
                <div style="font-size:12px" class="text-grey">
                  {{ row.attrName }}
                  <i v-if="row.targetCiId" class="tsfont-bind fz10" title="引用属性"></i>
                </div>
              </template>
              <template slot="field" slot-scope="{ row }">
                <TsFormSelect
                  :ref="'sltMapping' + row.attrId"
                  v-model="row.field"
                  :search="true"
                  :width="270"
                  :transfer="true"
                  :dataList="attrFieldList(row)"
                  :validateList="row.isRequired ? [{ name: 'required', message: ' ' }] : []"
                ></TsFormSelect>
              </template>
              <template slot="actionType" slot-scope="{ row }">
                <TsFormSwitch
                  v-model="row.action"
                  falseValue="replace"
                  trueValue="delete"
                ></TsFormSwitch>
              </template>
            </TsTable>
          </template>
          <template v-slot:relMapping>
            <TsTable
              v-if="relData"
              :fixedHeader="false"
              v-bind="relData"
              :showPager="false"
            >
              <template slot="relId" slot-scope="{ row }">
                <div>{{ row.relLabel }}</div>
                <div style="font-size:12px" class="text-grey">{{ row.relName }}</div>
              </template>
              <template slot="field" slot-scope="{ row }">
                <TsFormSelect
                  v-model="row.field"
                  :search="true"
                  :transfer="true"
                  :width="270"
                  :dataList="relFieldList"
                ></TsFormSelect>
              </template>
              <template slot="actionType" slot-scope="{ row }">
                <TsFormSelect
                  v-model="row.action"
                  :transfer="true"
                  :clearable="false"
                  :dataList="[
                    { value: 'insert', text: $t('page.append') },
                    { value: 'replace', text: $t('page.replace') },
                    { value: 'update', text: $t('page.update') }
                  ]"
                ></TsFormSelect>
              </template>
            </TsTable>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close(false)">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    id: { type: Number },
    collection: { type: String }
  },
  data() {
    const _this = this;
    return {
      isLoading: false,
      matchAttrList: [], //记录自动匹配的属性，清理匹配时根据这个列表清理
      matchRelList: [], //记录自动匹配的关系，清理匹配时根据这个列表清理
      currentCollection: this.collection || '',
      collectionList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      formConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        ciId: {
          type: 'select',
          label: '目标模型',
          url: 'api/rest/cmdb/ci/citype/search',
          validateList: ['required'],
          valueName: 'id',
          width: '100%',
          textName: 'label',
          childrenName: 'ciList',
          parentValueName: 'id',
          parentTextName: 'name',
          search: true,
          mode: 'group',
          transfer: true,
          onChange: value => {
            //重置match数据
            this.resetAutoMatch();
            
            this.$set(this.syncCiCollectionData, 'ciId', value);
          }
        },
        collectionName: {
          type: 'select',
          label: this.$t('term.cmdb.collection'),
          transfer: true,
          width: '100%',
          value: this.collection,
          valueName: 'name',
          textName: 'label',
          validateList: ['required'],
          onChange: value => {
            //重置match数据
            this.resetAutoMatch();
            
            this.$set(this.syncCiCollectionData, 'collectionName', value);
            this.currentCollection = value;
          }
        },
        parentKey: {
          type: 'select',
          label: this.$t('term.cmdb.parentattr'),
          transfer: true,
          width: '100%',
          onChange: value => {
            this.$set(this.syncCiCollectionData, 'parentKey', value);
          },
          desc: '如A模型中的属性或关系引用了B模型，则B模型是A的被引用模型。只有被引用模型才需要配置父属性，父属性需要和引用模型中引用属性或关系所映射的属性一致，否则会匹配不上数据。如果被引用模型和同一个集合只有一个映射配置，父属性可以忽略，否则则需要配置系统才能匹配到正确的映射关系'
        },
        collectMode: {
          type: 'radio',
          label: '采集模式',
          dataList: [
            { value: 'initiative', text: this.$t('term.cmdb.initiativecollect') },
            { value: 'passive', text: this.$t('term.cmdb.passivitycollect') }
          ],
          validateList: ['required'],
          width: '100%',
          onChange: value => {
            this.$set(this.syncCiCollectionData, 'collectMode', value);
          },
          desc: '主动采集：一个集合只能关联一个主动采集模型；被动采集：一个集合可以关联多个被动采集模型，在主动采集模型采集过程中，如果当前模型被主动采集模型引用了，当前模型才会写入数据。'
        },
        isAutoCommit: {
          type: 'radio',
          label: '自动提交',
          dataList: [
            { value: 1, text: '是' },
            { value: 0, text: '否' }
          ],
          validateList: ['required'],
          onChange: value => {
            this.$set(this.syncCiCollectionData, 'isAutoCommit', value);
          },
          desc: '不自动提交则只会保存为事务，等待人工提交'
        },
        matchMode: {
          type: 'radio',
          label: '匹配模式',
          width: '100%',
          dataList: [
            { value: 'key', text: '节点' },
            { value: 'level', text: '层级' }
          ],
          validateList: ['required'],
          onChange: value => {
            this.$set(this.syncCiCollectionData, 'matchMode', value);
          },
          desc: '匹配模式用于指定下层数据的匹配规则，“节点”：根据父节点名称进行数据匹配，一般用在关系匹配或目标模型有多个属性的引用属性匹配。"层级"：根据层级进行数据匹配，父节点可以是任意名称，一般用在目标模型只有一个属性的引用属性匹配。'
        },
        uniqueAttrIdList: {
          type: 'select',
          multiple: true,
          label: '唯一规则',
          dataList: [],
          desc: '选择多个属性作为配置项的唯一标识，用于采集数据时匹配正确的配置项，如果不选择，则使用模型的唯一规则作为唯一标识',
          onChange: value => {
            this.$set(this.syncCiCollectionData, 'uniqueAttrIdList', value);
            if (this.syncCiCollectionData.uniqueAttrIdList && this.syncCiCollectionData.uniqueAttrIdList.length > 0) {
              if (this.attrData.tbodyList && this.attrData.tbodyList.length > 0) {
                this.attrData.tbodyList.forEach(attr => {
                  if (this.syncCiCollectionData.uniqueAttrIdList.find(d => d === attr.attrId)) {
                    this.$set(attr, 'isRequired', true);
                  } else {
                    this.$set(attr, 'isRequired', false);
                  }
                });
              }
            } else {
              if (this.attrData.tbodyList && this.attrData.tbodyList.length > 0) {
                this.attrData.tbodyList.forEach(attr => {
                  if (attr.isCiUnique) {
                    this.$set(attr, 'isRequired', true);
                  } else {
                    this.$set(attr, 'isRequired', false);
                  }
                });
              }
            }
            this.$refs['tableAttr'].$forceUpdate();
          }
        },
        description: {
          type: 'textarea',
          label: '说明',
          maxlength: 500,
          onChange: value => {
            this.$set(this.syncCiCollectionData, 'description', value);
          }
        },
        attrMapping: {
          type: 'slot',
          label: '属性映射',
          isHidden: true
        },
        relMapping: {
          type: 'slot',
          label: '关系映射',
          isHidden: true
        }
      },
      attrData: {
        theadList: [
          { key: 'attrId', title: '属性', width: 200 },
          { key: 'field', title: '匹配字段' }
          //{ key: 'actionType', title: '空值覆盖', tooltip: '激活后如果采集数据的对应属性是空值，则会清空对应属性原有的数据', width: 120 }
        ],
        tbodyList: []
      },
      relData: {
        theadList: [
          { key: 'relId', title: '关系', width: 200 },
          { key: 'field', title: '匹配字段' },
          { key: 'actionType', title: '动作', tooltip: '追加：新关系追加到旧关系中；替换：不管新关系是否为空，都会用新关系替换掉旧关系；更新：如果新关系不为空，则用新关系替换掉旧关系', width: 120 }
        ],
        tbodyList: []
      },
      syncCiCollectionData: { collectionName: this.collection }
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
    async init() {
      this.isLoading = true;
      this.$nextTick(async() => {
        await this.getCollectionList();
        await this.getSyncCiCollectionById();
        this.isLoading = false;
        //初始化父属性下拉框数据
        this.$set(this.formConfig.parentKey, 'dataList', this.parentAttrFieldList);
      });
    },
    async getCollectionList() {
      await this.$api.cmdb.sync
        .getCollectionList({
          collectionName: this.collection,
          isNeedPhysicalType: 1
        })
        .then(res => {
          this.collectionList = res.Return;
          this.$set(this.formConfig.collectionName, 'dataList', this.collectionList);
        });
    },
    async getAttrByCiId(ciId) {
      let hasAttr = false;
      if (ciId) {
        await this.$api.cmdb.ci.getAttrByCiId(ciId).then(res => {
          this.attrList = res.Return;
          this.attrData.tbodyList = [];
          this.formConfig.uniqueAttrIdList.dataList = [];
          if (this.attrList && this.attrList.length > 0) {
            this.attrList.forEach(attr => {
              if (attr.type !== 'expression') {
                this.formConfig.uniqueAttrIdList.dataList.push({ value: attr.id, text: attr.label + '(' + attr.name + ')' });
              }
              if (attr.inputType === 'at' || attr.isCiUnique) {
                hasAttr = true;
                let attrObj = null;
                if (this.syncCiCollectionData.mappingList) {
                  attrObj = this.syncCiCollectionData.mappingList.find(a => attr.id == a.attrId);
                }
                if (!attrObj) {
                  attrObj = {
                    attrId: attr.id,
                    attrLabel: attr.label,
                    attrName: attr.name,
                    field: '',
                    targetCiId: attr.targetCiId,
                    isCiUnique: !!attr.isCiUnique,
                    action: 'replace'
                    //由于已经有自定义唯一规则，不需要再依赖模型的唯一规则
                    //isRequired: !!attr.isCiUnique
                  };
                } else {
                  attrObj.attrLabel = attr.label;
                  attrObj.attrName = attr.name;
                  attrObj.isCiUnique = !!attr.isCiUnique;
                  attrObj.targetCiId = attr.targetCiId;
                }
                if (!this.syncCiCollectionData.uniqueAttrIdList || this.syncCiCollectionData.uniqueAttrIdList.length <= 0) {
                  attrObj.isRequired = !!attr.isCiUnique;
                } else {
                  if (this.syncCiCollectionData.uniqueAttrIdList.find(d => d == attr.id)) {
                    attrObj.isRequired = true;
                  } else {
                    attrObj.isRequired = false;
                  }
                }
                this.attrData.tbodyList.push(attrObj);
              }
            });
          }
        });
      }
      if (hasAttr) {
        this.formConfig.attrMapping.isHidden = false;
      } else {
        this.formConfig.attrMapping.isHidden = true;
      }
    },
    async getRelByCiId(ciId) {
      let hasRel = false;
      if (ciId) {
        await this.$api.cmdb.ci.getRelByCiId(ciId).then(res => {
          this.relList = res.Return;
          this.relData.tbodyList = [];
          if (this.relList && this.relList.length > 0) {
            this.relList.forEach(rel => {
              if (rel.inputType == 'at') {
                hasRel = true;
                let relObj = null;
                if (this.syncCiCollectionData.mappingList) {
                  relObj = this.syncCiCollectionData.mappingList.find(m => rel.id == m.relId && rel.direction == m.direction);
                }
                if (!relObj) {
                  relObj = {
                    relId: rel.id,
                    direction: rel.direction,
                    relLabel: rel.direction == 'from' ? rel.toLabel : rel.fromLabel,
                    relName: rel.direction == 'from' ? rel.toName : rel.fromName,
                    field: '',
                    action: 'insert'
                  };
                } else {
                  relObj.relLabel = rel.direction == 'from' ? rel.toLabel : rel.fromLabel;
                  relObj.relName = rel.direction == 'from' ? rel.toName : rel.fromName;
                }
                this.relData.tbodyList.push(relObj);
              }
            });
          }
        });
      }
      if (hasRel) {
        this.formConfig.relMapping.isHidden = false;
      } else {
        this.formConfig.relMapping.isHidden = true;
      }
    },
    async getSyncCiCollectionById() {
      if (this.id) {
        await this.$api.cmdb.sync.getSyncCiCollectionById(this.id).then(res => {
          this.syncCiCollectionData = res.Return;
          for (let k in this.syncCiCollectionData) {
            if (this.formConfig[k]) {
              this.formConfig[k].value = this.syncCiCollectionData[k];
              //模型id和集合不能修改，不然映射全部重新配置可能会有问题
              if (k == 'ciId' || k == 'collectionName') {
                this.formConfig[k].disabled = true;
                if (k == 'collectionName') {
                  this.currentCollection = this.syncCiCollectionData[k];
                }
              }
            }
          }
        });
      }
    },
    autoMatch() {
      this.attrData.tbodyList.forEach((attr) => {
        const matchAttrField = this.attrFieldList(attr).find(d => d.value.toLowerCase() === attr.attrName.toLowerCase());
        if (matchAttrField && !attr.field) {
          this.$set(attr, 'field', matchAttrField.value);
          this.matchAttrList.push(attr.attrName);
        }
      });
     
      this.relData.tbodyList.forEach((rel) => {
        const matchRelField = this.relFieldList.find(d => d.value.toLowerCase() === rel.relName.toLowerCase());
        if (matchRelField && !rel.field) {
          this.$set(rel, 'field', matchRelField.value);
          this.matchRelList.push(rel.relName);
        }
      });
    },
    resetAutoMatch() {
      this.matchAttrList.forEach(attrName => {
        const attr = this.attrData.tbodyList.find(d => d.attrName === attrName);
        if (attr) {
          this.$set(attr, 'field', '');
        }
      });
      this.matchAttrList = [];
      this.matchRelList.forEach(relName => {
        const rel = this.relData.tbodyList.find(d => d.relName === relName);
        if (rel) {
          this.$set(rel, 'field', '');
        }
      });
      this.matchRelList = [];
    },
    save() {
      const form = this.$refs['ciForm'];
      let isValid = true;
      this.attrData.tbodyList.forEach(element => {
        if (this.$refs['sltMapping' + element.attrId] && !this.$refs['sltMapping' + element.attrId].valid()) {
          isValid = false;
        }
      });
      if (form.valid() && isValid) {
        this.syncCiCollectionData.mappingList = [];
        if (this.attrData && this.attrData.tbodyList && this.attrData.tbodyList.length > 0) {
          this.syncCiCollectionData.mappingList = this.syncCiCollectionData.mappingList.concat(
            this.attrData.tbodyList.filter(attr => {
              return !!attr.field;
            })
          );
        }
        if (this.relData && this.relData.tbodyList && this.relData.tbodyList.length > 0) {
          this.syncCiCollectionData.mappingList = this.syncCiCollectionData.mappingList.concat(
            this.relData.tbodyList.filter(rel => {
              return !!rel.field;
            })
          );
        }
        this.$api.cmdb.sync.saveSyncCiCollection(this.syncCiCollectionData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    getAttrFieldList(fieldList, finalFieldList, parentList, onlyParentKey) {
      fieldList.forEach(f => {
        if (!f.subset && !onlyParentKey) {
          if (!parentList || parentList.length == 0) {
            finalFieldList.push({ text: f.name + '-' + f.desc + '(' + f.type + ')', value: f.name });
          } else {
            let ptext = '';
            let pname = '';
            parentList.forEach(d => {
              if (ptext) {
                ptext += '->';
                pname += '.';
              }
              ptext += d.desc;
              pname += d.name;
            });
            finalFieldList.push({ text: ptext + '->' + f.name + '-' + f.desc + '(' + f.type + ')', value: pname + '.' + f.name });
          }
        }
        if (f.subset) {
          if (!parentList || parentList.length == 0) {
            this.getAttrFieldList(f.subset, finalFieldList, [f], onlyParentKey);
          } else {
            this.getAttrFieldList(f.subset, finalFieldList, [...parentList, f], onlyParentKey);
          }
        }
      });
    },
    getRelFieldList(fieldList, finalFieldList, parentList) {
      if (parentList && parentList.length > 0) {
        let ptext = '';
        let pname = '';
        for (let i = 0; i < parentList.length; i++) {
          if (ptext) {
            ptext += '->';
            pname += '.';
          }
          pname += parentList[i].name;
          ptext += parentList[i].name + '-' + parentList[i].desc;
        }
        ptext += '(' + parentList[parentList.length - 1].type + ')';
        finalFieldList.push({ text: ptext, value: pname });
      }
      fieldList.forEach(f => {
        if (f.subset) {
          if (parentList && parentList.length > 0) {
            this.getRelFieldList(f.subset, finalFieldList, [...parentList, f]);
          } else {
            this.getRelFieldList(f.subset, finalFieldList, [f]);
          }
        }
      });
    }
  },
  filter: {},
  computed: {
    currentCiId() {
      return this.syncCiCollectionData.ciId;
    },
    attrFieldList() {
      return attr => {
        const fieldList = [];
        const collection = this.collectionList.find(c => c.name == this.currentCollection);
        if (collection && collection.fields) {
          this.getAttrFieldList(collection.fields, fieldList, null, false);
          if (attr.targetCiId) {
            this.getRelFieldList(collection.fields, fieldList, null);
          }
        }
        return fieldList;
      };
    },
    relFieldList() {
      const fieldList = [];
      const collection = this.collectionList.find(c => c.name == this.currentCollection);
      if (collection && collection.fields) {
        this.getRelFieldList(collection.fields, fieldList, null);
      }
      return fieldList;
    },
    parentAttrFieldList() {
      const fieldList = [];
      const collection = this.collectionList.find(c => c.name == this.currentCollection);
      if (collection && collection.fields) {
        this.getAttrFieldList(collection.fields, fieldList, null, true);
        this.getRelFieldList(collection.fields, fieldList, null);
      }
      return fieldList;
    }
  },
  watch: {
    currentCiId: {
      handler: function(val) {
        this.getAttrByCiId(val);
        this.getRelByCiId(val);
      },
      immediate: true
    },
    currentCollection: {
      handler: function(val) {
        this.$set(this.formConfig.parentKey, 'dataList', this.parentAttrFieldList);
      }
    }
  }
};
</script>
<style lang="less"></style>
