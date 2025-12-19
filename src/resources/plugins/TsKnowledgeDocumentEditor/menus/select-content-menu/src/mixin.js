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
      return this.menuState?.editorData;
    },
    isCommandActive() {
      return (commandName, attrs) => {
        if (typeof commandName == 'object') {
          return this?.editorData?.isActive?.(commandName);
        }
        return this?.editorData?.isActive?.(commandName, attrs);
      };
    },
    activeMenuClassName() {
      return (commandName) => {
        return this?.isCommandActive(commandName) ? 'text-href' : '';
      };
    },
    iconStyle() {
      return {
        fontSize: `${this.iconSize}px`
      };
    }
  }
};
