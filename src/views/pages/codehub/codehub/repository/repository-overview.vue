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
          class="mr-xs"
          @change="() => changeCurrentPage(1)"
        ></CombineSearcher>
      </template>
      <div slot="content">
        <Loading v-if="isLoad" loadingShow type="fix"></Loading>
        <TsCard
          v-else
          v-bind="repositoryData"
          headerPosition="right"
          @updatePage="changeCurrentPage"
          @updateSize="changePageSize"
        >
          <template slot="header" slot-scope="{ row }">
            <div class="action-group" @click.stop>
              <div class="action-item ts-link" @click="copyWorkingPath(row)">{{ $t('term.codehub.copyworkingcopyroute') }}</div>
              <div v-clipboard="(row.repositoryServiceVo && row.repositoryServiceVo.address) + row.address" v-clipboard:success="copyok" class="action-item ts-link">{{ $t('term.codehub.copyurladdress') }}</div>
              <div class="action-item tsfont-refresh" @click="syncRepository(row.id)">{{ $t('page.synchronous') }}</div>
              <div v-if="row.canEdit" class="action-item tsfont-edit" @click="editRepository(row.id)">{{ $t('page.edit') }}</div>
              <div v-if="row.canEdit" class="action-item tsfont-trash-o" @click="deleteRepository(row.id)">{{ $t('page.delete') }}</div>
            </div>
          </template>
          <template slot-scope="{ row }">
            <div class="padding-sm cursor-pointer" @click="gotoDetail(row.id)">
              <TsRow>
                <Col span="8">
                  {{ row.name }}
                </Col>
                <Col span="8">
                  <span :class="row.repositoryServiceVo && getClassName[row.repositoryServiceVo.type]" class="h2">
                  </span>
                  <span>
                    {{ row.repositoryServiceVo ? setServetxt(row.repositoryServiceVo.type) : '-' }}
                  </span>
                </Col>
              </TsRow>
              <TsRow>
                <Col span="8">
                  <div>
                    <Tooltip placement="top">
                      <div>{{ $utils.getAbbrNameAndName(row.appSystemVo) }}</div>
                      <div slot="content">
                        {{ $utils.getAbbrNameAndName(row.appModuleVo) }}
                      </div>
                    </Tooltip>
                  </div>
                </Col>
                <Col span="8">
                  <div v-if="row.runnerName" class="nodename-item">
                    <span class="text-tip">{{ $t('page.node') }}</span>
                    <span>{{ row.runnerName || '-' }}</span>
                    <span class="text-action ts-refresh icon-refresh" :title="$t('page.switchnode')" @click.stop="updateNode(row)"></span>
                  </div>
                </Col>
                <Col span="8">
                  <div class="flex-align">
                    <span>
                      {{ $t('term.codehub.recentlyupdate') }}：
                      <UserCard
                        v-if="row.lcu"
                        :uuid="row.lcu"
                        :hideAvatar="true"
                      ></UserCard>
                    </span>
                    <span class="text-tip pl-sm">{{ row.lcd | formatDate }}</span>
                  </div>
                </Col>
              </TsRow>
            </div>
          </template>
        </TsCard>
      </div>
    </TsContain>
    <RepositoryEditDialog
      v-if="isShowRepositoryEditDialog"
      :id="repositoryId"
      @close="close"
    ></RepositoryEditDialog>
    <RepositorySyncDialog
      v-if="isShowRepositorySyncDialog"
      :id="repositoryId"
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
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    RepositoryEditDialog: resolve => require(['./edit/repository-edit-dialog.vue'], resolve),
    RepositorySyncDialog: resolve => require(['./edit/repository-sync-dialog.vue'], resolve)
  },
  directives: { clipboard },
  mixins: [repositorymixin],
  props: [''],
  data() {
    return {
      getClassName: {
        //不同类型映射的名字
        gitlab: 'tsfont-gitlab text-danger',
        svn: 'tsfont-svn text-info'
      },
      isLoad: true,
      isShowRepositoryEditDialog: false,
      isShowRepositorySyncDialog: false,
      repositoryId: null,
      repositoryData: {
        //卡片的数据
        span: 24,
        sm: 24,
        md: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        keyName: 'id',
        classKey: 'syncStatus',
        classname: 'repository-list',
        padding: false,
        boxShadow: false,
        hasHoverShadow: true,
        cardList: [],
        pageType: 'number',
        currentPage: 1,
        pageSize: 10,
        rowNum: 0
      },
      typeList: [
        { text: this.$t('page.allofthem'), value: '' },
        { text: 'GITLAB', value: 'gitlab' },
        { text: 'SVN', value: 'svn' }
      ],
      searchVal: {},
      searchConfig: {
        search: true,
        searchList: [
          {
            type: 'select',
            name: 'appSystemId',
            value: '',
            label: this.$t('page.system'),
            transfer: true,
            dynamicUrl: '/api/rest/codehub/appsystem/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            onChange: (appSystemId) => {
              this.updateSubsystem(appSystemId);
            }
          },
          {
            type: 'select',
            name: 'appModuleId',
            value: '',
            label: this.$t('page.subsystem'),
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id'
          },
          {
            type: 'select',
            name: 'type',
            value: '',
            label: this.$t('page.type'),
            dataList: [],
            search: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'repoServiceId',
            value: '',
            dynamicUrl: '/api/rest/codehub/repositoryservice/search',
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            label: this.$t('term.process.catalog'),
            placeholder: this.$t('form.placeholder.pleaseselect', {'target': this.$t('term.process.catalog')}),
            transfer: true
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    this.searchConfig && this.searchConfig.searchList.forEach((item) => {
      if (item && item.name == 'type') {
        item.dataList = this.typeList;
      }
    });
    this.searchList();
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
    changeCurrentPage(currentPage) {
      this.repositoryData.currentPage = currentPage;
      this.searchList();
    },
    changePageSize(pageSize) {
      this.repositoryData.currentPage = 1;
      this.repositoryData.pageSize = pageSize;
      this.searchList();
    },
    searchList(flushParam) {
      let param = {};
      if (flushParam) {
        param = flushParam;
      }
      if (this.$route.query.serveid) {
        param.repoServiceId = this.$route.query.serveid;
      }
      let searchParams = this.$utils.deepClone(this.searchVal);
      if (!this.$utils.isEmpty(searchParams)) {
        param.repositoryServiceVo = {type: searchParams.type};
        delete searchParams.type;
      }
      this.$api.codehub.repository.getList({...param, ...searchParams}).then(res => {
        this.isLoad = false;
        let list = (res && res.Status == 'OK' && res.Return.tbodyList) || [];
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
          this.$set(this.repositoryData, 'pageCount', res.Return.pageCount);
          this.$set(this.repositoryData, 'rowNum', res.Return.rowNum);
          this.$set(this.repositoryData, 'pageSize', res.Return.pageSize);
          this.$set(this.repositoryData, 'currentPage', res.Return.currentPage);
          // this.searchTime && clearTimeout(this.searchTime);
          // this.searchTime = setTimeout(() => {
          //   this.searchList(param);
          // }, 10 * 1000);
        }
        this.$set(this.repositoryData, 'cardList', list);
      }).finally(() => {
        this.isLoad = false;
      });
    },
    editRepository(id) {
      this.repositoryId = id || null;
      this.isShowRepositoryEditDialog = true;
    },
    deleteRepository(id) {
      let param = { id: id };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.deploy.warehouse')}),
        'on-ok': (vnode) => {
          this.$api.codehub.repository.delete(param).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchList();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    syncRepository(id) {
      this.isShowRepositorySyncDialog = true;
      if (id) {
        this.repositoryId = id;
      }
    },
    close(isreload) {
      this.isShowRepositorySyncDialog = false;
      this.isShowRepositoryEditDialog = false;
      this.repositoryId = null;
      if (isreload) {
        this.searchList();
      }
    },
    gotoDetail(id) {
      this.$router.push({
        path: '/repository-detail',
        query: {
          id: id
        }
      });
    },
    updateSubsystem(appSystemId) {
      // 更新子系统条件
      if (appSystemId) {
        this.searchConfig.searchList.forEach((item) => {
          if (item && item.name == 'appModuleId') {
            item.params = { appSystemId: appSystemId };
            item.dynamicUrl = '/api/rest/codehub/appmodule/search';
          }
        });
      } else {
        this.searchConfig.searchList.forEach((item) => {
          if (item && item.name == 'appModuleId') {
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
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.flex-align {
  display: flex;
  align-items: center;
}
/deep/ .card-li {
  .repository-list {
    border-left: 3px solid @default-primary-color;
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
