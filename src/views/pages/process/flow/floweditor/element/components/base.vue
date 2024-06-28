<script>
export default {
  name: '',
  components: {},
  inject: ['getGraph', 'getNode'],
  props: {},
  data() {
    return {
      node: null
    };
  },
  beforeCreate() {},
  created() {
    this.node = this.getNode();
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
