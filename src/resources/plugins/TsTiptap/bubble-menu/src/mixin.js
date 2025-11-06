export default {
  inject: ['menuState'],
  computed: {
    editorData() {
      return this.menuState.editorData;
    }
  }
};
