<template>
  <div>
    <Tooltip content="链接" placement="top" :transfer="true">
      <span class="tsfont-inlink cursor-pointer" @click.stop="openDialog"></span>
    </Tooltip>
    <EditLinkDialog v-if="isShowDialog" @close="closeDialog"></EditLinkDialog>
  </div>
</template>
<script>
import toolBarMixin from '@/resources/plugins/TsTiptap/toolbar/src/toolbar-mixin.js';
export default {
  name: '',
  components: {
    EditLinkDialog: () => import('@/resources/plugins/TsTiptap/toolbar/src/link/edit-link-dialog.vue')
  },
  mixins: [toolBarMixin],
  props: {},
  data() {
    return {
      isShowDialog: false
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
    openDialog() {
      this.isShowDialog = true;
    },
    closeDialog(menuData) {
      this.isShowDialog = false;
      if (menuData) {
        this.emitValue(menuData);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
