<template>
  <div>
    <div v-if="config.ciIdList && config.ciIdList.length > 0" class="entity-container">
      <div v-for="(ciId, eindex) in config.ciIdList" :key="eindex" class="entity-li border-color">
        <h4 class="text-title">
          <span class="overflow" :title="getCiName(ciId)">{{ getCiName(ciId) }}</span>
          <i v-if="!readonly && !disabled" class="text-href tsfont-edit ml-md" @click="showCiDialog(ciId)"></i>
        </h4>
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
          <div v-else class="text-tip">
            没有任何要修改的配置项
          </div>
        </div>
      </div>
    </div>
    <div v-else>{{ $t('page.notarget',{target:$t('page.model')}) }}</div>
    <EditCi
      v-if="!readonly && isEditCiDialogShow"
      :ciId="editCiId"
      :actionAdd="config.actionAdd || false"
      :actionEdit="config.actionEdit || false"
      :actionDel="config.actionDel || false"
      @close="closeCiDialog"
      @save="saveCiData"
    ></EditCi>
    <EditCiEntity
      v-if="!readonly && isEditCiEntityDialogShow && rootCiId"
      :ciEntityData="editCiEntityData"
      :ciId="editCiId"
      :rootCiId="rootCiId"
      @close="closeCiEntityDialog"
      @save="saveCiEntityData"
      @cancel="closeCiDialog"
    ></EditCiEntity>
  </div>
</template>
<script>
import base from '@/resources/plugins/TsSheet/form/component/base.vue';
import validmixin from '@/resources/plugins/TsSheet/form/component/common/validate-mixin.js';
import CiEntityList from '@/views/pages/cmdb/cientity/cientity-list.vue';

export default {
  name: '',
  components: {
    EditCi: () => import('./edit-ci.vue'),
    EditCiEntity: () => import('./edit-cientity.vue'),
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
      isShowExpend: true,
      needExpendAll: false,
      // dataConfig: [], // 内容列表
      ciList: [], //模型列表
      isEditCiDialogShow: false,
      isEditCiEntityDialogShow: false,
      editCiId: null, //编辑哪一个模型
      editCiEntityData: {}, //编辑哪一个配置项
      entityList: [] //所有需要修改的配置项信息
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
    validConfig() {
      const errorList = this.validDataForAllItem();
      if (!this.config.ciId) {
        errorList.push({ field: 'ciId', error: '请选择模型' });
      }
      if (!this.config.actionAdd && !this.config.actionEdit && !this.config.actionDel) {
        errorList.push({field: 'dataConfig', error: '至少要选择一个可操作的字段'});
      }
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
            this.$set(cientity, '_expander', false); //隐藏展开按钮，详细看table-tbody.vue中相关代码
          } else {
            this.$set(cientity, '_expander', true); //显示展开按钮，详细看table-tbody.vue中相关代码
          }
          this.$forceUpdate();
        }
      });
    },
    getCiList() {
      this.$api.cmdb.ci.getCiList({ idList: this.config.ciIdList }).then(res => {
        if (res.Status == 'OK') {
          this.ciList = res.Return || [];
        }
      });
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
    closeCiDialog() {
      this.editCiId = null;
      this.isEditCiDialogShow = false;
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
            cientity['_expander'] = false; //隐藏展开按钮
          } else if (type == 'import') {
            if (this.actionTypeConfig.edit) {
              cientity['actionType'] = 'update';
              cientity['_expander'] = true; //展示展开按钮
            } else if (this.actionTypeConfig.del) {
              cientity['actionType'] = 'delete';
              cientity['_expander'] = false; //隐藏展开按钮
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
            cientity['_expander'] = false; //隐藏展开按钮
          } else if (cientity['actionType'] == 'update') {
            cientity['_expander'] = true; //展示展开按钮
          }
          if (index > -1) {
            this.$set(this.entityList, index, cientity);
          } else {
            this.entityList.push(cientity);
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
          const returnList = this.entityList.filter(cientity => {
            return cientity.rootCiId === ciId && !cientity._isnew;
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
</style>
