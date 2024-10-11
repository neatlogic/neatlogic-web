<script>
export default {
  name: '',
  components: {
  },
  inject: ['getGraph', 'getNode'],
  props: {},
  data() {
    return {
      node: null,
      data: null,
      size: null
    };
  },
  beforeCreate() {},
  created() {
    this.node = this.getNode();
    this.data = this.node.getData();
    this.size = this.node.size();
    this.node.on('change:data', ({ current }) => {
      //data发生改变时，改变vue中的data值，触发模板更新
      this.data = current;
    });
    this.node.on('change:size', ({ current }) => {
      this.size = current;
    });
  },
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
  computed: {
    status() {
      if (this.data.status) {
        if (this.data.status === 'succeed') {
          return 'bg-success-grey';
        } else if (this.data.status === 'running') {
          return 'bg-primary';
        }
      }
      return 'bg-node-grey';
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
