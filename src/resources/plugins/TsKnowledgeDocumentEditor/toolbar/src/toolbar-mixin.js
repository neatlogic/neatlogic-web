export default {
  methods: {
    emitValue(menuName) {
      this.$emit('insert-menu-content', menuName);
    }
  }
};
