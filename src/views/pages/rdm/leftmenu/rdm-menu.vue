<template>
  <div class="menu_link">
    <div>
      <ul>
        <li class="link">
          <a class="tsfont-plus text-primary" @click="addProject">
            <span class="text-primary">{{ $t('term.rdm.project') }}</span>
          </a>
        </li>
        <li
          v-for="project in projectList"
          :key="project.id"
          class="link"
          :class="{ active: $isMenuActive('/project/' + project.id) || $isMenuActive('/project-edit/' + project.id) }"
        >
          <a class="cursor tsfont-blocks" style="position: relative" @click="goTo('/project/' + project.id)">
            <span>{{ project.name }}</span>
            <div
              v-if="project.isOwner || project.isLeader"
              style="position: absolute; right: 0px; top: 0px"
              class="text-grey cursor tsfont-setting"
              @click.stop="toProjectManage(project.id)"
            ></div>
          </a>
        </li>
      </ul>
    </div>
    <ProjectEditDialog v-if="isProjectDialogShow" @close="closeProjectDialog"></ProjectEditDialog>
  </div>
</template>
<script>
export default {
  name: 'RdmMenu',
  components: {
    ProjectEditDialog: resolve => require(['@/views/pages/rdm/project/project-add-dialog.vue'], resolve)
  },
  data: function() {
    return {
      isProjectDialogShow: false,
      projectList: [],
      searchParam: { isMine: 1 }
    };
  },
  created() {
    this.searchProject();
  },
  mounted() {},
  methods: {
    goTo(path) {
      //从左侧菜单点链接，激活清理历史标记
      this.$route.meta.clearHistory = true;
      this.$router.push({ path: path });
    },
    toProjectManage(projectId) {
      this.$router.push({ path: '/project-edit/' + projectId });
    },
    addProject() {
      this.isProjectDialogShow = true;
    },
    closeProjectDialog(needRefresh) {
      this.isProjectDialogShow = false;
      if (needRefresh) {
        this.searchProject();
      }
    },
    searchProject() {
      this.$api.rdm.project.searchProject(this.searchParam).then(res => {
        this.projectList = res.Return.tbodyList;
      });
    }
  },
  computed: {},
  watch: {
    '$store.state.leftMenu.rdmProjectCount'(newvalue) {
      this.searchProject();
    }
  }
};
</script>
<style lang="less" scoped></style>
