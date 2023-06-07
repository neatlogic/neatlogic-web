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
              v-model="searchParams.type"
              :dataList="typeList"
              :clearable="false"
              transfer
              :placeholder="$t('form.placeholder.pleaseselect',{target:$t('page.type')})"
              border="border"
              @on-change="() => getSearch('type', searchParams.type)"
            ></TsFormSelect>
          </Col>
          <Col :span="16">
            <InputSearcher
              v-model="searchParams.keyword"
              @change="() => getSearch('keyword', searchParams.keyword)"
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
          v-bind="repositoryData"
          headerPosition="right"
          @updatePage="changeCurrentPage"
          @updateSize="changePageSize"
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
      @close="closeServeEditDialog"
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
      searchParams: {
        type: 'all',
        keyword: ''
      },
      repositoryData: {
        //卡片的数据
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        keyName: 'id',
        classname: 'repository-list',
        padding: false,
        cardList: [],
        pageType: 'number',
        currentPage: 1,
        pageSize: 10,
        rowNum: 0
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
  created() {
    this.searchRepository();
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
    getSearch(key, value) {
      //顶部搜索条件拼接
      this.$set(this.searchParams, key, value == 'all' ? '' : value);
      this.$set(this.repositoryData, 'currentPage', 1);
      this.searchRepository();
    },
    changeCurrentPage(currentPage) {
      this.repositoryData.currentPage = currentPage;
      this.searchRepository();
    },
    changePageSize(pageSize) {
      // 切换页码
      this.repositoryData.currentPage = 1;
      this.repositoryData.pageSize = pageSize;
      this.searchRepository();
    },
    searchRepository() {
      let param = {
        currentPage: this.repositoryData.currentPage,
        pageSize: this.repositoryData.pageSize
      };
      let searchParams = this.$utils.deepClone(this.searchParams);
      if (this.searchParams) {
        Object.assign(param, this.searchParams);
        param.type = searchParams.type == 'all' ? '' : searchParams.type;
      }
      this.loadingShow = true;
      this.$api.codehub.service.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this.repositoryData, 'pageCount', res.Return.pageCount);
          this.$set(this.repositoryData, 'rowNum', res.Return.rowNum);
          this.$set(this.repositoryData, 'pageSize', res.Return.pageSize);
          this.$set(this.repositoryData, 'currentPage', res.Return.currentPage);
          this.$set(this.repositoryData, 'cardList', res.Return.tbodyList);
        } else {
          this.$set(this.repositoryData, 'cardList', []);
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
              this.searchRepository();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    closeServeEditDialog(needRefresh) {
      this.isShowServeEditDialog = false;
      this.repositoryServiceId = null;
      if (needRefresh) {
        this.searchRepository();
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
