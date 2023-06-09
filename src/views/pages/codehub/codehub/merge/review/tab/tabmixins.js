export default {
  props: {
    mrData: Object,
    id: Number, //mruuid
    mrstatusList: Array,
    statusList: Array,
    commitId: {//从需求选中的commituuid
      type: [String, Number, Boolean]
    },
    refreshItem: Array, //需要强制刷新的tab
    selectFilepath: String
  },
  data() {
    return {
    };
  },
  mounted() {},
  beforeDestroy() {},
  methods: {},
  computed: {},
  watch: {}
};
