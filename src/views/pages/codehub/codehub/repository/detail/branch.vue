<template>
  <div>
    <div class="input-border" style="padding:0 16px;">
      <Row :gutter="16">
        <Col span="18">
          <Button type="primary" @click="editLi()">
            <i class="ts-plus"></i>{{ $t('page.branch') }}
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
        v-bind="activeConfig"
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
                <td><h4>{{ row.name }}</h4></td>
                <td rowspan="2"><template v-if="showBranch(row.name).length>0"></template><Tag
                  v-for="(branch,bindex) in showBranch(row.name)"
                  :key="bindex"
                  :color="typeList[branch].color"
                  class="ml-sm"
                >{{ typeList[branch].name }}</Tag></td>
                <td rowspan="2">{{ row.commit.shortId }}</td>
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
    <BranchEdit
      v-if="isEdit"
      :uuid="editUuid"
      :repositoryId="id"
      :isShow="isEdit"
      :branchList="activeConfig.cardList||[]"
      @close="close"
    ></BranchEdit>
    <BranchDelete
      v-if="isDelete"
      :branchName="branchName"
      :repositoryId="id"
      :isShow="isDelete"
      @close="close"
    ></BranchDelete>
  </div>
</template>

<script>
import FormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
import editmixin from './edittabmixin.js';
export default {
  name: 'Branch',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    FormInput,
    BranchEdit: resolve => require(['./edit/branch-edit.vue'], resolve),
    BranchDelete: resolve => require(['./edit/branch-delete.vue'], resolve)
  },
  mixins: [editmixin],
  props: {},
  data() {
    return {
      keyword: '',
      isload: false,
      isEdit: false,
      isDelete: false,
      editUuid: null,
      branchName: null,
      activeConfig: {
        //卡片的数据
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        keyName: 'uuid',
        classname: 'repository-list',
        currentPage: 1,
        pageSize: 10,
        cardList: []
      },
      typeList: {
        'defaultBranch': {name: '默认分支', color: 'success'},
        'mainBranch': {name: '主干分支', color: 'primary'}
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
    getList() {
      let param = {
        repositoryId: this.id,
        hasCommit: 1
      };
      this.keyword && this.$set(param, 'keyword', this.keyword);
      this.activeConfig.pageSize && this.$set(param, 'pageSize', this.activeConfig.pageSize);
      this.activeConfig.currentPage && this.$set(param, 'currentPage', this.activeConfig.currentPage);
      this.isload = true;
      this.$api.codehub.repositorydetail.getBranch(param).then(res => {
        this.isload = false;
        if (res && res.Status == 'OK') {
          Object.assign(this.activeConfig, {
            pageCount: res.Return.pageCount,
            rowNum: res.Return.rowNum,
            pageSize: res.Return.pageSize,
            currentPage: res.Return.currentPage,
            cardList: res.Return.list
          });
        } else {
          this.activeConfig = null;
        }
      }).catch(error => {
        this.isload = false;
      });
    },
    updateSize(size) {
      this.activeConfig.pageSize = size || 1;
      this.activeConfig.currentPage = 1;
      this.getList();
    },
    updatePage(page) {
      this.activeConfig.currentPage = page || 1;
      this.getList();
    },
    deleteLi(name) {
      if (name) {
        this.branchName = name;
        this.isDelete = true;
      }
    },
    editLi(val) {
      if (val) {
        this.editUuid = val;
      }
      this.isEdit = true;
    },
    close(isReload) {
      this.isEdit = false;
      this.isDelete = false;
      this.editUuid = null;
      this.branchName = null;
      if (isReload) {
        this.getList();
      }
    }
  },

  filter: {},

  computed: {
    showBranch() {
      return function(name) {
        let type = [];
        if (this.reposData.defaultBranch && this.reposData.defaultBranch == name) {
          type.push('defaultBranch');
        }
        if (this.reposData.mainBranch && this.reposData.mainBranch == name) {
          type.push('mainBranch');
        }
        return type;
      };
    }
  },

  watch: {
    isload: {
      handler: function(val) {
        this.$emit('updateStatus', val);
      }      
    }
  }

};
</script>
<style lang="less"></style>
