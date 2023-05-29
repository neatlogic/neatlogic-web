<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="editRepository()">{{ $t('term.deploy.warehouse') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <CombineSearcher
          v-model="searchVal"
          v-bind="searchConfig"
          @change="getTableList(1)"
        ></CombineSearcher>
      </template>
      <div slot="content">
        <Loading v-if="isLoad" loadingShow style="min-height:100px"></Loading>
        <TsCard
          v-else
          v-bind="reposData"
          headerPosition="right"
          @updatePage="updatePage"
        >
          <template slot="header" slot-scope="{ row }">
            <div class="action-group">
              <div class="action-item text-action ts-link" @click="copyWorkingPath(row)">{{ $t('term.codehub.copyworkingcopyroute') }}</div>
              <div v-clipboard="row.repositoryServiceVo.address + row.address" v-clipboard:success="copyok" class="action-item text-action ts-link">{{ $t('term.codehub.copyurladdress') }}</div>
              <div class="action-item text-action ts-refresh" @click="syncRepository(row.uuid)">{{ $t('page.synchronous') }}</div>
              <div v-if="row.canEdit" class="action-item text-action ts-edit" @click="editRepository(row.uuid)">{{ $t('page.edit') }}</div>
              <div v-if="row.canEdit" class="action-item text-action ts-trash" @click="deleteRepository(row.uuid)">{{ $t('page.delete') }}</div>
            </div>
          </template>
          <template slot-scope="{ row }">
            <table class="table cursor-pointer" @click="gotoDetail(row.uuid)">
              <tbody>
                <tr>
                  <td>
                    <h4>{{ row.name }}</h4>
                  </td>
                  <td>
                    <div>
                      <span :class="imgsrc[row.repositoryServiceVo.type]" class="usercard-smallicon" style="width: 19px;vertical-align: middle;margin-right: 5px;"></span>
                      <span>{{ row.repositoryServiceVo ? setServetxt(row.repositoryServiceVo.type) : '-' }}</span>
                    </div>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td>
                    <Tooltip v-if="showtips(row)" theme="light" max-width="300">
                      <div>{{ setTxt(row, 'text') }}</div>
                      <div slot="content">
                        <div>{{ setTxt(row, 'tips') }}</div>
                      </div>
                    </Tooltip>
                    <div v-else>{{ setTxt(row, 'text') }}</div>
                  </td>
                  <td>
                    <div v-if="row.agentName" class="nodename-item">
                      <span class="text-tip">{{ $t('page.node') }}</span>
                      <span>{{ row.agentName || '-' }}</span>
                      <span class="text-action ts-refresh icon-refresh" :title="$t('page.switchnode')" @click.stop="updateNode(row)"></span>
                    </div>
                  </td>
                  <td class="text-right">
                    <span>{{ $t('term.codehub.recentlyupdate') }}：{{ row.lcu }}</span>
                    <span class="text-tip ml-10">{{ row.lcd | formatDate }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </TsCard>
      </div>
    </TsContain>
    <RepositoryEditDialog
      v-if="isShowRepositoryEditDialog"
      :uuid="editUuid"
      :systemUuid="search.systemUuid"
      :subsystemUuid="search.subsystemUuid"
      @close="close"
    ></RepositoryEditDialog>
    <RepositorySyncDialog
      v-if="isShowRepositorySyncDialog"
      :uuid="editUuid"
      @close="close"
    ></RepositorySyncDialog>
  </div>
</template>

<script>
import clipboard from '@/resources/directives/clipboard.js';
import repositorymixin from './repositorymixin.js';
export default {
  name: '',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    RepositoryEditDialog: resolve => require(['./edit/repository-edit-dialog.vue'], resolve),
    RepositorySyncDialog: resolve => require(['./edit/repository-sync-dialog.vue'], resolve)
  },
  directives: { clipboard },
  mixins: [repositorymixin],
  props: [''],
  data() {
    return {
      imgsrc: {
        //不同类型映射的名字
        gitlab: 'tsfont-gitlab',
        svn: 'tsfont-svn'
      },
      isLoad: true,
      isShowRepositoryEditDialog: false,
      isShowRepositorySyncDialog: false,
      editUuid: null, //编辑弹窗对应的仓库id
      search: {
        repositoryServiceVo: { type: '' },
        repoServiceUuid: '',
        keyword: '',
        systemUuid: '',
        subsystemUuid: ''
      },
      reposData: {
        //卡片的数据
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        keyName: 'uuid',
        classKey: 'syncStatus',
        classname: 'repository-list',
        cardList: []
      },
      typeList: [
        { text: this.$t('page.allofthem'), value: '' },
        { text: 'GITLAB', value: 'gitlab' },
        { text: 'SVN', value: 'svn' }
      ],
      serveList: [],
      subsystemConf: {
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        dataList: [],
        onChange: (val) => {
          this.getSearch('subsystemUuid', val);
        }
      },
      searchVal: {},
      searchConfig: {
        search: true,
        searchList: [
          {
            type: 'select',
            name: 'systemUuid',
            value: '',
            label: this.$t('page.system'),
            transfer: true,
            dynamicUrl: '/module/codehub/api/rest/system/search',
            rootName: 'list',
            textName: 'name',
            valueName: 'uuid',
            onChange: (systemUuid) => {
              this.updateSubsystem(systemUuid);
              this.getSearch('systemUuid', systemUuid);
            }
          },
          {
            type: 'select',
            name: 'subsystemUuid',
            value: '',
            label: this.$t('page.subsystem'),
            rootName: 'list',
            textName: 'name',
            valueName: 'uuid',
            onChange: (val) => {
              this.getSearch('subsystemUuid', val);
            }
          },
          {
            type: 'select',
            name: 'type',
            value: '',
            label: this.$t('page.type'),
            dataList: this.typeList,
            search: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'repoServiceUuid',
            value: '',
            label: this.$t('term.process.catalog'),
            placeholder: this.$t('form.placeholder.pleaseselect', {'target': this.$t('term.process.catalog')}),
            dataList: this.serveList,
            transfer: true
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getService();
    if (this.$route.query.serveuuid) {
      this.$set(this.search, 'repoServiceUuid', this.$route.query.serveuuid);
    }
    this.searchList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getService() {
      //获取服务下拉选项
      this.$api.codehub.service.getList({ needPage: false }).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this, 'serveList', res.Return.list);
        }
      });
    },
    getSearch(type, value) {
      //顶部搜索条件拼接
      if (type == 'repositoryServiceVo') {
        this.$set(this.search.repositoryServiceVo, 'type', value);
      } else {
        this.$set(this.search, type, value);
      }
      this.clearPage();
      this.searchList();
    },
    updatePage(page) {
      this.reposData.currentPage = page;
      this.searchList();
    },
    clearPage() {
      //搜索时重置分页等信息
      this.$set(this.reposData, 'currentPage', 1);
    },
    searchList(flushParam) {
      let param = {};
      if (flushParam) {
        param = flushParam;
      } else {
        this.reposData.pageSize && Object.assign(param, { pageSize: this.reposData.pageSize });
        this.reposData.currentPage && Object.assign(param, { currentPage: this.reposData.currentPage });
        if (this.search) {
          this.search.subsystemUuid && Object.assign(param, { subsystemUuid: this.search.subsystemUuid });
          this.search.systemUuid && Object.assign(param, { systemUuid: this.search.systemUuid });
          this.search.keyword && Object.assign(param, { keyword: this.search.keyword });
          this.search.repoServiceUuid && Object.assign(param, { repoServiceUuid: this.search.repoServiceUuid });
          this.search.repositoryServiceVo && this.search.repositoryServiceVo.type && Object.assign(param, { repositoryServiceVo: { type: this.search.repositoryServiceVo.type } });
        }
        this.isLoad = true;
      }
      this.$api.codehub.repository.getList(param).then(res => {
        this.isLoad = false;
        let list = (res && res.Status == 'OK' && res.Return.list) || [];
        if (list.length > 0) {
          list.forEach(li => {
            //如果同步时间到当前时间超过60min的状态为橙色（none是橙色）
            if (li.syncTime && li.syncStatus == 'success') {
              let lastTime = new Date().getTime() - li.syncTime;
              if (lastTime > 1000 * 60 * 60) {
                this.$set(li, 'syncStatus', 'none');
              }
            }
          });
          this.$set(this.reposData, 'pageCount', res.Return.pageCount);
          this.$set(this.reposData, 'rowNum', res.Return.rowNum);
          this.$set(this.reposData, 'pageSize', res.Return.pageSize);
          this.$set(this.reposData, 'currentPage', res.Return.currentPage);

          this.searchTime && clearTimeout(this.searchTime);
          this.searchTime = setTimeout(function() {
            this.searchList(param);
          }, 10000);
        }
        this.$set(this.reposData, 'cardList', list);
      }).finally(() => {
        this.isLoad = false;
      });
    },
    editRepository(uuid) {
      this.editUuid = uuid || '';
      this.isShowRepositoryEditDialog = true;
    },
    deleteRepository(uuid) {
      let param = { uuid: uuid };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.deploy.warehouse')}),
        btnType: 'confirm',
        'on-ok': function(vnode) {
          this.$api.codehub.repository.delete(param).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchList();
              vnode.isShow = false;
            } else {
              this.$Message.error(res.Message);
            }
          });
        }
      });
    },
    syncRepository(uuid) {
      this.isShowRepositorySyncDialog = true;
      if (uuid) {
        this.editUuid = uuid;
      }
    },
    close(isreload) {
      this.isShowRepositorySyncDialog = false;
      this.isShowRepositoryEditDialog = false;
      this.editUuid = null;
      if (isreload) {
        this.searchList();
      }
    },
    gotoDetail(uuid) {
      this.$router.push({
        path: '/repository-detail',
        query: {
          uuid: uuid
        }
      });
    },
    updateSubsystem(systemUuid) {
      // 更新子系统条件
      this.search.subsystemUuid = '';
      if (systemUuid) {
        this.searchConfig.searchList.forEach((item) => {
          if (item && item.name == 'subsystemUuid') {
            item.params = { systemId: val };
            item.dynamicUrl = '/api/rest/codehub/subsystem/search';
          }
        });
      } else {
        this.searchConfig.searchList.forEach((item) => {
          if (item && item.name == 'subsystemUuid') {
            item.params = {};
            item.dynamicUrl = '';
          }
        });
      }
    },
    copyok(val) {
      this.$Message.success(this.$t('message.copysuccess'));
    }
  },
  filter: {},
  computed: {
    showtips() {
      return function(config) {
        let isshow = false;
        if ((config.systemVo && config.systemVo.description) || (config.subSystemVo && config.subSystemVo.description)) {
          isshow = true;
        }
        return isshow;
      };
    },
    setServetxt() {
      return function(val) {
        let txt = '';
        this.typeList.forEach(types => {
          if (types.value == val) {
            txt = types.text;
          }
        });
        return txt;
      };
    },
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
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.text-label {
  line-height: 54px;
}
/deep/ .tscard-li {
  .repository-list {
    border-left: 3px solid @default-primary-color;
  }
  .tscard-body{
    table{
      table-layout: fixed;
    }
  }
  &.li-success {
    .repository-list {
      border-color: @default-success-color;
    }
  }
  &.li-failed {
    .repository-list {
      border-color: @default-error-color;
    }
  }
  &.li-none {
    .repository-list {
      border-color: @default-warning-color;
    }
  }
  .nodename-item {
    .icon-refresh {
      opacity: 0;
      margin-left: 5px;
    }
  }
  &:hover {
    .nodename-item {
      .icon-refresh {
        opacity: 1;
      }
    }
  }
}
</style>
