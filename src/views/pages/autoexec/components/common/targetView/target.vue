
<template>
  <div v-if="config">
    <div :is="getNodeHandler()" :config="config"></div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    filterHandler: () => import('@/views/pages/autoexec/components/common/targetView/target-filter.vue'),
    inputNodeListHandler: () => import('@/views/pages/autoexec/components/common/targetView/target-input-node.vue'),
    selectNodeListHandler: () => import('@/views/pages/autoexec/components/common/targetView/target-select-node.vue')
  },
  filters: {
  },
  props: {
    config: Object
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  computed: {
    getNodeHandler() {
      return () => {
        let handler = '';
        for (let key in this.config) {
          let item = this.config[key];
          if (item) {
            if (Array.isArray(item)) {
              item.length > 0 && (handler = key + 'Handler');
            } else if (JSON.stringify(item) != '{}') {
              handler = key + 'Handler';
            }
          }
        }
        return handler;
      };
    }
  },
  watch: {}
};
</script>
