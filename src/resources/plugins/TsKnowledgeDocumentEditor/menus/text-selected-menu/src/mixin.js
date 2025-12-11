export default {
  inject: ['menuState'],
  props: {
    icon: {
      type: String,
      default: ''
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
    }
  }
};
