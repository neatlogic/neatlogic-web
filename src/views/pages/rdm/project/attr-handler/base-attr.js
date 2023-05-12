export const AttrBase = {
  name: '',
  components: {},
  props: {
    readonly: {type: Boolean, default: false},
    border: { type: String },
    mode: { type: String, default: 'input' },
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
