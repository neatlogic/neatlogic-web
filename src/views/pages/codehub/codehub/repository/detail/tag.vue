<template>
  <div>
    <div class="input-border" style="padding:0 16px;">
      <Row :gutter="16">
        <Col span="18">
          <Button type="primary" @click="editLi()">
            <i class="ts-plus"></i>{{ $t('page.tag') }}
          </Button>         
        </Col>
        <Col span="6">
          <FormInput
            v-model.trim="keyword"
            suffix="i-icon ts-search"
            :placeholder="$t('page.keyword')"
            @keyup.enter.native="getList()"
          ></FormInput>
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
            <div class="action-item text-action ts-trash" @click="deleteLi(row.name)">{{ $t('page.delete') }}</div>
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
                <td><h4><i class="ts-tag text-primary" style="margin-right:4px;"></i>{{ row.name }}</h4></td>
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
      v-if="isEdit"
      :uuid="editUuid"
      :repositoryId="id"
      :isShow="isEdit"
      @close="close"
    ></TagEdit>
  </div>
</template>

<script>
import FormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
import editmixin from './edittabmixin.js';
export default {
  name: 'Tag',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    FormInput,
    TagEdit: resolve => require(['./edit/tag-edit.vue'], resolve)
  },
  mixins: [editmixin],
  props: {},
  data() {
    return {
      keyword: '',
      isload: false,
      isEdit: false,
      editUuid: null,
      tagConfig: {
        //卡片的数据
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        //pageType: 'numbet',
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

  activated() {

  },

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    updateSize(size) {
      this.tagConfig.pageSize = size || 1;
      this.tagConfig.currentPage = 1;
      this.getList();
    },
    updatePage(page) {
      this.tagConfig.currentPage = page || 1;
      this.getList();
    },
    getList() {
      let param = {
        repositoryId: this.id,
        hasCommit: 1
      };
      this.keyword && Object.assign(param, {keyword: this.keyword});
      this.tagConfig.pageSize && Object.assign(param, {pageSize: this.tagConfig.pageSize});
      this.tagConfig.currentPage && Object.assign(param, {currentPage: this.tagConfig.currentPage});
      this.isload = true;
      this.$api.codehub.repositorydetail.getTag(param).then(res => {
        this.isload = false;
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
      }).catch(error => {
        this.isload = false;
      });
    },
    editLi(val) {
      if (val) {
        this.editUuid = val;
      }
      this.isEdit = true;
    },
    close() {
      this.isEdit = false;
      this.editUuid = null;
      this.getList();
    },
    deleteLi(name) {
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
              } else {
                this.$Message.error(res.Message);
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
