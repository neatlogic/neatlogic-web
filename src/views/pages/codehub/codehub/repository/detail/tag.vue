<template>
  <div>
    <div class="input-border" style="padding:0 16px;">
      <Row :gutter="16">
        <Col span="18">
          <Button type="primary" @click="editLi()">
            <i class="ts-plus"></i>标签
          </Button>         
        </Col>
        <Col span="6">
          <FormInput
            v-model.trim="keyword"
            suffix="i-icon ts-search"
            placeholder="关键字"
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
            <div class="action-item text-action ts-trash" @click="deleteLi(row.name)">删除</div>
          </div>
        </template>
        <template slot-scope="{ row }">
          <table class="table" style="table-layout:fixed">
            <colgroup>
              <col />
              <col width="200" />
              <col width="200" />
            </colgroup>
            <tbody>
              <tr>
                <td><h4><i class="ts-tag text-primary" style="margin-right:4px;"></i>{{ row.name }}</h4></td>
                <td rowspan="2" colspan="2" class="text-right text-tip">{{ row.commit.shortId }}</td>
                <!--  -->
              </tr>
              <tr>
                <td>
                  <span>{{ row.commit.committer }}</span><span class="text-tip ml-10">{{ row.commit.committerDate ?row.commit.committerDate.time:'' | formatDate }}</span>
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
      :repositoryUuid="uuid"
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
        pageType: 'numbet',
        keyName: 'name',
        cardList: []
      }
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
    if (this.uuid) {
      this.getList();
    }
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
      let _this = this;
      let param = {
        repositoryUuid: _this.uuid,
        hasCommit: 1
      };
      _this.keyword && Object.assign(param, {keyword: _this.keyword});
      _this.tagConfig.pageCount && Object.assign(param, {pageCount: _this.tagConfig.pageCount});
      _this.tagConfig.rowNum && Object.assign(param, {rowNum: _this.tagConfig.rowNum});
      _this.tagConfig.pageSize && Object.assign(param, {pageSize: _this.tagConfig.pageSize});
      _this.tagConfig.currentPage && Object.assign(param, {currentPage: _this.tagConfig.currentPage});
      _this.isload = true;
      _this.$api.codehub.repositorydetail.getTag(param).then(res => {
        _this.isload = false;
        if (res && res.Status == 'OK') {
          Object.assign(_this.tagConfig, {
            pageCount: res.Return.pageCount,
            rowNum: res.Return.rowNum,
            pageSize: res.Return.pageSize,
            currentPage: res.Return.currentPage,
            cardList: res.Return.list || [{}]
          });
        } else {
          _this.tagConfig = null;
        }
      }).catch(error => {
        _this.isload = false;
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
          repositoryUuid: this.uuid,
          tagName: name
        };
        let _this = this;
        _this.$createDialog({
          title: '删除确认',
          //content: '是否确认删除当前仓库下的该标签',
          content: '是否确认删除该标签',
          btnType: 'error',
          'on-ok': function(vnode) {
            _this.$api.codehub.repositorydetail.deleteTag(param).then((res) => {
              if (res && res.Status == 'OK') {
                _this.$Message.success('删除成功');
                _this.getList();
                vnode.isShow = false;
              } else {
                _this.$Message.error(res.Message);
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
