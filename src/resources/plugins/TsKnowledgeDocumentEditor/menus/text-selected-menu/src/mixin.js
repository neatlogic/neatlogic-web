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
    }
  }
};
