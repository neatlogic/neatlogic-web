<template>
  <div class="RoleManagement">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain :gutter="10" border="border">
      <template slot="topLeft">
        <div v-if="selectedList && selectedList.length > 0">
          <div class="action-group toolbar-right">
            <span class="action-item tsfont-trash-o" @click="deleteList(selectedList)">{{ $t('page.batchdelete') }}</span>
          </div>
        </div>
        <div v-else>
          <div class="action-group toolbar-right">
            <span class="action-item tsfont-plus" @click="editRole()">{{ $t('page.role') }}</span>
          </div>
        </div>
      </template>
      <template slot="topRight">
        <InputSearcher
          v-model="keyword"
          @change="changeCurrent(1)"
        ></InputSearcher>
      </template>
      <div slot="content">
        <div class="content">
          <TsTable
            v-if="tableData"
            v-bind="tableData"
            :theadList="theadList"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
          >
            <template slot="action" slot-scope="{row}">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-edit text-action" @click="editRole(row, 'role')">{{ $t('page.edit') }}</li>
                  <li class="tsfont-plus text-action" @click="editRole(row, 'adduser')">{{ $t('page.member') }}</li>
                  <li class="tsfont-plus text-action" @click="editRole(row, 'addgroup')">{{ $t('page.group') }}</li>
                  <li class="tsfont-permission text-action" @click="editRole(row, 'auth')">{{ $t('page.auth') }}</li>
                  <li class="tsfont-trash-o text-action" @click="deleteList(row)">{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: [],
  data() {
    return {
      groupType: 'add', //判断新增分组还是编辑分组
      loadingShow: true,
      keyword: '',
      tableData: null, //table的正文数据
      selectedList: null, //选中哪些
      searchParams: {
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        { title: 'ID', key: 'name' },
        { title: this.$t('term.framework.rolename'), key: 'description' },
        { title: this.$t('term.framework.usercount'), key: 'userCount' },
        { title: this.$t('term.framework.teamcount'), key: 'teamCount' },
        { title: ' ', key: 'action'}
      ]
    };
  },
  created() {},
  mounted() {
    this.getTableList();
  },
  methods: {
    getTableList() {
      let data = {
        keyword: this.keyword,
        pageSize: this.searchParams.pageSize,
        currentPage: this.searchParams.currentPage
      };
      this.$addHistoryData('keyword', data.keyword);
      this.$addHistoryData('currentPage', data.currentPage);
      this.$addHistoryData('pageSize', data.pageSize);
      this.loadingShow = true;
      this.$api.framework.role.roleList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    restoreHistory(historyData) {
      this.keyword = historyData['keyword'];
      this.searchParams.currentPage = historyData['currentPage'];
      this.searchParams.pageSize = historyData['pageSize'];
    },
    changeCurrent(current) {
      this.searchParams.currentPage = current;
      this.getTableList();
    },
    changePageSize(pageSize) {
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = pageSize;
      this.getTableList();
    },
    getSelect(selection) {
      this.selectedList = selection;
    },
    deleteList: function(row) {
      let key = row instanceof Array;
      let uuidList = [];
      if (key && row.length > 1) {
        row.forEach(item => {
          uuidList.push(item.uuid);
        });
      } else {
        uuidList = [row.uuid];
      }
      let param = {
        uuidList: uuidList
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.role') + '：' + row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.role
            .delrole(param)
            .then(res => {
              if (res && res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.tableData.currentPage = 1;
                this.getTableList();
              }
            });
        },
        'on-cancel': vnode => {}
      });
    },
    //批量授权
    batchAuth: function() {
      this.isBatch = true;
      this.showAuth = true;
      this.authorizationTitle = this.$t('term.framework.batchauth');
    },
    //新添加角色
    editRole: function(val, key) {
      let roleId = '';
      let uuid = '';
      if (val) {
        roleId = val.name || '';
        uuid = val.uuid || '';
        this.groupType = 'edit';
      } else {
        this.groupType = 'add';
      }
      this.$router.push({
        path: `role-addview`,
        query: { roleId: roleId, key: key, uuid: uuid, groupType: this.groupType}
      });
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.RoleManagement {
  .top {
    .bar-top {
      .bar-top-left {
        .batch {
          margin-left: 16px;
        }
      }
      .bar-top-right {
        width: 400px;
      }
    }
  }
  .content {
    width: 100%;
    // float: left;
    // border-top: 1px solid;
    .card-wrapper {
      padding: @space-base;

      .card-top {
        padding: 0 20px 8px 20px;
        .action {
          text-align: center;
        }
      }
      .card-item {
        height: 56px;
        line-height: 56px;
        padding: 0 20px;
        margin-bottom: 8px;
        &:hover {
          .action {
            display: block;
          }
        }
        .action {
          display: none;
          cursor: pointer;
        }
        .count {
          > span {
            margin-left: 5px;
          }
        }
        .tstable-action-ul {
          li {
            display: inline-block;
            padding: 0 @space-xs;
            &:not(:last-of-type) {
              position: relative;
              &::after {
                content: '|';
                width: 1px;
                height: 14px;
                color: @dividing-color;
                right: 0px;
                position: absolute;
              }
            }
            &::before {
              margin-right: 4px;
            }
          }
        }
      }
      .page {
        text-align: right;
      }
    }
    .content-left {
      height: calc(100vh - 130px);
      background: @white;
      margin-left: calc(80% + 16px);
      padding: 16px 24px;
      overflow: auto;
    }
    .actionText {
      padding-left: 5px;
    }
  }
}
</style>
