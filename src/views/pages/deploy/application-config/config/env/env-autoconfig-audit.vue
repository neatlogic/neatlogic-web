<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <TsTable
        v-bind="outerTableConfig"
        :theadList="outerTheadList"
        :fixedHeader="false"
        canExpand
        class="inner-table"
        :defaultShowSize="10"
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
      >
        <template v-slot:expand="{ row }">
          <TsTable
            :theadList="interTheadList"
            :tbodyList="row.table.tbodyList"
            :fixedHeader="false"
            multiple
            @getSelected="getSelect"
          >
          </TsTable>
        </template>
      </TsTable>
    </TsDialog>
  </div>
</template>
<script>

export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    instanceId: {
      type: [String, Number]
    },
    params: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      dialogConfig: {
        type: 'slider',
        isShow: true,
        okText: this.$t('回退'),
        width: 'large',
        title: this.$t('审计')
      },
      outerTableConfig: null,
      outerTheadList: [
        {
          title: '修改者',
          key: 'fcuName'
        },
        {
          title: '修改时间',
          key: 'fcd',
          type: 'time'
        }
      ],
      interTheadList: [
        {
          key: 'selection'
        },
        {
          title: '变量名',
          key: 'key'
        },
        {
          title: '修改前类型',
          key: 'beforeTypeText'
        },
        {
          title: '修改前值',
          key: 'beforeValue'
        },
        {
          title: '修改后类型',
          key: 'afterTypeText'
        },
        {
          title: '修改后值',
          key: 'afterValue'
        }
      ],
      currentPage: 1,
      pageSize: 10,
      select: null
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    this.getAuditList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getAuditList() {
      let data = {
        appSystemId: this.params.appSystemId,
        appModuleId: this.params.appModuleId,
        envId: this.params.envId,
        instanceId: this.instanceId,
        currentPage: this.currentPage,
        pageSize: this.pageSize
      };
      this.$api.deploy.applicationConfig.getEnvAutoConfigAuditList(data).then((res) => {
        if (res && res.Status == 'OK') {
          this.outerTableConfig = res.Return;
        }
      });
    },
    okDialog() {
      let selectdRowUuidList = [];
      if (this.outerTableConfig) {
        let outerTbodyList = this.outerTableConfig.tbodyList;
        if (outerTbodyList && outerTbodyList.length > 0) {
          outerTbodyList.forEach((outerRow) => {
            let interTbodyList = outerRow.table.tbodyList;
            if (interTbodyList && interTbodyList.length > 0) {
              interTbodyList.forEach((interRow) => {
                if (interRow._selected == true) {
                  selectdRowUuidList.push(interRow.uuid);
                }
              });
            }
          });
        }
      }
      if (selectdRowUuidList.length > 0) {
        let data = {
          appSystemId: this.params.appSystemId,
          appModuleId: this.params.appModuleId,
          envId: this.params.envId,
          instanceId: this.instanceId,
          uuidList: selectdRowUuidList
        };
        this.$api.deploy.applicationConfig.fallbackEnvAutoConfig(data).then((res) => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.closeDialog(true);
          }
        });
      } else {
        this.closeDialog(false);
      }
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    changeCurrent(currentPage) {
      this.currentPage = currentPage;
      this.getAuditList();
    },
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.getAuditList();
    },
    getSelect(li, selection) {
      this.select = selection;
    }
  },
  filter: {},
  computed: {
    // hasSelected() {
    //   console.log('hasSelected');
    //   if (this.outerTableConfig) {
    //     let outerTbodyList = this.outerTableConfig.tbodyList;
    //     if (outerTbodyList && outerTbodyList.length > 0) {
    //       outerTbodyList.forEach((outerRow) => {
    //         let interTbodyList = outerRow.table.tbodyList;
    //         if (interTbodyList && interTbodyList.length > 0) {
    //           interTbodyList.forEach((interRow) => {
    //             if (interRow.selectd == true) {
    //               return true;
    //             }
    //           });
    //         }
    //       });
    //     }
    //   }
    //   return false;
    // }
  },
  watch: {
    // hasSelected2() {
    //   console.log('hasSelected2');
    //   if (this.outerTableConfig) {
    //     let outerTbodyList = this.outerTableConfig.tbodyList;
    //     if (outerTbodyList && outerTbodyList.length > 0) {
    //       outerTbodyList.forEach((outerRow) => {
    //         let interTbodyList = outerRow.table.tbodyList;
    //         if (interTbodyList && interTbodyList.length > 0) {
    //           interTbodyList.forEach((interRow) => {
    //             if (interRow.selectd == true) {
    //               return true;
    //             }
    //           });
    //         }
    //       });
    //     }
    //   }
    //   return false;
    // }
  }
};
</script>
<style lang="less">
</style>
