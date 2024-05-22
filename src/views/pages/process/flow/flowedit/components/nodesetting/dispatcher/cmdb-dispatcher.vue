<template>
  <div>
    <Loading
      v-if="loadingShow"
      :loadingShow="loadingShow"
    ></Loading>
    <TsForm
      v-else
      ref="form"
      v-model="formData"
      :item-list="formItemList"
      labelPosition="left"
      :labelWidth="80"
      style="width: 100%"
    >
      <template v-slot:filterList>
        <div
          v-for="(item, index) in filterList"
          :key="item.uuid"
          class="flex-start"
          :class="filterList.length > 1 ? 'mb-sm' : ''"
        >
          <TsFormSelect
            v-bind="item.keyConfig"
            ref="keyForm"
            v-model="item.key"
            transfer
            width="84px"
            border="border"
            :validateList="[{name: 'required', message: ''}]"
            :dealDataByUrl="dealDataByUrl"
            :isNowrap="true"
          ></TsFormSelect>
          <span class="tsfont-arrow-right" style="padding: 0 4px"></span>
          <TsFormSelect
            ref="formAttribute"
            v-model="item.formAttributeUuid"
            :dataList="item.formAttributeDataList"
            textName="label"
            valueName="uuid"
            width="84px"
            transfer
            border="border"
            :validateList="[{name: 'required', message: ''}]"
            :isNowrap="true"
            @on-focus="handleFormAttributeDataListDisabled()"
            @change="handleFormAttributeDataListDisabled()"
          ></TsFormSelect>
          <span
            v-if="index != 0"
            class="text-action tsfont-trash-o"
            style="padding-left: 4px;"
            @click.stop="deleteFilter(index)"
          ></span>
        </div>
        <span class="tsfont-plus text-href" @click="() => addFilter()">{{ $t('dialog.title.addtarget', { target: $t('page.mapping') }) }}</span>
      </template>
      <template v-slot:priorityList>
        <div v-if="$utils.isEmpty(priorityList)" style="height: 30px"></div>
        <VueDraggable
          v-else
          v-model="priorityList"
          handle=".tsfont-option-vertical"
          animation="300"
        >
          <transition-group>
            <div
              v-for="item in priorityList"
              :key="item.value"
              class="mb-xs"
              style="width: 100%"
            >
              <span class="bg-grey radius-sm overflow pr-xs" style="max-width: 100%; display: inline-block;cursor:move;">
                <span class="tsfont-option-vertical">{{ item.text }}</span>
              </span>
            </div>
          </transition-group>
        </VueDraggable>
      </template>
    </TsForm>
  </div>
