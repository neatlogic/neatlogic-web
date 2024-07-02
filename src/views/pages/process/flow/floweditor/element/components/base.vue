<script>
export default {
  name: '',
  components: {},
  inject: ['getGraph', 'getNode'],
  props: {},
  data() {
    return {
      node: null,
      data: null
    };
  },
  beforeCreate() {},
  created() {
    this.node = this.getNode();
    this.data = this.node.getData();
    this.node.on('change:data', ({ current }) => {
      //data发生改变时，该表vue中的data值，触发模板更新
      this.data = current;
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
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
