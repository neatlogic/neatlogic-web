<template>
  <div>
    <TsForm
      ref="dataForm"
      v-model="currentWidget"
      :item-list="dataFormConfig"
      labelPosition="top"
    >
      <template v-slot:dataType>
        <TsFormRadio v-model="currentWidget.dataType" :dataList="currentWidgetComponent.dataTypes"></TsFormRadio>
      </template>
      <template v-slot:config>
        <div>
          <div v-if="currentWidget && currentWidget.dataType && currentWidget.dataType === 'dynamic'" class="ivu-form-item tsform-item ivu-form-label-top">
            <label class="ivu-form-item-label overflow">{{ $t('term.report.refreshrate') }}</label>
            <div class="ivu-form-item-content">
              <div class="pl-md pr-md">
                <Slider
                  v-model="currentWidget.dataInterval"
                  :min="0"
                  :max="300"
                  :step="10"
                  :tip-format="
                    val => {
                      return val + $t('page.second');
                    }
                  "
                ></Slider>
              </div>
            </div>
          </div>
          <div v-if="currentWidget && currentWidget.dataType && currentWidget.dataType === 'dynamic'" class="ivu-form-item tsform-item ivu-form-label-top">
            <label class="ivu-form-item-label overflow">{{ $t('page.datasource') }}</label>
            <div class="ivu-form-item-content">
              <TsFormSelect
                dynamicUrl="/api/rest/datawarehouse/datasource/search"
                valueName="id"
                textName="label"
                rootName="tbodyList"
                :transfer="true"
                :value="currentWidget.datasourceId"
                @change="
                  val => {
                    //重置条件和排序设置
                    $set(currentWidget, 'sortList', []);
                    $set(currentWidget, 'conditionList', []);
                    $set(currentWidget, 'datasourceId', val);
                  }
                "
              ></TsFormSelect>
            </div>
          </div>
          <div v-if="currentWidgetComponent && currentWidgetComponent.fields && currentWidgetComponent.fields.length > 0">
            <div v-if="currentWidget && currentWidget.dataType === 'static'" class="ivu-form-item tsform-item ivu-form-label-top">
              <Divider plain orientation="right" style="font-size:12px;margin:0px">{{ $t('term.report.datatype.bindstaticdata') }}</Divider>
              <div v-for="(field, index) in currentWidgetComponent.fields" :key="index" class="ivu-form-item tsform-item ivu-form-label-top">
                <label class="ivu-form-item-label overflow">{{ field.label }}</label>
                <div class="ivu-form-item-content">
                  <TsFormInput
                    :value="getCurrentWidgetField(field.name) && getCurrentWidgetField(field.name)['value']"
                    type="textarea"
                    @change="
                      val => {
                        setCurrentWidgetField(field.name, 'value', val);
                      }
                    "
                  ></TsFormInput>
                </div>
              </div>
            </div>
            <div v-else-if="currentWidget && currentWidget.dataType === 'dynamic'">
              <div v-if="datasourceSortList && datasourceSortList.length > 0" class="ivu-form-item tsform-item ivu-form-label-top">
                <label class="ivu-form-item-label overflow">{{ $t('page.sort') }}</label>
                <div class="ivu-form-item-content bg-op padding-xs radius-md" style="white-space:normal">
                  <Tag
                    v-for="(field, index) in datasourceSortList"
                    :key="index"
                    size="large"
                  >
                    <Badge v-if="getFieldSortIndex(field)" :count="getFieldSortIndex(field)"></Badge>
                    <span>{{ field.label }}</span>
                    <span
                      class="tssort"
                      style="cursor:pointer"
                      :class="getFieldSort(field)"
                      @click="changeSort(field)"
                    ></span>
                  </Tag>
                </div>
              </div>
              <div class="ivu-form-item tsform-item ivu-form-label-top">
                <label class="ivu-form-item-label overflow">{{ $t('term.report.returnrows') }}</label>
                <div class="ivu-form-item-content">
                  <div class="pl-md pr-md">
                    <Slider
                      v-model="currentWidget.limit"
                      :min="0"
                      :max="50"
                      :step="1"
                    ></Slider>
                  </div>
                </div>
              </div>
              <Divider plain orientation="right" style="font-size:12px;margin:0px">{{ $t('term.report.datatype.binddynamicdata') }}</Divider>
              <div v-for="(field, index) in currentWidgetComponent.fields" :key="index" class="ivu-form-item tsform-item ivu-form-label-top">
                <label class="ivu-form-item-label overflow">{{ field.label }}</label>
                <div class="ivu-form-item-content">
                  <TsFormSelect
                    :value="getCurrentWidgetField(field.name) && getCurrentWidgetField(field.name)['datasourceField']"
                    :transfer="true"
                    valueName="id"
                    textName="label"
                    :dataList="getDatasourceFieldList(field)"
                    @change="
                      val => {
                        setCurrentWidgetField(field.name, 'datasourceField', val);
                      }
                    "
                  ></TsFormSelect>
                </div>
              </div>
              <div v-if="datasourceConditionList && datasourceConditionList.length > 0">
                <Divider plain orientation="right" style="font-size:12px;margin:0px">{{ $t('page.filtercondition') }}</Divider>
                <div v-for="(field, index) in datasourceConditionList" :key="index" class="ivu-form-item tsform-item ivu-form-label-top">
                  <label class="ivu-form-item-label overflow">{{ field.label }}</label>
                  <div class="ivu-form-item-content">
                    <ConditionHandler
                      :handler="field.inputType"
                      :config="field.config"
                      :value="getConditionValue(field.id)"
                      @change="
                        val => {
                          changeCondition(field, val);
                        }
                      "
                    ></ConditionHandler>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    ConditionHandler: resolve => require(['@/views/pages/framework/datawarehouse/condition-handler.vue'], resolve)
  },
  props: {
    currentWidget: {type: Object},
    currentWidgetComponent: {type: Object}
  },
  data() {
    return {
      datasourceConditionList: [],
      filterTypeList: ['text', 'number', 'date', 'time', 'datetime'], //允许排序的字段类型
      dataFormConfig: {
        dataType: {
          type: 'slot',
          label: this.$t('term.report.datatype.name')
        },
        config: {
          type: 'slot',
          hideLabel: true
        }
      },
      datasourceFieldList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getConditionValue(fieldId) {
      if (this.currentWidget.conditionList) {
        const condition = this.currentWidget.conditionList.find(d => d.id === fieldId);
        if (condition) {
          return condition.value;
        }
      }
      return null;
    },
    changeCondition(condition, val) {
      if (!this.currentWidget.conditionList) {
        this.$set(this.currentWidget, 'conditionList', []);
      }
      const c = this.currentWidget.conditionList.find(d => d.id === condition.id);
      if (c) {
        this.$set(c, 'value', val);
      } else {
        const newc = {};
        newc.id = condition.id;
        newc.inputType = condition.inputType;
        newc.value = val;
        this.currentWidget.conditionList.push(newc);
      }
    },
    getFieldSortIndex(field) {
      if (this.currentWidget.sortList) {
        const index = this.currentWidget.sortList.findIndex(d => d.fieldId == field.id);
        if (index >= 0) {
          return index + 1;
        }
      }
      return 0;
    },
    getFieldSort(field) {
      if (this.currentWidget.sortList) {
        const sortfield = this.currentWidget.sortList.find(d => d.fieldId == field.id);
        if (sortfield) {
          if (sortfield.type == 'ASC') {
            return 'down';
          } else if (sortfield.type == 'DESC') {
            return 'up';
          }
        }
      }
      return 'none';
    },
    changeSort(field) {
      if (!this.currentWidget.sortList) {
        this.$set(this.currentWidget, 'sortList', []);
      }
      const sortfieldIndex = this.currentWidget.sortList.findIndex(d => d.fieldId == field.id);
      if (sortfieldIndex >= 0) {
        const sortfield = this.currentWidget.sortList[sortfieldIndex];
        if (sortfield.type == 'ASC') {
          this.$set(sortfield, 'type', 'DESC');
        } else if (sortfield.type == 'DESC') {
          this.$delete(this.currentWidget.sortList, sortfieldIndex);
        }
      } else {
        this.currentWidget.sortList.push({fieldId: field.id, type: 'ASC'});
      }
    },
    changeDatasourceId(val) {
      if (val) {
        this.$api.framework.datawarehouse.getDatasourceById(val).then(res => {
          if (res.Return.fieldList && res.Return.fieldList.length > 0) {
            this.datasourceFieldList = res.Return.fieldList;
            this.datasourceConditionList = [];
            this.datasourceFieldList.forEach(field => {
              if (field.isCondition) {
                this.datasourceConditionList.push(this.$utils.deepClone(field));
              }
            });
          }
        });
      } else {
        this.datasourceFieldList = [];
      }
    },
    getDatasourceFieldList(field) {
      if (field && this.datasourceFieldList && this.datasourceFieldList.length) {
        return this.datasourceFieldList.filter(d => field.type.includes(d.type));
      }
      return [];
    },
    getCurrentWidgetField(fieldName) {
      if (this.currentWidget && this.currentWidget.fields) {
        return this.currentWidget.fields.find(d => d.name === fieldName);
      }
      return null;
    },
    setCurrentWidgetField(fieldName, prop, val) {
      if (this.currentWidget) {
        if (!this.currentWidget.fields) {
          this.$set(this.currentWidget, 'fields', []);
        }
        const field = this.currentWidget.fields.find(d => d.name === fieldName);
        if (field) {
          this.$set(field, prop, val);
        } else {
          const f = { name: fieldName };
          f[prop] = val;
          this.currentWidget.fields.push(f);
        }
      }
    }
  },
  filter: {},
  computed: {
    datasourceSortList() {
      if (this.datasourceFieldList && this.datasourceFieldList.length) {
        return this.datasourceFieldList.filter(d => this.filterTypeList.includes(d.type));
      }
      return [];
    }
  },
  watch: {
    'currentWidget.datasourceId': {
      handler: function(val) {
        this.changeDatasourceId(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
