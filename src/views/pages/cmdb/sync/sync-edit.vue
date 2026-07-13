<template>
  <div>
    <TsDialog v-if="syncCiCollectionData" v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="syncCiCollectionData.id">{{ $t('dialog.title.edittarget', { target: $t('page.config') }) }}：{{ syncCiCollectionData.ciLabel }}({{ syncCiCollectionData.ciName }})</div>
        <div v-if="!syncCiCollectionData.id">{{ $t('dialog.title.addtarget', { target: $t('page.config') }) }}</div>
      </template>
      <template v-slot>
        <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
        <TsForm ref="ciForm" :item-list="formConfig">
          <template v-slot:globalAttrMapping>
            <TsTable
              v-if="globalAttrData"
              ref="tableGlobalAttr"
              :fixedHeader="false"
              v-bind="globalAttrData"
              :showPager="false"
            >
              <template slot="attrId" slot-scope="{ row }">
                <div>
                  {{ row.globalAttrLabel }}
                </div>
                <div style="font-size: 12px" class="text-grey">
                  {{ row.globalAttrName }}
                </div>
              </template>
              <template slot="field" slot-scope="{ row }">
                <TsFormSelect
                  :ref="'sltMapping' + row.globalAttrId"
                  v-model="row.field"
                  :search="true"
                  :width="270"
                  :transfer="true"
                  :dataList="attrFieldList(row)"
                ></TsFormSelect>
              </template>
            </TsTable>
          </template>
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
                <div style="font-size: 12px" class="text-grey">
                  {{ row.attrName }}
                  <i v-if="row.targetCiId" class="tsfont-bind fz10" :title="$t('term.cmdb.invokeattr')"></i>
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
                <TsFormSelect
                  v-if="row.targetCiId"
                  v-model="row.action"
                  :transfer="true"
                  :clearable="false"
                  :dataList="[
                    { value: 'merge', text: $t('page.merge') },
                    { value: 'replace', text: $t('page.replace') }
                  ]"
                ></TsFormSelect>
                <div v-else></div>
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
                <div style="font-size: 12px" class="text-grey">{{ row.relName }}</div>
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
        <Button v-if="!isLoading" type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    id: { type: Number },
    collection: { type: String }
  },
  data() {
    const _this = this;
    return {
      isLoading: false,
      matchGlobalAttrList: [], ////记录自动匹配的全局属性，清理匹配时根据这个列表清理
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
          label: this.$t('term.cmdb.targetci'),
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
          desc: this.$t('term.cmdb.parentattrdesc')
        },
        collectMode: {
          type: 'radio',
          label: this.$t('term.cmdb.collectmode'),
          dataList: [
            { value: 'initiative', text: this.$t('term.cmdb.initiativecollect') },
            { value: 'passive', text: this.$t('term.cmdb.passivitycollect') }
          ],
          validateList: ['required'],
          width: '100%',
          onChange: value => {
            this.$set(this.syncCiCollectionData, 'collectMode', value);
          },
          desc: this.$t('term.cmdb.collectmodedesc')
        },
        isAutoCommit: {
          type: 'radio',
          label: this.$t('term.cmdb.autocommit'),
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ],
          //value: 1,
          validateList: ['required'],
          onChange: value => {
            this.$set(this.syncCiCollectionData, 'isAutoCommit', value);
          },
          desc: this.$t('term.cmdb.autocommitdesc')
        },
        matchMode: {
          type: 'radio',
          label: this.$t('term.cmdb.matchmode'),
          width: '100%',
          //value: 'key',
          dataList: [
            { value: 'key', text: this.$t('page.node') },
            { value: 'level', text: this.$t('term.cmdb.hierarchy') }
          ],
          validateList: ['required'],
          onChange: value => {
            this.$set(this.syncCiCollectionData, 'matchMode', value);
          },
          desc: this.$t('term.cmdb.matchmodedesc')
        },
        uniqueAttrIdList: {
          type: 'select',
          multiple: true,
          label: this.$t('term.cmdb.uniquerule'),
          dataList: [],
          desc: this.$t('term.cmdb.syncuniqueruledesc'),
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
        isAllowMultiple: {
          type: 'radio',
          label: this.$t('term.cmdb.multidatacompatible'),
          value: 0,
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ],
          validateList: ['required'],
          onChange: value => {
            this.$set(this.syncCiCollectionData, 'isAllowMultiple', value);
          },
          desc: this.$t('term.cmdb.multidatacompatibledesc')
        },
        description: {
          type: 'textarea',
          label: this.$t('page.explain'),
          maxlength: 500,
          onChange: value => {
            this.$set(this.syncCiCollectionData, 'description', value);
          }
        },
        globalAttrMapping: {
          type: 'slot',
          label: this.$t('term.cmdb.globalattrmapping'),
          isHidden: true
        },
        attrMapping: {
          type: 'slot',
          label: this.$t('term.cmdb.attrmapping'),
          isHidden: true
        },
        relMapping: {
          type: 'slot',
          label: this.$t('term.cmdb.relmapping'),
          isHidden: true
        }
      },
      globalAttrData: {
        theadList: [
          { key: 'attrId', title: this.$t('page.attribute'), width: 200 },
          { key: 'field', title: this.$t('term.cmdb.matchfield') }
        ],
        tbodyList: []
      },
      attrData: {
        theadList: [
          { key: 'attrId', title: this.$t('page.attribute'), width: 200 },
          { key: 'field', title: this.$t('term.cmdb.matchfield') },
          { key: 'actionType', title: this.$t('page.actions'), tooltip: this.$t('term.cmdb.attractiontooltip'), width: 120 }
          //{ key: 'actionType', title: '空值覆盖', tooltip: '激活后如果采集数据的对应属性是空值，则会清空对应属性原有的数据', width: 120 }
        ],
        tbodyList: []
      },
      relData: {
        theadList: [
          { key: 'relId', title: this.$t('page.relation'), width: 200 },
          { key: 'field', title: this.$t('term.cmdb.matchfield') },
          { key: 'actionType', title: this.$t('page.actions'), tooltip: this.$t('term.cmdb.relactiontooltip'), width: 120 }
        ],
        tbodyList: []
      },
      syncCiCollectionData: { collectionName: this.collection, isAutoCommit: 1, matchMode: 'key' }
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
    async getGlobalAttrByCiId(ciId) {
      let hasGlobalAttr = false;
      if (ciId) {
        await this.$api.cmdb.ci.getGlobalAttrByCiId(ciId).then(res => {
          const globalAttrList = res.Return;
          this.globalAttrData.tbodyList = [];
          if (globalAttrList && globalAttrList.length > 0) {
            hasGlobalAttr = true;
            globalAttrList.forEach(attr => {
              let attrObj = null;
              if (this.syncCiCollectionData.mappingList) {
                attrObj = this.syncCiCollectionData.mappingList.find(a => attr.id == a.globalAttrId);
              }
              if (!attrObj) {
                attrObj = {
                  globalAttrId: attr.id,
                  globalAttrLabel: attr.label,
                  globalAttrName: attr.name,
                  field: ''
                };
              } else {
                attrObj.globalAttrLabel = attr.label;
                attrObj.globalAttrName = attr.name;
              }
              this.globalAttrData.tbodyList.push(attrObj);
            });
          }
        });
        if (hasGlobalAttr) {
          this.formConfig.globalAttrMapping.isHidden = false;
        } else {
          this.formConfig.globalAttrMapping.isHidden = true;
        }
      }
    },
    async getAttrByCiId(ciId) {
      let hasAttr = false;
      if (ciId) {
        await this.$api.cmdb.ci.getAttrByCiId(ciId).then(res => {
          const attrList = res.Return;
          this.attrData.tbodyList = [];
          this.formConfig.uniqueAttrIdList.dataList = [];
          if (attrList && attrList.length > 0) {
            attrList.forEach(attr => {
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
          const relList = res.Return;
          this.relData.tbodyList = [];
          if (relList && relList.length > 0) {
            relList.forEach(rel => {
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
      this.attrData.tbodyList.forEach(attr => {
        const matchAttrField = this.attrFieldList(attr).find(d => d.value.toLowerCase() === attr.attrName.toLowerCase());
        if (matchAttrField && !attr.field) {
          this.$set(attr, 'field', matchAttrField.value);
          this.matchAttrList.push(attr.attrName);
        }
      });

      this.relData.tbodyList.forEach(rel => {
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
        if (this.globalAttrData && this.globalAttrData.tbodyList && this.globalAttrData.tbodyList.length > 0) {
          this.syncCiCollectionData.mappingList = this.syncCiCollectionData.mappingList.concat(
            this.globalAttrData.tbodyList.filter(attr => {
              return !!attr.field;
            })
          );
        }
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
          if (!parentList || parentList.length === 0) {
            finalFieldList.push({ text: f.name + '·' + f.desc + '(' + f.type + ')', value: f.name });
          } else {
            let ptext = '';
            let pname = '';
            parentList.forEach(d => {
              if (ptext) {
                ptext += '->';
                pname += '.';
              }
              ptext += d.name + '·' + d.desc;
              pname += d.name;
            });
            finalFieldList.push({ text: ptext + '->' + f.name + '·' + f.desc + '(' + f.type + ')', value: pname + '.' + f.name });
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
          ptext += parentList[i].name + '·' + parentList[i].desc;
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
        const collection = this.collectionList.find(c => c.name === this.currentCollection);
        if (collection && collection.fields) {
          if (!attr.targetCiId) {
            this.getAttrFieldList(collection.fields, fieldList, null, false);
          } else {
            //引用属性兼容subset型和普通型字段
            this.getRelFieldList(collection.fields, fieldList, null);
            this.getAttrFieldList(collection.fields, fieldList, null, false);
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
        this.getGlobalAttrByCiId(val);
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
