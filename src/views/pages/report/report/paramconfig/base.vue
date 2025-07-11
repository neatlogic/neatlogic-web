<script>

export default {
  components: {
    ReactionFilter: () => import('@/views/pages/report/report/paramconfig/reaction/filter.vue')
  },
  props: {
    config: {
      type: Object
    },
    rowData: {
      // 编辑当前行的数据
      type: Object,
      default: () => {
        return {};
      }
    },
    paramList: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  methods: {
    valid() {
      const formRef = this.$refs;
      let isValidPass = true;
      for (let key in formRef) {
        const refKey = this.$refs[key];
        if (key && refKey && refKey.valid && !refKey.valid()) {
          isValidPass = false;
        }
      }
      return isValidPass;
    },
    setConfig() {
      const formData = this.$utils.deepClone(this.$refs['formMain'].getFormValue()) || {};
      const reactionFilterList = this.$refs?.reactionFilterRef?.saveData() || [];
      if (!this.$utils.isEmpty(formData)) {
        delete formData['reactionFilter'];
      }
      return {
        ...formData,
        reactionFilterList: reactionFilterList
      };
    }
  }
};
</script>
