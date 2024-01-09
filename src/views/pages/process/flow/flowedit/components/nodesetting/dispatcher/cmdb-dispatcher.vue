<template>
  <div>
    <Loading
      v-if="loadingShow"
      :loadingShow="loadingShow"
    ></Loading>
    <TsForm
      v-else
      ref="form"
      v-model="cmdbConfig"
      :item-list="cmdbDispatcherList"
      labelPosition="left"
      :labelWidth="80"
      style="width: 100%"
    >
      <template v-slot:filterList>
        <div
          v-for="(item, index) in filterList"
          :key="item.uuid"
          class="flex-between"
          :class="filterList.length > 1 ? 'mb-sm' : ''"
        >
          <TsFormSelect
            v-bind="item.keyConfig"
            ref="keyForm"
            v-model="item.key"
            transfer
            width="84px"
            border="border"
            :validateList="['required']"
            :dealDataByUrl="handleKeyDealDataByUrl"
          ></TsFormSelect>
          <span class="tsfont-arrow-right pl-xs pr-xs"></span>
          <TsFormSelect
            ref="formAttribute"
            v-model="item.formAttributeUuid"
            :dataList="item.formAttributeDataList"
            textName="label"
            valueName="uuid"
            width="84px"
            transfer
            border="border"
            :validateList="['required']"
            @on-focus="filterFormAttributeDataList()"
          ></TsFormSelect>
          <span v-if="index != 0" class="text-action tsfont-trash-o pl-xs" @click.stop="deleteFilter(index)"></span>
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
              <span class="bg-grey radius-sm overflow pr-xs" style="max-width: 100%; display: inline-block">
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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    VueDraggable
  },
  props: {
    allFormitemList: {
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
      cmdbConfig: {
        type: 'ci'
      },
      priorityList: [],
      filterList: [],
      cmdbDispatcherList: [
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
            this.cmdbConfig = {
              type: selectedValue
            };
            this.priorityList = [];
            this.filterList = [];
            this.handleTypeById(selectedValue);
            let keyList = ['type', 'dataSource'];
            this.cmdbDispatcherList = this.cmdbDispatcherList.filter(item => {
              return item && item.name && keyList.includes(item.name);
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
            if (value) {
              this.handleWorkerList(value);
              this.addFilter('', '', value);
            } else {
              this.cmdbDispatcherList.splice(1, this.cmdbDispatcherList.length - 1);
              let keyList = ['type', 'dataSource'];
              for (let key in this.cmdbConfig) {
                if (!keyList.includes(key)) {
                  delete this.cmdbConfig[key];
                }
              }
            }
          }
        }
      ],
      otherAttrFormList: [
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
          onChange: (selectedItem, item, itemList) => {
            this.priorityList = [];
            let nodeList = this.$utils.deepClone(item) || []; // 深拷贝，不影响原有数据
            this.priorityList = nodeList;
          }
        },
        {
          name: 'priorityList',
          validateList: ['required'],
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
      if (this.cmdbConfig.type == 'ci') {
        keyConfig = {
          url: 'api/rest/cmdb/ci/listattr',
          textName: 'label',
          valueName: 'id',
          params: {
            ciId: dataSource || this.cmdbConfig.dataSource
          }
        };
      } else if (this.cmdbConfig.type == 'customView') {
        keyConfig = {
          url: 'api/rest/cmdb/customview/attr/get',
          textName: 'alias',
          valueName: 'uuid',
          rootName: 'attrList',
          params: { id: dataSource || this.cmdbConfig.dataSource }
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
      let {type = '', ciId = '', customViewId = '', priorityList = [], workerList = []} = this.$utils.deepClone(this.value) || {};
      let filterPriorityList = [];
      let tbodyList = [];
      this.filterList = [];
      this.cmdbConfig = {
        type: type,
        ciId: type == 'ci' ? ciId : '',
        customViewId: type == 'customView' ? customViewId : '',
        workerList: workerList || [],
        dataSource: ciId || customViewId
      };
      if (this.cmdbConfig.type == 'ci') {
        await this.$api.cmdb.ci.searchCiListAttr({ defaultValue: priorityList || [], ciId: this.cmdbConfig.dataSource }).then(res => {
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
      } else if (this.cmdbConfig.type == 'customView') {
        await this.$api.cmdb.customview.searchCustomAttrData({ defaultValue: priorityList || [], id: this.cmdbConfig.dataSource }).then(res => {
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
      this.handleTypeById(type);
      this.value?.filterList?.forEach(item => {
        // 处理映射关系回显
        if (item && item.key && item.formAttributeUuid) {
          this.addFilter(item.key, item.formAttributeUuid, ciId || customViewId);
        }
      });
      // 根据优先级idList拿到对应的text，然后根据优先级排序，设置用户拖拽前的数据
      this.priorityList = filterPriorityList.sort((a, b) => priorityList.indexOf(a.value) - priorityList.indexOf(b.value))
        .map(item => ({ ...item })); // 采用浅拷贝的方式，避免 filterPriorityList 中的元素被修改
      this.loadingShow = false;
    },
    handleWorkerList(value) {
      let formItemList = [...this.cmdbDispatcherList, ...this.otherAttrFormList];
      formItemList.forEach(item => {
        if (item.name == 'workerList') {
          // 处理人
          if (this.cmdbConfig.type == 'ci') {
            item.url = 'api/rest/cmdb/ci/listattr';
            item.textName = 'label';
            item.valueName = 'id';
            item.params = { ciId: value };
          } else if (this.cmdbConfig.type == 'customView') {
            item.url = 'api/rest/cmdb/customview/attr/get';
            item.textName = 'alias';
            item.valueName = 'uuid';
            item.rootName = 'attrList';
            item.params = { id: value };
          }
        }
      });
      this.cmdbDispatcherList = formItemList;
    },
    handleTypeById(selectedValue) {
      // 根据配置项类型选择不同的数据来源
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
      const selectedOption = options[selectedValue] || options.ci;
      const filterCriteria = item => item && item.name === 'dataSource';
      this.cmdbDispatcherList.filter(filterCriteria).forEach(item => Object.assign(item, selectedOption));
    },
    handleKeyDealDataByUrl(nodeList) {
      // 过滤模型属性被选中属性
      let key = {
        ci: 'id',
        customView: 'uuid'
      };
      let filterList = this.filterList.map(item => item.key);
      nodeList.forEach(item => {
        if (item && item[key[this.cmdbConfig.type]] && filterList.includes(item[key[this.cmdbConfig.type]])) {
          item._disabled = true;
        }
        if (this.cmdbConfig.type == 'customView') {
          item.alias = item.alias ? item.alias : item.attrVo && item.attrVo.label && item.attrVo.label;
        }
      });
      return nodeList;
    },
    filterFormAttributeDataList() {
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
      let saveData = {
        ...this.cmdbConfig,
        ciId: this.cmdbConfig.type === 'ci' ? this.cmdbConfig.dataSource : '',
        customViewId: this.cmdbConfig.type === 'customView' ? this.cmdbConfig.dataSource : '',
        filterList: this.filterList.filter(item => item.key && item.formAttributeUuid).map(({ key, formAttributeUuid }) => ({ key, formAttributeUuid })),
        priorityList: this.priorityList.filter(item => !this.$utils.isEmpty(item.value)).map(item => item.value) // 只存储值给后端
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
      // 校验
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
