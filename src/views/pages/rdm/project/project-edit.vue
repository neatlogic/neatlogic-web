<template>
  <TsContain :enableCollapse="true">
    <template v-slot:navigation>
      <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
    </template>
    <template v-slot:topLeft></template>
    <template v-slot:sider>
      <div style="height: calc(100vh - 205px)" class="pr-md">
        <div class="text-title padding-xs">{{ $t('term.rdm.projectsets') }}</div>
        <ul>
          <li class="text-default overflow radius-sm cursor padding-xs" :class="{ 'bg-selected': currentTab === 'projectinfo' }" @click="currentTab = 'projectinfo'">
            <span>{{ $t('page.basicinfo') }}</span>
          </li>
          <li class="text-default overflow radius-sm cursor padding-xs" :class="{ 'bg-selected': currentTab === 'projectstatus' }" @click="currentTab = 'projectstatus'">
            <span>{{ $t('term.rdm.statussets') }}</span>
          </li>
        </ul>
        <div class="text-title padding-xs">
          <div>{{ $t('term.rdm.appsets') }}</div>
          <div class="fz10">拖动已激活应用进行排序</div>
        </div>
        <draggable
          v-if="selectedAppList && selectedAppList.length > 0"
          tag="ul"
          :list="selectedAppList"
          handle=".tsfont-drag"
          ghost-class="li-active"
          @end="dragEnd"
        >
          <li
            v-for="item in selectedAppList"
            :key="item.id"
            class="text-default overflow radius-sm padding-xs"
            style="position: relative"
            :title="item.name"
            :class="{ 'bg-selected': currentTab === 'app_' + item.name }"
            @click="
              currentTab = 'app_' + item.name;
              appId = null;
              $nextTick(() => {
                appId = item.id;
              });
            "
          >
            <span class="tsfont-drag" style="cursor: move"></span>
            <span class="cursor overflow" style="margin-right: 50px">{{ item.name }}</span>
            <span style="position: absolute; right: 0px">
              <Button size="small" @click.stop="unactiveApp(item.type)">{{ $t('page.disable') }}</Button>
            </span>
          </li>
        </draggable>
        <ul>
          <li
            v-for="(item, index) in unSelectedAppList"
            :key="index"
            style="position: relative"
            class="text-default overflow radius-sm padding-xs"
          >
            <span class="tsfont-fullscreen text-grey overflow" style="margin-right: 50px">{{ item.label }}</span>
            <span style="position: absolute; right: 0px">
              <Button type="success" size="small" @click.stop="activeApp(item.name)">{{ $t('page.enable') }}</Button>
            </span>
          </li>
        </ul>
        <div class="text-title padding-xs">{{ $t('page.others') }}</div>
        <ul>
          <li class="text-default overflow radius-sm cursor padding-xs" :class="{ 'bg-selected': currentTab === 'others' }" @click="currentTab = 'others'">
            <span>{{ $t('page.delete') }}</span>
          </li>
        </ul>
      </div>
    </template>
    <template v-slot:content>
      <div v-if="currentTab === 'projectinfo'"><ProjectEdit :id="projectId"></ProjectEdit></div>
      <div v-else-if="currentTab === 'projectstatus'"><ProjectStatus :projectId="projectId"></ProjectStatus></div>
      <div v-else-if="currentTab.startsWith('app_') && appId">
        <AppEditor :projectId="projectId" :appId="appId"></AppEditor>
      </div>
      <div v-else-if="currentTab === 'others'">
        <MoreEdit :projectId="projectId" @close="close"></MoreEdit>
      </div>
    </template>
  </TsContain>
</template>

<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    draggable,
    ProjectEdit: resolve => require(['./edittab/project-edit.vue'], resolve),
    AppEditor: resolve => require(['./edittab/app-editor.vue'], resolve),
    MoreEdit: resolve => require(['./edittab/more-edit.vue'], resolve),
    ProjectStatus: resolve => require(['./edittab/project-status-edit.vue'], resolve)
  },
  data() {
    return {
      projectId: null,
      dialogConfig: {
        type: 'slider',
        maskClose: true,
        isShow: true,
        width: 'huge',
        hasFooter: false
      },
      selectedAppList: [],
      appTypeList: [],
      appId: null,
      currentTab: 'projectinfo'
    };
  },
  beforeCreate() {},
  created() {
    this.projectId = Math.floor(this.$route.params['projectId']);
    this.getAppByProjectId();
    this.getAllAppTypeList();
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
    dragEnd() {
      this.$api.rdm.app
        .updateAppSort({
          projectId: this.projectId,
          appList: this.selectedAppList
        })
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.updatesuccess'));
          }
        });
    },
    unactiveApp(appType) {
      this.$api.rdm.app.unactiveApp(this.projectId, appType).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('page.unactivesuccess'));
          this.getAppByProjectId();
        }
      });
    },
    activeApp(appType) {
      this.$api.rdm.app.activeApp(this.projectId, appType).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('page.activesucess'));
          this.getAppByProjectId();
        }
      });
    },
    getAppByProjectId() {
      if (this.projectId) {
        this.$api.rdm.project.getAppByProjectId(this.projectId, { isActive: 1 }).then(res => {
          this.selectedAppList = res.Return;
        });
      }
    },
    getAllAppTypeList() {
      this.$api.rdm.app.getAllAppTypeList().then(res => {
        this.appTypeList = res.Return;
      });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    unSelectedAppList() {
      return this.appTypeList.filter(d => {
        return !this.selectedAppList.find(dd => d.name == dd.type);
      });
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.titlelistBox {
  margin-bottom: 14px;
}
.treeTitle {
  padding-left: 16px;
  font-size: 12px;
  margin-bottom: 4px;
}
.treeList {
  font-size: 13px;
  font-weight: 400;
  min-width: 130px;
  height: 32px;
  line-height: 32px;
  cursor: pointer;
  span {
    padding-left: 10px;
  }
}
// .bg-block {
//   border-radius: 6px;
// }
.tsbg-block {
  border-radius: 6px;
}
</style>
