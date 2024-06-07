
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
          title: this.$t('term.deploy.connectionmode'),
          key: 'authType'
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
  beforeDestroy() {},
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
          }
        });
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
</style>
