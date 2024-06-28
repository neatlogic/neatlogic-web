<template>
  <div>
    <TsFormSwitch
      v-model="isFilter"
      :trueValue="true"
      :falseValue="false"
      :trueText="$t('term.dashboard.datafilter')"
      :falseText="$t('term.dashboard.datafilter')"
      :showStatus="showStatus"
      @on-change="(val)=>{changeFilter(val);}"
    ></TsFormSwitch>
    <template v-if="isFilter">
      <TsRow
        v-for="(f,findex) in filterList"
        :key="findex"
        :gutter="8"
        class="filter-list"
      >
        <Col span="4">
          <TsFormSelect
            ref="formValid"
            v-model="f.leftValue"
            :dataList="getTableList(findex)"
            :placeholder="$t('page.table')"
            :validateList="validateList"
            transfer
          ></TsFormSelect>
        </Col>
        <Col span="4">
          <TsFormSelect
            ref="formValid"
            v-model="f.leftColumn"
            :dataList="getFormTableAttrList(f.leftValue)"
            :placeholder="$t('page.attribute')"
            :validateList="validateList"
            transfer
          ></TsFormSelect>
        </Col>
        <Col span="4">
          <TsFormSelect
            ref="formValid"
            v-model="f.expression"
            :dataList="expressionList"
            :placeholder="$t('term.cmdb.expression')"
            :validateList="validateList"
            transfer
          ></TsFormSelect>
        </Col>
        <Col span="4">
          <TsFormSelect
            ref="formValid"
            v-model="f.rightMappingMode"
            :dataList="mappingModeList"
            :placeholder="$t('page.mappingmode')"
            :validateList="validateList"
            transfer
          ></TsFormSelect>
        </Col>
        <Col span="6">
          <template v-if="f.rightMappingMode === 'formCommonComponent'">
            <TsFormSelect
              ref="formValid"
              v-model="f.value"
              :dataList="getFormComponent('formCommonComponent')"
              textName="label"
              valueName="uuid"
              :validateList="validateList"
              :firstSelect="false"
              transfer
              border="border"
            ></TsFormSelect>
          </template>
          <template v-else-if="f.rightMappingMode === 'formTableComponent'">
            <TsRow :gutter="8">
              <Col :span="12">
                <TsFormSelect
                  ref="formValid"
                  v-model="f.rightValue"
                  :dataList="getFormComponent('formTableComponent')"
                  textName="label"
                  valueName="uuid"
                  :placeholder="$t('page.component')"
                  :validateList="validateList"
                  transfer
                  @on-change="(val)=>{
                    $set(f, 'rightColumn', '');
                  }"
                ></TsFormSelect>
              </Col>
              <Col :span="12">
                <TsFormSelect
                  ref="formValid"
                  v-model="f.rightColumn"
                  :dataList="getFormTableAttrList(f.rightValue)"
                  :placeholder="$t('page.attribute')"
                  :validateList="validateList"
                  transfer
                ></TsFormSelect>
              </Col>
            </TsRow>
          </template>
          <template v-else-if="f.rightMappingMode == 'constant'">
            <TsFormInput
              ref="formValid"
              v-model="f.rightValue"
              :validateList="validateList"
              border="border"
            ></TsFormInput>
          </template>
          <template v-else-if="f.rightMappingMode === 'processTaskParam'">
            <TsFormSelect
              ref="formValid"
              v-model="f.rightValue"
              v-bind="processTaskParamConfig"
            ></TsFormSelect>
          </template>
          <template v-else>
            <TsFormInput
              ref="formValid"
              v-model="f.rightValue"
              :validateList="validateList"
              border="border"
            ></TsFormInput>
          </template>
        </Col>
        <Col span="2">
          <span class="text-tip-active tsfont-plus pr-xs" @click="addFilter(filterList)"></span>
          <span v-if="filterList.length > 1" class="text-tip-active tsfont-trash-o delete-condition" @click="delFilterItem(filterList, findex)"></span>
        </Col>
      </TsRow>
    </template>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    value: String,
    filterList: Array,
    allFormitemList: Array,
    showStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isFilter: false,
      validateList: ['required'],
      expressionList: [
        {
          value: 'like',
          text: this.$t('term.expression.like')
        },
        {
          value: 'notlike',
          text: this.$t('term.expression.notlike')
        },
        {
          value: 'equal',
          text: this.$t('term.expression.eq')
        },
        {
          value: 'unequal',
          text: this.$t('term.expression.ne')
        }
      ],
      mappingModeList: [
        {
          text: this.$t('page.constant'),
          value: 'constant'
        },
        {
          text: this.$t('term.process.formcommonitem'),
          value: 'formCommonComponent'
        },
        {
          text: this.$t('term.process.formtableitem'),
          value: 'formTableComponent'
        },
        {
          text: this.$t('term.process.taskinformation'),
          value: 'processTaskParam'
        }
      ],
      processTaskParamConfig: {
        dynamicUrl: '/api/rest/process/condition/list',
        textName: 'label',
        valueName: 'name',
        border: 'border',
        transfer: true,
        validateList: ['required']
      }
    };
  },
  beforeCreate() {},
  created() {
    this.isFilter = !this.$utils.isEmpty(this.filterList);
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addFilter(filterList) {
      filterList.push({
        leftMappingMode: 'formTableComponent',
        leftValue: '',
        leftColumn: '',
        expression: '',
        rightMappingMode: '',
        rightValue: '',
        rightColumn: ''
      });
    },
    delFilterItem(filterList, index) {
      filterList.splice(index, 1);
    },
    valid() {
      let isValid = true;
      let formValidList = this.$refs.formValid;
      if (formValidList && formValidList.length > 0) {
        formValidList.forEach(v => {
          if (!v.valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    },
    changeFilter(val) {
      let filterList = [];
      if (val) {
        filterList = [
          {
            leftMappingMode: 'formTableComponent',
            leftValue: '',
            leftColumn: '',
            expression: '',
            rightMappingMode: '',
            rightValue: '',
            rightColumn: ''
          }
        ];
      }
      this.$emit('updateFilterList', filterList);
    }
  },
  filter: {},
  computed: {
    getTableList() {
      return (index) => {
        let list = [];
        let tableList = []; //可选的表格组件
        if (this.value) {
          tableList.push(this.value);
          this.filterList.forEach((i, iIndex) => {
            if (index > iIndex) {
              if (i.leftValue && !tableList.includes(i.leftValue)) {
                tableList.push(i.leftValue);
              }
             
              if (i.rightMappingMode === 'formTableComponent' && i.rightValue && !tableList.includes(i.rightValue)) {
                tableList.push(i.rightValue);
              }
            }
          });
          list = this.allFormitemList.filter(item => {
            return tableList.includes(item.uuid);
          }).map(m => {
            return {
              text: m.label,
              value: m.uuid
            };
          });
        }
        return list;
      };
    },
    getFormTableAttrList() {
      return (value) => {
        let dataList = [];
        if (value && this.allFormitemList && this.allFormitemList.length > 0) {
          let find = this.allFormitemList.find(item => item.uuid === value);
          if (find && find.config && find.config.dataConfig) {
            find.config.dataConfig.forEach(d => {
              dataList.push({
                text: d.label,
                value: d.uuid
              });
            });
          }
        }
        return dataList;
      };
    },
    getFormComponent() {
      return (type) => {
        let dataList = [];
        if (this.allFormitemList && this.allFormitemList.length > 0) {
          if (type === 'formCommonComponent') { //表单普通组件
            dataList = this.allFormitemList.filter(item => {
              return item.handler != 'formtableselector' && item.handler != 'formtableinputer' && item.handler != 'formcube';
            });
          } else if (type === 'formTableComponent') { //table组件（表格数据组件、表单选择组件）
            dataList = this.allFormitemList.filter(item => {
              return item.handler === 'formtableselector' || item.handler === 'formtableinputer';
            });
          }
        }
        return dataList;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.filter-list{
   &:not(:last-child) {
    padding-bottom: 8px;
  }
}
</style>
