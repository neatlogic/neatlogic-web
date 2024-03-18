
<template>
  <div class="bg-op radius-sm padding">
    <TsForm
      v-if="paramList.length"
      ref="paramList"
      v-model="executeConfig"
      :labelWidth="82"
      :item-list="formConfig"
    ></TsForm>
    <div v-else class="text-tip">{{ $t('term.autoexec.jobparamnosettingtip') }}</div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {
  },
  props: {
    id: {type: [String, Number], default: null},
    defaultValue: {
      type: Array,
      default: () => []
    },
    canEdit: {
      type: Boolean,
      default: true
    },
    paramList: {//可选参数列表
      type: Array,
      default: () => []
    }
  },
  data() {
    let _this = this;
    return {
      formConfig: {
        paramList: {
          type: 'checkbox',
          label: this.$t('term.autoexec.jobparam'),
          dataList: [],
          multiple: true,
          disabled: !_this.canEdit
        }
      },
      executeConfig: {
        paramList: []
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
    save() {
      return this.executeConfig.paramList;
    }
  },
  computed: {},
  watch: {
    defaultValue: {
      handler(val) {
        val && (this.executeConfig.paramList = this.$utils.deepClone(val));
      },
      deep: true,
      immediate: true
    },
    paramList: {
      handler(val) {
        val && (this.formConfig.paramList.dataList = this.$utils.deepClone(val));
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
