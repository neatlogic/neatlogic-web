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
            @change="() => getList()"
          ></InputSearcher>
        </Col>
      </Row>
    </div>
    <div>
      <Loading v-if="isload" loadingShow style="min-height:100px"></Loading>
      <TsCard
        v-else
        v-bind="tagConfig"
        headerPosition="right"
        @updatePage="updatePage"
        @updateSize="updateSize"
      >
        <template slot="header" slot-scope="{ row }">
          <div class="action-group">
            <div class="action-item text-action tsfont-trash-o" @click="deleteTag(row.name)">{{ $t('page.delete') }}</div>
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
                  <h4>
                    <span class="ts-tag text-primary icon-right">
                      {{ row.name }}</span>
                  </h4>
                </td>
                <td rowspan="2" colspan="2" class="text-right text-tip">{{ row.commit.shortId }}</td>
                <td></td>
              </tr>
              <tr>
                <td>
                  <span>{{ row.commit.committer }}</span><span class="text-tip ml-sm">{{ row.commit.committerDate ?row.commit.committerDate.time:'' | formatDate }}</span>
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
      isload: false,
      isShowTagEdit: false,
      tagConfig: {
        //卡片的数据
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        keyName: 'name',
        currentPage: 1,
        pageSize: 10,
        cardList: []
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updateSize(pageSize) {
      this.tagConfig.currentPage = 1;
      this.tagConfig.pageSize = pageSize || 10;
      this.getList();
    },
    updatePage(currentPage) {
      this.tagConfig.currentPage = currentPage || 1;
      this.getList();
    },
    getList() {
      let param = {
        keyword: this.keyword,
        currentPage: this.tagConfig.currentPage,
        pageSize: this.tagConfig.pageSize,
        repositoryId: this.id,
        hasCommit: 1
      };
      this.isload = true;
      this.$api.codehub.repositorydetail.getTag(param).then(res => {
        if (res && res.Status == 'OK') {
          Object.assign(this.tagConfig, {
            pageCount: res.Return.pageCount,
            rowNum: res.Return.rowNum,
            pageSize: res.Return.pageSize,
            currentPage: res.Return.currentPage,
            cardList: res.Return.list || [{}]
          });
        } else {
          this.tagConfig = null;
        }
      }).finally(error => {
        this.isload = false;
      });
    },
    editTag() {
      this.isShowTagEdit = true;
    },
    close(needRefresh) {
      this.isShowTagEdit = false;
      if (needRefresh) {
        this.getList();
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
                this.getList();
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
  watch: {
    isload: {
      handler: function(val) {
        this.$emit('updateStatus', val);
      }      
    }
  }
};
</script>
<style lang='less'>
</style>
