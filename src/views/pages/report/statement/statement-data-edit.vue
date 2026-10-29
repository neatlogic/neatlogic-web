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
              <!-- 保留现有下拉控件及回显参数，通过 dashboard 统一数据源入口传递来源类型。 -->
              <TsFormSelect
                dynamicUrl="/api/rest/dashboard/datasource/list"
                :params="datasourceParams"
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
              <div v-for="(field, index) in currentWidgetComponent.fields" :key="index" class="mb-sm"> 
                <TsFormItem
                  :label="field.label"
                  labelPosition="top"
                  :tooltip="field.description"
                  :required="field.isRequired"
                >
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
                </TsFormItem>
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
import { getDatasourceType } from '@/resources/api/report/statement/datasource';

export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    ConditionHandler: () => import('@/views/pages/framework/datawarehouse/condition-handler.vue')
  },
  props: {
    currentWidget: {type: Object},
    currentWidgetComponent: {type: Object}
  },
  data() {
    return {
      datasourceConditionList: [],
      datasourceRequestId: 0, // 切换来源时忽略已过期的字段详情响应。
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
  beforeDestroy() {
    // 销毁后不再接收尚未完成的字段详情请求。
    this.datasourceRequestId += 1;
  },
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
    changeDatasourceId(val, datasourceType) {
      // 来源由类型和 ID 共同确定，清空候选项并阻止旧请求回写新配置。
      const requestId = ++this.datasourceRequestId;
      this.datasourceFieldList = [];
      this.datasourceConditionList = [];
      if (val) {
        return this.$api.report.statement.getDatasource({ id: val, datasourceType: getDatasourceType(datasourceType) }).then(res => {
          if (requestId !== this.datasourceRequestId) {
            return;
          }
          this.datasourceFieldList = (res.Return && res.Return.fieldList) || [];
          this.datasourceFieldList.forEach(field => {
            if (field.isCondition) {
              this.datasourceConditionList.push(this.$utils.deepClone(field));
            }
          });
        });
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
    // TsFormSelect 会将此参数合并到关键词、分页及 defaultValue 回显请求中。
    datasourceParams() {
      return { datasourceType: getDatasourceType(this.currentWidget && this.currentWidget.datasourceType) };
    },
    // 同一个 ID 在不同来源中可能重复，类型改变也必须重新加载字段。
    datasourceIdentity() {
      return { id: this.currentWidget && this.currentWidget.datasourceId, ...this.datasourceParams };
    },
    datasourceSortList() {
      if (this.datasourceFieldList && this.datasourceFieldList.length) {
        return this.datasourceFieldList.filter(d => this.filterTypeList.includes(d.type));
      }
      return [];
    }
  },
  watch: {
    datasourceIdentity: {
      handler: function(val) {
        this.changeDatasourceId(val.id, val.datasourceType);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
