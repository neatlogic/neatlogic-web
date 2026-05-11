<template>
  <div class="menu_link rdm-menu-box">
    <div :class="{ grid: pageCount > 1 }">
      <ul>
        <li class="link">
          <a class="tsfont-plus text-primary" @click="addProject">
            <span class="text-primary">{{ $t('page.project') }}</span>
          </a>
        </li>
        <li
          v-for="project in projectList"
          :key="project.id"
          class="link rdm-menu-link"
          :class="{ active: $isMenuActive('/project/' + project.id) || $isMenuActive('/project-edit/' + project.id) }"
        >
          <a
            class="cursor tsfont-blocks rdm-menu-a"
            :style="{ color: project.color }"
            @click="goTo('/project/' + project.id)"
          >
            <span class="project-name overflow">{{ project.name }}</span>
            <div
              v-if="project.isOwner || project.isLeader"
              class="text-grey cursor tsfont-setting rdm-menu-setting-icon"
              @click.stop="goTo('/project-edit/' + project.id)"
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
import LeftMenuMixin from '@/views/components/leftmenu/leftmenu-mixin';
export default {
  name: 'RdmMenu',
  components: {
    ProjectEditDialog: () => import('@/views/pages/rdm/project/project-add-dialog.vue'),
    VerticalPager: () => import('@/resources/plugins/VerticalPager/vertical-pager.vue')
  },
  mixins: [LeftMenuMixin],
  data() {
    return {
      isProjectDialogShow: false,
      projectList: [],
      pageCount: 0,
      searchParam: { isMine: 1, isClose: 0, currentPage: 1, pageSize: 10 }
    };
  },
  created() {
    this.searchProject();
  },
  mounted() {},
  methods: {
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
        let { pageCount = 0, tbodyList = [] } = res.Return || {};
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
.rdm-menu-box {
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 23px;
    > ul {
      min-width: 0;
    }
    .rdm-menu-link {
      padding: 0 0 0 6px !important;
    }
    .rdm-menu-a {
      position: relative;
      width: 100%;
      padding-right: 0px !important;
    }
    .rdm-menu-setting-icon {
      right: 4px;
    }
    .project-name {
      max-width: calc(100% - 44px);
    }
  }
  .project-name {
    display: inline-block;
    max-width: calc(100% - 35px);
  }
  .rdm-menu-setting-icon {
    position: absolute;
    right: 12px;
    top: 0px;
  }
}
</style>
