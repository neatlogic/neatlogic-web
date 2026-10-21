export default {
  props: {
    positioningKey: {
      // 参数失效时，定位到失效参数对应的键
      type: String,
      default: ''
    },
    id: [Number, String],
    selectedTreeNode: {
      type: Object,
      default: () => ({})
    }
  },
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
    editorTarget() {
      return `${this.id || 'new'}:${this.parentId}`;
    },
    parentId() {
      return this.id ? (this.selectedTreeNode.parentId || 0) : (this.selectedTreeNode.id || 0);
    },
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
  }
};
