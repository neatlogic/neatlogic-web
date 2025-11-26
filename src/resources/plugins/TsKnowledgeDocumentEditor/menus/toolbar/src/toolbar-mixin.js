export default {
  methods: {
    insertMenuContent(menuName) {
      this.$emit('insert-menu-content', menuName);
    }
  }
};
