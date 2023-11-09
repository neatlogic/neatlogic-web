export default {
  props: {
    uuid: [Number, String]
  },
  data() {
    return {
      loading: false
    };
  },
  mounted() {
    this.getData();
  },
  beforeDestroy() {},
  methods: {},
  computed: {
    //去除转义字符
    escape2Html() {
      return function(str) {
        if (str) {
          const arrEntities = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' };
          return str.replace(/&(lt|gt|nbsp|amp|quot);/gi, function(all, t) {
            return arrEntities[t];
          });
        }
      };
    }
  },
  watch: {}
};
