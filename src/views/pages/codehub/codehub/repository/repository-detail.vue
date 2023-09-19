<template>
  <div>
    <TsContain v-if="reposData">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back('/repository-overview')">{{ $getFromPage($t('router.codehub.repository')) }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ reposData.name ||'-' }}</span>
        <Tooltip
          v-if="showtips(reposData)"
          class="pl-sm"
          theme="light"
          max-width="300"
        >
          <div>{{ getAbbrNameAndName(reposData) }}</div>
          <div slot="content">
            <div>{{ getAbbrNameAndName(reposData) }}</div>
          </div>
        </Tooltip>
        <div v-else>{{ getAbbrNameAndName(reposData) }}</div>
      </template>
      <template v-slot:topRight>
        <div v-if="!isLoad" class="action-group">
          <div v-if="reposData.agentName" class="action-item"><span class="text-tip">{{ $t('page.node') }}</span><span>{{ reposData.agentName||'-' }}</span>
            <span
              class="text-action tsfont-refresh ml-xs"
              :title="$t('page.switchnode')"
              @click.stop="updateNode(reposData)"
            ></span>
          </div>
          <div class="action-item tsfont-attachment" @click="copyWorkingPath(reposData)">{{ $t('term.codehub.copyworkingcopyroute') }}</div>
          <div v-clipboard="reposData.repositoryServiceVo.address+reposData.address" v-clipboard:success="copySuccess" class="action-item tsfont-attachment">{{ $t('term.codehub.copyurladdress') }}</div>
          <div :class="showSync?'':'disable'" class="action-item tsfont-refresh" @click="syncRepository(reposData.id)">{{ $t('page.synchronous') }}</div>
        </div>
      </template>
      <div slot="content">
        <Loading v-if="isLoad || isLoadBranch" loadingShow style="height:120px"></Loading>
        <div v-else>
          <Tabs v-model="activetab" :animated="false">
            <TabPane
              v-for="(tab,tabindex) in tabList"
              :key="tabindex"
              :label="tab.text"
              :name="tab.name"
            >
              <div
                :is="tab.name"
                v-if="activetab == tab.name"
                :id="id"
                :reposData="reposData"
              ></div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </TsContain>
    <Loading v-else type="fix" loadingShow></Loading>
    <RepositorySyncDialog
      v-if="isShowSyncDialog"
      :id="repositoryId"
      @close="closeSyncDialog"
    ></RepositorySyncDialog>
  </div>
</template>

<script>
import tabs from './detail';
import clipboard from '@/resources/directives/clipboard.js';
import repositorymixin from './repositorymixin.js';
export default {
  name: '',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    RepositorySyncDialog: resolve => require(['./edit/repository-sync-dialog.vue'], resolve),
    ...tabs
  },
  directives: {clipboard},
  mixins: [repositorymixin],
  props: [''],
  data() {
    return {
      isLoad: false, //仓库数据是否加载中
      isLoadBranch: false, //分支标签数据是否加载中
      isShowSyncDialog: false,
      tabList: [{
        name: 'action',
        text: this.$t('page.activity')
      }, {
        name: 'commit',
        text: this.$t('page.submit')
      }, {
        name: 'branch',
        text: this.$t('page.branch')
      }, {
        name: 'tag',
        text: this.$t('page.tag')
      }, {
        name: 'file',
        text: this.$t('page.browse')
      }],
      activetab: 'action',
      id: null,
      repositoryId: null,
      reposData: null,
      showSync: true//是否显示同步按钮
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.$route.query.id) {
      this.id = Number(this.$route.query.id);
    }
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      if (this.id) {
        this.getDetail(this.id);
      } else {
        this.reposData = null;
      }
    },
    syncRepository(id) {
      this.isShowSyncDialog = true;
      if (id) {
        this.repositoryId = id;
      }
    },
    closeSyncDialog() {
      this.isShowSyncDialog = false;
      this.repositoryId = null;
    },
    getDetail(id) {
      let param = {};
      if (id) {
        Object.assign(param, {id: id, getDelegation: true});
      }
      this.isLoad = true;
      this.$api.codehub.repository.getDetail(param).then((res) => {
        if (res && res.Status == 'OK') {
          this.reposData = res.Return;
          if (this.reposData.type != 'svn' || this.reposData.delegation) {
            this.tabList.push({
              name: 'setting',
              text: this.$t('page.setting')
            });
          }
        } else {
          this.reposData = null;
        }
      }).finally(() => {
        this.isLoad = false;
      });
    },
    copySuccess() {
      this.$Message.success(this.$t('message.copysuccess'));
      this.isLoad = false;
    }
  },
  filter: {},
  computed: {
    getAbbrNameAndName() {
      // 获取系统和模块的简称(名称)
      return function(config) {
        let text = '';
        if (this.$utils.getAbbrNameAndName(config.appSystemVo)) {
          if (this.$utils.getAbbrNameAndName(config.appModuleVo)) {
            text = this.$utils.getAbbrNameAndName(config.appSystemVo) + '/' + this.$utils.getAbbrNameAndName(config.appModuleVo);
          } else {
            text = this.$utils.getAbbrNameAndName(config.appSystemVo);
          }
        } else if (this.$utils.getAbbrNameAndName(config.appModuleVo)) {
          text = this.$utils.getAbbrNameAndName(config.appModuleVo);
        }
        return text;
      };
    },
    showtips() {
      return function(config) {
        let isshow = false;
        if ((config.appSystemVo && config.appSystemVo.abbrName) || (config.appModuleVo && config.appModuleVo.name)) {
          isshow = true;
        }
        return isshow;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
