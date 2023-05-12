export default {
  props: {
    config: Object,
    canEdit: {
      type: Boolean,
      default: true
    },
    defaultValue: {
      type: [Array, Object],
      default: null
    },
    defaultSearchValue: { //默认搜索条件，不可改变
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isValid: true
    };
  },
  created() {
  },
  mounted() { },
  beforeDestroy() { },
  methods: {},
  computed: {},
  watch: {}
};
