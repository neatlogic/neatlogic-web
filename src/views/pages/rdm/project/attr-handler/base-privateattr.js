export const AttrBase = {
  name: '',
  components: {},
  props: {
    projectId: {type: Number},
    readonly: {type: Boolean, default: false},
    border: { type: String },
    mode: { type: String, default: 'input' },
    issueData: { type: Object }, //issue数据
    attrConfig: { type: Object }, //属性设置
    valueList: { type: Array } //属性数据
  },
  data() {
    return {};
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
