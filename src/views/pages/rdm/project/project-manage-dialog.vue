<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <Tabs v-model="currentTab">
        <TabPane label="基本信息" name="basic" class="pl-md">
          <ProjectEdit v-if="currentTab === 'basic'" :id="projectId"></ProjectEdit>
        </TabPane>
        <TabPane label="字段定义" name="attr" class="pl-md">
          <AttrEdit v-if="currentTab === 'attr'" :projectId="projectId"></AttrEdit>
        </TabPane>
        <TabPane label="项目状态" name="projectstatus" class="pl-md">
          <ProjectStatus v-if="currentTab === 'projectstatus'" :projectId="projectId"></ProjectStatus>
        </TabPane>
        <TabPane label="对象状态" name="objectstatus" class="pl-md">
          <ObjectStatus v-if="currentTab === 'objectstatus'" :projectId="projectId"></ObjectStatus>
        </TabPane>
        <TabPane label="更多设置" name="more" class="pl-md">
          <MoreEdit v-if="currentTab === 'more'" :projectId="projectId" @close="close"></MoreEdit>
        </TabPane>
      </Tabs>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    ProjectEdit: resolve => require(['./edittab/project-edit.vue'], resolve),
    AttrEdit: resolve => require(['./edittab/attr-edit.vue'], resolve),
    MoreEdit: resolve => require(['./edittab/more-edit.vue'], resolve),
    ProjectStatus: resolve => require(['./edittab/project-status-edit.vue'], resolve),
    ObjectStatus: resolve => require(['./edittab/object-status-edit.vue'], resolve)
  },
  props: { projectId: { type: Number } },
  data() {
    return {
      dialogConfig: {
        type: 'slider',
        maskClose: true,
        isShow: true,
        width: 'huge',
        hasFooter: false
      },
      currentTab: 'basic'
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
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
