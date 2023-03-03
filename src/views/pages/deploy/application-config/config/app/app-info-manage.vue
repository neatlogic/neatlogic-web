
<template>
  <div class="app-manage-wrap">
    <AppInfo :appSystemId="appSystemId"></AppInfo>
    <div class="border-bottom border-color"></div>
    <div class="pt-nm">
      <span class="pl-nm">通知</span>
    </div>
    <div class="mb-nm">
      <TsForm
        ref="form"
        v-model="formValue"
        :item-list="formList"
      ></TsForm>
    </div>
    <div class="border-bottom border-color"></div>
    <div class="pt-nm">
      <span class="pl-nm">权限</span>
    </div>
    <div class="pt-nm pl-nm pr-nm">
      <TsRow class="pb-sm">
        <Col span="10">
          <div class="action-group mt-xs">
            <span v-show="hasEditConfigAuth" class="action-item tsfont-plus text-href" @click="openAuthDialog">添加</span>
            <span
              v-show="hasEditConfigAuth"
              class="action-item tsfont-edit"
              :class="!selectedAuthList || selectedAuthList.length == 0 ? 'disable' : ''"
              @click="batchEdit"
            >编辑</span>
            <span
              v-show="hasEditConfigAuth"
              class="action-item tsfont-trash-o"
              :class="!selectedAuthList || selectedAuthList.length == 0 ? 'disable' : ''"
              @click="batchDeleteAuth"
            >删除</span>
          </div>
        </Col>
        <Col span="6">
          <TsFormSelect
            v-model="actionList"
            transfer
            :multiple="false"
            :dataList="authList"
            placeholder="权限"
            @on-change="searchAuth(1)"
          ></TsFormSelect>
        </Col>
        <Col span="8">
          <UserSelect
            v-model="authorityStrList"
            :multiple="false"
            :transfer="true"
            placeholder="用户"
            :groupList="['user', 'role', 'team']"
            @on-change="searchAuth(1)"
          ></UserSelect>
        </Col>
      </TsRow>
      <div class="tstable-container pb-nm">
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div ref="tableMain" class="tstable-main">
          <table ref="tableBody" class="tstable-body">
            <thead> 
              <tr>
                <th
                  v-for="(th, thIndex) in tableConfig.theadList"
                  :key="thIndex"
                  :class="[borderRight(th.key, thIndex + 1), (th.key != 'user') ? 'text-center' : '']"
                >
                  <Checkbox
                    v-if="th.key == 'selection'"
                    v-model="checkAll"
                    :indeterminate="indeterminate"
                    @on-change="selectedAll"
                  ></Checkbox>
                  <span v-else>{{ th.title }}</span>
                </th>
              </tr>
            </thead>
            <tbody v-if="!loadingShow" class="text-center">
              <template v-if="tableConfig.tbodyList.length > 0">
                <tr
                  v-for="(item, index) in tableConfig.tbodyList"
                  :key="item.id"
                  style="position: relative;"
                  @mouseout="onMouseout(item, index)"
                  @mouseover="onMouseover(item, index)"
                >
                  <td
                    v-for="(innerItem, nIndex) in tableConfig.theadList"
                    :key="nIndex"
                    :class="borderRight(innerItem.key, nIndex + 1)"
                  > 
                    <template v-if="innerItem.key == 'selection'">
                      <Checkbox :value="item.isSelected" @on-change="(isSelected) => getSelected(isSelected, item, item.authUuid)"></Checkbox>
                    </template>
                    <template v-else-if="innerItem.key == 'user'">
                      <UserSelect
                        v-if="item.authType && item.authUuid"
                        :value="`${item.authType}#${item.authUuid}`"
                        :readonly="true"
                      ></UserSelect>
                    </template>
                    <span v-else :class="item && item[innerItem.name] ? 'tsfont-check text-success' : 'tsfont-close text-grey'"></span>
                  </td>
                  <div :class="item.isShow ? 'show-operation bg-selected' : 'hide-operation'" :style="item.isShow && topRightWidth ? {right: `${topRightWidth}px`} : ''">
                    <span v-show="hasEditConfigAuth" class="tsfont-edit text-action cursor pr-sm" @click.stop="editAuth(item)">编辑</span>
                    <span v-show="hasEditConfigAuth" class="tsfont-trash-s text-action cursor" @click.stop="delAuth(item)">删除</span>
                  </div>
                </tr>
              </template>
              <template v-else>
                <tr class="text-center">
                  <td :colspan="tableConfig.theadList.length">暂无数据</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <AppEdit
      v-if="isShowAuthDialog"
      :isEdit="isEdit"
      :params="appEditParams"
      @close="closeAuthDialog"
    ></AppEdit>
    <BatchEditAuthDialog v-if="isShowBatchEditDialog" :params="batchEditAppParams" @close="closeBatchEditDialog"></BatchEditAuthDialog>
  </div>
