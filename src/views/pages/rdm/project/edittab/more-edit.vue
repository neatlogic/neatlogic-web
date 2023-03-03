<template>
  <div>
    <Button type="error" @click="deleteProject">删除项目</Button>
    <div class="text-grey">永久删除此项目，此操作不可恢复，请谨慎操作。</div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
   
  },
  props: { projectId: { type: Number }},
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    deleteProject() {
      if (this.projectId) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: '确认删除当前项目？此操作不可恢复，请谨慎操作。',
          btnType: 'error',
          'on-ok': vnode => {
            this.$api.rdm.project.deleteProjectById(this.projectId).then(res => {
              if (res.Status === 'OK') {
                // 刷新左侧菜单
                this.$store.commit('leftMenu/setRdmProjectCount', 'minus');
                vnode.isShow = false;
                this.$emit('close');
              }
            });
          }
        });
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
