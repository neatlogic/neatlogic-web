<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
      <template v-slot>
        <div>
          <TsTable v-if="dataSourceData && dataSourceData.fieldList.length > 0" :theadList="theadList" :tbodyList="dataSourceData.fieldList">
            <template v-slot:isCondition="{ row }">
              <TsFormSwitch v-model="row.isCondition" :trueValue="1" :falseValue="0"></TsFormSwitch>
            </template>
            <template v-slot:inputType="{ row }">
              <div>
                <TsFormSelect
                  v-if="row.isCondition"
                  v-model="row.inputType"
                  :dataList="conditionHandlerList"
                  transfer
                  border="border"
                  valueName="name"
                  textName="label"
                  @on-change="changeConditionHandler"
                ></TsFormSelect>
              </div>
            </template>
            <template v-slot:config="{ row }">
              <div>
                <ConditionConfig
                  v-if="row.isCondition && getHandlerByName(row.inputType) && getHandlerByName(row.inputType).hasConfig"
                  :ref="'conditionConfig_'+row.name"
                  :handler="row.inputType"
                  :config="row.config"
                ></ConditionConfig>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import { HANDLERS } from './handler-list.js';

export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    ConditionConfig: resolve => require(['./condition-config.vue'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    const _this = this;
    return {
      conditionHandlerList: HANDLERS,
      conditionList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        title: this.$t('dialog.title.edittarget', {'target': this.$t('page.condition')}),
        width: 'large'
      },
      theadList: [
        { key: 'name', title: this.$t('page.uniquekey') },
        { key: 'label', title: this.$t('page.name') },
        { key: 'isCondition', title: this.$t('term.framework.iscondition') + '？', width: 100 },
        { key: 'inputType', title: this.$t('term.framework.inputtype') },
        { key: 'config', title: '', width: 400 }
      ],
      dataSourceData: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getDatasourceById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getHandlerByName(name) {
      return this.conditionHandlerList.find(d => d.name === name);
    },
    isFieldSelected(field) {
      return !!this.conditionList.find(d => d.fieldId == field.id);
    },
    toggleField(isActive, field) {
      if (isActive) {
        this.conditionList.push({ fieldId: field.id, fieldLabel: field.label, fieldName: field.name });
      } else {
        const index = this.conditionList.findIndex(d => d.fieldId == field.id);
        if (index > -1) {
          this.conditionList.splice(index, 1);
        }
      }
    },
    changeConditionHandler() {

    },
    getDatasourceById() {
      if (this.id) {
        this.$api.framework.datawarehouse.getDatasourceById(this.id).then(res => {
          this.dataSourceData = res.Return;
          //给field的config设置默认值，这样后面所有逻辑都可以直接使用双向绑定处理
          this.dataSourceData.fieldList.forEach(field => {
            if (!field.config) {
              field.config = {};
            }
          });
        });
      }
    },
    save() {
      if (this.dataSourceData?.fieldList && this.dataSourceData.fieldList.length > 0) {
        let isValid = true;
        this.dataSourceData.fieldList.forEach(field => {
          const conditionConfig = this.$refs['conditionConfig_' + field.name];
          if (conditionConfig) {
            if (!conditionConfig.valid()) {
              isValid = false;
            }
          }
        });
       
        if (isValid) {
          this.$api.framework.datawarehouse.saveDataSourceField({fieldList: this.dataSourceData.fieldList}).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              this.close();
            }
          });
        //console.log(JSON.stringify(this.dataSourceData, null, 2));
        }
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.condition-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 50px 300px auto 100px;
}
.tag {
  border-width: 1px !important;
  border-style: solid !important;
  cursor: pointer;
}
/deep/.tstable-tr td{
  vertical-align:top;
}
</style>
