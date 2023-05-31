<template>
  <div>
    <TsContain v-if="reposData">
      <template slot="top">
        <div class="clearfix">
          <div class="ts-angle-left d_f cursor-pointer" @click="gotoList">{{ $t('term.codehub.repositorylist') }}</div>
          <div class="d_f top-title">
            <h3 class="title">{{ reposData.name||'-' }}</h3>
            <div class="text-tip desc">
              <Tooltip v-if="showtips(reposData)" theme="light" max-width="300">
                <div>{{ setTxt(reposData,'text') }}</div>
                <div slot="content">
                  <div>{{ setTxt(reposData,'tips') }}</div>
                </div>
              </Tooltip>
              <div v-else>{{ setTxt(reposData,'text') }}</div>
            </div>
          </div>
          <div v-if="!isLoad" class="action-group d_f_r">
            <div v-if="reposData.agentName" class="action-item"><span class="text-tip">{{ $t('page.node') }}</span><span>{{ reposData.agentName||'-' }}</span>
              <span
                class="text-action ts-refresh"
                style="margin-left:5px;"
                :title="$t('page.switchnode')"
                @click.stop="updateNode(reposData)"
              ></span>
            </div>
            <div class="action-item ts-link" @click="copyWorkingPath(reposData)">{{ $t('term.codehub.copyworkingcopyroute') }}</div>
            <div v-clipboard="reposData.repositoryServiceVo.address+reposData.address" v-clipboard:success="copyok" class="action-item ts-link">{{ $t('term.codehub.copyurladdress') }}</div>
            <div :class="showSync?'':'disable'" class="action-item ts-refresh" @click="syncRepository(reposData.uuid)">{{ $t('page.synchronous') }}</div>
          </div>
        </div>
      </template>
      <div slot="content">
        <Loading v-if="isLoad || isLoadBranch" loadingShow style="height:120px"></Loading>
        <div v-else style="padding:10px;">
          <Tabs v-model="activetab" :animated="animated">
            <TabPane
              v-for="(tab,tabindex) in tabList"
              :key="tabindex"
              :label="tab.text"
              :name="tab.name"
            >
              <div
                :is="tab.name"
                v-if="activetab == tab.name"
                :uuid="uuid"
                :reposData="reposData"
                @updateStatus="updateTabstatus"
              ></div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </TsContain>
    <Loading v-else type="fix" loadingShow></Loading>
    <RepositoryEditDialog
      v-if="isEdit && editType=='repository'"
      :uuid="editUuid"
      :isShow="isEdit"
      :serveList="serveList"
      @close="close"
    ></RepositoryEditDialog>
    <RepositorySyncDialog
      v-if="isEdit && editType=='sync'"
      :uuid="editUuid"
      :isShow="isEdit"
      @close="close"
    ></RepositorySyncDialog>
  </div>
</template>

<script>
import tabs from './detail';
import clipboard from '@/resources/directives/clipboard.js';
import NoData from '@/resources/components/nodata/NoData.vue';
import repositorymixin from './repositorymixin.js';
export default {
  name: '',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    RepositoryEditDialog: resolve => require(['./edit/repository-edit-dialog.vue'], resolve),
    RepositorySyncDialog: resolve => require(['./edit/repository-sync-dialog.vue'], resolve),
    NoData,
    ...tabs
  },
  directives: {clipboard},
  mixins: [repositorymixin],
  props: [''],
  data() {
    return {
      isLoad: false, //仓库数据是否加载中
      isLoadBranch: false, //分支标签数据是否加载中
      isEdit: false, //是否编辑
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
      uuid: null,
      editUuid: null,
      reposData: null,
      statusList: {
        'success': '#2ed373',
        'failed': '#e42332',
        'none': '#336eff'
      },
      serveList: [],
      animated: false,
      tabLoaded: false, //当前tab加载完成
      showSync: true//是否显示同步按钮
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.$route.query.uuid) {
      this.uuid = this.$route.query.uuid;
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editRepository() {
      this.isEdit = true;
      this.editUuid = this.$utils.deepClone(this.uuid);
    },
    deleteRepository() {
      //详情页删除当前仓库的功能已经去掉
      let param = { uuid: this.uuid };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.deploy.warehouse')}),
        btnType: 'error',
        'on-ok': function(vnode) {
          this.$api.codehub.repository.delete(param).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.gotoList();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    syncRepository(uuid) {
      this.editType = 'sync';
      this.isEdit = true;
      if (uuid) {
        this.editUuid = uuid;
      }
    },
    close() {
      this.isEdit = false;
      this.editUuid = null;
    },
    gotoList() {
      this.$router.push({
        path: '/repository-overview'
      });
    },
    getDetail(uuid) {
      let param = {};
      if (uuid) {
        Object.assign(param, {uuid: uuid, getDelegation: true});
      }
      this.isLoad = true;
      this.$api.codehub.repository.getDetail(param).then((res) => {
        this.isLoad = false;
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
      }).catch((error) => {
        this.isLoad = false;
      });
    },
    copyok() {
      this.$Message.success(this.$t('message.copysuccess'));
      this.isLoad = false;
    },
    updateTabstatus(status) {
      this.tabLoaded = !status;
    }
  },
  filter: {},
  computed: {
    setTxt() {
      return function(config, type) {
        let text = '';
        let prev = config.systemVo || '';
        let next = config.subSystemVo || '';
        if (prev) {
          text = prev.name + (prev.description ? ('(' + prev.description + ')') : '');
          if (next) {
            text += ' / ' + next.name + (next.description ? ('(' + next.description + ')') : '');
          }
        }
        return text;
      };
    },
    showtips() {
      return function(config) {
        let isshow = false;
        if ((config.systemVo && config.systemVo.description) || (config.subSystemVo && config.subSystemVo.description)) {
          isshow = true;
        }
        return isshow;
      };
    }
  },
  watch: {
    uuid: {
      handler: function(val) {
        if (val) {
          this.getDetail(val);
        } else {
          this.reposData = null;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.top-title {
  .title {
    line-height: 30px;
  }
  .desc {
    line-height: 20px;
  }
  padding-left: 20px;
  margin-left: 20px;
  border-left: 1px solid @default-border;
}
</style>
