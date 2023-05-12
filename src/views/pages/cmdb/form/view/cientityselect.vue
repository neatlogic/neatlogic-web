<template>
  <div>
    <div v-if="setting.config.ciIdList && setting.config.ciIdList.length > 0" class="entity-container">
      <div v-for="(ciId, eindex) in setting.config.ciIdList" :key="eindex" class="entity-li border-color">
        <h4 class="text-title">
          {{ getCiName(ciId) }}
          <i v-if="!isReadonly" class="text-href tsfont-edit ml-md" @click="showCiDialog(ciId)"></i>
        </h4>
        <div v-if="formView">
          <CiEntityList
            v-if="getCiEntityListByCiId(ciId).length > 0"
            ref="CiEntityList"
            :ciEntityList="getCiEntityListByCiId(ciId)"
            :ciId="ciId"
            :needActionType="true"
            :actionTypeConfig="actionTypeConfig"
            :needAction="isReadonly?false:true"
            :needExpand="actionTypeConfig.edit"
            :needCondition="false"
            :needPage="false"
            :formConfigList="dataConfig"
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
    <div v-if="setting.config.desc" class="component-tips ts-info">{{ setting.config.desc }}</div>
    <transition name="fade">
      <span v-if="validMesage != ''" class="form-error-tip">{{ validMesage }}</span>
    </transition>
    <EditCi
      v-if="!isReadonly && isEditCiDialogShow"
      :ciId="editCiId"
      :actionAdd="setting.config.actionAdd || false"
      :actionEdit="setting.config.actionEdit || false"
      :actionDel="setting.config.actionDel || false"
      @close="closeCiDialog"
      @save="saveCiData"
    ></EditCi>
    <EditCiEntity
      v-if="!isReadonly && isEditCiEntityDialogShow && rootCiId"
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
import viewmixin from '@/resources/components/FormMaker/formedit/view/viewmixin.js';
import CiEntityList from '@/views/pages/cmdb/cientity/cientity-list.vue';
export default {
  name: '',
  components: {
    EditCi: resolve => require(['./component/edit-ci.vue'], resolve),
    EditCiEntity: resolve => require(['./component/edit-cientity.vue'], resolve),
    CiEntityList
  },
  filters: {},
  mixins: [viewmixin],
  props: [''],
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
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeActionType(row, action) {
      this.entityList.forEach(cientity => {
        if (cientity.uuid == row.uuid) {
          this.$set(cientity, 'actionType', action);
          if (action == 'delete') {
            this.$set(cientity, '_expander', false);//隐藏展开按钮，详细看table-tbody.vue中相关代码
          } else {
            this.$set(cientity, '_expander', true);//显示展开按钮，详细看table-tbody.vue中相关代码
          }
          this.$forceUpdate();
        }
      });
    },
    updateValue(val) {
      //更新值
      this.entityList = val || [];
      this.$forceUpdate();
    },
    getValue() {
      //获取值
      return this.entityList || [];
    },
    validateValue() {
      //校验
      return true;
    },
    getCiList() {
      this.$api.cmdb.ci.getCiList({ idList: this.setting.config.ciIdList }).then(res => {
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
            cientity['_expander'] = false;//隐藏展开按钮
          } else if (type == 'import') {
            if (this.actionTypeConfig.edit) {
              cientity['actionType'] = 'update';
              cientity['_expander'] = true;//展示展开按钮
            } else if (this.actionTypeConfig.del) {
              cientity['actionType'] = 'delete';
              cientity['_expander'] = false;//隐藏展开按钮
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
            cientity['_expander'] = false;//隐藏展开按钮
          } else if (cientity['actionType'] == 'update') {
            cientity['_expander'] = true;//展示展开按钮
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
  computed: {
    rootCiId() {
      if (this.setting.config && this.setting.config.ciIdList) {
        return this.setting.config.ciIdList[0];
      }
      return null;
    },
    dataConfig() {
      return this.setting.config.dataConfig;
    },
    actionTypeConfig() {
      let config = this.setting.config;
      return {edit: config.actionEdit || false, del: config.actionDel || false, add: config.actionAdd || false};
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
    value: {
      handler: function(val) {
        if (val) {
          this.updateValue(val);
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.entity-container {
  .entity-li {
    padding-bottom: 10px;
    .text-title {
      line-height: 2;
      position: relative;
      .text{
        position: absolute;
        right: 10px;
        cursor: pointer;
        span{
          vertical-align: top;
        }
      }
    }
  }
}
</style>
