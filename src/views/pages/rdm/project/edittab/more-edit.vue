<template>
  <div>
    <Button type="error" @click="deleteProject">{{ $t('dialog.title.deletetarget', {target: $t('term.rdm.project')}) }}</Button>
    <div class="text-grey mt-md">{{ $t('term.rdm.deleteprojectdesc') }}</div>
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
          content: this.$t('term.rdm.deletecurrentprojectdesc'),
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
