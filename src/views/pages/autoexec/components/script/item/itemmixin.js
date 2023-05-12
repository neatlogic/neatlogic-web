export default {
  props: {
    config: Object,
    canEdit: [Number, Boolean],
    isFirst: Boolean,
    prevList: Array,
    paramList: Array,
    paramsTypeList: Array,
    failPolicyOption: {
      type: Array,
      default() {
        return [];
      }
    },
    inputTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    execMode: String,
    combopConfig: Object, //当前阶段数据
    prevStepList: Array,
    operationType: {
      type: String,
      default: 'combop'
    }
  },
  data() {
    return {
    };
  },
  mounted() {
  },
  beforeDestroy() {

  },
  methods: {
  },
  computed: {

  },
  watch: {
  }
};
