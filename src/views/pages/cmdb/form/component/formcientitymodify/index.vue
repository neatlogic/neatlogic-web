<template>
  <div>
    <div v-if="config.ciIdList && config.ciIdList.length > 0" class="entity-container">
      <div v-for="(ciId, eindex) in config.ciIdList" :key="eindex" class="entity-li border-color">
        <div class="btn-grid">
          <div>
            <h4 class="text-title">
              <span class="overflow" :title="getCiName(ciId)">{{ getCiName(ciId) }}</span>
            </h4>
          </div>
          <div style="text-align: right">
            <div class="action-group">
              <div v-if="!readonly && !disabled && canEditData" class="action-item tsfont-edit" @click="showCiDialog(ciId)">编辑数据</div>
              <div v-if="!readonly && !disabled && (config.actionEdit || config.actionAdd)" class="action-item tsfont-download" @click="showTemplateDialog(ciId)">下载导入模板</div>
              <div v-if="!readonly && !disabled && (config.actionEdit || config.actionAdd)" class="action-item tsfont-upload" @click="openFilePicker(ciId)">导入数据</div>
            </div>
          </div>
        </div>
        <div v-if="mode === 'read'">
          <CiEntityList
            v-if="getCiEntityListByCiId(ciId).length > 0"
            ref="CiEntityList"
            :ciEntityList="getCiEntityListByCiId(ciId)"
            :ciId="ciId"
            :needActionType="true"
            :actionTypeConfig="actionTypeConfig"
            :needAction="readonly ? false : true"
            :needExpand="actionTypeConfig.edit"
            :needError="true"
            :needCondition="false"
            :needPage="false"
            :formConfigList="dataConfig"
            :readonlyTextIsHighlight="readonlyTextIsHighlight"
            saveMode="emit"
            mode="dialog"
            @delete="deleteCiEntity"
            @update="updateCiEntity"
            @changeActionType="changeActionType"
          ></CiEntityList>
          <div v-else class="text-tip">没有任何要修改的配置项</div>
          <div v-if="importError" v-html="importError"></div>
        </div>
      </div>
    </div>
    <div v-else>{{ $t('page.notarget', { target: $t('page.model') }) }}</div>
    <EditCiMain
      v-if="!readonly && isEditCiDialogShow"
      :ciId="editCiId"
      :actionAdd="config.actionAdd || false"
      :actionEdit="config.actionEdit || false"
      :actionDel="config.actionDel || false"
      @close="closeCiDialog"
      @save="saveCiData"
    ></EditCiMain>
    <EditCiEntity
      v-if="!readonly && isEditCiEntityDialogShow && rootCiId"
      :ciEntityData="editCiEntityData"
      :ciId="editCiId"
      :rootCiId="rootCiId"
      @close="closeCiEntityDialog"
      @save="saveCiEntityData"
      @cancel="closeCiDialog"
    ></EditCiEntity>
    <ImportTemplate
      v-if="isTemplateShow"
      :formConfigList="dataConfig"
      :ciId="editCiId"
      @close="closeTemplateDialog"
    ></ImportTemplate>
    <input
      ref="fileInput"
      type="file"
      accept=".xls, .xlsx"
      style="display: none"
      @change="analyExcel"
    />
  </div>
</template>
<script>
import base from '@/resources/plugins/TsSheet/form/component/base.vue';
import validmixin from '@/resources/plugins/TsSheet/form/component/common/validate-mixin.js';
import CiEntityList from '@/views/pages/cmdb/cientity/cientity-list.vue';

