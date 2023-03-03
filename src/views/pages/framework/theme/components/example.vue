<template>
  <div>
    <div
      :is="item.example+'-type'"
      :item="item"
      :list="list"
      :type="type"
      transfer
    ></div>
  </div>
</template>
<script>
import components from '../example/index.js';
export default {
  name: '',
  components: {
    ...components
  },
  props: {item: Object, type: String, list: Array},
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
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
  watch: {
  }
};
</script>
