<script>
export default {
  name: '',
  components: {
  },
  inject: ['getGraph', 'getNode'],
  props: {},
  data() {
    return {
      data: {}
    };
  },
  beforeCreate() {},
  created() {
    const node = this.getNode();
    this.data = node.getData();
    node.on('change:data', ({ current }) => {
      this.data = current;
    });
  },
  beforeMount() {},
  mounted() {
  },
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
</script>
<style lang="less">
</style>
