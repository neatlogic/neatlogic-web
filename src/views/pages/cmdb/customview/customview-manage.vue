<template>
  <div>
    <TsContain border="none">
      <template slot="topLeft">
        <Dropdown placement="bottom-start">
          <a href="javascript:void(0)" class="text-action tsfont-plus">
            {{ $t('term.cmdb.view') }}
            <Icon type="ios-arrow-down"></Icon>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="addCustomView">{{ $t('term.cmdb.publicdataview') }}</DropdownItem>
            <DropdownItem @click.native="addGraph">{{ $t('term.cmdb.publicsceneview') }}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </template>
      <template slot="topRight">
        <InputSearcher v-model="keyword" @change="doSearch"></InputSearcher>
      </template>
      <div slot="content" ref="maintable">
        <Tabs v-model="currentTab">
          <TabPane :label="$t('term.cmdb.dataview')" name="data">
            <TsTable
              v-if="customViewData"
              v-bind="customViewData"
              :theadList="theadList"
              @changeCurrent="changeCustomViewPage"
              @changePageSize="changeCustomViewPageSize"
            >
              <template slot="name" slot-scope="{ row }">
                <a href="javascript:void(0)" @click="toCustomViewDetail(row.id)">{{ row.name }}</a>
              </template>
              <template slot="tag" slot-scope="{ row }">
                <div v-if="row.tagList && row.tagList.length > 0">
                  <Tag v-for="(tag, index) in row.tagList" :key="index">
                    {{ tag.name }}
                  </Tag>
                </div>
              </template>
              <template slot="isActive" slot-scope="{ row }">
                <span v-if="row.isActive == 1" class="text-success">{{ $t('page.yes') }}</span>
                <span v-else class="text-grey">{{ $t('page.no') }}</span>
              </template>
              <template slot="fcd" slot-scope="{ row }">
                {{ row.fcd | formatDate }}
              </template>
              <template slot="fcu" slot-scope="{ row }">
                <UserCard :uuid="row.fcu"></UserCard>
              </template>
              <template slot="lcd" slot-scope="{ row }">
                {{ row.lcd | formatDate }}
              </template>
              <template slot="lcu" slot-scope="{ row }">
                <UserCard v-if="row.lcu" :uuid="row.lcu"></UserCard>
              </template>
              <template slot="action" slot-scope="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li class="icon tsfont-edit" @click.stop="editCustomView(row)">{{ $t('page.edit') }}</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </TabPane>
          <TabPane :label="$t('term.cmdb.topoview')" name="topo">
            <TsTable
              v-if="graphData"
              :theadList="theadList"
              v-bind="graphData"
              @changeCurrent="changeGraphPage"
              @changePageSize="changeGraphPageSize"
            >
              <template slot="name" slot-scope="{ row }">
                <a href="javascript:void(0)" @click="toGraphDetail(row.id)">{{ row.name }}</a>
              </template>
              <template slot="isActive" slot-scope="{ row }">
                <span v-if="row.isActive == 1" class="text-success">{{ $t('page.yes') }}</span>
                <span v-else class="text-grey">{{ $t('page.no') }}</span>
              </template>
              <template slot="fcd" slot-scope="{ row }">
                {{ row.fcd | formatDate }}
              </template>
              <template slot="fcu" slot-scope="{ row }">
                <UserCard :uuid="row.fcu"></UserCard>
              </template>
              <template slot="lcd" slot-scope="{ row }">
                {{ row.lcd | formatDate }}
              </template>
              <template slot="lcu" slot-scope="{ row }">
                <UserCard v-if="row.lcu" :uuid="row.lcu"></UserCard>
              </template>
              <template slot="action" slot-scope="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li class="icon tsfont-edit" @click.stop="editGraph(row)">{{ $t('page.edit') }}</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </TabPane>
        </Tabs>
      </div>
    </TsContain>
  </div>
</template>
<script>
import UserCard from '@/resources/components/UserCard/UserCard.vue';

export default {
  name: '',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    UserCard
  },
  props: {},
  data() {
    return {
      currentTab: 'data',
      keyword: '',
      searchVal: {},
      searchConfig: {
        placeholder: this.$t('term.cmdb.viewname'),
        searchList: [
          {
            type: 'select',
            name: 'tagId',
            dataList: [],
            label: this.$t('page.tag'),
            search: true,
            dynamicUrl: '/api/rest/cmdb/tag/search',
            textName: 'name',
            valueName: 'id',
            transfer: true
          }
        ]
      },
      searchCustomViewParam: { currentPage: 1 },
      searchGraphParam: { currentPage: 1 },
      theadList: [
        { key: 'name', title: this.$t('page.name') },
        { key: 'isActive', title: this.$t('term.report.isactive') },
        { key: 'fcu', title: this.$t('page.creator') },
        { key: 'fcd', title: this.$t('page.createdate') },
        { key: 'lcu', title: this.$t('page.fcu') },
        { key: 'lcd', title: this.$t('page.lcu') },
        { key: 'action', title: '' }
      ],
      customViewData: {},
      graphData: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchCustomView();
    this.searchGraph();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    restoreHistory(historyData) {
      this.currentTab = historyData['tab'];
      console.log(this.currentTab);
    },
    doSearch() {
      if (this.currentTab === 'data') {
        this.searchCustomViewParam.keyword = this.keyword;
        this.searchCustomViewParam.currentPage = 1;
        this.searchCustomView();
      } else if (this.currentTab === 'topo') {
        this.searchGraphParam.keyword = this.keyword;
        this.searchGraphParam.currentPage = 1;
        this.searchGraph();
      }
    },
    toCustomViewDetail(id) {
      this.$router.push({ path: '/view-data/' + id });
    },
    addCustomView() {
      this.$router.push({ path: '/view-edit/public' });
    },
    toGraphDetail(id) {
      this.$router.push({ path: '/graph-data/' + id });
    },
    addGraph() {
      this.$router.push({ path: '/graph-edit/public' });
    },
    changeCustomViewPage(currentPage) {
      this.searchParam.currentPage = currentPage;
      this.searchCustomView();
    },
    changeCustomViewPageSize(pageSize) {
      this.searchCustomViewParam.currentPage = 1;
      this.searchCustomViewParam.pageSize = pageSize;
      this.searchCustomView();
    },
    searchCustomView() {
      this.$api.cmdb.customview.searchPublicCustomView(this.searchCustomViewParam).then(res => {
        this.customViewData = res.Return;
      });
    },
    changeGraphPage(currentPage) {
      this.searchGraphParam.currentPage = currentPage;
      this.searchGraph();
    },
    changeGraphPageSize(pageSize) {
      this.searchGraphParam.currentPage = 1;
      this.searchGraphParam.pageSize = pageSize;
      this.searchGraph();
    },
    searchGraph() {
      this.$api.cmdb.graph.searchGraph(this.searchGraphParam).then(res => {
        this.graphData = res.Return;
      });
    },
    editCustomView(customView) {
      this.$router.push({ path: '/view-edit/public/' + customView.id });
    },
    editGraph(graph) {
      this.$router.push({ path: '/graph-edit/public/' + graph.id });
    }
  },
  filter: {},
  computed: {},
  watch: {
    currentTab: {
      handler: function(val) {
        this.$addHistoryData('tab', val);
      }
    }
  }
};
</script>
<style lang="less"></style>
