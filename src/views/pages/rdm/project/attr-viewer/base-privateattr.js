export const AttrBase = {
  name: '',
  components: {},
  props: {
    issueData: { type: Object }, //issue数据
    attrConfig: { type: Object }, //属性设置
    valueList: { type: Array }, //属性数据
    scale: { type: Number, default: 1 }//某些组件支持缩小尺寸
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
