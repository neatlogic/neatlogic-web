<template>
  <div>
    <div class="input-border" style="padding:0 16px;">
      <Row :gutter="16">
        <Col span="18">
          <span class="tsfont-plus text-action" @click="editTag()">{{ $t('page.tag') }}</span>
        </Col>
        <Col span="6">
          <InputSearcher
            v-model="keyword"
            @change="() => searchTagData()"
          ></InputSearcher>
        </Col>
      </Row>
    </div>
    <div>
      <Loading v-if="loadingShow" loadingShow style="min-height:100px"></Loading>
      <TsCard
        v-else
        v-bind="tagConfig"
        headerPosition="right"
        @updatePage="updatePage"
        @updateSize="updateSize"
      >
        <template slot="header" slot-scope="{ row }">
          <div class="action-group">
            <div class="action-item tsfont-trash-o" @click="deleteTag(row.name)">{{ $t('page.delete') }}</div>
          </div>
        </template>
        <template slot-scope="{ row }">
          <table class="table" style="table-layout:fixed;width:100%;">
            <colgroup>
              <col />
              <col width="200" />
              <col width="200" />
            </colgroup>
            <tbody>
              <tr>
                <td>
                  <span class="ts-tag text-primary icon-right">
                    {{ row.name }}
                  </span>
                </td>
                <td rowspan="2" colspan="2" class="text-right text-tip">{{ row.commit.shortId }}</td>
                <td></td>
              </tr>
              <tr>
                <td>
                  <span>{{ row.commit.committer }}</span>
                  <span class="text-tip ml-sm">{{ row.commit.committerDate ? row.commit.committerDate.time:'' | formatDate }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </TsCard>
    </div>
    <TagEdit
      v-if="isShowTagEdit"
      :repositoryId="id"
      @close="close"
    ></TagEdit>
  </div>
</template>

<script>
import editmixin from './edittabmixin.js';
export default {
  name: 'Tag',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TagEdit: resolve => require(['./edit/tag-edit.vue'], resolve)
  },
  mixins: [editmixin],
  props: {},
  data() {
    return {
      keyword: '',
      loadingShow: true,
      isShowTagEdit: false,
      tagConfig: {
        //卡片的数据
        span: 24,
        sm: 24,
        md: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        keyName: 'name',
        currentPage: 1,
        pageSize: 10,
        cardList: [],
        boxShadow: false,
        hasHoverShadow: true
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchTagData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updateSize(pageSize = 10) {
      this.tagConfig.currentPage = 1;
      this.tagConfig.pageSize = pageSize;
      this.searchTagData();
    },
    updatePage(currentPage = 1) {
      this.tagConfig.currentPage = currentPage;
      this.searchTagData();
    },
    searchTagData() {
      let param = {
        keyword: this.keyword,
        currentPage: this.tagConfig.currentPage,
        pageSize: this.tagConfig.pageSize,
        repositoryId: this.id,
        hasCommit: 1
      };
      this.loadingShow = true;
      this.$api.codehub.repositorydetail.getTag(param).then(res => {
        if (res && res.Status == 'OK') {
          Object.assign(this.tagConfig, {
            pageCount: res.Return.pageCount,
            rowNum: res.Return.rowNum,
            pageSize: res.Return.pageSize,
            currentPage: res.Return.currentPage,
            cardList: res.Return.list || [{}]
          });
        }
      }).finally(error => {
        this.loadingShow = false;
      });
    },
    editTag() {
      this.isShowTagEdit = true;
    },
    close(needRefresh) {
      this.isShowTagEdit = false;
      if (needRefresh) {
        this.searchTagData();
      }
    },
    deleteTag(name) {
      if (name) {
        let param = {
          repositoryId: this.id,
          tagName: name
        };
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('term.codehub.confirmdeletetag'),
          btnType: 'error',
          'on-ok': (vnode) => {
            this.$api.codehub.repositorydetail.deleteTag(param).then((res) => {
              if (res && res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.searchTagData();
                vnode.isShow = false;
              }
            }); 
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang='less'>
</style>
