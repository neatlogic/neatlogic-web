<template>
  <TsContain :hasContentPadding="false">
    <template slot="topLeft">     
      <span class="action-item tsfont-plus cursor" @click="showAdd = true">
        {{ $t('page.newtarget',{'target':$t('page.member')}) }}
      </span>
    </template>
    <template slot="topRight">
      <div>
        <InputSearcher v-model="keyword" :placeholder="$t('page.keyword')" @change="userKeyword"></InputSearcher>
      </div>
    </template>
    <template slot="topCenter">            
      <div class="div-btn-contain action-group text-right pr-nm">
        <template v-if="userListData.cardList.length > 0">
          <span class="action-item" :class="isSelectAll?'tsfont-check-square-o':'tsfont-minus-square'" @click="allSelect">{{ isSelectAll ? $t('page.selectall') : $t('page.unselectall') }}</span>
          <span class="action-item tsfont-trash-o" @click="batchDel">{{ $t('page.batchdelete') }}</span>
        </template>
      </div>
    </template>
    <template slot="content">
      <div class="common-adduser">
        <div class="card-content">
          <template v-if="userListData.cardList && userListData.cardList.length > 0">
            <TsCard
              v-bind="userListData"
              :boxShadow="false"
              :padding="false"
              :fixBtn="true"
              :sm="12"
              :lg="8"
              :xl="6"
              :xxl="4"
              :userInfoStyle="true"
              @updatePage="getRoleUserList"
            >
              <template slot-scope="{ row, index }">
                <div class="block-wrapper bg-block radius-md" :class="[{isLevel : row.level}, {active : single[row.uuid]}]">
                  <div class="block-item">
                    <div class="text-content">
                      <div class="top">
                        <Checkbox v-model="single[row.uuid]" style="z-index:9"></Checkbox>
                        <i class="tsfont-close item-del" @click="userDel(row,index)"></i>
                      </div>
                      <UserDetail :uuid="row.uuid" :type="detailType"></UserDetail>
                    </div>
                  </div>
                </div>
              </template>
            </TsCard>

          </template>
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
              <span v-if="userCount.number> 0" style="float:left;padding-top:10px">{{ $t('message.framework.usercounttarget',{target:userCount.number}) }}</span>
              <Button style="margin-left: 8px" @click="showAdd = false;">{{ $t('page.cancel') }}</Button>
              <Button type="primary" :disabled="userCount.number<= 0" @click="submitUser">{{ $t('page.save') }}</Button>
            </div>
          </template>
        </TsDialog>
      </div>
    </template>
  </TsContain>
</template>

