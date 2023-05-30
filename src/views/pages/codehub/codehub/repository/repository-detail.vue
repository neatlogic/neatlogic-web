<template>
  <div>
    <TsContain v-if="reposData" class="bg-block">
      <template slot="top">
        <div class="clearfix">
          <div class="ts-angle-left d_f cursor-pointer" @click="gotoList">仓库列表</div>
          <div class="d_f top-title">
            <!-- <Badge :color="statusList[reposData.syncStatus]" /> -->
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
            <div v-if="reposData.agentName" class="action-item"><span class="text-tip">节点</span><span>{{ reposData.agentName||'-' }}</span>
              <span
                class="text-action ts-refresh"
                style="margin-left:5px;"
                title="切换节点"
                @click.stop="updateNode(reposData)"
              ></span>
            </div>
            <div class="action-item ts-link" @click="copyWorkingPath(reposData)">复制workingcopy路径</div>
            <div v-clipboard="reposData.repositoryServiceVo.address+reposData.address" v-clipboard:success="copyok" class="action-item ts-link">复制URL地址</div>
            <div :class="showSync?'':'disable'" class="action-item ts-refresh" @click="syncRepository(reposData.uuid)">同步</div>
            <!-- <div class="action-item text-action ts-edit" @click="editRepository">编辑</div>
            <div class="action-item text-action ts-trash" @click="deleteRepository">删除</div> -->
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
    //FormSelect,
    //FormInput
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
        text: '活动'
      }, {
        name: 'commit',
        text: '提交'
      }, {
        name: 'branch',
        text: '分支'
      }, {
        name: 'tag',
        text: '标签'
      }, {
        name: 'file',
        text: '浏览'
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

  created() {

  },

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
      let _this = this;
      let param = { uuid: this.uuid };
      _this.$createDialog({
        title: '删除确认',
        content: '是否确认删除该仓库',
        btnType: 'error',
        'on-ok': function(vnode) {
          _this.$api.codehub.repository.delete(param).then(res => {
            if (res && res.Status == 'OK') {
              _this.$Message.success('删除成功');
              _this.gotoList();
              vnode.isShow = false;
            } else {
              _this.$Message.error(res.Message);
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
              text: '设置'
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
      this.$Message.success('复制成功');
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
        // if (type == 'text') {
        //   text = (prev ? prev.name : '') + (next ? '/' + next.name : '');
        // } else if (type == 'tips') {
        //   text = (prev && prev.description ? prev.description : '') + (next && next.description ? '/' + next.description : '');
        // }
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
// .action-item {
//   width: 90px;
// }
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
