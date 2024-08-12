<template>
  <div class="menu_link">
    <div :class="{ grid: pageCount > 1 }">
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
          <a
            class="cursor tsfont-blocks"
            :style="{ color: project.color }"
            style="position: relative"
            @click="goTo('/project/' + project.id)"
          >
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
      <div v-if="pageCount > 1" style="margin-top: 44px;">
        <VerticalPager
          :currentPage="searchParam.currentPage"
          :pageCount="pageCount"
          @change="
            page => {
              handlePageSize(page);
            }
          "
        ></VerticalPager>
      </div>
    </div>
    <ProjectEditDialog v-if="isProjectDialogShow" @close="closeProjectDialog"></ProjectEditDialog>
  </div>
</template>
<script>
export default {
  name: 'RdmMenu',
  components: {
    ProjectEditDialog: () => import('@/views/pages/rdm/project/project-add-dialog.vue'),
    VerticalPager: () => import('@/resources/plugins/VerticalPager/vertical-pager.vue')
  },
  data: function() {
    return {
      isProjectDialogShow: false,
      projectList: [],
      pageCount: 0,
      searchParam: { isMine: 1, isClose: 0, currentPage: 1, pageSize: 10}
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
      this.$route.meta.clearHistory = true; // 激活清理历史标记
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
    handlePageSize(currentPage) {
      this.searchParam.currentPage = currentPage;
      this.searchParam.pageSize = 10;
      this.searchProject();
    },
    searchProject() {
      this.$api.rdm.project.searchProject(this.searchParam).then(res => {
        let {pageCount = 0, tbodyList = []} = res.Return || {};
        this.projectList = tbodyList;
        this.pageCount = pageCount;
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
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 23px;
}
</style>