<script>
export default {
  name: 'CommonAdduser',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    UserDetail: resolve => require(['./common-user-detail'], resolve),
    selectUser: resolve => require(['./common-select-user-role'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher'], resolve)
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
      // 刷新列表数据方法
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      userListData: {cardList: []},
      keyword: '',
      userNum: 0,
      currentPage: 1,
      pageSize: 40,
      // userUuidList: [],
      single: {},
      selectList: [],
      detailType: 'user',
      isSelectAll: true, // 是否是全选文案
      showAdd: false,
      userCount: {userUuidList: [], teamUuidList: [], number: 0}
    };
  },

  beforeCreate() {},

  created() {
    this.authName && this.getRoleUserList();
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
    userKeyword() {
      this.getRoleUserList();
    },
    //获取当前角色下的用户列表,用在角色管理页面添加用户
    getRoleUserList: function(currentPage) {
      let data = {
        roleUuid: this.authName,
        keyword: this.keyword || '',
        pageSize: this.pageSize,
        currentPage: currentPage || this.currentPage,
        needPage: true
      };
      this.$api.framework.user.newSearchUser(data).then(res => {
        if (res.Status == 'OK') {
          this.userNum = res.Return.rowNum;
          // this.userUuidList = [];
          let newArr = [];
          res.Return.tbodyList.forEach(tbody => {
            let obj = {
              text: tbody.userName,
              value: tbody.userId,
              uuid: tbody.uuid
            };
            newArr.push(obj);
            // this.userUuidList.push(obj);
          });
          this.userListData = res.Return;
          this.userListData.cardList = newArr;
        }
      });
    },
    //点击删除用户
    userDel(item, index) {
      if (this.authName) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deletetargetconfirm', {targer: item.text}),
          btnType: 'error',
          'on-ok': async vnode => {
            const key = await this.deleteMember(item.uuid);
            if (key === 'OK') {
              this.userListData.cardList.splice(index, 1);
              this.$Message.success(this.$t('message.deletesuccess'));
              this.$emit('deleteOk');
              vnode.isShow = false;
            }
          }
        });
      } else {
        this.userListData.cardList.splice(index, 1);
      }
    },
    //确认删除
    deleteMember: function(val) {
      let data = {
        roleUuid: this.authName,
        userUuidList: typeof val === 'string' ? [val] : val
      };
      return new Promise((resolve, reject) => {
        this.$api.framework.role.deleltRoleUser(data).then(res => {
          resolve(res.Status);
        });
      });
    },
    //全选
    allSelect: function() {
      let list = this.userListData.cardList;
      list.forEach((item) => {
        this.$set(this.single, item.uuid, this.isSelectAll);
      });
      this.isSelectAll = !this.isSelectAll;
    },
    //批量删除
    batchDel() {
      const _this = this;
      let arrA = this.userListData.cardList;
      let arrB = this.selectList;
      if (arrB.length <= 0) {
        this.$Message.warning(this.$t('message.selectobjdel'));
        return;
      }
     
      if (this.authName) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deletetargetconfirm', {target: this.$t('term.framework.selectedtarget')}),
          btnType: 'error',
          'on-ok': async vnode => {
            const key = await this.deleteMember(arrB);
            if (key === 'OK') {
              this.batchCancle(arrB, arrA);
              _this.$emit('deleteOk');
              _this.$nextTick(() => {
                _this.isSelectAll = true; // 设置默认全选状态
              });
              _this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
            }
          },
          'on-cancel': vnode => {
            // 取消
            let list = this.userListData.cardList;
            list && list instanceof Array && list.forEach((item) => {
              this.$set(this.single, item.uuid, false);
            });
          }
        });
      } else {
        this.batchCancle(arrB, arrA);
      }
    },
    batchCancle: function(arrB, arrA) {
      for (let i = 0; i < arrB.length; i++) {
        for (let j = 0; j < arrA.length; j++) {
          if (arrB[i] === arrA[j].uuid) {
            arrA.splice(j, 1);
          }
        }
      }
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
      // 模态框，点击确认按钮
      let _this = this;
      let uuidList = [];
      if (this.userCount.userUuidList) {        
        uuidList = this.isRepeat(this.userCount.userUuidList, uuidList);
      } 
      this.showAdd = false;     
      this.isSelectAll = true; 
      this.saveUuidList = uuidList.map(item => item.uuid);
      this.userListData.cardList.push(...uuidList);
      this.$emit('saveUser');
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
    getSaveUuidList() {
      return this.saveUuidList;
    }
  },

  filter: {},

  computed: {
    showUser() {
      return function(li) {
        let showstyle = { display: 'block' };
        if (li) {
          li.value.indexOf(this.keyword) < 0 && li.text.indexOf(this.keyword) < 0 && (showstyle = { display: 'none' });
        }
        return showstyle;
      };
    }
  },

  watch: {
    single: {
      handler: function(newVal) {
        for (let i in newVal) {
          let index = this.selectList.indexOf(i);
          if (newVal[i] && index == '-1') {
            this.selectList.push(i);
          } else if (newVal[i] == false) {
            let cindex = this.selectList.indexOf(i);
            this.selectList.splice(cindex, 1);
          }
        }
        if (this.selectList.length === this.userListData.cardList.length) {
          this.isSelectAll = false;
        } else {
          this.isSelectAll = true;
        }
      },
      deep: true
    },
    showAdd(val) {
      if (!val) {
        this.userCount = {userUuidList: [], teamUuidList: [], number: 0};
      }
    },
    refreshListSetting: {
      handler(val) {
        if (val && val.isRefreshRoleUserList) {
          this.getRoleUserList();
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
.common-adduser {
  height: 100%;
  padding-top: 7px;
  .card-content {
    height: calc(100vh - 186px);
    overflow: auto;
    padding-bottom: 60px;
    .block-wrapper {
      // margin-bottom: 16px;
      // border: 1px solid transparent;
      .block-item {
        // height: 110px;
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
            right: 0px;
            top: -2px;
            .item-del {
              opacity: 0;
              cursor: pointer;
            }
          }
          // padding: 16px;
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
  .active {
    border-color: @primary-color;
  }
}
</style>
