<template>
  <div class="template-manage">
    <TsContain border="border">
      <template slot="topLeft">
        <span class="tsfont-plus text-action" @click="isDialogShow = true">{{ $t('page.template') }}</span>
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

    <!-- 添加对话框 -->
    <TsDialog :isShow.sync="isDialogShow" :title="$t('dialog.title.addtarget',{target:$t('page.template')})" @on-ok="add">
      <Tsform ref="form" :itemList="formItemConfig"></Tsform>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'TemplateManage',
  components: {
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    Tsform: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  data() {
    const _this = this;
    return {
      isLoading: false,
      isDialogShow: false,
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
          type: 'text',
          label: _this.$t('page.name'),
          maxlength: 50,
          width: '100%',
          validateList: ['required', 'name-special', {
            name: 'searchUrl', url: 'api/rest/knowledge/template/save'
          }]
        }
      }
    };
  },
  created() {
    this.search();
    if (this.$route.query.isnew) {
      this.isDialogShow = true;
    }
  },
  methods: {
    async search(params = {}) {
      this.isLoading = true;
      this.searchParams = { ...this.searchParams, currentPage: 1, ...params };
      const res = await this.$api.knowledge.template.search(this.searchParams);
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
    },
    async updateStatus(row) {
      const params = {
        id: row.id,
        isActive: row.isActive
      };
      try {
        const res = await this.$api.knowledge.template.updateStatus(params);
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      } catch (error) {
        row.isActive = row.isActive === 0 ? 1 : 0;
      }
    },
    action(row, value) {
      if (value == 'del') {
        this.deleteTemplate(row);
      } else if (value == 'copy') {
        this.toEditPage(value, row);
      }
    },
    async deleteTemplate({ name, id }) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': async vnode => {
          if (vnode.okBtnDisable) {
            return;
          }
          vnode.okBtnDisable = true;
          const params = { id };
          const res = await this.$api.knowledge.template.delete(params).finally(res => {
            vnode.okBtnDisable = false;
          });
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.search();
          }
        }
      });
    },
    add() {
      if (!this.$refs.form.valid()) return;
      const formData = this.$refs.form.getFormValue();
      this.toEditPage('add', formData);
    },
    toEditPage(operation, data) {
      this.$router.push({
        name: 'template-edit',
        query: { operation, id: data.id, name: data.name }
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
