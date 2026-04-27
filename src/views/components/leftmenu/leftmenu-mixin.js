export default {
  computed: {
    currentModuleItem() {
      let moduleList = this.$store.state.topMenu.moduleList;
      let findItem = moduleList.find(item => item.moduleId === MODULEID);
      return findItem || {};
    }
  },
  methods: {
    canClick() {
      let { isDisabled = false, disabledReason = '' } = this.currentModuleItem || {};
      if (isDisabled) {
        this.$Notice.error({
          title: this.$t('page.licenseexception'),
          desc: disabledReason
        });
        return false;
      }
      return true;
    },
    newTab(e, menu, path) {
      if (!this.canClick()) {
        return false;
      }
      let base = this.$router.options.base;
      let replaceStr = `<a href="${base}#${path}" class="cursor ${menu.icon}">${menu.name}</a>`;
      e.currentTarget.innerHTML = replaceStr;
    },
    goTo(path) {
      if (!this.canClick()) {
        return false;
      }
      this.$route.meta.clearHistory = true;
      this.$router.push({ path: path });
    }
  }
};
