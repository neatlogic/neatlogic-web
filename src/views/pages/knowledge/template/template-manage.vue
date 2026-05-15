<template>
  <div class="template-manage">
    <TsContain border="border">
      <template slot="topLeft">
        <span class="tsfont-plus text-action" @click="toEditPage('add')">{{ $t('page.template') }}</span>
      </template>
      <template slot="topRight">
        <InputSearcher
          v-model="searchParams.keyword"
          :placeholder="$t('form.placeholder.name')"
          @change="search()"
        ></InputSearcher>
      </template>
      <template slot="content">
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <div class="card-container">
          <TsCard
            v-bind="cardConfig"
            headerPosition="right"
            :boxShadow="false"
            :fixBtn="true"
            :padding="false"
            @updatePage="currentPage=>search({currentPage})"
            @updateSize="pageSize=>search({pageSize})"
            @action="action"
          >
            <template v-slot:default="{row}">
              <div class="switch">
                <TsFormSwitch v-model="row.isActive" @on-change="updateStatus(row)"></TsFormSwitch>
              </div>
              <div class="card-body" @click="toEditPage('edit', row)">
                <div class="name pb-sm text-action">{{ row.name }}</div>
                <div class="text-tip">
                  <UserCard v-bind="row.lcuVo" hideAvatar></UserCard>
                  <span>{{ $t('page.whenandwhattodo',{time:$utils.getDateByFormat(row.lcd),target: row.actionType}) }}</span>
                </div>
              </div>
            </template>
          </TsCard>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'TemplateManage',
  components: {
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  data() {
    return {
      isLoading: false,
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
      }
    };
  },
  created() {
    this.search();
  },
  methods: {
    restoreHistory(historyData) {
      if (historyData['searchParams']) {
        Object.assign(this.searchParams, historyData['searchParams']);
      }
    },
    search(params = {}) {
      this.isLoading = true;
      this.searchParams = { ...this.searchParams, currentPage: 1, ...params };
      this.$addHistoryData('searchParams', this.searchParams);
      this.$api.knowledge.template.searchTemplate(this.searchParams).then((res) => {
        if (res.Status === 'OK') {
          const { templateList: cardList, rowNum, currentPage, pageSize, pageCount } = res.Return;
          this.cardConfig = { cardList, rowNum, currentPage, pageSize, pageCount };
          this.cardConfig.cardList.map(v => {
            v.btnList = [
              {name: this.$t('page.copy'), value: 'copy', icon: 'tsfont-copy', type: 'text'},
              {name: this.$t('page.delete'), value: 'del', type: 'del', icon: 'tsfont-trash-o'}
            ];
          });
          this.isLoading = false;
        }
      });
    },
    updateStatus(row) {
      const params = {
        id: row.id,
        isActive: row.isActive
      };
      this.$api.knowledge.template.updateStatusTemplate(params).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          row.isActive = row.isActive === 0 ? 1 : 0;
        }
      });
    },
    action(row, value) {
      if (value == 'del') {
        this.deleteTemplate(row);
      } else if (value == 'copy') {
        this.toEditPage(value, row);
      }
    },
    deleteTemplate({ name, id }) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          if (vnode.okBtnDisable) {
            return;
          }
          vnode.okBtnDisable = true;
          const params = { id };
          this.$api.knowledge.template.deleteTemplate(params).then((res) => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.search();
            }
          }).finally(res => {
            vnode.okBtnDisable = false;
          });
        }
      });
    },
    toEditPage(type, data = {}) {
      const query = {};
      if (data.id) {
        query.id = data.id;
      }
      if (type) {
        query.operation = type;
      }
      this.$router.push({
        name: 'template-edit',
        query
      });
    }
  }
};
</script>
<style lang='less' scoped>
.template-manage {
  .card-container {
    .switch{
        position: absolute;
        right: 10px;
        top: 16px;
      }
    .action-item {
      width: 100%;
    }
  }
}
</style>
