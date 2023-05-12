<template>
  <div class="event-solution-manage">
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="add">{{ $t('term.process.solution') }}</span>
      </template>
      <template slot="topRight">
        <InputSearcher v-model="searchParams.keyword" @change="search()"></InputSearcher>
      </template>
      <template slot="content">
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <div class="solution-card-container">
          <TsCard
            v-bind="cardConfig"
            headerPosition="right"
            :boxShadow="false"
            :fixBtn="true"
            :padding="false"
            @updatePage="currentPage => search({ currentPage })"
            @updateSize="pageSize => search({ pageSize })"
            @action="action"
          >
            <template v-slot:header="{ row }">
              <TsFormSwitch v-model="row.isActive" @on-change="updateStatus(row)"></TsFormSwitch>
            </template>
            <template v-slot:default="{ row }">
              <div class="card-body" @click="toEditPage({ id: row.id, operation: 'edit' })">
                <div class="name overflow pb-sm text-action" :title="row.name">{{ row.name }}</div>
                <div v-if="row.content" class="text-grey overflow">{{ delHtmlTag(row.content) }}</div>
              </div>
            </template>
            <template v-slot:control="{ row }">
              <div class="tsfont-copy" @click="toEditPage({ id: row.id, operation: 'copy' })">{{ $t('page.copy') }}</div>
              <div class="tsfont-trash-o" @click="deleteSolution(row)">{{ $t('page.delete') }}</div>
            </template>
          </TsCard>
        </div>
      </template>
    </TsContain>

    <!-- 添加对话框 -->
    <TsDialog :isShow.sync="isDialogShow" :title="$t('term.process.solution')" @on-ok="confirmAdd">
      <Tsform ref="form" :itemList="formItemConfig"></Tsform>
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: 'EventSolutionManage',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    Tsform: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
    //UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  data() {
    const vm = this;
    return {
      isLoading: false,
      isDialogShow: false,
      name: null,
      searchParams: {
        keyword: '',
        currentPage: 1,
        pageSize: 24
      },
      cardConfig: {
        cardList: [],
        rowNum: 0,
        currentPage: 1,
        pageSize: 20,
        pageCount: 1
      },
      formItemConfig: {
        name: {
          name: 'name',
          type: 'text',
          label: this.$t('page.name'),
          value: null,
          width: '100%',
          maxlength: 50,
          validateList: [
            'required',
            'name-special',
            {
              name: 'searchUrl',
              url: 'api/rest/event/solution/save'
            }
          ],
          onChange(value) {
            vm.name = value;
          }
        }
      },
      deleting: false
    };
  },
  created() {
    this.search();
  },
  methods: {
    search(params = {}) {
      this.isLoading = true;
      this.searchParams = { ...this.searchParams, currentPage: 1, ...params };
      this.$addHistoryData('keyword', this.searchParams.keyword);
      this.$addHistoryData('currentPage', this.searchParams.currentPage);
      this.$api.process.eventSolution
        .search(this.searchParams)
        .then(res => {
          if (res.Status === 'OK') {
            const { solutionList: cardList, rowNum, currentPage, pageSize, pageCount } = res.Return;
            this.cardConfig = { cardList, rowNum, currentPage, pageSize, pageCount };
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    add(params) {
      this.isDialogShow = true;
      this.name = null;
    },
    confirmAdd() {
      if (this.$refs.form.valid()) {
        this.$router.push({
          name: 'event-solution-edit',
          query: {
            operation: 'add',
            name: this.name
          }
        });
      }
    },
    action(row, value) {
      if (value == 'del') {
        this.deleteSolution(row);
      } else if (value == 'copy') {
        this.toEditPage({ id: row.id, operation: 'copy' });
      }
    },
    updateStatus(row) {
      let params = {
        id: row.id,
        isActive: row.isActive
      };
      this.$api.process.eventSolution
        .updateStatus(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
          }
        })
        .catch(error => {
          row.isActive = row.isActive === 0 ? 1 : 0;
        });
    },
    toEditPage({ id, operation }) {
      this.$router.push({
        name: 'event-solution-edit',
        query: {
          operation,
          id
        }
      });
    },
    deleteSolution({ name, id }) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          if (!this.deleting) {
            const params = { id };
            this.deleting = true;
            this.$api.process.eventSolution
              .delete(params)
              .then(res => {
                this.deleting = false;
                if (res.Status === 'OK') {
                  this.$Message.success(this.$t('message.deletesuccess'));
                  vnode.isShow = false;
                  this.search();
                }
              })
              .catch(error => {
                this.deleting = false;
              });
          }
        }
      });
    },
    restoreHistory(historyData) {
      this.searchParams.keyword = historyData['keyword'] || '';
      this.searchParams.currentPage = historyData['currentPage'] || 1;
    }
  },
  computed: {
    delHtmlTag() {
      return (val) => {
        return val.replace(/<[^>]+>/g, '');
      };
    }
  }

};
</script>

<style lang="less" scoped>
/deep/.tscard-header {
  right: 10px !important;
  opacity: 1 !important;
}
.event-solution-manage {
  font-size: 13px;
  .solution-card-container {
    .card-body {
      cursor: pointer;
      .name {
        padding-right: 24px;
      }
    }
    .action-item {
      width: 100%;
    }
  }
}
</style>
