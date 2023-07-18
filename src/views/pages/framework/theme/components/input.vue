<template>
  <div>
    <div
      :is="item.input+'-type'"
      class="m-inline"
      :config="item"
      transfer
    ></div>
  </div>
</template>
<script>
import components from '../input/index.js';
export default {
  name: '',
  components: {
    ...components
  },
  props: {item: Object},
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let item = this.item;
    if (!item.value) {
      item.value = '';
      this.$forceUpdate();
    }
  },
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
