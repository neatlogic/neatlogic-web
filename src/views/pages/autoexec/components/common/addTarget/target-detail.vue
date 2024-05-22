
<template>
  <div>
    <TsFormItem
      :label="$t('term.autoexec.screeningmode')"
      labelPosition="left"
      :labelWidth="labelWidth"
      :required="required"
    >
      <PoptipSelect
        ref="typeList"
        v-model="typeValue"
        :list="typeList"
        :disabled="!canEdit"
        isRequired
        transfer
        clearable
      ></PoptipSelect>
    </TsFormItem>
    <!-- 过滤器 -->
    <AddFilters
      v-if="typeValue === 'filter'"
      ref="filterMain"
      :config="config"
      :defaultValue="executeNodeConfig.filter"
      :canEdit="canEdit"
      :defaultSearchValue="defaultSearchValue"
    ></AddFilters>
    <!-- 参数：添加阶段的时候可以选参数 -->
    <AddParam
      v-if="typeValue === 'paramList'"
      :id="id"
      ref="paramList"
      :defaultValue="executeNodeConfig.paramList"
      :canEdit="canEdit"
      :defaultSearchValue="defaultSearchValue"
      :runtimeParamList="runtimeParamList"
      :labelWidth="labelWidth"
    ></AddParam>
    <!-- 输入文本 -->
    <InputTag
      v-if="typeValue === 'inputNodeList'"
      ref="inputNodeList"
      :config="config"
      :defaultValue="executeNodeConfig.inputNodeList"
      :canEdit="canEdit"
      :defaultSearchValue="defaultSearchValue"
    ></InputTag>
    <!-- 节点 -->
    <AddNode
      v-if="typeValue === 'selectNodeList'"
      ref="selectNodeList"
      :config="config"
      :defaultValue="executeNodeConfig.selectNodeList"
      :canEdit="canEdit"
      :defaultSearchValue="defaultSearchValue"
    ></AddNode>
    <!-- 上游参数 -->
    <AddPrenode
      v-if="typeValue === 'preOutputList'"
      ref="preOutputList"
      :config="config"
      :defaultValue="executeNodeConfig.preOutputList"
      :canEdit="canEdit"
      :labelWidth="labelWidth"
      :prevStepList="prevStepList"
    ></AddPrenode>
  </div>
</template>
<script>

export default {
  name: '',
  components: {
    AddNode: () => import('./add-node.vue'),
    InputTag: () => import('./add-input.vue'),
    AddParam: () => import('./add-param.vue'),
    AddFilters: () => import('./add-filters.vue'),
    AddPrenode: () => import('./add-prenode.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    PoptipSelect: () => import('@/resources/components/PoptipSelect/PoptipSelect.vue')
  },
  filters: {
  },
  props: {
    id: [Number, String],
    config: Object,
    canEdit: {
      type: Boolean,
      default: true
    },
    type: { //现在指定执行目标:'now'
      type: String,
      default: 'now'
    },
    defaultSearchValue: { //节点搜索条件
      type: Object,
      default: null
    },
    isAddParam: {
      type: Boolean,
      default: false
    },
    runtimeParamList: Array, //作业参数
    required: {
      type: Boolean,
      default: false
    },
    labelWidth: {
      type: Number,
      default: 80
    },
    isAddPrenode: { //是否引用上游参数选项
      type: Boolean,
      default: false
    },
    prevStepList: Array
  },
  data() {
    return {
      executeNodeConfig: {
        filter: {},
        selectNodeList: [],
        inputNodeList: [],
        paramList: [],
        preOutputList: []
      },
      validateList: ['required'],
      typeList: [
        {
          value: 'filter',
          text: this.$t('page.filter'),
          description: this.$t('term.autoexec.filterdesc')
        },
        {
          value: 'selectNodeList',
          text: this.$t('page.node'),
          description: this.$t('term.autoexec.nodedesc')
        },
        {
          value: 'inputNodeList',
          text: this.$t('term.autoexec.inputtext'),
          description: this.$t('term.autoexec.inputtextdesc')
        }
      ],
      typeValue: ''
    };
  },
  beforeCreate() {},
  created() {
    if (this.isAddParam) {
      this.typeList.push({
        value: 'paramList',
        text: this.$t('term.autoexec.jobparam'),
        description: this.$t('term.autoexec.citejobparamdesc')
      });
    }
    if (this.isAddPrenode) {
      this.typeList.push({
        value: 'preOutputList',
        text: this.$t('term.autoexec.upstreamparameter'),
        description: this.$t('term.autoexec.citeupstreamparamdesc')
      });
    }
    this.initData();
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
    initData() {
      if (this.type == 'now') {
        this.config && Object.keys(this.executeNodeConfig).forEach(key => {
          if (this.config[key] && !this.$utils.isEmpty(this.config[key])) {
            this.executeNodeConfig[key] = this.config[key];
            this.typeValue = key;
          }
        });
      }
    },
    save() {
      let data = {};
      if (this.typeValue == 'filter') {
        let filterValue = this.$refs.filterMain ? this.$refs.filterMain.save() : null;
        let complexModeSearchValue = this.$refs.filterMain ? this.$refs.filterMain.getComplexModeSearchValue() : null;
        if (complexModeSearchValue && !this.$utils.isEmptyObj(complexModeSearchValue) && complexModeSearchValue.hasOwnProperty('conditionGroupList')) {
          this.$set(data, 'filter', complexModeSearchValue);
        } else if (this.executeNodeConfig.filter && this.executeNodeConfig.filter.hasOwnProperty('conditionGroupList') && this.$utils.isEmptyObj(complexModeSearchValue)) {
          this.$set(data, 'filter', complexModeSearchValue);// 编辑执行目标，为空
        } else {
          this.$set(data, 'filter', filterValue);
        }
      } else if (this.typeValue == 'selectNodeList') {
        let selectNodeConfig = this.$refs.selectNodeList ? this.$refs.selectNodeList.save() : null;
        Object.assign(data, selectNodeConfig);
      } else if (this.typeValue == 'inputNodeList') {
        let inputNodeConfig = this.$refs.inputNodeList ? this.$refs.inputNodeList.save() : null;
        Object.assign(data, inputNodeConfig);
      } else if (this.typeValue == 'paramList') {
        let paramListConfig = this.$refs.paramList ? this.$refs.paramList.save() : null;
        Object.assign(data, paramListConfig);
      } else if (this.typeValue == 'preOutputList') {
        let preOutputList = this.$refs.preOutputList ? this.$refs.preOutputList.save() : null;
        this.$set(data, 'preOutputList', preOutputList);
      }
      return data;
    },
    valid() {
      let isValid = true;
      if (!this.$refs.typeList.valid()) {
        isValid = false;
      } else if (this.typeValue) {
        if (this.typeValue == 'filter') {
          isValid = this.$refs.filterMain.valid();
        } else if (this.typeValue == 'selectNodeList') {
          isValid = this.$refs.selectNodeList.valid();
        } else if (this.typeValue == 'inputNodeList') {
          isValid = this.$refs.inputNodeList.valid();
        } else if (this.typeValue == 'paramList') {
          isValid = this.$refs.paramList.valid();
        }
      }
      return isValid;
    }
  },
  computed: {
  },
  watch: {
    // config: {
    //   handler(val) {
    //     this.initData();
    //   },
    //   immediate: true,
    //   deep: true
    // }
  }
};
</script>
