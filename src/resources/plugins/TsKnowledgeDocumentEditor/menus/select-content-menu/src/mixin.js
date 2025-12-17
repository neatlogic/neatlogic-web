export default {
  inject: ['menuState'],
  props: {
    icon: {
      type: String,
      default: ''
    },
    iconSize: {
      type: Number,
      default: 14
    },
    tipContentList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    command: {
      type: String,
      default: ''
    },
    nodeConfig: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  computed: {
    editorData() {
      return this.menuState.editorData;
    },
    getActiveMenuClassName() {
      return (commandName) => {
        return this?.menuState?.editorData?.isActive(commandName) ? 'text-href' : '';
      };
    },
    iconStyle() {
      return {
        fontSize: `${this.iconSize}px`
      };
    }
  }
};
