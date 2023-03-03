<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <ProjectEdit :id="id" ref="projectEdit" mode="dialog"></ProjectEdit>
    </template>
    <template v-slot:footer>
      <Button @click="close()">取消</Button>
      <Button type="primary" @click="save()">确定</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    ProjectEdit: resolve => require(['./project-edit.vue'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        title: !this.id ? '创建项目' : '编辑项目',
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
    getProjectById() {

    },
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
