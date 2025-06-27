
<template>
  <div class="runner-manage">
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span class="text-action tsfont-plus mr-md" @click="addRunner">
          {{ $t('term.deploy.actuator') }}
        </span>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="keyword"
            :placeholder="$t('term.framework.nameandip')"
            @change="getTableList"
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsTable
            :theadList="theadList"
            v-bind="tableSetting"
            @changeCurrent="changeCurrent"
            @headerTitleOperation="headerTitleOperation"
            @changePageSize="changePageSize"
          >
            <template slot="name" slot-scope="{ row }">
              <span v-if="row && row.name" class="text-href" @click="editRunner(row)">{{ row.name }}</span>
            </template>
            <template slot="usedCount" slot-scope="{ row }">
              <ReferenceSelect
                :isTable="true"
                :dataList="row.runnerGroupVoList"
                :isUrl="false"
                textName="name"
                valueName="id"
                jumpPath="/framework.html#/tagent-add?id="
                :referenceCount="row.usedCount"
              ></ReferenceSelect>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-trash-o" @click="delRunner(row)">{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
            <template v-slot:status="{ row }">
              <span v-if="row.status == 'connected'" class="green">
                <Tooltip
                  v-if="row.infoObj"
                  transfer
                  placement="bottom-start"
                >
                  <span class="green cursor">{{ $t('term.framework.connected') }}</span>
                  <div slot="content" style="width:300px">
                    <Row>
                      <Col span="8" class="text-right"> {{ $t('page.updatetime') }}：</Col>
                      <Col span="16">{{ $utils.getDateByFormat(row.statusLcd) }}</Col>
                    </Row>
                    <Row>
                      <Col span="8" class="text-right"> {{ $t('page.tagentregistercount') }}：</Col>
                      <Col span="16">{{ row.infoObj.tagentRegisterCount }}</Col>
                    </Row>
                  </div>
                </Tooltip>
                <span v-else class="green">
                  {{ $t('term.framework.connected') }}
                </span>
              </span>
              <span v-else>
                <Tooltip
                  v-if="row.disConnectReason"
                  :content="row.disConnectReason"
                  :max-width="300"
                  transfer
                  placement="bottom-start"
                >
                  <span class="red cursor">{{ $t('term.framework.notconnected') }}</span>
                </Tooltip>
                <span v-else class="red">
                  {{ $t('term.framework.notconnected') }}
                </span>
              </span>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
    <RunnerEditDialog
      v-if="isShowRunnerEditDialog"
      :runnerData="runnerData"
      @close="closeAddRunner"
    ></RunnerEditDialog>
  </div>
</template>
<script>
export default {
  name: 'RunnerManage', // runner管理
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue'),
    RunnerEditDialog: () => import('./runner-edit-dialog.vue')
  },
  filters: {},
  props: {},
  data() {
    return {
      isShowRunnerEditDialog: false, // 是否显示编辑
      keyword: '',
      runnerData: {},
      theadList: [
        {
          title: '#',
          key: 'id'
        },
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.status'),
          key: 'status',
          headerIcon: 'tsfont-refresh'
        },
        {
          title: 'IP',
          key: 'host'
        },
        {
          title: this.$t('page.protocol'),
          key: 'protocol'
        },
        {
          title: this.$t('term.deploy.commandport'),
          key: 'port'
        },
        {
          title: this.$t('term.deploy.heartbeatport'),
          key: 'nettyPort'
        },
        {
          title: this.$t('term.framework.associationgroup'),
          key: 'usedCount'
        },
        {
          key: 'action'
        }
      ],
      tableSetting: {
        tbodyList: []
      },
      searchParams: {
        currentPage: 1,
        pageSize: 20
      }
    };
  },
  beforeCreate() {},
  created() {
    let route = this.$route;
    if (route && route.query && route.query['type'] == 'add') {
      this.isShowRunnerEditDialog = true;
    }
    this.getTableList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.clearTimmer();
  },
  destroyed() {},
  methods: {
    closeAddRunner(needRefresh) {
      this.isShowRunnerEditDialog = false;
      if (needRefresh) {
        this.getTableList();
      }
    },
    addRunner() {
      this.runnerData = {};
      this.isShowRunnerEditDialog = true;
    },
    editRunner(row) {
      this.runnerData = row;
      this.isShowRunnerEditDialog = true;
    },
    delRunner(row) {
      if (row && !this.$utils.isEmptyObj(row)) {
        this.$createDialog({
          title: this.$t('page.warning'),
          content: `${this.$t('term.framework.deleteconfirm')}Runner<span style="color: red">${row.name}</span>?`,
          btnType: 'error',
          'on-ok': vnode => {
            vnode.isShow = false;
            this.$api.framework.runner.deleteRunner(row.id).then((res) => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.getTableList();
              }
            });
          }
        });
      }
    },
    changeCurrent(currentPage) {
      this.searchParams.currentPage = currentPage;
      this.getTableList();
    },
    changePageSize(pageSize) {
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = pageSize;
      this.getTableList();
    },
    getTableList() {
      // 获取列表数据
      let params = {
        keyword: this.keyword,
        currentPage: this.searchParams.currentPage,
        pageSize: this.searchParams.pageSize
      };
      this.$api.framework.runner.getRunner(params)
        .then(res => {
          if (res.Status == 'OK') {
            Object.assign(this.tableSetting, res.Return);
            this.refreshTbodyList();
          }
        });
    },
    getRunnerStatus(item) {
      return this.$api.framework.runner.getRunnerStatus({id: item.id}).then((res) => {
        if (res.Status == 'OK') {
          if (!this.$utils.isEmpty(res.Return)) {
            this.$set(item, 'status', res.Return.status);
            this.$set(item, 'statusLcd', res.Return.statusLcd);
            this.$set(item, 'statusText', res.Return.statusText);
          }
        }
      });
    },
    clearTimmer() {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
    },
    refreshTbodyList(isRefresh) {
      this.clearTimmer();
      if (!this.$utils.isEmpty(this.tableSetting.tbodyList)) {
        let promiseArr = [];
        promiseArr = this.tableSetting.tbodyList.map(item => {
          return this.getRunnerStatus(item);
        });
        Promise.all(promiseArr).then(() => {
          if (isRefresh) {
            this.$Message.success(this.$t('message.refreshsuccess'));
          }
          this.timmer = setTimeout(() => {
            this.refreshTbodyList();
          }, 10000);
        });
      }
    },
    headerTitleOperation() {
      this.refreshTbodyList(true);
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
</style>
