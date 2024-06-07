
<template>
  <div class="runner-manage">
    <div class="flex-between mb-md">
      <div>
        <span class="text-action tsfont-plus mr-md" @click="addRunner">{{ $t('dialog.title.createtarget', {target: 'Runner'}) }}</span>
        <span class="tsfont-rotate-right text-action text" @click="refreshList">{{ $t('page.refresh') }}</span>
      </div>
      <InputSearcher
        v-model="inputSetting.value"
        v-bind="inputSetting"
        @change="getTableList(1,20)"
      ></InputSearcher>
    </div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <TsTable
      :theadList="theadList"
      v-bind="tableSetting"
      @getSelected="getSelected"
      @operation="operation"
      @changeCurrent="getTableList"
      @changePageSize="getTableList(1, ...arguments)"
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
</template>
<script>
export default {
  name: 'RelateRunnerList', // 关联runner列表
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue')
  },
  filters: {
  },
  props: {},
  data() {
    return {
      inputSetting: {
        placeholder: this.$t('term.framework.nameandip'),
        value: ''
      },
      loadingShow: false,
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
        tbodyList: [],
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
    addRunner() {
      // 新建runner
      window.open(HOME + '/framework.html#/runner-manage?type=add', '_blank');
    },
    refreshList() {
      this.getTableList();
    },
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
    getTableList(currentPage, pageSize) {
      // 获取列表数据
      let params = {
        groupId: null,
        isFilterGroup: null,
        keyword: this.inputSetting.value,
        needPage: false,
        currentPage: currentPage || this.tableSetting.currentPage,
        pageSize: pageSize || this.tableSetting.pageSize
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
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
</style>
