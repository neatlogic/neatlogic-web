<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <ProjectEdit :id="id" ref="projectEdit" mode="dialog"></ProjectEdit>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    ProjectEdit: () => import('@/views/pages/rdm/project/edittab/project-edit.vue')
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        title: !this.id ? this.$t('dialog.title.createtarget', {'target': this.$t('term.rdm.project')}) : this.$t('dialog.title.edittarget', {'target': this.$t('term.rdm.project')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      }
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
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs['projectEdit'];
      form.save(() => {
        this.close(true);
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
