<template>
  <TsContain :enableCollapse="true">
    <template v-slot:navigation>
      <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
    </template>
    <template v-slot:topLeft></template>
    <template v-slot:sider>
      <div style="height:calc(100vh - 205px)" class="pr-md">
        <div class="text-title padding-xs">{{ $t('term.rdm.projectsets') }}</div>
        <ul>
          <li class="text-default overflow radius-sm cursor padding-xs" :class="{ 'bg-selected': currentTab === 'projectinfo' }" @click="currentTab = 'projectinfo'">
            <span>{{ $t('page.basicinfo') }}</span>
          </li>
          <li class="text-default overflow radius-sm cursor padding-xs" :class="{ 'bg-selected': currentTab === 'projectstatus' }" @click="currentTab = 'projectstatus'">
            <span>{{ $t('term.rdm.statussets') }}</span>
          </li>
        </ul>
        <div class="text-title padding-xs">{{ $t('term.rdm.appsets') }}</div>
        <ul>
          <li
            v-for="item in objectList"
            :key="item.id"
            class="text-default overflow radius-sm padding-xs cursor"
            :title="item.name"
            :class="{ 'bg-selected': currentTab === 'object_' + item.name }"
            @click="
              currentTab = 'object_' + item.name;
              appId = null;
              $nextTick(()=>{
                appId = item.id;
              });
            "
          >
            <span class="tsfont-block">{{ item.name }}</span>
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
      <div v-else-if="currentTab.startsWith('object_') && appId"><AppEdit :projectId="projectId" :appId="appId"></AppEdit></div>
      <div v-else-if="currentTab === 'others'">
        <MoreEdit :projectId="projectId" @close="close"></MoreEdit>
      </div>
    </template>
  </TsContain>
</template>

<script>
export default {
  name: '',
  components: {
    ProjectEdit: resolve => require(['./edittab/project-edit.vue'], resolve),
    AppEdit: resolve => require(['./edittab/app-edit.vue'], resolve),
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
      objectList: [],
      appId: null,
      currentTab: 'projectinfo'
    };
  },
  beforeCreate() {},
  created() {
    this.projectId = Math.floor(this.$route.params['projectId']);
    this.getAppByProjectId();
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
    getAppByProjectId() {
      if (this.projectId) {
        this.$api.rdm.project.getAppByProjectId(this.projectId).then(res => {
          this.objectList = res.Return;
        });
      }
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
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
