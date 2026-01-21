<template>
  <div ref="bubbleMenuRef" class="selected-content-menu-wrapper bg-op border-base">
    <component
      :is="getComponentName(nodeName)"
      :nodeConfig="nodeConfig"
      :selectedText="selectedText"
      @emitMenuValue="handleCommand"
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
    },
    selectedText: {
      type: String,
      default: ''
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
      this.$emit('handleSelectMenuContent', menuDataConfig);
    }
  },
  filter: {},
  computed: {
    getComponentName() {
      return (type) => {
        if (type === 'image') {
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
.selected-content-menu-wrapper {
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