</template>
<script>
import VueDraggable from 'vuedraggable';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    VueDraggable
  },
  props: {
    allFormitemList: {
      // 表单数据
      type: Array,
      default: () => {
        return [];
      }
    },
    value: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      loadingShow: true, // 编辑分派器时，需要重组formItemList，需要等重组完再渲染组件
      formData: {
        type: 'ci'
      },
      formNameList: ['type', 'dataSource'],
      priorityList: [], // 优先级
      filterList: [], // 匹配映射
      formItemList: [
        {
          name: 'type',
          validateList: ['required'],
          dataList: [
            {
              text: this.$t('term.cmdb.cientity'),
              value: 'ci'
            },
            {
              text: this.$t('term.cmdb.view'),
              value: 'customView'
            }
          ],
          label: this.$t('term.report.datatype.name'),
          type: 'radio',
          onChange: selectedValue => {
            this.formData = {
              type: selectedValue
            };
            this.priorityList = [];
            this.filterList = [];
            this.handleDataSourceByType(selectedValue);
            this.formItemList = this.formItemList.filter(item => {
              return item && item.name && this.formNameList.includes(item.name);
            });
          }
        },
        {
          name: 'dataSource',
          validateList: ['required'],
          url: 'api/rest/cmdb/ci/list',
          label: this.$t('page.datasources'),
          type: 'select',
          textName: 'text',
          valueName: 'value',
          rootName: '',
          transfer: true,
          border: 'border',
          firstSelect: false,
          onChange: value => {
            // 数据来源改变的时候
            for (let key in this.formData) {
              if (key && !this.formNameList.includes(key)) {
                delete this.formData[key];
              }
            }
            if (value) {
              this.handleWorkerList(value);
              this.filterList = [];
              this.addFilter('', '', value);
            } else {
              this.formItemList.splice(2, this.formItemList.length);
              this.priorityList = [];
            }
          }
        }
      ],
      otherFormItemList: [
        {
          name: 'filterList',
          validateList: ['required'],
          label: this.$t('term.process.matchmapping'),
          type: 'slot'
        },
        {
          name: 'workerList',
          validateList: ['required'],
          label: this.$t('term.process.dealwithuser'),
          type: 'select',
          value: '',
          border: 'border',
          multiple: true,
          url: '',
          textName: '',
          valueName: '',
          rootName: '',
          transfer: true,
          firstSelect: false,
          onChange: (selectedItem, itemList) => {
            this.priorityList = this.$utils.deepClone(itemList) || []; // 深拷贝，不影响原有数据
          }
        },
        {
          name: 'priorityList',
          label: this.$t('page.priority'),
          type: 'slot'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.handleInitData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    deleteFilter(index) {
      if (index == 0) {
        return false;
      }
      this.filterList.splice(index, 1);
    },
    addFilter(key = '', formAttributeUuid = '', dataSource = '') {
      let keyConfig;
      let id = dataSource || this.formData.dataSource;
      if (this.formData.type == 'ci') {
        keyConfig = {
          dynamicUrl: 'api/rest/cmdb/ci/listattr',
          textName: 'label',
          valueName: 'id',
          params: {
            ciId: id
          }
        };
      } else if (this.formData.type == 'customView') {
        keyConfig = {
          url: 'api/rest/cmdb/customview/attr/get',
          textName: 'alias',
          valueName: 'uuid',
          rootName: 'attrList',
          params: { id: id}
        };
      }
      this.filterList.push({
        key,
        keyConfig,
        formAttributeUuid,
        formAttributeDataList: this.$utils.deepClone(this.allFormitemList),
        uuid: this.$utils.setUuid()
      });
    },
    async handleInitData() {
      // 处理回显初始值
      if (this.$utils.isEmpty(this.value)) {
        this.loadingShow = false;
        return false;
      }
      let {type = '', ciId = '', customViewId = '', priorityList = [], workerList = [], filterList = []} = this.$utils.deepClone(this.value) || {};
      let filterPriorityList = [];
      let tbodyList = [];
      this.filterList = [];
      this.formData = {
        type: type,
        ciId: type == 'ci' ? ciId : '',
        customViewId: type == 'customView' ? customViewId : '',
        workerList: workerList || [],
        dataSource: ciId || customViewId
      };
      if (type == 'ci' && !this.$utils.isEmpty(priorityList)) {
        await this.$api.cmdb.ci.searchCiListAttr({ defaultValue: priorityList || [], ciId: this.formData.dataSource }).then(res => {
          tbodyList = res.Return || [];
          tbodyList.forEach((item) => {
            if (item.label && item.id) {
              filterPriorityList.push({
                text: item.label,
                value: item.id
              });
            }
          });
        });
      } else if (type == 'customView' && !this.$utils.isEmpty(priorityList)) {
        await this.$api.cmdb.customview.searchCustomAttrData({ defaultValue: priorityList || [], id: this.formData.dataSource }).then(res => {
          tbodyList = res.Return?.attrList || [];
          tbodyList.forEach((item) => {
            if ((item.alias || (item.attrVo && item.attrVo.label)) && item.uuid) {
              filterPriorityList.push({
                text: item.alias || (item.attrVo && item.attrVo.label),
                value: item.uuid
              });
            }
          });
        });
      }
      this.handleWorkerList(ciId || customViewId);
      this.handleDataSourceByType(type);
      filterList.forEach(item => {
        // 处理映射关系回显
        if (item && item.key && item.formAttributeUuid) {
          this.addFilter(item.key, item.formAttributeUuid, ciId || customViewId);
        }
      });
      // 根据优先级idList拿到对应的text，然后根据优先级排序，设置用户拖拽前的数据
      this.priorityList = this.$utils.isEmpty(workerList) ? [] : filterPriorityList.sort((a, b) => priorityList.indexOf(a.value) - priorityList.indexOf(b.value))
        .map(item => ({ ...item })); // 采用浅拷贝的方式，避免 filterPriorityList 中的元素被修改
      this.loadingShow = false;
    },
    handleWorkerList(id) {
      // 根据不同的类型，处理处理人
      let defaultFormItemList = this.$utils.deepClone(this.formItemList);
      defaultFormItemList.splice(2, defaultFormItemList.length);
      let formItemList = [...defaultFormItemList, ...this.otherFormItemList];
      formItemList.forEach(item => {
        if (item.name == 'workerList') {
          // 处理人
          if (this.formData.type == 'ci') {
            item.url = 'api/rest/cmdb/ci/listattr';
            item.textName = 'label';
            item.valueName = 'id';
            item.rootName = '';
            item.params = { ciId: id };
          } else if (this.formData.type == 'customView') {
            item.url = 'api/rest/cmdb/customview/attr/get';
            item.textName = 'alias';
            item.valueName = 'uuid';
            item.rootName = 'attrList';
            item.params = { id: id };
          }
        }
      });
      this.formItemList = formItemList;
    },
    handleDataSourceByType(type) {
      // 处理数据来源根据数据类型
      const options = {
        ci: {
          url: 'api/rest/cmdb/ci/list',
          textName: 'text',
          valueName: 'value',
          rootName: ''
        },
        customView: {
          url: 'api/rest/cmdb/customview/public/search',
          textName: 'name',
          valueName: 'id',
          rootName: 'tbodyList'
        }
      };
      const selectedOption = options[type] || options.ci;
      let formItem = this.formItemList.find(item => item.name === 'dataSource');
      if (formItem) {
        Object.assign(formItem, selectedOption);
      }
    },
    dealDataByUrl(nodeList) {
      // 已选择属性设置禁用
      let key = {
        ci: 'id',
        customView: 'uuid'
      };
      let filterList = this.filterList.map(item => item.key);
      nodeList.forEach(item => {
        if (item && item[key[this.formData.type]] && filterList.includes(item[key[this.formData.type]])) {
          item._disabled = true;
        }
        if (this.formData.type == 'customView') {
          item.alias = item.alias ? item.alias : item.attrVo && item.attrVo.label && item.attrVo.label;
        }
      });
      return nodeList;
    },
    handleFormAttributeDataListDisabled() {
      // 已选择的表单属性，禁用
      let uuidList = [];
      this.filterList.forEach(item => {
        if (item && item.formAttributeUuid) {
          uuidList.push(item.formAttributeUuid);
        }
        item.formAttributeDataList.forEach((v, vIndex) => {
          const updatedV = { ...v, _disabled: false };
          if (v && v.uuid && uuidList.includes(v.uuid)) {
            updatedV._disabled = true;
          }
          this.$set(item.formAttributeDataList, vIndex, updatedV);
        });
      });
    },
    saveData() {
      // 提供给外部使用
      // 注意:filterList字段,flow-valid.js文件里面有一个数据校验方法,主要用于校验[{"formAttributeUuid": "ca04365ff49c4c80b39cf802e857eeaa","key": 441733552807936},{key: '441733846409216', formAttributeUuid: ''}]
      // key或者formAttributeUuid字段为空情况
      let saveData = {
        ...this.formData,
        ciId: this.formData.type === 'ci' ? this.formData.dataSource : '',
        customViewId: this.formData.type === 'customView' ? this.formData.dataSource : '',
        filterList: this.filterList.map(({ key, formAttributeUuid }) => ({ key, formAttributeUuid })),
        priorityList: this.priorityList.filter(item => !this.$utils.isEmpty(item.value)).map(item => item.value)
      };

      if (saveData.type === 'ci') {
        delete saveData.customViewId;
      } else if (saveData.type === 'customView') {
        delete saveData.ciId;
      }
      delete saveData.dataSource;
      return saveData;
    },
    valid() {
      // 校验，提供给外部使用
      // flow-valid.js还有一个数据校验的方法
      let isValid = true;
      let formList = [this.$refs.keyForm, this.$refs.formAttribute];
      for (let key = 0; key < formList.length; key++) {
        if (formList[key] && formList[key].valid && !formList[key].valid()) {
          isValid = false;
        }
      }
      if (this.$refs.form && !this.$refs.form.valid()) {
        isValid = false;
      }
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
