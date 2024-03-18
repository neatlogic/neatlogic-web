
<template>
  <div class="runner-manage">
    <div class="flex-between mb-sm">
      <div class="action-group">
        <span class="action-item tsfont-plus" @click="toAddRunner">{{ $t('dialog.title.createtarget', {target: 'Runner'}) }}</span>
        <span class="action-item tsfont-refresh" @click="getTableList">{{ $t('page.refresh') }}</span>
      </div>
      <InputSearcher
        v-model="keyword"
        @change="getTableList"
      ></InputSearcher>
    </div>
    <div>
      <Loading
        :loadingShow="loadingShow"
        type="fix"
      ></Loading>
      <TsTable
        :theadList="theadList"
        v-bind="tableSetting"
        @getSelected="getSelected"
        @operation="operation"
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
      >
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
      </TsTable>
    </div>
  </div>
</template>
<script>
export default {
  name: 'RunnerRelateComponent', // runner管理
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve)
  },
  filters: {},
  props: {
    groupId: {
      type: [Number, String]
    }
  },
  data() {
    return {
      isShowSelection: true,
      loadingShow: false,
      keyword: '',
      theadList: [
        {
          key: 'selection',
          multiple: true
        },
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
          key: 'action', 
          title: '', 
          type: 'action',
          operations: [
            {
              name: this.$t('page.delete'),
              icon: 'tsfont-trash-s',
              type: 'text',
              action: 'del'
            }
          ] 
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
    operation(view, row) {
      if (view == 'del' && row) {
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
    getSelected(id, row) {
      this.$emit('input', row);
    },
    getTableList() {
      // 获取列表数据
      let params = {
        groupId: this.groupId ? this.groupId : null,
        isFilterGroup: this.groupId ? 1 : null,
        keyword: this.keyword,
        currentPage: this.searchParams.currentPage,
        pageSize: this.searchParams.pageSize
      };
      this.loadingShow = true;
      this.$api.framework.runner.getRunner(params)
        .then(res => {
          if (res.Status == 'OK') {
            Object.assign(this.tableSetting, res.Return);
          }
        }).finally(() => {
          this.loadingShow = false;
        });
    },
    toAddRunner() {
      // 新建runner
      window.open(HOME + '/framework.html#/runner-manage?type=add', '_blank');
    },
    changeCurrent(currentPage) {
      this.searchParams.currentPage = currentPage;
      this.getTableList();
    },
    changePageSize(pageSize) {
      this.searchParams.currentPage = currentPage;
      this.searchParams.pageSize = pageSize;
      this.getTableList();
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped></style>
