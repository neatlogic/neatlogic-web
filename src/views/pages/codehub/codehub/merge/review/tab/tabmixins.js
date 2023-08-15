export default {
  props: {
    mrData: Object,
    id: Number, //mrId
    mrstatusList: Array,
    statusList: Array,
    commitId: {
      //从需求选中的commitId
      type: [String, Number, Boolean]
    },
    refreshItem: Array, //需要强制刷新的tab
    selectFilepath: String,
    versionId: Number, // 版本id，版本中心页面的tab
    url: {
      // 代码变更接口
      type: String,
      default: '/api/rest/codehub/mergerequest/diff'
    },
    readOnly: {
      // 每行代码进行评论
      type: Boolean,
      default: false
    },
    canBinaryFileDownload: {
      // 二进制文件是否可以下载
      type: Boolean,
      default: true
    },
    canExpandContent: {
      // 代码变更，是否功能展开更多内容，左边序号展开内容
      type: Boolean,
      default: true
    }
  },
  data() {
    return {};
  },
  mounted() {},
  beforeDestroy() {},
  methods: {},
  computed: {},
  watch: {}
};