</template>
<script>
export default {
  name: '', // 应用信息
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve),
    AppEdit: resolve => require(['@/views/pages/deploy/application-config/config/app/app-edit.vue'], resolve),
    AppInfo: resolve => require(['@/views/pages/deploy/application-config/config/app/app-info.vue'], resolve),
    BatchEditAuthDialog: resolve => require(['@/views/pages/deploy/application-config/config/app/components/batch-edit-auth-dialog.vue'], resolve), // 批量编辑权限
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    appSystemId: {
      type: Number,
      default: null
    },
    hasEditConfigAuth: {
      // 是否有编辑配置权限
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      topRightWidth: 0, 
      indeterminate: false,
      loadingShow: false,
      checkAll: false, // 全选
      authorityStrList: '', // 用户
      actionList: '', // 权限
      isShowAuthDialog: false,
      isShowBatchEditDialog: false,
      operationAuthLength: 0,
      envAuthLength: 0,
      selectedAuthList: [],
      authList: [], // 权限下拉列表
      envAuthList: [], // 环境权限列表
      operationAuthList: [],
      scenarioAuthList: [],
      appEditParams: {},
      batchEditAppParams: {}, // 批量编辑
      searchParam: {
        appSystemId: this.appSystemId
      },
      tableConfig: {
        theadList: [],
        tbodyList: []
      },
      formValue: {
        notifyPolicyId: null
      },
      formList: [
        {
          type: 'select',
          label: '通知策略',
          name: 'notifyPolicyId',
          dynamicUrl: 'api/rest/notify/policy/search',
          params: {handler: 'neatlogic.module.deploy.notify.handler.DeployJobNotifyPolicyHandler'},
          search: true,
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          width: '30%',
          labelWidth: 82,
          onChange: (val) => {
            this.changeNotifyPolicy(val);
          }
        }
      ]

    };
  },
  beforeCreate() {},
  created() {
    if (this.appSystemId) {
      this.getAppSystemNotifyId(this.appSystemId);
    }
  },
  beforeMount() {},
  mounted() {
    this.loadingShow = true;
    this.getAuthList().then(() => {
      this.searchAuth(1);
    }).finally(() => {
      this.loadingShow = false;
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getAuthList() {
      await this.$api.deploy.applicationConfig.getAuthList({appSystemId: this.appSystemId}).then((res) => {
        if (res && res.Status == 'OK') {
          let dataInfo = res.Return || {};
          this.handleAuthListData(dataInfo);
          for (let key in dataInfo) {
            if (key && dataInfo[key]) {
              dataInfo[key].forEach((item) => {
                if (key == 'envAuthList') {
                  this.envAuthList.push(item.value);
                } else if (key == 'scenarioAuthList') {
                  this.scenarioAuthList.push(item.value);
                } else if (key == 'operationAuthList') {
                  this.operationAuthList.push(item.value);
                }
              });
            }
          }
        }
      });
    },
    searchAuth(currentPage) {
      this.searchParam.currentPage = currentPage || 1;
      let searchParam = {
        actionList: this.handleActionList(this.actionList),
        authorityStrList: this.authorityStrList ? [this.authorityStrList] : []
      };
      this.loadingShow = true;
      this.$api.deploy.applicationConfig.getAppConfigAuthList({...this.searchParam, ...searchParam}).then((res) => {
        if (res && res.Status == 'OK') {
          this.operationAuthLength = 0;
          this.envAuthLength = 0;
          this.tableConfig = res.Return;
          this.checkboxIsSelectedAll(false);
          this.tableConfig.theadList.forEach((item) => {
            item['title'] = item.displayName;
            item['key'] = item.name; 
            if (this.operationAuthList.includes(item.key)) {
              this.operationAuthLength = this.operationAuthLength + 1;
            } else if (this.envAuthList.includes(item.key)) {
              this.envAuthLength = this.envAuthLength + 1;
            }
          });
          this.tableConfig.theadList.unshift({
            key: 'selection',
            isSelected: false
          });
          this.setTopRight();
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    openAuthDialog() {
      this.isShowAuthDialog = true;
      this.isEdit = 0;
      this.appEditParams = {};
      this.appEditParams.appSystemId = this.appSystemId;
    },
    editAuth(row) {
      if (row) {
        this.isShowAuthDialog = true;
        this.isEdit = 1;
        this.appEditParams = {
          appSystemId: this.appSystemId,
          authorityStrList: [`${row.authType}#${row.authUuid}`]
        };
      }
    },
    async delAuth(row) {
      if (row && !this.$utils.isEmptyObj(row)) {
        let params = {
          appSystemId: this.appSystemId,
          uuidList: row.authUuid ? [row.authUuid] : []
        };
        let userInfoList = await this.$api.common.getUserRoleTeam({groupList: [row.authType], valueList: [`${row.authType}#${row.authUuid}`]});
        this.$createDialog({
          title: '删除权限',
          content: `确认删除${row.authUuid == 'alluser' ? '所有人' : (userInfoList.Return && userInfoList.Return[0] ? userInfoList.Return[0].dataList[0].text : '')}的所有权限？`,
          btnType: 'error',
          btnList: [
            {
              text: '取消',
              type: 'default',
              ghost: true,
              fn: vnode => {
                vnode.isShow = false;
              }
            },
            { 
              text: '删除',
              type: 'error', 
              fn: vnode => {
                vnode.isShow = false; 
                this.$api.deploy.applicationConfig.batchDelAuthApp(params).then((res) => {
                  if (res && res.Status == 'OK') {
                    this.$Message.success(this.$t('message.content.deletesuccess'));
                    this.setInitData();
                  }
                });
              }
            }
          ]
        });
      }
    },
    closeAuthDialog(needRefresh) {
      this.isShowAuthDialog = false;
      if (needRefresh) {
        this.setInitData();
      }
    },
    getSelected(isSelected, selectedItem, authUuid) {
      if (isSelected) {
        this.selectedAuthList.push(selectedItem);
        this.$set(selectedItem, 'isSelected', true);
      } else {
        this.selectedAuthList.forEach((item, index) => {
          if (item.authUuid == authUuid) {
            this.selectedAuthList.splice(index, 1);
            this.$set(selectedItem, 'isSelected', false);
          }
        });
      }
      if (this.selectedAuthList.length == this.tableConfig.tbodyList.length) {
        // 全选按钮高亮
        this.checkAll = true;
        this.indeterminate = false;
        this.checkboxIsSelectedAll(true);
      } else {
        this.checkAll = false;
        this.indeterminate = true;
        this.checkboxIsSelectedAll(false);
      }
    },
    checkboxIsSelectedAll(isSelectedAll) {
      if (isSelectedAll) {
        this.tableConfig.tbodyList.forEach((item) => {
          this.$set(item, 'isSelected', true);
        });
      } else {
        this.tableConfig.tbodyList.forEach((item) => {
          this.$set(item, 'isSelected', false);
        });
      }
    },
    selectedAll() {
      // 选中所有
      if (this.checkAll) {
        this.checkboxIsSelectedAll(true);
        this.indeterminate = false;
        this.selectedAuthList = this.tableConfig.tbodyList;
      } else {
        this.checkboxIsSelectedAll(false);
        this.indeterminate = true;
        this.selectedAuthList = [];
      }
    },
    onMouseover(item, index) {
      item.isShow = !item.isShow;
      this.$set(this.tableConfig.tbodyList, index, item);
      this.setTopRight();
    },
    onMouseout(item, index) {
      item.isShow = false;
      this.$set(this.tableConfig.tbodyList, index, item);
    },
    batchEdit() {
      // 批量编辑
      if (this.selectedAuthList && this.selectedAuthList.length > 0) {
        let authorityStrList = [];
        this.selectedAuthList.forEach((item) => {
          if (item.authUuid) {
            authorityStrList.push(`${item.authType}#${item.authUuid}`);
          }
        });
        this.batchEditAppParams = {
          appSystemId: this.appSystemId,
          authorityStrList: authorityStrList
        };
        this.isShowBatchEditDialog = true;
      }
    },
    batchDeleteAuth() {
      // 批量删除
      let uuidList = [];
      let batchDelParams = {};
      if (this.selectedAuthList && this.selectedAuthList.length > 0) {
        this.selectedAuthList.forEach((item) => {
          if (item.authUuid) {
            uuidList.push(item.authUuid);
          }
        });
        batchDelParams = {
          appSystemId: this.appSystemId,
          uuidList
        };
        this.$createDialog({
          title: '批量删除权限',
          content: `批量删除被选中权限？`,
          btnType: 'error',
          btnList: [
            {
              text: '取消',
              type: 'default',
              ghost: true,
              fn: vnode => {
                vnode.isShow = false;
              }
            },
            { 
              text: '删除',
              type: 'error', 
              fn: vnode => {
                vnode.isShow = false; 
                this.$api.deploy.applicationConfig.batchDelAuthApp(batchDelParams).then((res) => {
                  if (res && res.Status == 'OK') {
                    this.$Message.success(this.$t('message.content.deletesuccess'));
                    this.setInitData();
                  }
                });
              }
            }
          ]
        });
      }
    },
    setInitData() {
      this.$emit('updateAuth');
      this.checkAll = false;
      this.indeterminate = true;
      this.selectedAuthList = [];
      this.searchAuth(1);
    },
    closeBatchEditDialog(needRefresh) {
      this.isShowBatchEditDialog = false;
      if (needRefresh) {
        this.setInitData();
      }
    },
    handleAuthListData(authObj) {
      this.authList = [];
      let obj = {
        envAuthList: 'env',
        operationAuthList: 'operation',
        scenarioAuthList: 'scenario'
      };
      if (authObj && !this.$utils.isEmptyObj(authObj)) {
        for (let key in authObj) {
          if (key && authObj[key]) {
            authObj[key].forEach((item) => {
              this.authList.push({
                text: item.text,
                value: item.value ? `${obj[key]}/${item.value}` : ''
              });
            });
          }
        }
      }
    },
    handleActionList(auth) {
      let actionList = [];
      if (auth) {
        let authList = auth.split('/');
        if (authList && authList.length > 0) {
          actionList.push({
            action: authList[1],
            type: authList[0]
          });
        }
      }
      return actionList;
    },
    borderRight(key, tIndex) {
      let operation = (2 + parseInt(this.operationAuthLength));
      let env = (parseInt(operation) + parseInt(this.envAuthLength));
      let borderRight = '';
      if (key == 'user') {
        borderRight = 'border-right border-color';
      } else if (operation == tIndex) {
        borderRight = 'border-right border-color';
      } else if (env == tIndex) {
        borderRight = 'border-right border-color';
      }
      return borderRight;
    },
    setTopRight() {
      this.$nextTick(() => {
        let outWidth = this.$refs.tableMain ? this.$refs.tableMain.offsetWidth : 0;
        let innerWidth = this.$refs.tableBody ? this.$refs.tableBody.scrollWidth : 0;
        let scrollLeft = this.$refs.tableMain ? this.$refs.tableMain.scrollLeft : 0; // 左边滚动距离
        this.$set(this, 'topRightWidth', Math.max(0, innerWidth - outWidth) ? Math.max(0, innerWidth - (outWidth + scrollLeft)) + 20 : 0); // 20一个操作按钮的宽度
      });
    },
    //改变策略
    changeNotifyPolicy(notifyPolicyId) {
      let param = {
        appSystemId: this.appSystemId
      };
      if (notifyPolicyId) {
        param['notifyPolicyId'] = notifyPolicyId;
      }
      this.$api.deploy.applicationConfig.saveAppSystemNotify(param).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.savesuccess'));
        }
      });
    },
    getAppSystemNotifyId(appSystemId) {
      let param = {
        appSystemId: appSystemId
      };
      this.$api.deploy.applicationConfig.getAppSystemNotifyId(param).then((res) => {
        if (res.Status == 'OK') {
          this.formValue.notifyPolicyId = res.Return;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/my-theme.less';
.app-manage-wrap {
  overflow: hidden;
  .border-bottom {
    border-bottom: 1px solid;
  }
}
.app-row {
  display: flex;
  align-items: center;
}
.border-right {
  border-right: 1px solid;
}
.hide-operation {
  display: none;
}

.theme(@table-hover-color){
 .show-operation {
  display: inline-block;
  position: absolute;
  top: 10px;
  right: 16px;
  width: 100px;
  text-align: center;
  background-color: @table-hover-color;
}
}

html {
  .theme(@default-table-hover-color);
  &.theme-dark {
    .theme(@dark-table-hover-color);
  }
}
</style>
