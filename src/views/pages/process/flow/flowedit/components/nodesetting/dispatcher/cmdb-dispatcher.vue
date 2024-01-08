<template>
  <TsForm
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
          @on-focus="filterFormAttributeDataList(item.formAttributeDataList, item.formAttributeUuid)"
        ></TsFormSelect>
        <span v-if="index != 0" class="text-action tsfont-trash-o pl-xs" @click.stop="deleteFilter(index)"></span>
      </div>
      <span class="tsfont-plus text-href" @click="() => addFilter()">{{ $t('dialog.title.addtarget',{'target':$t('page.mapping')}) }}</span>
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
            <span class="bg-grey radius-xs overflow" style="max-width: 100%;display: inline-block;">
              <span class="tsfont-option-vertical">{{ item.text }}</span>
            </span>
          </div>
        </transition-group>
      </VueDraggable>
    </template>
  </TsForm>
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
      cmdbConfig: {
        type: 'ci'
      },
      priorityList: [],
      filterList: [],
      cmdbDispatcherList: [
        {
          name: 'type',
          validateList: [
            'required'
          ],
          dataList: [
            {
              text: this.$t('term.cmdb.cientity'),
              value: 'ci'
            },
            {
              text: this.$t('term.cmdb.view'),
              value: 'customView'
            }],
          label: this.$t('term.report.datatype.name'),
          type: 'radio',
          onChange: (selectedValue) => {
            this.cmdbConfig = {
              type: selectedValue
            };
            this.priorityList = [];
            this.filterList = [];
            this.handleTypeById(selectedValue);
          }
        },
        {
          name: 'dataSource',
          validateList: [
            'required'
          ],
          url: 'api/rest/cmdb/ci/list',
          label: this.$t('page.datasources'),
          type: 'select',
          textName: 'text',
          valueName: 'value',
          rootName: '',
          transfer: true,
          border: 'border',
          firstSelect: false,
          onChange: (value) => {
            // 数据来源改变的时候
            if (value) {
              this.cmdbDispatcherList.push(...this.otherAttrFormList);
              this.addFilter('', '', value); 
              this.cmdbDispatcherList.forEach((item) => {
                if (item.name == 'workerList') {
                  // 处理人
                  if (this.cmdbConfig.type == 'ci') {
                    item.url = 'api/rest/cmdb/ci/listattr';
                    item.textName = 'label';
                    item.valueName = 'id';
                    item.params = {ciId: value};
                  } else if (this.cmdbConfig.type == 'customView') {
                    item.url = 'api/rest/cmdb/customview/attr/get';
                    item.textName = 'label';
                    item.valueName = 'uuid';
                    item.params = {id: this.value};
                  }
                }
              });
            } else {
              this.cmdbDispatcherList.splice(2, this.cmdbDispatcherList.length);
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
          validateList: [
            'required'
          ],
          label: this.$t('term.process.matchmapping'),
          type: 'slot'
        },
        {
          name: 'workerList',
          validateList: [
            'required'
          ],
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
            console.log('返回的值', item);
            this.priorityList = [];
            let nodeList = this.$utils.deepClone(item) || [];// 深拷贝，不影响原有数据
            this.priorityList = nodeList;
          }
        },
        {
          name: 'priorityList',
          validateList: [
            'required'
          ],
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
          dynamicUrl: 'api/rest/cmdb/ci/listattr',
          textName: 'label',
          valueName: 'id',
          params: {
            ciId: dataSource || this.cmdbConfig.dataSource
          }
        };
      } else if (this.cmdbConfig.type == 'customView') {
        keyConfig = {
          dynamicUrl: 'api/rest/cmdb/customview/attr/get',
          textName: 'name',
          valueName: 'id',
          rootName: 'tbodyList',
          params: {id: dataSource || this.cmdbConfig.dataSource}
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
        return false;
      }
      let priorityList = [];
      this.filterList = [];
      this.cmdbConfig = {
        type: this.value.type,
        ciId: this.value.type == 'ci' ? this.value.ciId : '',
        customViewId: this.value.type == 'customView' ? this.value.customViewId : '',
        workerList: this.value.workerList || []
      };
      if (this.cmdbConfig.type == 'ci') {
        await this.$api.cmdb.ci.getCiList({idList: this.value.priorityList || []}).then(res => {
          priorityList = res.Return || [];
        });
      } else if (this.cmdbConfig.type == 'customView') {
        await this.$api.cmdb.customview.searchPublicCustomView({defaultValue: this.value.priorityList || []}).then(res => {
          priorityList = res.Return || [];
        });
      }
   
      this.priorityList = priorityList || [];
      this.handleTypeById(this.value.type);
      this.value?.filterList?.forEach((item) => { // 处理映射关系回显
        if (item && (item.key && item.formAttributeUuid)) {
          this.addFilter(item.key, item.formAttributeUuid);
        }
      });
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
      const filterCriteria = item => item && (item.name === 'dataSource');
      this.cmdbDispatcherList.filter(filterCriteria)
        .forEach(item => Object.assign(item, selectedOption));
    },
    handleKeyDealDataByUrl(nodeList) {
      // 过滤模型属性被选中属性
      let key = {
        ci: 'id',
        customView: 'uuid'
      };
      let filterList = this.filterList.map((item) => item.key);
      nodeList.forEach((item) => {
        if (item && item[key[this.cmdbConfig.type]] && filterList.includes(item[key[this.cmdbConfig.type]])) {
          item._disabled = true;
        }
      });
      return nodeList;
    },
    filterFormAttributeDataList(nodeList) {
      const filterListSet = this.filterList
        .filter(item => item.formAttributeUuid)
        .map(item => item.formAttributeUuid); // new Set 去重唯一
      console.log('返回的内容', filterListSet);
      nodeList.forEach(item => {
        if (item && item.uuid && filterListSet.includes(item.uuid)) {
          item['_disabled'] = item['_disabled'] || filterListSet.includes(item.uuid); // has对象中是否有一个值
          console.log('filterListSet.includes(item.uuid)', filterListSet.includes(item.uuid), item.uuid);
        }
      });
    },
    saveData() {
      // 提供给外部使用
      let saveData = {
        ...this.cmdbConfig,
        ciId: this.cmdbConfig.type === 'ci' ? this.cmdbConfig.dataSource : '',
        customViewId: this.cmdbConfig.type === 'customView' ? this.cmdbConfig.dataSource : '',
        filterList: this.filterList
          .filter((item) => item.key && item.formAttributeUuid)
          .map(({ key, formAttributeUuid }) => ({ key, formAttributeUuid })),
        priorityList: this.priorityList.filter((item) => !this.$utils.isEmpty(item.value)).map((item) => item.value) // 只存储值给后端
      };

      if (saveData.type === 'ci') {
        delete saveData.customViewId;
      } else if (saveData.type === 'customView') {
        delete saveData.dataSource;
      }

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
<style lang="less">
</style>
