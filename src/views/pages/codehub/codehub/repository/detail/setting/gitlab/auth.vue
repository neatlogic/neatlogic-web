<template>
  <div>
    <div style="margin-bottom:10px;">
      <Button type="primary" @click="addAuth()"><i class="ts-plus"></i>权限</Button> 
      <Button v-if="!isDowning" v-download="downloadPath" class="ml-10">导出Excel</Button> 
      <Button v-else loading class="ml-10">导出中</Button> 
    </div>
    <h4>用户授权</h4>
    <div v-if="!isLoading">
      <TsTable
        v-bind="tabledata"
        :tbodyList="authList"
      >
        <template slot="name" slot-scope="{row}">
          <UserCard
            :id="row.id"
            :row="row"
            type="member"
            :repositoryUuid="uuid"
          ></UserCard>
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
            <div class="action-item text-action ts-edit" @click="editAuth(row)">编辑</div>
            <div class="action-item text-action ts-trash" @click="delAuth(row)">删除</div>
          </div>
        </template>
      </TsTable>
    </div>
    <Loading v-else loadingShow style="min-height:100px"></Loading>
    <Divider />
    <h4>分组授权</h4>
    <div v-if="!isLoadingGroup">
      <TsTable
        v-bind="grouptabledata"
        :tbodyList="authGroupList"
      >
        <template slot="name" slot-scope="{row}">
          <UserCard
            :id="row.id"
            :row="row"
            type="group"
            :repositoryUuid="uuid"
          ></UserCard>
        </template>
        <template slot="endtime" slot-scope="{row}">
          {{ row.endtime | formatDate }}
        </template>
        <template slot="group_access_level" slot-scope="{row}">
          {{ getText(row.group_access_level) }}
        </template>
        <template slot="actions" slot-scope="{row}">
          <div class="action-group">
            <div class="action-item text-action ts-edit" @click="editAuth(row,'group')">编辑</div>
            <div class="action-item text-action ts-trash" @click="delAuth(row,'group')">删除</div>
          </div>
        </template>
      </TsTable>
    </div>
    <Loading v-else loadingShow style="min-height:100px"></Loading>
    <AuthAdd
      v-if="isEdit"
      :isShow="isEdit"
      :uuid="uuid"
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
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  filters: {},
  directives: { download},
  props: {
    uuid: String
  },
  data() {
    return {
      colorConfig: {
        blocked: '#e42332',
        active: '#2ed373'
      },
      tabledata: {
        theadList: [{
          title: '用户名',
          key: 'name'
        }, {
          title: '状态',
          key: 'state'
        }, {
          title: '继承自',
          key: 'group_name'
        }, {
          title: '权限',
          key: 'access_level'
        }, {
          title: '截止日期',
          key: 'expires_at'
        }, {
          key: 'actions',
          width: 80
        }],
        rowKey: 'id'
      },
      grouptabledata: {
        theadList: [{
          title: '组名',
          key: 'name'
        }, {
          title: '权限',
          key: 'group_access_level'
        }, {
          title: '截止日期',
          key: 'expires_at'
        }, {
          key: 'actions',
          width: 80
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
        'repositoryUuid': this.uuid
      };
      let _this = this;
      _this.$createDialog({
        title: '删除确认',
        content: '是否确认删除该权限',
        btnType: 'error',
        'on-ok': function(vnode) {
          if (type) {
            Object.assign(param, {
              'group_id': row.id
            });
            _this.$api.codehub.repositorydetail.deleteGitAuth('group', param).then((res) => {
              if (res && res.Status == 'OK') {
                _this.$Message.success('删除成功');
                _this.getList();
                vnode.isShow = false;
              } else {
                _this.$Message.error(res.Message);
              }
            });
          } else {
            Object.assign(param, {
              'user_id': row.id
            });
            _this.$api.codehub.repositorydetail.deleteGitAuth('member', param).then((res) => {
              if (res && res.Status == 'OK') {
                _this.$Message.success('删除成功');
                _this.getList();
                vnode.isShow = false;
              } else {
                _this.$Message.error(res.Message);
              }
            });
          }
        }
      });     
    },
    getList() {
      //获取权限列表
      let param = {
        repositoryUuid: this.uuid
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
        url: '/module/codehub/api/binary/repository/permission/export',
        params: {
          repositoryUuid: this.uuid
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
