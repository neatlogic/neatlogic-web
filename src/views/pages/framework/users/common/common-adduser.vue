<template>
  <div class="common-adduser">
    <div class="top">
      <div class="bar-top">
        <div class="bar-top-left">
          <div class="div-btn-contain action-group">
            <template>
              <span v-show="type !== 'auth_role'" class="action-item tsfont-plus" @click="add(type)">{{ $t('page.newtarget',{'target':$t('page.member')}) }}</span>
              <span v-show="type == 'auth_role'" class="action-item tsfont-plus" @click="add(type)">{{ $t('page.newtarget',{'target':$t('page.role')}) }}</span>
            </template>
          </div>
        </div>
        <div class="bar-top-right">
          <div class="div-btn-contain action-group">
            <template v-if="roleUuidList.length > 0 || userUuidList.length > 0">
              <span class="action-item" :class="isSelectAll?'ts-check-square-o':'tsfont-minus-square'" @click="allSelect">
                {{ isSelectAll ? $t('page.selectall') : $t('page.unselectall') }}
              </span>
              <span class="action-item tsfont-trash-o" @click="batchDel">{{ $t('page.batchdelete') }}</span>
            </template>
          </div>
          <InputSearcher
            v-model="keyword"
            :placeholder="$t('page.keyword')"
            class="search"
            @change="ints"
          ></InputSearcher>
        </div>
      </div>
    </div>
    <div class="card-content">
      <TsRow>
        <template v-if="type == 'auth_role'|| type=='team'">
          <Col
            v-for="(item,index) in userUuidList"
            :key="item.value"
            :xxl="4"
            :md="6"
            :sm="6"
            :xs="24"
            :style="showUser(item, index)"
          >
            <div class="block-wrapper bg-block radius-md" :class="[{isLevel : item.level}, {active : single[item.uuid]}]">
              <div class="block-item">
                <div class="text-content">
                  <div class="top">
                    <Checkbox v-model="single[item.uuid]" style="z-index:9"></Checkbox>
                    <i class="tsfont-close item-del" @click="userDel(item,index)"></i>
                  </div>
                  <UserDetail :uuid="item.uuid" :type="detailType"></UserDetail>
                </div>
              </div>
            </div>
          </Col>
          <div v-if="userUuidList.length == 0">
            <NoData></NoData>
          </div>
        </template>        
        <template v-else>
          <TsCard
            v-if="isRefresh"
            v-bind="matrixCardData"
            :sm="12"
            :lg="8"
            :xl="6"
            :xxl="4"
            :boxShadow="false"          
            classname="overvivew-main"
            @updatePage="getpageList"
          >
            <template slot-scope="{ row, index }">
              <div class="block-wrapper bg-block radius-md">
                <div class="block-item">
                  <div class="text-content">
                    <UserDetail v-if="isShow" :uuid="row.uuid"></UserDetail>
                    <div class="top">
                      <Checkbox v-model="single[row.uuid]" style="z-index:9"></Checkbox>
                      <i class="tsfont-close item-del" @click="userDel(row,index)"></i>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </TsCard>
        </template>
      </TsRow>
    </div>
    <TsDialog
      v-if="showAdd"
      type="modal"
      :isShow.sync="showAdd"
      :title="$t('page.newtarget',{'target':$t('page.member')})"
      width="medium"
    >
      <template v-slot>
        <selectUser @getUserNum="getUserNum"></selectUser>
      </template>
      <template v-slot:footer>
        <div class="drawer-footer">
          <span v-if="userCount.number> 0" style="float:left;padding-top:10px"> {{ $t('message.framework.usercounttarget',{target:userCount.number}) }} </span>
          <Button style="margin-left: 8px" @click="showAdd = false;">{{ $t('page.cancel') }}</Button>
          <Button type="primary" :disabled="userCount.number<= 0" @click="submitUser">{{ $t('page.save') }}</Button>
        </div>
      </template>
    </TsDialog>

    <TsDialog
      v-if="showAddRole"
      type="modal"
      :isShow.sync="showAddRole"
      :title="$t('page.newtarget',{'target':$t('page.role')})"
      width="50%"
    >
      <template>
        <roleList @getSelect="getRoleSelect"></roleList>
      </template>
      <template v-slot:footer>
        <div class="drawer-footer">
          <span style="float:left;padding-top:10px"> {{ roleCount.text }}</span>
          <Button style="margin-left: 8px" @click="showAddRole = false">{{ $t('page.cancel') }}</Button>
          <Button v-if="roleCount.roleUuidList && roleCount.roleUuidList.length > 0" type="primary" @click="submitRole">{{ $t('page.save') }}</Button>
          <Button v-else type="primary" disabled>{{ $t('page.save') }}</Button>
        </div>
      </template>
    </TsDialog>
  </div>
