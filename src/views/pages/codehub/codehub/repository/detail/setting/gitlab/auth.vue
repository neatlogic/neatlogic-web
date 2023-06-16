<template>
  <div>
    <div style="margin-bottom:10px;">
      <Button type="primary" @click="addAuth()"><i class="ts-plus"></i>{{ $t('page.authority') }}</Button> 
      <Button v-if="!isDowning" v-download="downloadPath" class="ml-sm">{{ $t('term.codehub.exportexcel') }}</Button> 
      <Button v-else loading class="ml-sm">$t('term.codehub.exporting')</Button> 
    </div>
    <h4>{{ $t('term.codehub.userauth') }}</h4>
    <div v-if="!isLoading">
      <TsTable
        v-bind="tabledata"
        :tbodyList="authList"
      >
        <template slot="name" slot-scope="{row}">
          <UserinfoGitlab
            :id="row.id"
            :row="row"
            type="member"
            :repositoryId="id"
          ></UserinfoGitlab>
        </template>
        <template slot="state" slot-scope="{row}">
          <span :style="'color:' + colorConfig[row.state]">{{ row.state }}</span>
        </template>
        <template slot="endtime" slot-scope="{row}">
          {{ row.endtime | formatDate }}
        </template>
        <template slot="access_level" slot-scope="{row}">
          {{ getText(row.access_level) }}
        </template>
        <template slot="actions" slot-scope="{row}">
          <div v-if="!row.group_name" class="action-group">
            <div class="action-item text-action ts-edit" @click="editAuth(row)">{{ $t('page.edit') }}</div>
            <div class="action-item text-action ts-trash" @click="delAuth(row)">{{ $t('page.delete') }}</div>
          </div>
        </template>
      </TsTable>
    </div>
    <Loading v-else loadingShow style="min-height:100px"></Loading>
    <Divider />
    <h4>{{ $t('term.codehub.groupauth') }}</h4>
    <div v-if="!isLoadingGroup">
      <TsTable
        v-bind="grouptabledata"
        :tbodyList="authGroupList"
      >
        <template slot="name" slot-scope="{row}">
          <UserinfoGitlab
            :id="row.id"
            :row="row"
            type="group"
            :repositoryId="id"
          ></UserinfoGitlab>
        </template>
        <template slot="endtime" slot-scope="{row}">
          {{ row.endtime | formatDate }}
        </template>
        <template slot="group_access_level" slot-scope="{row}">
          {{ getText(row.group_access_level) }}
        </template>
        <template slot="actions" slot-scope="{row}">
          <div class="action-group">
            <div class="action-item text-action ts-edit" @click="editAuth(row,'group')">{{ $t('page.edit') }}</div>
            <div class="action-item text-action ts-trash" @click="delAuth(row,'group')">{{ $t('page.delete') }}</div>
          </div>
        </template>
      </TsTable>
    </div>
    <Loading v-else loadingShow style="min-height:100px"></Loading>
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
  directives: { download},
  props: {
    id: Number
  },
  data() {
    return {
      colorConfig: {
        blocked: '#e42332',
        active: '#2ed373'
      },
      tabledata: {
        theadList: [{
          title: this.$t('page.username'),
          key: 'name'
        }, {
          title: this.$t('page.status'),
          key: 'state'
        }, {
          title: this.$t('term.cmdb.extendto'),
          key: 'group_name'
        }, {
          title: this.$t('page.authority'),
          key: 'access_level'
        }, {
          title: this.$t('term.codehub.expiresat'),
          key: 'expires_at'
        }, {
          key: 'actions'
        }],
        rowKey: 'id'
      },
      grouptabledata: {
        theadList: [{
          title: this.$t('page.groupname'),
          key: 'name'
        }, {
          title: this.$t('page.authority'),
          key: 'group_access_level'
        }, {
          title: this.$t('term.codehub.expiresat'),
          key: 'expires_at'
        }, {
          key: 'actions'
        }],
        rowKey: 'id'
      },
      isEdit: false,
      authList: [],
      authGroupList: [],
      isLoading: false,
      isLoadingGroup: false,
      accList: [{
        value: 10,
        text: 'Guest'
      }, {
        value: 20,
        text: 'Reporter'            
      }, {
        value: 30,
        text: 'Developer'            
      }, {
        value: 40,
        text: 'Maintainer'            
      }, {
        value: 50,
        text: 'Owner'            
      }],
      isDowning: false, //是否在下载中
      editConfig: null//编辑内容
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
    addAuth() {
      this.editConfig = null;
      this.isEdit = true;
    },
    changeCurrent() {

    },
    changePageSize() {
      
    },
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
        'repositoryId': this.id
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('term.codehub.delauth'),
        btnType: 'error',
        'on-ok': (vnode) => {
          if (type) {
            Object.assign(param, {
              'group_id': row.id
            });
            this.$api.codehub.repositorydetail.deleteGitAuth('group', param).then((res) => {
              if (res && res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.getList();
                vnode.isShow = false;
              } else {
                this.$Message.error(res.Message);
              }
            });
          } else {
            Object.assign(param, {
              'user_id': row.id
            });
            this.$api.codehub.repositorydetail.deleteGitAuth('member', param).then((res) => {
              if (res && res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.getList();
                vnode.isShow = false;
              } else {
                this.$Message.error(res.Message);
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
      this.$api.codehub.repositorydetail.getGitAuthList(param).then(res => {
        if (res.Status == 'OK') {
          this.authList = res.Return || [];
        } else {
          this.authList = [];
        }
      }).finally(res => {
        this.isLoading = false;
      });  
      this.isLoadingGroup = true;
      this.$api.codehub.repositorydetail.searchGitGroup(param).then(res => {
        if (res.Status == 'OK') {
          this.authGroupList = res.Return || [];
        } else {
          this.authGroupList = [];
        }        
      }).finally(res => {
        this.isLoadingGroup = false;
      });
    },
    showUser(item) {
      console.log(item);
    },
    changeDownStatus(type, event) { //下载进度和状态的监听
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
