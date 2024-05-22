<template>
  <TsForm
    ref="dataForm"
    v-model="widget"
    :item-list="dataFormConfig"
    labelPosition="top"
  >
    <template v-slot:dataType>
      <TsFormRadio v-model="widget.dataType" :dataList="currentWidgetComponent.dataTypes"></TsFormRadio>
    </template>
    <template v-slot:config>
      <div>
        <TsFormItem v-if="widget && widget.dataType && widget.dataType === 'dynamic'" labelPosition="top" :label="$t('term.report.refreshrate')">
          <div class="pl-md pr-md">
            <Slider
              v-model="widget.dataInterval"
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
        </TsFormItem>
        <TsFormItem v-if="widget && widget.dataType && widget.dataType === 'dynamic'" labelPosition="top" :label="$t('page.datasource') ">
          <TsFormSelect
            dynamicUrl="/api/rest/datawarehouse/datasource/search"
            valueName="id"
            textName="label"
            rootName="tbodyList"
            :params="{ moduleId: moduleId }"
            :transfer="true"
            :value="widget.datasourceId"
            @change="
              val => {
                //重置条件和排序设置
                $set(widget, 'sortList', []);
                $set(widget, 'conditionList', []);
                $set(widget, 'datasourceId', val);
              }
            "
          ></TsFormSelect>
        </TsFormItem>
        <div v-if="currentWidgetComponent && currentWidgetComponent.fields && currentWidgetComponent.fields.length > 0">
          <div v-if="widget && widget.dataType === 'static'">
            <Divider plain orientation="right" style="font-size: 12px; margin: 0px">{{ $t('term.report.datatype.bindstaticdata') }}</Divider>
            <TsFormItem
              v-for="(field, index) in currentWidgetComponent.fields"
              :key="index"
              :label="field.label"
              labelPosition="top"
            >
              <TsFormInput
                :value="getCurrentWidgetField(field.name) && getCurrentWidgetField(field.name)['value']"
                @change="
                  val => {
                    setCurrentWidgetField(field.name, 'value', val);
                  }
                "
              ></TsFormInput>
            </TsFormItem>
          </div>
          <div v-else-if="widget && widget.dataType === 'dynamic'">
            <TsFormItem v-if="datasourceSortList && datasourceSortList.length > 0" :label="$t('page.sort')" labelPosition="top">
              <Tag v-for="(field, index) in datasourceSortList" :key="index" size="large">
                <Badge v-if="getFieldSortIndex(field)" :count="getFieldSortIndex(field)"></Badge>
                <span>{{ field.label }}</span>
                <span
                  class="tssort"
                  style="cursor: pointer"
                  :class="getFieldSort(field)"
                  @click="changeSort(field)"
                ></span>
              </Tag>
            </TsFormItem>
            <TsFormItem :label="$t('term.report.returnrows')" labelPosition="top">
              <div class="pl-md pr-md">
                <Slider
                  v-model="widget.limit"
                  :min="0"
                  :max="50"
                  :step="1"
                ></Slider>
              </div>
            </TsFormItem>
            <Divider plain orientation="right" style="font-size: 12px; margin: 0px">{{ $t('page.fieldmapping') }}</Divider>
            <TsFormItem
              v-for="(field, index) in currentWidgetComponent.fields"
              :key="index"
              labelPosition="top"
              :label="field.label"
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
            <div v-if="datasourceConditionList && datasourceConditionList.length > 0">
              <Divider plain orientation="right" style="font-size: 12px; margin: 0px">{{ $t('page.filtercondition') }}</Divider>
              <TsFormItem :label="$t('term.rdm.innerparam')" labelPosition="top">
                <Tag v-for="(con, index) in presetList" :key="index"><span v-html="'#{' + con + '}'"></span></Tag>
              </TsFormItem>
              <TsFormItem
                v-for="(field, index) in datasourceConditionList"
                :key="index"
                labelPosition="top"
                :label="field.label"
              >
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
              </TsFormItem>
            </div>
          </div>
        </div>
      </div>
    </template>
  </TsForm>
</template>
<script>
import { WIDGETS } from './widget/widget-list.js';

export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    ConditionHandler: () => import('@/views/pages/framework/datawarehouse/condition-handler.vue')
  },
  props: {
    moduleId: { type: String }, //所属模块
    widget: { type: Object },
    presetList: { type: Array } //内部条件变量
  },
  data() {
    return {
      datasourceFieldList: [],
      datasourceConditionList: [],
      filterTypeList: ['text', 'number', 'date', 'time', 'datetime'], //允许排序的字段类型
      dataFormConfig: {
        //数据表单设置
        dataType: {
          type: 'slot',
          label: this.$t('term.report.datatype.name')
        },
        config: {
          type: 'slot',
          hideLabel: true
        }
      }
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
    getFieldSortIndex(field) {
      if (this.widget.sortList) {
        const index = this.widget.sortList.findIndex(d => d.fieldId == field.id);
        if (index >= 0) {
          return index + 1;
        }
      }
      return 0;
    },
    getFieldSort(field) {
      if (this.widget.sortList) {
        const sortfield = this.widget.sortList.find(d => d.fieldId == field.id);
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
      if (!this.widget.sortList) {
        this.$set(this.widget, 'sortList', []);
      }
      const sortfieldIndex = this.widget.sortList.findIndex(d => d.fieldId == field.id);
      if (sortfieldIndex >= 0) {
        const sortfield = this.widget.sortList[sortfieldIndex];
        if (sortfield.type == 'ASC') {
          this.$set(sortfield, 'type', 'DESC');
        } else if (sortfield.type == 'DESC') {
          this.$delete(this.widget.sortList, sortfieldIndex);
        }
      } else {
        this.widget.sortList.push({ fieldId: field.id, type: 'ASC' });
      }
    },
    getConditionValue(fieldId) {
      if (this.widget.conditionList) {
        const condition = this.widget.conditionList.find(d => d.id === fieldId);
        if (condition) {
          return condition.value;
        }
      }
      return null;
    },
    changeCondition(condition, val) {
      if (!this.widget.conditionList) {
        this.$set(this.widget, 'conditionList', []);
      }
      const c = this.widget.conditionList.find(d => d.id === condition.id);
      if (c) {
        this.$set(c, 'value', val);
      } else {
        const newc = {};
        newc.id = condition.id;
        newc.inputType = condition.inputType;
        newc.value = val;
        this.widget.conditionList.push(newc);
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
      if (this.widget && this.widget.fields) {
        return this.widget.fields.find(d => d.name === fieldName);
      }
      return null;
    },
    setCurrentWidgetField(fieldName, prop, val) {
      if (this.widget) {
        if (!this.widget.fields) {
          this.$set(this.widget, 'fields', []);
        }
        const field = this.widget.fields.find(d => d.name === fieldName);
        if (field) {
          this.$set(field, prop, val);
        } else {
          const f = { name: fieldName };
          f[prop] = val;
          this.widget.fields.push(f);
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
    },
    currentWidgetComponent() {
      if (this.widget) {
        return WIDGETS.find(d => d.type === this.widget.type);
      }
      return {};
    }
  },
  watch: {
    'widget.datasourceId': {
      handler: function(val) {
        this.changeDatasourceId(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.tag {
  border-width: 1px !important;
  border-style: solid !important;
  cursor: pointer;
}
</style>
