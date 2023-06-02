<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="editServe()">{{ $t('term.process.catalog') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <TsRow>
          <Col :span="8">
            <TsFormSelect
              v-model="search.type"
              :dataList="typeList"
              :clearable="false"
              transfer
              :placeholder="$t('form.placeholder.pleaseselect',{target:$t('page.type')})"
              border="border"
              @on-change="() => getSearch('type', search.type)"
            ></TsFormSelect>
          </Col>
          <Col :span="16">
            <InputSearcher
              v-model="search.keyword"
              @change="() => getSearch('keyword', search.keyword)"
            ></InputSearcher>
          </Col>
        </TsRow>

      </template>
      <div slot="content">
        <Loading
          v-if="loadingShow"
          :loadingShow="loadingShow"
          type="fix"
        ></Loading>
        <TsCard
          v-else
          v-bind="reposData"
          headerPosition="right"
          @updatePage="updatePage"
        >
          <template slot="header" slot-scope="{ row }">
            <div class="action-group">
              <div class="action-item">
                <div class="text-action tsfont-edit" @click.stop="editServe(row.id)">{{ $t('page.edit') }}</div>
              </div>
              <div class="action-item">
                <div class="text-action tsfont-trash-o" @click.stop="deleteServe(row.id)">{{ $t('page.delete') }}</div>
              </div>
            </div>
          </template>
          <template slot-scope="{ row }">
            <div class="padding-sm">
              <div class="cursor-pointer" @click="gotoRepository(row.id)">
                <TsRow class="mb-sm">
                  <Col span="8">
                    {{ row.name }}
                  </Col>
                  <Col span="8">
                    {{ row.address }}
                  </Col>
                </TsRow>
                <TsRow>
                  <Col span="8">
                    {{ typeConfig[row.type] }}
                  </Col>
                  <Col span="8">
                    <span class="text-grey">{{ row.username }}</span>
                  </Col>
                  <Col span="8">
                    <div style="float:right;">
                      {{ $t('term.codehub.recentlyupdate') }}：
                      <UserCard v-if="row.lcu" :uuid="row.lcu" :hideAvatar="true"></UserCard>
                      <span
                        class="text-tip"
                        style="font-size:80%;margin-left:10px;"
                      >{{ row.lcd | formatDate }}</span></div>
                  </Col>
                </TsRow>
              </div>
            </div>
          </template>
        </TsCard>
      </div>
    </TsContain>
    <ServeEditDialog
      v-if="isShowServeEditDialog"
      :id="repositoryServiceId"
      @close="close"
    ></ServeEditDialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    ServeEditDialog: resolve => require(['./edit/serve-edit-dialog.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      loadingShow: true,
      isShowServeEditDialog: false,
      repositoryServiceId: null, // 仓库id
      search: {
        type: 'all',
        keyword: ''
      },
      reposData: {
        //卡片的数据
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        keyName: 'id',
        classname: 'repository-list',
        padding: false,
        cardList: []
      },
      typeList: [
        { text: this.$t('page.allofthem'), value: 'all' },
        { text: 'GITLAB', value: 'gitlab' },
        { text: 'SVN', value: 'svn' }
      ],
      typeConfig: {
        gitlab: 'GITLAB',
        svn: 'SVN'
      },
      serveList: []
    };
  },

  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getSearch(key, value) {
      //顶部搜索条件拼接
      this.$set(this.search, key, value == 'all' ? '' : value);
      this.$set(this.reposData, 'currentPage', 1);
      this.searchList();
    },
    updatePage(page) {
      this.reposData.currentPage = page;
      this.searchList();
    },
    searchList() {
      let param = {};
      this.reposData.pageSize && Object.assign(param, { pageSize: this.reposData.pageSize });
      this.reposData.currentPage && Object.assign(param, { currentPage: this.reposData.currentPage });
      let searchParams = this.$utils.deepClone(this.search);
      if (this.search) {
        Object.assign(param, this.search);
        param.type = searchParams.type == 'all' ? '' : searchParams.type;
      }
      this.loadingShow = true;
      this.$api.codehub.service.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this.reposData, 'pageCount', res.Return.pageCount);
          this.$set(this.reposData, 'rowNum', res.Return.rowNum);
          this.$set(this.reposData, 'pageSize', res.Return.pageSize);
          this.$set(this.reposData, 'currentPage', res.Return.currentPage);
          this.$set(this.reposData, 'cardList', res.Return.tbodyList);
        } else {
          this.$set(this.reposData, 'cardList', []);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    editServe(id) {
      this.isShowServeEditDialog = true;
      this.repositoryServiceId = null;
      if (id) {
        this.repositoryServiceId = id;
      }
    },
    deleteServe(id) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', {target: this.$t('term.process.catalog')}),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.service.delete({ id: id }).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchList();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    close(isreload) {
      this.isShowServeEditDialog = false;
      this.repositoryServiceId = null;
      if (isreload) {
        this.searchList();
      }
    },
    gotoRepository(id) {
      window.open(HOME + '/codehub.html#/repository-overview?serveid=' + id, '_blank');
    }
  },

  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
/deep/ .tscard-li {
  .repository-list {
    .tscard-header,
    .btn-test {
      opacity: 0;
    }
    &:hover {
      .tscard-header,
      .btn-test {
        opacity: 1;
      }
    }
  }
}
</style>
