<template>
  <div>
    <div class="pb-sm">{{ $t('term.process.jobscenariovalue') }}</div>
    <div class="param-list">
      <TsFormItem
        v-for="(item,index) in scenarioParamMappingGroupList"
        :key="index"
        :label="item.name"
        :required="!!item.isRequired"
        labelPosition="left"
      >
        <div v-for="(m,mindex) in item.mappingList" :key="mindex">
          <TsRow :gutter="8" :class="m.mappingMode !== 'formTableComponent'?'pb-sm':''">
            <Col span="6">
              <TsFormSelect
                ref="formValid"
                v-model="m.mappingMode"
                :dataList="mappingModeList"
                :validateList="item.isRequired?validateList:[]"
                :firstSelect="false"
                transfer
                border="border"
                @on-change="(val)=>{changeMappingMode(m,val)}"
              ></TsFormSelect>
            </Col>
            <Col span="16">
              <template v-if="m.mappingMode === 'formCommonComponent'">
                <TsFormSelect
                  ref="formValid"
                  v-model="m.value"
                  :dataList="getFormComponent('formCommonComponent')"
                  textName="label"
                  valueName="uuid"
                  :validateList="item.isRequired? validateList:[]"
                  :firstSelect="false"
                  transfer
                  border="border"
                ></TsFormSelect>
              </template>
              <template v-else-if="m.mappingMode === 'formTableComponent'">
                <div class="formTableComponent">
                  <TsRow :gutter="8">
                    <Col :span="12">
                      <TsFormSelect
                        ref="formValid"
                        v-model="m.value"
                        :dataList="getFormComponent('formTableComponent')"
                        textName="label"
                        valueName="uuid"
                        :placeholder="$t('term.framework.tablecomponent')"
                        :validateList="item.isRequired? validateList:[]"
                        transfer
                        @on-change="(val)=>{
                          $set(m, 'column', '');
                        }"
                      ></TsFormSelect>
                    </Col>
                    <Col :span="12">
                      <TsFormSelect
                        ref="formValid"
                        v-model="m.column"
                        :dataList="getFormTableAttrList(m.value)"
                        :placeholder="$t('page.attribute')"
                        :validateList="item.isRequired? validateList:[]"
                        transfer
                      ></TsFormSelect>
                    </Col>
                  </TsRow>
                </div>
              </template>
              <template v-else-if="m.mappingMode == 'constant'">
                <TsFormSelect
                  ref="formValid"
                  v-model="m.value"
                  :dataList="scenarioList"
                  :validateList="item.isRequired? validateList:[]"
                  :firstSelect="false"
                  transfer
                  border="border"
                ></TsFormSelect>
              </template>
              <template v-else>
                <TsFormInput
                  ref="formValid"
                  v-model="m.value"
                  :validateList="item.isRequired?validateList:[]"
                  border="border"
                ></TsFormInput>
              </template>
            </Col>
            <Col span="2">
              <span class="text-tip-active tsfont-plus pr-xs" @click="addItem(item.mappingList)"></span>
              <span v-if="item.mappingList.length > 1" class="text-tip-active tsfont-trash-o delete-condition" @click="delItem(item.mappingList, mindex)"></span>
            </Col>
          </TsRow>
          <div v-if="m.mappingMode === 'formTableComponent'" class="pb-sm">
            <FilterList
              ref="filterList"
              :filterList="m.filterList"
              :allFormitemList="allFormitemList"
              :value="m.value"
              showStatus
              @updateFilterList="(list)=>{
                $set(m,'filterList', list);
              }"
            ></FilterList>
          </div>
        </div>
      </TsFormItem>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    FilterList: () => import('../filter-list.vue')
  },
  props: {
    allFormitemList: Array,
    scenarioList: Array,
    scenarioParamMappingGroupList: Array
  },
  data() {
    return {
      validateList: ['required'],
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
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
  
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
    changeMappingMode(item) {
      this.$set(item, 'value', null);
      this.$set(item, 'column', null);
      this.$set(item, 'filterList', []);
    },
    addItem(list) {
      list.push({
        mappingMode: '',
        value: '',
        column: '',
        filterList: []
      });
    },
    delItem(list, index) {
      list.splice(index, 1);
    },
    valid() {
      let isValid = true;
      for (let key in this.$refs) {
        let item = this.$refs[key];
        if (Array.isArray(item)) {
          item.forEach(v => {
            if (v && v.valid) {
              !v.valid() && (isValid = false);
            }
          });
        } else {
          if (item && item.valid) {
            !item.valid() && (isValid = false);
          }
        }
      }
      return isValid;
    }
  },
  filter: {},
  computed: {
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
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
