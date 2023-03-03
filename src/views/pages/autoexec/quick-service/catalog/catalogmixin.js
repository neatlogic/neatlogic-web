export default {
  props: {
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
  methods: {},
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
