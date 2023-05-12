export default {
  props: {
    positioningKey: {
      // 参数失效，定位到失效key值
      type: String,
      default: ''
    },
    id: [Number, String, Boolean],
    selectedTreeNode: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      
    };
  },
  mounted() { },
  beforeDestroy() { },
  methods: {
    updateActiveStatus(id, isActive) {
      // 保存激活状态
      if (id && id != true) {
        this.$api.autoexec.action.updateServiceActiveStatus({ id: id, isActive: isActive }).then((res) => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        });
      }
    }
  },
  computed: {
    //去除转义字符
    escape2Html() {
      return (str) => {
        if (str) {
          const arrEntities = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' };
          return str.replace(/&(lt|gt|nbsp|amp|quot);/gi, (all, t) => {
            return arrEntities[t];
          });
        }
      };
    }
  },
  watch: {}
};
