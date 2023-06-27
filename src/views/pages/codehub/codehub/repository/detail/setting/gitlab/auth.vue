<template>
  <div>
    <div class="mb-sm">
      <div class="action-group">
        <span class="action-item tsfont-plus" @click="addAuth()">
          {{ $t('page.authority') }}
        </span>
        <span v-if="!isDowning" v-download="downloadPath" class="action-item tsfont-export">{{ $t('term.codehub.exportexcel') }}</span>
        <span v-else class="action-item disable" :title="$t('page.downloadloadingtip')">
          <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
          {{ $t('term.codehub.exporting') }}
        </span>
      </div>
    </div>
    <div>{{ $t('term.codehub.userauth') }}</div>
    <div v-if="!isLoading">
      <TsTable v-bind="tableData" :tbodyList="authList">
        <template slot="name" slot-scope="{ row }">
          <UserinfoGitlab
            :id="row.id"
            :row="row"
            type="member"
            :repositoryId="id"
          ></UserinfoGitlab>
        </template>
        <template slot="state" slot-scope="{ row }">
          <span :style="'color:' + colorConfig[row.state]">{{ row.state }}</span>
        </template>
        <template slot="endtime" slot-scope="{ row }">
          {{ row.endtime | formatDate }}
        </template>
        <template slot="access_level" slot-scope="{ row }">
          {{ getText(row.access_level) }}
        </template>
        <template slot="action" slot-scope="{ row }">
          <div v-if="!row.group_name" class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-edit" @click="editAuth(row)">{{ $t('page.edit') }}</li>
              <li class="tsfont-trash-o" @click="delAuth(row)">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <Loading v-else loadingShow style="min-height: 100px"></Loading>
    <Divider />
    <h4>{{ $t('term.codehub.groupauth') }}</h4>
    <div v-if="!isLoadingGroup">
      <TsTable v-bind="groupTableData" :tbodyList="authGroupList">
        <template slot="name" slot-scope="{ row }">
          <UserinfoGitlab
            :id="row.id"
            :row="row"
            type="group"
            :repositoryId="id"
          ></UserinfoGitlab>
        </template>
        <template slot="endtime" slot-scope="{ row }">
          {{ row.endtime | formatDate }}
        </template>
        <template slot="group_access_level" slot-scope="{ row }">
          {{ getText(row.group_access_level) }}
        </template>
        <template slot="action" slot-scope="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-edit" @click="editAuth(row, 'group')">{{ $t('page.edit') }}</li>
              <li class="tsfont-trash-o" @click="delAuth(row, 'group')">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <Loading v-else loadingShow style="min-height: 100px"></Loading>
    <AuthAdd
      v-if="isEdit"
      :id="id"
      :accList="accList"
      :editConfig="editConfig"
      @close="close"
    ></AuthAdd>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    AuthAdd: resolve => require(['./auth-add.vue'], resolve),
    UserinfoGitlab: resolve => require(['@/views/pages/codehub/codehub/repository/components/userinfo-gitlab.vue'], resolve)
  },
  filters: {},
  directives: { download },
  props: {
    id: Number
  },
  data() {
    return {
      colorConfig: {
        blocked: '#e42332',
        active: '#2ed373'
      },
      tableData: {
        theadList: [
          {
            title: this.$t('page.username'),
            key: 'name'
          },
          {
            title: this.$t('page.status'),
            key: 'state'
          },
          {
            title: this.$t('term.cmdb.extendto'),
            key: 'group_name'
          },
          {
            title: this.$t('page.authority'),
            key: 'access_level'
          },
          {
            title: this.$t('term.codehub.expiresat'),
            key: 'expires_at'
          },
          {
            key: 'action'
          }
        ],
        rowKey: 'id'
      },
      groupTableData: {
        theadList: [
          {
            title: this.$t('page.groupname'),
            key: 'name'
          },
          {
            title: this.$t('page.authority'),
            key: 'group_access_level'
          },
          {
            title: this.$t('term.codehub.expiresat'),
            key: 'expires_at'
          },
          {
            key: 'action'
          }
        ],
        rowKey: 'id'
      },
      isEdit: false,
      authList: [],
      authGroupList: [],
      isLoading: false,
      isLoadingGroup: false,
      accList: [
        {
          value: 10,
          text: 'Guest'
        },
        {
          value: 20,
          text: 'Reporter'
        },
        {
          value: 30,
          text: 'Developer'
        },
        {
          value: 40,
          text: 'Maintainer'
        },
        {
          value: 50,
          text: 'Owner'
        }
      ],
      isDowning: false, //是否在下载中
      editConfig: null //编辑内容
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
    addAuth() {
      this.editConfig = null;
      this.isEdit = true;
    },
    changeCurrent() {},
    changePageSize() {},
    close(isReload) {
      this.editConfig = null;
      this.isEdit = false;
      if (isReload) {
        this.getList();
      }
    },
    editAuth(row, type) {
      let newConfig = {};
      newConfig = JSON.parse(JSON.stringify(row));
      Object.assign(newConfig, {
        authType: type ? 'group' : 'member'
      });
      this.editConfig = newConfig;
      this.isEdit = true;
    },
    delAuth(row, type) {
      let param = {
        repositoryId: this.id
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.authority')}),
        btnType: 'error',
        'on-ok': vnode => {
          if (type) {
            param.group_id = row.id;
            this.$api.codehub.repositorydetail.deleteGitAuth('group', param).then(res => {
              if (res && res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.getList();
                vnode.isShow = false;
              }
            });
          } else {
            param.user_id = row.id;
            this.$api.codehub.repositorydetail.deleteGitAuth('member', param).then(res => {
              if (res && res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.getList();
                vnode.isShow = false;
              }
            });
          }
        }
      });
    },
    getList() {
      //获取权限列表
      let param = {
        repositoryId: this.id
      };
      this.isLoading = true;
      this.$api.codehub.repositorydetail
        .getGitAuthList(param)
        .then(res => {
          if (res.Status == 'OK') {
            this.authList = res.Return || [];
          } else {
            this.authList = [];
          }
        })
        .finally(res => {
          this.isLoading = false;
        });
      this.isLoadingGroup = true;
      this.$api.codehub.repositorydetail
        .searchGitGroup(param)
        .then(res => {
          if (res.Status == 'OK') {
            this.authGroupList = res.Return || [];
          } else {
            this.authGroupList = [];
          }
        })
        .finally(res => {
          this.isLoadingGroup = false;
        });
    },
    showUser(item) {
      console.log(item);
    },
    changeDownStatus(type, event) {
      //下载进度和状态的监听
      if (type == 'start') {
        this.isDowning = true;
      } else if (type != 'progress') {
        this.isDowning = false;
      }
    }
  },
  computed: {
    downloadPath() {
      return {
        url: '/api/binary/codehub/repository/permission/export',
        params: {
          id: this.id
        },
        changeStatus: this.changeDownStatus
      };
    },
    getText() {
      return function(val) {
        let item = this.accList.find(a => {
          return a.value == val;
        });
        return item.text;
      };
    }
  },
  watch: {}
};
</script>
<style lang='less'>
</style>