export default {
  name: '',
  components: {
    EditCiMain: () => import('./edit-cientity-main.vue'),
    EditCiEntity: () => import('./edit-cientity.vue'),
    ImportTemplate: () => import('@/views/pages/cmdb/form/component/formcientitymodify/import-template.vue'),
    CiEntityList
    //CiEntityList: resolve => require(['@/views/pages/cmdb/cientity/cientity-list.vue', resolve])
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      isTemplateShow: false,
      isShowExpend: true,
      needExpendAll: false,
      // dataConfig: [], // 内容列表
      ciList: [], //模型列表
      isEditCiDialogShow: false,
      isEditCiEntityDialogShow: false,
      editCiId: null, //编辑哪一个模型
      editCiEntityData: {}, //编辑哪一个配置项
      entityList: [], //所有需要修改的配置项信息
      importError: null,
      attrMap: {} //属性列表，用于前端校验
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCiList();
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setAllowAdd(bool) {
      this.$set(this.config, 'actionAdd', !!bool);
    },
    setAllowEdit(bool) {
      this.$set(this.config, 'actionEdit', !!bool);
    },
    setAllowDelete(bool) {
      this.$set(this.config, 'actionDel', !!bool);
    },
    //对外校验方法
    async validData(validConifg) {
      const errorList = await this.validateCiEntityAttr();
      if (errorList && errorList.length > 0) {
        const returnList = [];
        errorList.forEach(error => {
          returnList.push({
            uuid: this.formItem.uuid,
            error: error
          });
        });
        return returnList;
      }
      return [];
    },
    openFilePicker(ciId) {
      this.editCiId = ciId;
      this.$refs.fileInput.click();
    },
    analyExcel(event) {
      const file = event.target.files[0];
      if (file) {
        let formData = new FormData();
        formData.append('file', file);
        formData.append('ciId', this.editCiId);
        formData.append('param', 'file');
        formData.append('type', 'cientityformimport');
        this.$api.cmdb.cientity
          .importCiEntity(formData)
          .then(res => {
            const result = res.Return.analyzedResult;
            if (result) {
              if (result.successList) {
                result.successList.forEach(cientity => {
                  this.$delete(cientity, 'id');
                  cientity['rootCiId'] = this.rootCiId;
                  cientity['actionType'] = 'insert';
                  cientity['#expander'] = false; //隐藏展开按钮
                  this.entityList.push(cientity);
                });
              }
              this.importError = result.error;
            }
          })
          .finally(() => {
            //清空文本框的选择
            this.$refs.fileInput.value = '';
          });
      }
    },
    validConfig() {
      const errorList = this.validDataForAllItem();
      if (!this.config.ciId) {
        errorList.push({ field: 'ciId', error: '请选择模型' });
      }
      /*if (!this.config.actionAdd && !this.config.actionEdit && !this.config.actionDel) {
        errorList.push({ field: 'dataConfig', error: '至少要选择一个可操作的字段' });
      }*/
      return errorList;
    },
    init() {
      this.entityList = this.value || [];
    },
    changeActionType(row, action) {
      this.entityList.forEach(cientity => {
        if (cientity.uuid == row.uuid) {
          this.$set(cientity, 'actionType', action);
          if (action == 'delete') {
            this.$set(cientity, '#expander', false); //隐藏展开按钮，详细看table-tbody.vue中相关代码
          } else {
            this.$set(cientity, '#expander', true); //显示展开按钮，详细看table-tbody.vue中相关代码
          }
          this.$forceUpdate();
        }
      });
    },
    getCiList() {
      this.$api.cmdb.ci.getCiList({ idList: this.config.ciIdList }).then(res => {
        if (res.Status == 'OK') {
          this.ciList = res.Return || [];
          if (['edit', 'editSubform'].includes(this.mode)) {
            // 编辑模式下更新表单高度
            this.$nextTick(() => {
              this.$emit('resize');
            });
          }
        }
      });
    },
    async getAttrByCiId(ciIdList) {
      if (ciIdList && ciIdList.length > 0) {
        for (let i = 0; i < ciIdList.length; i++) {
          const ciId = ciIdList[i];
          await this.$api.cmdb.ci.getAttrByCiId(ciId).then(res => {
            this.attrMap[ciId] = res.Return;
          });
        }
      }
    },
    expandAllDiffContent() {
      // 全部展开
      this.$refs.CiEntityList[0].expandAllDiffContent(this.isShowExpend);
      //this.isShowExpend = !this.isShowExpend;
    },
    showCiDialog(ciId) {
      this.editCiId = ciId;
      this.isEditCiDialogShow = true;
    },
    showTemplateDialog(ciId) {
      this.editCiId = ciId;
      this.isTemplateShow = true;
    },
    closeCiDialog() {
      this.editCiId = null;
      this.isEditCiDialogShow = false;
    },
    closeTemplateDialog() {
      this.editCiId = null;
      this.isTemplateShow = false;
    },
    closeCiEntityDialog() {
      this.editCiId = null;
      this.editCiEntityData = {};
      this.isEditCiEntityDialogShow = false;
    },
    //添加新配置项数据时调用此方法
    saveCiData(type, ciEntityList) {
      if (ciEntityList && ciEntityList.length > 0) {
        ciEntityList.forEach(cientity => {
          if (type == 'add') {
            cientity['actionType'] = 'insert';
            cientity['#expander'] = false; //隐藏展开按钮
          } else if (type == 'import') {
            if (this.actionTypeConfig.edit) {
              cientity['actionType'] = 'update';
              cientity['#expander'] = true; //展示展开按钮
            } else if (this.actionTypeConfig.del) {
              cientity['actionType'] = 'delete';
              cientity['#expander'] = false; //隐藏展开按钮
            }
          }
          const index = this.entityList.findIndex(oldcientity => {
            return oldcientity.uuid == cientity.uuid;
          });
          if (index == -1) {
            this.entityList.push(cientity);
          } else {
            this.$set(this.entityList, index, cientity);
          }
        });
      }
      this.closeCiDialog();
    },
    //修改配置项时调用此方法
    saveCiEntityData(ciEntityList) {
      if (ciEntityList && ciEntityList.length > 0) {
        ciEntityList.forEach(cientity => {
          const index = this.entityList.findIndex(e => e.uuid == cientity.uuid);
          if (cientity['actionType'] == 'insert' || cientity['actionType'] == 'delete') {
            cientity['#expander'] = false; //隐藏展开按钮
          } else if (cientity['actionType'] == 'update') {
            cientity['#expander'] = true; //展示展开按钮
          }
          if (index > -1) {
            this.$set(this.entityList, index, cientity);
          } else {
            // this.entityList.push(cientity); // 编辑配置项时，追加自动采集里的数据，提交时，会额外新增一条数据
          }
        });
      }
      this.closeCiEntityDialog();
    },
    //打开编辑对话框
    updateCiEntity(ciEntity) {
      if (ciEntity && ciEntity.ciId) {
        if (this.dataConfig) {
          ciEntity.editableAttrRelIdList = [];
          if (ciEntity.actionType == 'update') {
            this.dataConfig.forEach(v => {
              if (v.isEdit) {
                ciEntity.editableAttrRelIdList.push(v.key);
              }
            });
          }
        }
        this.editCiEntityData = ciEntity;
        this.editCiId = ciEntity.ciId;
        this.isEditCiEntityDialogShow = true;
      }
    },
    async validateCiEntityAttr() {
      const errorSet = new Set();
      //获取所有配置项的起始模型id，如果是级联添加的配置项这里不校验了，因为也没地方显示，将来有需要再考虑
      const ciIdList = [...new Set(this.entityList.map(d => d.rootCiId))];
      if (ciIdList.length === 0) {
        return;
      }
      //根据模型id获取属性
      await this.getAttrByCiId(ciIdList);
      //清空配置项异常
      this.entityList.forEach(cientity => {
        this.$set(cientity, '_error', null);
      });

      //开始校验
      ciIdList.forEach(ciId => {
        const attrList = this.attrMap[ciId];
        if (attrList && attrList.length > 0) {
          //校验属性唯一
          const uniqueAttrList = this.attrMap[ciId].filter(v => v.isUnique);
          const currentCiEntityList = this.getCiEntityListByCiId(ciId);
          if (uniqueAttrList.length > 0 && currentCiEntityList.length > 0) {
            const checkSet = {};
            uniqueAttrList.forEach(attr => {
              currentCiEntityList.forEach(cientity => {
                const attrEntity = cientity.attrEntityData['attr_' + attr.id];
                const valueList = attrEntity && attrEntity.valueList;
                if (valueList && valueList.length > 0) {
                  const v = valueList.join(',');
                  if (!checkSet[v]) {
                    checkSet[v] = [];
                  }
                  checkSet[v].push(cientity);
                }
              });
              for (let key in checkSet) {
                if (checkSet[key].length > 1) {
                  checkSet[key].forEach(cientity => {
                    this.$set(cientity, '_error', ['属性“' + attr.label + '”的值必须唯一']);
                    errorSet.add('属性“' + attr.label + '”的值必须唯一');
                  });
                }
              }
            });
          }
          //校验唯一规则
          const ciUniqueAttrList = this.attrMap[ciId].filter(v => v.isCiUnique);
          if (ciUniqueAttrList && ciUniqueAttrList.length > 0) {
            const checkSet = {};
            currentCiEntityList.forEach(cientity => {
              let combinevalue = '';
              ciUniqueAttrList.forEach(attr => {
                const attrEntity = cientity.attrEntityData['attr_' + attr.id];
                const valueList = attrEntity && attrEntity.valueList;
                if (valueList && valueList.length > 0) {
                  const v = valueList.join(',');
                  if (combinevalue) {
                    combinevalue += '#';
                  }
                  combinevalue += v;
                }
              });
              if (!checkSet[combinevalue]) {
                checkSet[combinevalue] = [];
              }
              checkSet[combinevalue].push(cientity);
            });
            for (let key in checkSet) {
              if (checkSet[key].length > 1) {
                checkSet[key].forEach(cientity => {
                  if (cientity['_error']) {
                    cientity['_error'].push('唯一规则出现重复');
                  } else {
                    this.$set(cientity, '_error', ['唯一规则出现重复']);
                  }
                  errorSet.add('唯一规则出现重复');
                });
              }
            }
          }
        }
      });
      return [...errorSet];
    },
    deleteCiEntity(ciEntity) {
      if (ciEntity && ciEntity.uuid && this.entityList && this.entityList.length > 0) {
        for (let i = this.entityList.length - 1; i >= 0; i--) {
          const entity = this.entityList[i];
          if (entity.uuid == ciEntity.uuid) {
            this.entityList.splice(i, 1);
            break;
          }
        }
      }
    },
    updateList(ciId, ciEntityList) {
      if (this.entityList && this.entityList.length > 0) {
        for (let i = this.entityList.length - 1; i >= 0; i--) {
          const entity = this.entityList[i];
          if (entity.ciId == ciId) {
            this.entityList.splice(i, 1);
          }
        }
      }
      if (ciEntityList && ciEntityList.length > 0) {
        ciEntityList.forEach(cientity => {
          this.entityList.push(cientity);
        });
      }
    }
  },
  filter: {},
  computed: {
    actualValue() {
      if (this.value) {
        if (this.value instanceof Array && this.value.length > 0) {
          return this.value[0];
        } else {
          return this.value;
        }
      }
      return null;
    },
    rootCiId() {
      if (this.config && this.config.ciIdList) {
        return this.config.ciIdList[0];
      }
      return null;
    },
    dataConfig() {
      return this.config.dataConfig;
    },
    actionTypeConfig() {
      let config = this.config;
      return { edit: config.actionEdit || false, del: config.actionDel || false, add: config.actionAdd || false };
    },
    canEditData() {
      return this.config.actionEdit || this.config.actionDel || this.config.actionAdd;
    },
    getCiName() {
      return function(ciId) {
        let text = '';
        if (this.ciList && this.ciList.length > 0) {
          this.ciList.forEach(ci => {
            if (ci.value === ciId) {
              text = ci.text;
            }
          });
        }
        return text;
      };
    },
    getCiEntityListByCiId() {
      return function(ciId) {
        if (this.entityList && this.entityList.length > 0) {
          const returnList = [];
          this.entityList.forEach(cientity => {
            if (cientity.rootCiId === ciId && !cientity._isnew) {
              returnList.push(cientity);
            }
          });
          return returnList;
        } else {
          return [];
        }
      };
    }
  },
  watch: {
    entityList: {
      handler: function(val) {
        this.setValue(val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.entity-container {
  .entity-li {
    padding-bottom: 10px;
    .text-title {
      display: flex;
      line-height: 2;
      position: relative;
      .text {
        position: absolute;
        right: 10px;
        cursor: pointer;
        span {
          vertical-align: top;
        }
      }
    }
  }
}
.btn-grid {
  display: grid;
  grid-template-columns: auto auto;
}
</style>