</template>

<script>
import TsCard from '@/resources/components/TsCard/TsCard';
export default {
  name: 'CommonAdduser',
  components: {
    TsCard,
    UserDetail: resolve => require(['./common-user-detail'], resolve),
    selectUser: resolve => require(['./common-select-user'], resolve),
    roleList: resolve => require(['./select-user/role-list'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: {
    authName: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'role'
    },
    isTeam: {
      type: Boolean,
      default: false
    },
    refreshListSetting: {
      // 刷新列表
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      keyword: '',
      userNum: 0,
      isShow: true,
      isRefresh: true,
      userUuidList: [],
      roleUuidList: [],
      valueJsonList: [],
      single: {},
      selectList: [],
      detailType: 'user',
      isSelectAll: true,
      showAdd: false,
      userCount: {userUuidList: [], teamUuidList: [], number: 0},
      roleCount: {},
      matrixCardData: {
        //卡片布局的矩阵初始数据
        cardList: [],
        currentPage: 1,
        pageSize: 24,
        pageCount: 1
      },
      currentPage: 1, //当前页数
      showAddRole: false
    };
  },

  beforeCreate() {},

  created() {
    this.initConfig();
  },

  beforeMount() {},

  mounted() {},

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    initConfig() {
      if (this.authName != '' && this.type == 'role') {
        this.getRoleUserList(this.authName);
      } else if (this.authName != '' && this.type == 'auth_user') {
        this.getAuthUserList(this.authName);
      } else if (this.authName != '' && this.type == 'auth_role') {
        this.getAuthRoleList(this.authName);
        this.detailType = 'role';
      } else if (this.authName != '' && this.type == 'team') {
        this.getTeamUserList(this.authName);
      // this.detailType = "user";
      }
    },
    add(index) {
      if (index != 'auth_role' || this.type === 'team') {
        this.showAdd = true;
      } else {
        this.showAddRole = true;
      }
    },
    ints() {
      if (this.type === 'auth_user') {
        this.getAuthUserList(this.authName);
        // this.$emit('saveUser');
      }
    },
    getTeamUserList: function(uuid) {
      //用户列表，添加用户
      let data = {
        teamUuid: uuid
      };
      this.$api.common.getUserListForTeam(data).then(res => {
        if (res.Status == 'OK') {
          this.userNum = res.Return.teamUserList;
          this.userUuidList = [];
          res.Return.teamUserList.forEach(tbody => {
            let obj = {
              text: tbody.userName,
              value: tbody.userId,
              uuid: tbody.uuid,
              level: tbody.title || null,
              leveltext: tbody.titleText || null
            };
            this.userUuidList.push(obj);
          });
          this.$nextTick(() => {
            this.matrixCardData = res.Return;
            this.matrixCardData.cardList = this.userUuidList;
          });
        }
      });
    },
    //获取当前角色下的用户列表,用在角色管理页面添加用户
    getRoleUserList: function(val) {
      let data = {
        roleUuid: val,
        keyword: this.keyword
        // needPage: false
      };
      this.$api.framework.user.newSearchUser(data).then(res => {
        if (res.Status == 'OK') {
          this.userNum = res.Return.rowNum;
          this.userUuidList = [];
          res.Return.tbodyList.forEach(tbody => {
            let obj = {
              text: tbody.userName,
              value: tbody.userId,
              uuid: tbody.uuid
            };
            this.userUuidList.push(obj);
          });
        }
      });
    },
    //获取当前权限下的用户列表，用在权限管理页面获取该权限下的用户
    getAuthUserList: function(val, page) {
      let data = {
        auth: val,
        keyword: this.keyword,
        pageSize: this.matrixCardData.pageSize,
        currentPage: page || this.matrixCardData.currentPage
      };
      this.$api.common.getAuthUserList(data).then(res => {
        if (res.Status == 'OK') {
          this.userUuidList = [];
          // res.Return.userList.forEach(tbody => {
          //   let obj = {
          //     text: tbody.userName,
          //     value: tbody.userId,
          //     uuid: tbody.uuid
          //   };
          //   this.userUuidList.push(obj);
          // });
          this.isShow = false;
          
          this.$nextTick(() => {
            this.roleUuidList = [];
            if (res.Return.tbodyList) {
              res.Return.tbodyList.forEach(tbody => {
                let obj = {
                  text: tbody.userName,
                  value: tbody.userId,
                  uuid: tbody.uuid
                };
                this.roleUuidList.push(obj);
              });
              this.matrixCardData = res.Return;
            }
            this.isShow = true;
          });
          
          this.$emit('getuserIdList', this.userUuidList);
        }
      });
    },
    getpageList(page) {
      this.getAuthUserList(this.authName, page);
    },
    //获取当前权限下的角色列表，用在权限管理页面获取该权限下的角色
    getAuthRoleList: function(val) {
      let data = {
        auth: val,
        keyword: this.keyword
      };
      this.$api.common.getAuthRoleList(data).then(res => {
        if (res.Status == 'OK') {
          this.userUuidList = [];
          res.Return.roleList.forEach(tbody => {
            let obj = {
              text: tbody.description,
              value: tbody.name,
              uuid: tbody.uuid
            };
            
            this.userUuidList.push(obj);
          });          
          this.$emit('getroleIdList', this.userUuidList);
        }
      });
    },
    //点击删除用户
    userDel(item, index) {
      const _this = this;
      item.name = item.text || item.name;
      if (this.authName) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: item.name}),
          btnType: 'error',
          'on-ok': async vnode => {
            const key = await this.deleteMember(item.uuid);            
            if (key === 'OK') {
              _this.isShow = false;
              _this.$nextTick(() => {
                // _this.matrixCardData.tbodyList.splice(index, 1);
                _this.$Message.success(this.$t('message.deletesuccess'));
                _this.$emit('deleteOk');
                _this.initConfig();
                vnode.isShow = false;
                _this.isShow = true;
              });
            }
          },
          'on-cancel': vnode => {}
        });
      } else {
        this.roleUuidList.splice(index, 1);
        this.userUuidList.splice(index, 1);
      }
    },
    //确认删除
    deleteMember: function(val) {
      let userUuidList = [];
      if (typeof val === 'string') {
        userUuidList.push(val);
      } else if (typeof val === 'object') {
        userUuidList = val;
      }
      let data = {};
      if (this.type === 'role') {
        data = {
          roleUuid: this.authName,
          userUuidList: userUuidList
        };
        return new Promise((resolve, reject) => {
          this.$api.framework.role.deleltRoleUser(data).then(res => {
            if (res.Status === 'OK') {
              resolve(res.Status);
            }
          });
        });
      } else if (this.type === 'team') {
        data = {
          teamUuid: this.authName,
          userUuidList: userUuidList
        };
        return new Promise((resolve, reject) => {
          this.$api.framework.team.deleltTeamUser(data).then(res => {
            if (res.Status === 'OK') {
              resolve(res.Status);
            }
          });
        });
      } else if (this.type === 'auth_user') {
        data = {
          auth: this.authName,
          userUuidList: userUuidList
        };
        return new Promise((resolve, reject) => {
          this.$api.framework.auth.deleltAuthUser(data).then(res => {
            if (res.Status === 'OK') {
              resolve(res.Status);
            }
          });
        });
      } else if (this.type === 'auth_role') {
        data = {
          auth: this.authName,
          roleUuidList: userUuidList
        };
        return new Promise((resolve, reject) => {
          this.$api.framework.auth.deleltAuthRole(data).then(res => {
            if (res.Status === 'OK') {
              resolve(res.Status);
            }
          });
        });
      }
    },
    //全选
    allSelect: function() {
      let list = null;
      if (this.type == 'auth_role' || this.type === 'team') {
        list = JSON.parse(JSON.stringify(this.userUuidList));
      } else {
        list = JSON.parse(JSON.stringify(this.roleUuidList));
      }
      
      for (let i = 0; i < list.length; i++) {
        let index = list[i].uuid;
        this.$set(this.single, index, this.isSelectAll);
      }
      this.$nextTick(() => {
        this.isSelectAll = !this.isSelectAll;
      });
    },
    //批量删除
    batchDel() {
      const _this = this;
      let arrA = [];
      if (this.type == 'auth_role' || this.type === 'team') {
        arrA = this.userUuidList;
      } else {
        arrA = this.roleUuidList;
      }

      // let arrA = this.userUuidList;
      let arrB = this.selectList;
      if (arrB.length > 0) {
        if (this.authName) {
          this.$createDialog({
            title: this.$t('dialog.title.deleteconfirm'),
            content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.target')}),
            btnType: 'error',
            'on-ok': async vnode => {
              const key = await this.deleteMember(arrB);
              if (key === 'OK') {
                for (let i = 0; i < arrB.length; i++) {
                  for (let j = 0; j < arrA.length; j++) {
                    if (arrB[i] === arrA[j].uuid) {
                      arrA.splice(j, 1);
                    }
                  }
                }
                _this.isShow = false;
                _this.initConfig();
                _this.$nextTick(() => {
                  _this.isShow = true;
                  _this.isSelectAll = true;
                });
                _this.batchCancle();
                _this.$emit('deleteOk');
                _this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
              }
            },
            'on-cancel': vnode => {}
          });
        } else {
          for (let i = 0; i < arrB.length; i++) {
            for (let j = 0; j < arrA.length; j++) {
              if (arrB[i] === arrA[j].uuid) {
                arrA.splice(j, 1);
              }
            }
          }
        }        
      } else {
        this.$Message.warning(this.$t('message.selectobjdel'));
      }
    },
    batchCancle: function() {
      this.isSelectAll = true;
      this.single = {};
      this.selectList = [];
    },
    getUserNum(val) {
      Object.assign(this.userCount, val);
      if (this.userCount.teamUuidList.length > 0) {
        let uuidList = this.userCount.userUuidList.map(item => {
          return item.uuid;
        });
        let data = {teamUuidList: this.userCount.teamUuidList, userUuidList: uuidList};
        this.$api.framework.auth.getUserCount(data).then(res => {
          if (res.Return) {
            this.userCount.number = res.Return.count;
          }
        });
      } else {
        this.userCount.number = this.userCount.userUuidList.length;
      }
    },
    async submitUser() {
      let _this = this;
      if (this.userCount.teamUuidList && this.userCount.teamUuidList.length > 0) { //获取用户组中激活的用户列表
        this.isShow = false;
        await this.$api.common.getUserUuidForTeam({ teamUuidList: this.userCount.teamUuidList, isActive: 1 }).then(res => { 
          if (res.Status === 'OK') {
            let newList = res.Return.map(item => {
              let obj = {
                text: item.userName,
                value: item.userId,
                uuid: item.uuid
              };
              return obj;
            });
            _this.userCount.userUuidList = _this.isRepeat(newList, this.userCount.userUuidList);        
          }
        });
      }
     
      if (this.userCount.userUuidList) {
        this.userUuidList = this.isRepeat(this.userCount.userUuidList, this.userUuidList);
      } 
      this.isRefresh = false;
      this.showAdd = false;
      this.saveUuidList = this.userUuidList.map(item => item.uuid);
      this.$emit('saveUser', this.saveUuidList);
      this.$nextTick(() => {
        this.isRefresh = true;
        this.isShow = true;  
      });
    },
    submitRole() {
      // 新增角色
      const oldList = this.userUuidList;
      const newList = this.roleCount.roleUuidList;
      const concatList = this.isRepeat(newList, oldList);
      this.userUuidList = concatList;
      this.showAddRole = false;
      this.isShow = false;
      this.saveUuidList = this.userUuidList.map(item => item.uuid);
      this.$emit('saveRole', this.saveUuidList); 
      this.isShow = true;   
    },
    isRepeat(l1, l2) {
      //l1新增数组，l2目标数组
      let targetList = l2;
      for (let d = 0; d < l1.length; d += 1) {
        if (!l2.find(i => i.uuid === l1[d].uuid)) {
          targetList.unshift(l1[d]);
        }
      }
      return targetList;
    },
    getRoleSelect(list) {
      const roleList = list.map(item => {
        return {
          text: item.description,
          value: item.name,
          uuid: item.uuid
        };
      });
      this.roleCount = {
        text: list.length > 0 ? this.$t('message.framework.selectrolecount', {target: list.length}) : '',
        roleUuidList: roleList
      };
    },
    getSaveUuidList() { 
      this.saveUuidList = this.userUuidList.map(item => item.uuid);//saveUuidList 主要用于新增角色和组时拿去数据 ,不能删除
      return this.saveUuidList;
    }
  },

  filter: {},

  computed: {
    showUser() {
      return function(li) {
        let showstyle = { display: 'block' };
        if (this.keyword && li && (this.type === 'auth_role' || this.type === 'team')) {
          li.value.indexOf(this.keyword) < 0 && li.text.indexOf(this.keyword) < 0 && (showstyle = { display: 'none' });
        }
        return showstyle;
      };
    }
  },

  watch: {
    single: {
      handler: function(newVal) {
        this.selectList = [];
        for (let i in newVal) {
          if (newVal[i]) {
            this.selectList.push(i);
          }
        }
        
        this.$nextTick(() => {
          if (this.selectList.length == 0) {
            this.isSelectAll = true;
          } else {
            this.isSelectAll = false;
          }
        });
      },
      deep: true
    },
    showAdd(val) {
      if (!val) {
        this.userCount = {userUuidList: [], teamUuidList: [], number: 0};
      }
    },
    showAddRole(val) {
      if (!val) {
        this.roleCount = {};
      }
    },
    refreshListSetting: {
      handler(val) {
        if (val && (val.isRefreshAuthUserList || val.isRefreshTeamUserList || val.isRefreshRoleUserList)) {
          this.initConfig(); // 保存成功，刷新用户列表
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/framework/manage.less';
.bar-top-left{
  height: 32px;
  line-height: 32px;
}
.addTip{
  z-index: 2;
  margin-top: 12px;
  .block-item{
    height:104px!important;
  }
}
.roleshadw:hover{
  box-shadow: 0px 1px 4px 0px rgb(0 0 0 / 10%);
}
.overvivew-main{
  .text-content{
    padding: 8px!important;
  }
  .block-wrapper{
    margin-bottom: 0px!important;
    border: 0px solid transparent!important;
  }
  
}
/deep/.tscard-body{
  padding: 0!important;
  // border-radius: 0px!important;
}
.common-adduser {
  height: 100%;
  .bar-top {
    margin-bottom: 16px;
    .bar-top-right {
      height: 32px;
      line-height: 32px;
      width: 700px;
      .action-group {
        width: 280px;
        text-align: right;
        float: left;
      }
      .search {
        width: 400px;
        float: right;
      }
    }
  }
  .card-content {
    height: calc(100vh - 186px);
    overflow: auto;
    padding-bottom: 60px;
    // padding-top: 20px;
    .block-wrapper {
      margin-bottom: 16px;
      border: 1px solid transparent;
      .block-item {
        height: 110px;
        // .top {
        //   padding: 8px;
        //   text-align: right;
        // }
        .text-content {
          position: relative;
          .level {
            position: absolute;
            left: 0;
            top: -23px;
            > i {
              display: none;
              padding-left: 3px;
              cursor: pointer;
            }
            &:hover {
              > i {
                display: inline-block;
              }
            }
          }
          .tip {
            position: absolute;
            top: -1px;
            left: -1px;
            border: 17.5px solid;
            border-color: @warning-color transparent transparent @warning-color;
            > i {
              color: @white;
              font-size: 12px;
              position: absolute;
              top: -16px;
              left: -14px;
            }
          }
          .top {
            position: absolute;
            right: 8px;
            top: 6px;
            .item-del {
              opacity: 0;
              cursor: pointer;
            }
          }
          padding: 16px;
        }
      }
      .block-add {
        border: 1px dashed;
        cursor: pointer;
        .text-content {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          font-size: 16px;
          i {
            &::before {
              padding-right: 8px;
            }
          }
        }
      }
      &:hover {
        .text-content {
          .top {
            .item-del {
              opacity: 1;
            }
          }
        }
      }
    }
  }
  .isLevel {
    border-color: @warning-color;
  }
  .active {
    border-color: @primary-color;
  }
}
</style>
