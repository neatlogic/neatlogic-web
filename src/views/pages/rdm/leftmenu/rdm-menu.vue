<template>
  <div class="OverviewMenu menu_link">
    <div>
      <ul>
        <li class="link">
          <a class="tsfont-plus text-primary" @click="addProject"><span class="text-primary">项目</span></a>
        </li>
        <li
          v-for="project in projectList"
          :key="project.id"
          class="link"
          :class="{ active: $isMenuActive('/project-manage/' + project.id) }"
        >
          <a class="cursor">
            <div style="position:relative"><span
                                             class="tsfont-dot"
                                             :style="{ color: project.color }"
                                           ></span>
              <span @click="goTo('/project-detail/' + project.id)">{{ project.name }}</span>
              <div style="position:absolute;right:0px;top:0px" class="text-grey cursor tsfont-setting" @click="toProjectManage(project.id)"></div>
            </div>
          </a>
        </li>
      </ul>
    </div>
    <template v-if="dataList && dataList.length > 0">
      <div v-for="(menuGroup, index) in dataList" :key="index">
        <div class="title text-grey">
          {{ menuGroup.menuTypeName }}
        </div>
        <ul v-if="menuGroup.menuList && menuGroup.menuList.length > 0">
          <li
            v-for="menu in menuGroup.menuList"
            :key="menu.id"
            class="link"
            :class="{ active: $isMenuActive(menu.url) }"
            @click="goTo(menu.url)"
            @contextmenu="newTab($event, menu, menu.url ? menu.url : '/')"
          >
            <!-- <router-link :to="menu.url ? menu.url : '/'" :class="menu.icon" @click.native="goTo()">{{ menu.name }}</router-link> -->
            <a class="cursor" :class="menu.icon">{{ menu.name }}</a>
          </li>
        </ul>
      </div>
    </template>
    <ProjectEditDialog v-if="isProjectDialogShow" @close="closeProjectDialog"></ProjectEditDialog>
    <ProjectManageDialog v-if="isProjectManageDialogShow" :projectId="currentEditProjectId" @close="closeProjectManageDialog"></ProjectManageDialog>
  </div>
</template>
<script>
import LeftMenu from '@/views/components/leftmenu/leftmenu';

export default {
  name: 'RdmMenu',
  components: {
    ProjectEditDialog: resolve => require(['@/views/pages/rdm/project/edittab/project-edit-dialog.vue'], resolve),
    ProjectManageDialog: resolve => require(['@/views/pages/rdm/project/project-manage-dialog.vue'], resolve)
  },
  extends: LeftMenu,
  data: function() {
    return {
      isProjectDialogShow: false,
      isProjectManageDialogShow: false,
      currentEditProjectId: null,
      projectList: [],
      searchParam: {}
    };
  },
  created() {
    this.searchProject();
  },
  mounted() {},
  methods: {
    toProjectManage(projectId) {
      this.currentEditProjectId = projectId;
      this.isProjectManageDialogShow = true;
    },
    closeProjectManageDialog() {
      this.currentEditProjectId = null;
      this.isProjectManageDialogShow = false;
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
  computed: {
    dataList() {
      return this.$store.state.topMenu.dynamicMenu.rdm;
    }
  },
  watch: {
    '$store.state.leftMenu.rdmProjectCount'(newvalue) {
      this.searchProject();
    }
  }
};
</script>
<style lang="less" scoped>

.OverviewMenu {
  padding-top: 8px;
}
</style>
