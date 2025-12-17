<template>
  <div ref="bubbleMenuRef" class="bubble-menu bg-op border-base">
    <component
      :is="getComponentName(nodeName)"
      :nodeConfig="nodeConfig"
      @executeEditorCommand="handleCommand"
    />
  </div>
</template>
<script>
import MenuComponent from './src/index.js';
export default {
  name: '',
  components: {
    ...MenuComponent
  },
  props: {
    nodeName: {
      type: String,
      default: 'text'
    },
    nodeConfig: {
      type: Object,
      default: () => ({})
    }
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
  methods: {
    handleCommand(menuDataConfig) {
      this.$emit('executeEditorCommand', menuDataConfig);
    }
  },
  filter: {},
  computed: {
    getComponentName() {
      return (type) => {
        if (type === 'ImageView') {
          return 'ImageMenu';
        } else if (type === 'table') {
          return 'TableMenu';
        } else {
          return 'TextMenu';
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
.bubble-menu {
  position: absolute; /* 关键 */
  display: flex;
  align-items: center;
  gap: 15px;
  border-radius: 6px;
  padding: 10px 16px;
  z-index: 100;
  span {
    cursor: pointer;
  } 
}
</style>
