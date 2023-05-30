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
                <div class="text-action ts-edit" @click="editServe(row.uuid)">{{ $t('page.edit') }}</div>
              </div>
              <div class="action-item">
                <div class="text-action ts-trash" @click="deleteServe(row.uuid)">{{ $t('page.delete') }}</div>
              </div>
            </div>
          </template>
          <template slot-scope="{ row }">
            <div class="cursor-pointer" @click="gotoRepository(row.uuid)">
              <div>
                <table class="table" style="table-layout:fixed;">
                  <tbody>
                    <tr>
                      <td>
                        <h4>{{ row.name }}</h4>
                      </td>
                      <td>{{ row.address }}
                      </td>
                    </tr>
                    <tr>
                      <td>{{ typeConfig[row.type] }}</td>
                      <td><span style="font-size:80%;" class="text-tip">{{ row.username }}</span>
                        <div style="float:right;">{{ $t('term.codehub.recentlyupdate') }}：{{ row.lcu || '-' }}<span
                          class="text-tip"
                          style="font-size:80%;margin-left:10px;"
                        >{{ row.lcd | formatDate }}</span></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </TsCard>
      </div>
    </TsContain>
    <ServeEditDialog
      v-if="isShowServeEditDialog"
      :uuid="editUuid"
      @close="close"
    ></ServeEditDialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    ServeEditDialog: resolve => require(['./edit/serve-edit-dialog.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      loadingShow: true,
      isShowServeEditDialog: false, //是否编辑
      editUuid: null, //编辑弹窗对应的仓库id
      search: {
        type: '',
        keyword: ''
      },
      reposData: {
        //卡片的数据
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        keyName: 'uuid',
        classname: 'repository-list',
        cardList: []
      },
      typeList: [
        { text: this.$t('page.allofthem'), value: '' },
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
      this.$set(this.search, key, value);
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
      if (this.search) {
        Object.assign(param, this.search);
      }
      this.loadingShow = true;
      this.$api.codehub.service.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this.reposData, 'pageCount', res.Return.pageCount);
          this.$set(this.reposData, 'rowNum', res.Return.rowNum);
          this.$set(this.reposData, 'pageSize', res.Return.pageSize);
          this.$set(this.reposData, 'currentPage', res.Return.currentPage);
          this.$set(this.reposData, 'cardList', res.Return.list);
        } else {
          this.$set(this.reposData, 'cardList', []);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    editServe(uuid) {
      this.isShowServeEditDialog = true;
      this.editUuid = '';
      if (uuid) {
        this.editUuid = uuid;
      }
    },
    deleteServe(uuid) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', {target: this.$t('term.process.catalog')}),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.service.delete({ uuid: uuid }).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchList();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    testServe(list) {
      let param = {
        type: list.type,
        address: list.address || ''
      };
      this.$api.codehub.service.check(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          //this.searchList();
        }
      });
    },
    close(isreload) {
      this.isShowServeEditDialog = false;
      this.editUuid = null;
      if (isreload) {
        this.searchList();
      }
    },
    gotoRepository(uuid) {
      try {
        window.open(HOME + '/codehub.html#/repository-manage?serveuuid=' + uuid, '_blank');
      } catch (error) {
        this.$router.push({ path: '/repository-manage', query: { serveuuid: uuid } });
      }
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
