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
      <span class="tsfont-plus text-href" @click="addFilter">添加映射</span>
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
        return {
          'type': 'ci',
          'ciId': 1044706589786112,
          'workerList': [
            1044706589786112,
            441190910533632
          ],
          'filterList': [
            {
              'key': 441190910533632,
              'formAttributeUuid': 'ca04365ff49c4c80b39cf802e857eeaa'
            },
            {
              'key': 507682339217408,
              'formAttributeUuid': 'ba8b942b44ab4e29ba9a589f52a24807'
            }],
          'priorityList': [
            1044706589786112, 
            441190910533632
          ]
        };
      }
    }
  },
  data() {
    return {
      cmdbConfig: {
        type: 'ci'
      },
      priorityList: [],
      filterList: [
        {
          key: '',
          keyConfig: {
            url: 'api/rest/cmdb/ci/list',
            textName: 'text',
            valueName: 'value',
            rootName: ''
          },
          formAttributeUuid: '',
          formAttributeDataList: this.allFormitemList,
          uuid: this.$utils.setUuid()
        }
      ],
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
          name: 'ciId',
          validateList: [
            'required'
          ],
          url: 'api/rest/cmdb/ci/list',
          label: '数据来源',
          type: 'select',
          textName: 'text',
          valueName: 'value',
          rootName: '',
          transfer: true,
          border: 'border',
          firstSelect: false
        },
        {
          name: 'filterList',
          validateList: [
            'required'
          ],
          url: 'api/rest/cmdb/ci/list',
          label: '匹配映射',
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
          url: 'api/rest/cmdb/ci/list',
          textName: 'text',
          valueName: 'value',
          rootName: '',
          transfer: true,
          firstSelect: false,
          onChange: (selectedItem, item, itemList) => {
            let nodeList = this.$utils.deepClone(itemList);// 深拷贝，不影响原有数据
            this.priorityList = nodeList.map((item) => ({text: item.text, value: item.value}));
          }
        },
        {
          name: 'priorityList',
          validateList: [
            'required'
          ],
          label: this.$t('page.priority'),
          type: 'slot'
        }]
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
    addFilter(key = '', formAttributeUuid = '') {
      let keyConfig;
      if (this.cmdbConfig.type == 'ci') {
        keyConfig = {
          url: 'api/rest/cmdb/ci/list',
          textName: 'text',
          valueName: 'value',
          rootName: ''
        };
      } else if (this.cmdbConfig.type == 'customView') {
        keyConfig = {
          url: 'api/rest/cmdb/customview/public/search',
          textName: 'name',
          valueName: 'id',
          rootName: 'tbodyList'
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
      const filterCriteria = item => item && (item.name === 'ciId' || item.name === 'workerList');
      this.cmdbDispatcherList.filter(filterCriteria)
        .forEach(item => Object.assign(item, selectedOption));
    },
    handleKeyDealDataByUrl(nodeList) {
      // 过滤模型属性被选中属性
      let filterList = this.filterList.map((item) => item.key);
      nodeList.forEach((item) => {
        if (item && item.value && filterList.includes(item.value)) {
          item._disabled = true;
        }
      });
      return nodeList;
    },
    filterFormAttributeDataList(nodeList, currentFormAttributeUuid) {
      const filterListSet = new Set(this.filterList
        .filter(item => item.formAttributeUuid && item.formAttributeUuid !== currentFormAttributeUuid)
        .map(item => item.formAttributeUuid)
      ); // new Set 去重唯一

      nodeList.forEach(item => {
        if (item && item.uuid) {
          item['_disabled'] = item['_disabled'] || filterListSet.has(item.uuid); // has对象中是否有一个值
        }
      });
    },
    saveData() {
      // 提供给外部使用
      let saveData = {
        ...this.cmdbConfig,
        ciId: this.cmdbConfig.type === 'ci' ? this.cmdbConfig.ciId : '',
        customViewId: this.cmdbConfig.type === 'customView' ? this.cmdbConfig.ciId : '',
        filterList: this.filterList
          .filter((item) => item.key && item.formAttributeUuid)
          .map(({ key, formAttributeUuid }) => ({ key, formAttributeUuid })),
        priorityList: this.priorityList.filter((item) => !this.$utils.isEmpty(item.value)).map((item) => item.value) // 只存储值给后端
      };

      if (saveData.type === 'ci') {
        delete saveData.customViewId;
      } else if (saveData.type === 'customView') {
        delete saveData.ciId;
      }

      return saveData;
    },
    valid() {
      // 校验
      let isValid = true;
      let keyFormList = this.$refs.keyForm;
      let formAttributeList = this.$refs.formAttribute;
      for (let key = 0; key < keyFormList.length; key++) {
        if (keyFormList[key] && keyFormList[key].valid && !keyFormList[key].valid()) {
          isValid = false;
        }
      }
      for (let key = 0; key < formAttributeList.length; key++) {
        if (formAttributeList[key] && formAttributeList[key].valid && !formAttributeList[key].valid()) {
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
