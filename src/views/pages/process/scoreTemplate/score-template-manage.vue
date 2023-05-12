<template>
  <div class="score-template-manage">
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="add">{{ $t('page.template') }}</span>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="searchParams.keyword"
            @change="search"
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <div>
          <TsTable
            class="table"
            :theadList="theadList"
            v-bind="tableConfig"
            @operation="operation"
            @changeCurrent="currentPage=>search({currentPage})"
            @changePageSize="pageSize=>search({pageSize})"
          >
            <template v-slot:action="{row}">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li>
                    <TsFromSwitch v-model="row.isActive" showStatus @on-change="updateStatus(row)"></TsFromSwitch>
                  </li>
                  <li :class="{'text-grey disable': row.processCount > 0}" @click="remove(row)"><span>{{ $t('page.delete') }}</span></li>
                  <li :class="{'text-grey disable': row.processCount == 0}" @click="listProcess(row)">
                    <span style="paddingRight: 4px">{{ $t('term.process.relprocess') }}</span>
                    <span v-if="row.processCount > 0" class="text-primary">{{ row.processCount }}</span>
                  </li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
    <ScoreTemplateDialog v-if="dialogConfig.visiable" v-bind.sync="dialogConfig"></ScoreTemplateDialog>
  </div>
</template>

<script>
export default {
  name: 'ScoreTemplateManage',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    TsFromSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch.vue'], resolve),
    ScoreTemplateDialog: resolve => require(['./score-template-manage-dialog'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  data() {
    return {
      isLoading: false,
      searchParams: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        {title: this.$t('page.name'), key: 'name', type: 'linktext', textValue: 'view'},
        {title: this.$t('term.process.scoringdimension'), key: 'dimensionNames'},
        {title: '', key: 'action'}
      ],
      tableConfig: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      },
      dialogConfig: {
        visiable: !!this.$route.query.visiable,
        operation: this.$route.query.operation, //add, edit, list
        id: parseInt(this.$route.query.id)
      }
    };
  },
  created() {
    this.search();
  },
  methods: {
    search(params = {}) {
      this.isLoading = true;
      this.searchParams = {...this.searchParams, currentPage: 1, ...params};
      this.$api.process.scoreTemplate
        .search(this.searchParams)
        .then(res => {
          if (res.Status === 'OK') {
            const {scoreTemplateList: tbodyList, rowNum, pageSize, currentPage} = res.Return;
            this.tableConfig = { tbodyList, rowNum, pageSize, currentPage };
            this.isLoading = false;
          }
        });
    },
    add() {
      this.dialogConfig = {
        visiable: true,
        operation: 'add',
        id: null
      };
    },
    edit({id}) {
      this.dialogConfig = {
        visiable: true,
        operation: 'edit',
        id
      };
    },
    listProcess(row) {
      if (row.processCount > 0) {
        this.dialogConfig = {
          visiable: true,
          operation: 'list',
          id: row.id,
          name: row.name
        };
      }
    },
    operation(row, view) {
      if (view == 'view') {
        this.edit(row);
      }
    },
    remove({id, name, processCount}) {
      if (processCount > 0) return;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          const params = { id };
          this.$api.process.scoreTemplate
            .delete(params)
            .then(res => {
              if (res.Status === 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.search();
              }
            });
        }
      });
    },
    updateStatus(row) {
      const params = {
        id: row.id,
        isActive: row.isActive
      };
      this.$api.process.scoreTemplate
        .updateStatus(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
          }
        })
        .catch(error => {
          row.isActive = (row.isActive === 1) ? 0 : 1;
        });
    }
  }
};
</script>

<style lang="less" scoped>
.score-template-manage {
  .disable {
    cursor: not-allowed;
  }
}
</style>
