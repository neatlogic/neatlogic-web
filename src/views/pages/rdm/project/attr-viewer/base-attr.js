export const AttrBase = {
  name: '',
  components: {
  },
  props: {
    attrConfig: {type: Object}, //属性设置
    valueList: {type: [Array, Object, Number, String, Boolean]}, //属性数据
    scale: { type: Number, default: 1 }//某些组件支持缩小尺寸
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {
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
  },
  filter: {},
  computed: {},
  watch: {}
};
