<template>
  <div class="team-manage">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group toolbar-right">
          <span class="action-item tsfont-plus" @click="editTeam(true, 'teamTabs')">{{ $t('page.group') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <TsFormSelect
          ref="topRight"
          v-model.trim="keyword"
          v-bind="selectTreeSetting"
          @enter-search="searchkeyWord"
        >
          <template v-slot:option="{item}">
            <div class="flex-start team-manage-wrap">
              <div class="pr-md">{{ item.name }}</div>
              <div :title="item.upwardNamePath" class="overflow fz10 text-grey upward-name-path">{{ item.upwardNamePath }}</div>
            </div>
          </template>
        </TsFormSelect>
      </template>
      <div slot="content" class="dividing-color">
        <div class="card-wrapper">
          <div v-if="(!search && children.tbodyList && children.tbodyList.length > 0 ) || (search && searchList.length > 0)">
            <div class="card-top text-grey">
              <div class="title-block">{{ $t('term.framework.teamname') }}</div>
              <div class="cuont-block">{{ $t('term.framework.usercount') }}</div>
              <div class="btn-list title">{{ $t('page.action') }}</div>
            </div>
            <!-- start搜索时 -->
            <template v-if="search">
              <TeamTreeview :search="true" :children="searchList"></TeamTreeview>
            </template>
            <!-- end搜索时 -->
            <template v-else>
              <TeamTreeview :search="false" :children="children.tbodyList" @updateTeam="getTeamList"></TeamTreeview>
            </template>
          </div>
          <div v-else-if="!search">
            <NoData v-show="!loadingShow"></NoData>
          </div>
          <div v-if="search && searchList.length === 0">
            <NoData v-show="!loadingShow"></NoData>
          </div>
          <div v-if="!search && children.tbodyList && children.tbodyList.length > 0" class="page">
            <Page
              :current.sync="children.currentPage"
              :total="children.rowNum"
              :page-size="children.pageSize"
              size="small"
              transfer
              show-total
              show-sizer
              @on-change="changeCurrent"
              @on-page-size-change="changePageSize"
            />
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>

<script>
// import vuedraggable from "vuedraggable";
import TeamTreeview from './team/team-treeview';
export default {
  name: '',
  components: {
    // vuedraggable
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue'),
    TeamTreeview
  },
  props: [],
  data() {
    return {
      loadingShow: true,
      keyword: '',
      uuid: '', // 用于下榻页面搜索列表回显
      children: [],
      search: false,
      searchList: [],
      treeList: null,
      selectUuid: null,
      searchParams: {
        currentPage: 1,
        pageSize: 20
      },
      selectTreeSetting: {
        name: 'uuid',
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.group')}),
        search: true,
        multiple: false,
        width: '100%',
        dynamicUrl: '/api/rest/team/list/forselect',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'uuid',
        transfer: true,
        clear: true,
        border: 'border',
        onChange: (value) => {
          if (value) {
            this.selectUuid = value;
            this.showTreeList('uuid', value);
          } else {
            this.getTeamList();
          }
        },
        enterSearch: true
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.uuid) {
      // 处理搜索条件，下榻页面回显
      this.keyword = this.uuid;
      this.showTreeList('uuid', this.uuid);
    } else if (this.keyword) {
      // 处理搜索条件，下榻页面回显
      this.showTreeList('keyword', this.keyword);
    } else {
      this.getTeamList();
    }
  },
  beforeUpdate() {},
  updated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchkeyWord(value) {
      if (value) {
        this.showTreeList('keyword', value);
      } else {
        this.getTeamList();
      }
    },
    editTeam(isAdd, key, item) {
      //编辑、新建用户组
      let uuid = null;
      if (item) {
        uuid = item.uuid || null;
      }
      let obj = {
        uuid: uuid,
        isAdd: isAdd || null,
        key: key || null
      };
      this.$router.push({
        path: '/team-addview',
        query: obj
      });
    },
    getTeamList() {
      this.loadingShow = true;
      let data = {
        keyword: this.keyword,
        pageSize: this.searchParams.pageSize,
        currentPage: this.searchParams.currentPage
      };
      this.search = false;
      this.$addHistoryData('keyword', data.keyword);
      this.$addHistoryData('currentPage', data.currentPage);
      this.$addHistoryData('pageSize', data.pageSize);
      this.$api.framework.team
        .getTeamTreeList(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.children = res.Return;
            this.children.tbodyList.forEach(t => {
              if (!t.children) {
                t.children = [];
              }
            });
          }
        }).finally(() => {
          this.loadingShow = false;
        });
    },
    restoreHistory(historyData) {
      this.keyword = historyData['keyword'];
      this.uuid = historyData['uuid'];
      this.searchParams.currentPage = historyData['currentPage'];
      this.searchParams.pageSize = historyData['pageSize'];
    },
    showTreeList(name, value) {
      let params = {};
      params[name] = value;
      this.search = true;
      this.loadingShow = true;
      this.$addHistoryData([name], value);
      this.$api.framework.team
        .searchShowTree(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.searchList = res.Return.children || [];
          }
        }).finally(() => {
          this.loadingShow = false;
        });
    },
    changeCurrent(currentPage) {
      this.searchParams.currentPage = currentPage;
      this.getTeamList();
    },
    changePageSize(pageSize) {
      //改变页数
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = pageSize;
      this.getTeamList();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>

<style lang="less">
@import '~@/resources/assets/css/framework/manage.less';
.team-manage {
  .page {
    text-align: right;
  }
  .btn-list {
    &.title {
      padding-left: @space-md;
    }
  }
}
.team-manage-wrap {
  width: 100%;
  .pr-md {
    padding-right: 6px !important;
  }
  .upward-name-path {
    max-width: 315px;
  }
}
</style>
