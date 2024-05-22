<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <div class="action-icon text-right">
        <span class="tsfont-rotate-right text-tip-active" @click="refreshAccountList"></span>
        <span class="tsfont-edit text-tip-active pl-md" @click="editAccount"></span>
      </div>
      <TsForm
        ref="form"
        v-model="settingConfig"
        :item-list="settingForm"
        type="type"
        label-position="right"
      >
        <template v-slot:account>
          <TsFormSelect
            ref="formSelect"
            v-model="settingConfig.accountList"
            v-bind="settingForm.account"
            @first="gotoAccount"
            @searchCallback="refreshSuccess()"
          >
            <template v-if="validMessage != '' && validMessage == 'validMessage'" v-slot:validMessage>
              <div>
                <template>
                  <div v-for="(value, key, index) in validMessageObj" :key="index" class="form-error-tip">
                    {{ getItem(value) }}
                  </div>
                </template>
              </div>
            </template>
          </TsFormSelect>
        </template>
        <template v-slot:privateAccount>
          <div>
            <div v-if="privateAccountList && privateAccountList.length > 0" class="bg-op radius-lg padding">
              <div
                v-for="(item, index) in privateAccountList"
                :key="item.id"
                @mouseenter="mouseenter(item)"
                @mouseleave="mouseleave(item)"
              >
                <TsRow>
                  <Col span="22" class="text-href">
                    <div @click="editPrivateAccount(item)">
                      {{ item.text }}
                    </div>
                  </Col>
                  <Col span="2">
                    <span v-show="item.isShow" class="tsfont-trash-o cursor" @click="delPrivateAccount(item, index)"></span>
                  </Col>
                </TsRow>
              </div>
            </div>
            <div class="text-href tsfont-plus" @click="openPrivateAccount">{{ $t('page.privateaccount') }}</div>
            <ul v-if="connectTestResultList && connectTestResultList.length > 0" class="mt-xs">
              <!-- 测试连接，失败原因 -->
              <li v-for="(item, index) in connectTestResultList" :key="index" :class="getConnectStatus(item.exitValue)">
                <span class="valid-icon" :class="item.exitValue == 0 ? 'tsfont-check-s' : 'tsfont-close-s'"></span>
                <span>{{ getConnectResultText(item) }} {{ getReasonText(item.exitValue) }}</span>
              </li>
            </ul>
          </div>
        </template>
      </TsForm>
      <template v-slot:footer>
        <Button @click="closeDialog">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="testConnect">{{ $t('page.testconnection') }}</Button>
        <Button type="primary" @click="saveAccount">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
    <PrivateAccountEditDialog
      v-if="isShowNewAccount"
      :resourceId="resourceId"
      :accountId="accountId"
      :accountList="[...privateAccountList, ...publicAccountList]"
      @close="closePrivateAccount"
    ></PrivateAccountEditDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    PrivateAccountEditDialog: () => import('./private-account-edit-dialog')
  },
  filters: {},
  props: {
    resourceId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      isShowNewAccount: false,
      accountId: null,
      publicAccountList: [], // 公共账号列表
      privateAccountList: [], // 私有账号列表
      failureCount: 0, //错误校验信息条数
      successCount: 0, //成功校验信息条数
      failureReasonList: [], //失败校验信息详情
      validMessage: '', //是否显示自定义校验信息
      validMessageObj: {},
      connectTestResultList: [], // 连接测试结果列表
      loadingShow: false,
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.$t('page.accountsmanage'),
        maskClose: false,
        width: '700px'
      },
      settingConfig: {
        accountList: []
      },
      settingForm: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        account: {
          type: 'slot',
          name: 'account',
          label: this.$t('page.publicaccount'),
          transfer: true,
          multiple: true,
          firstText: this.$t('dialog.title.addtarget', {'target': this.$t('page.account')}),
          firstLi: true,
          dynamicUrl: '/api/rest/resourcecenter/account/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAccountNodeList,
          needCallback: false,
          onChange: (val, textlist, nodeList) => {
            let list = [...nodeList, ...this.privateAccountList];
            this.publicAccountList = nodeList || [];
            this.getValidMessage(list);
          }
        },
        privateAccount: {
          type: 'slot',
          name: 'privateAccount',
          label: this.$t('page.privateaccount')
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.resourceId) {
      this.getAccountList();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getValidMessage(list) {
      if (list.length == 0) {
        this.validMessage = '';
      } else {
        this.validMessage = 'noValidMessage';
      }
      let obj = {};
      list &&
        list.forEach(item => {
          let accountProtocal = item.config.account + '/' + item.config.protocol;
          if (obj[accountProtocal]) {
            obj[accountProtocal].push(item.text);
          } else {
            obj[accountProtocal] = [item.text];
          }
        });
      this.validMessageObj = obj;
      Object.keys(obj).forEach(item => {
        if (obj[item].length > 1) {
          this.validMessage = 'validMessage';
        }
      });
    },
    getAccountList() {
      this.getPublicAccountList();
      this.getPrivateAccountList();
    },
    getPublicAccountList() {
      if (this.resourceId) {
        this.$api.cmdb.asset.listAccount({ resourceId: this.resourceId, type: 'public' }).then(res => {
          // 公有账号列表
          if (res.Return.length > 0) {
            this.settingConfig.accountList = [];
            let publicAccountList = [];
            res.Return.forEach(item => {
              if (item.protocol != 'tagent' && item.id) {
                this.settingConfig.accountList.push(item.id);
                publicAccountList.push(item);
              }
            });
            this.publicAccountList = this.$utils.getAccountNodeList(publicAccountList);
          } else {
            this.settingConfig.accountList = [];
            this.publicAccountList = [];
          }
        });
      } else {
        this.settingConfig.accountList = [];
        this.publicAccountList = [];
      }
    },
    getPrivateAccountList() {
      if (this.resourceId) {
        this.$api.cmdb.asset.listAccount({ resourceId: this.resourceId, type: 'private' }).then(res => {
          // 私有账号列表
          if (res.Return.length > 0) {
            this.privateAccountList = [];
            let privateAccountList = [];
            res.Return.forEach(item => {
              if (item.protocol != 'tagent' && item.id) {
                privateAccountList.push(item);
              }
            });
            this.privateAccountList = this.$utils.getAccountNodeList(privateAccountList);
          } else {
            this.privateAccountList = [];
          }
        });
      } else {
        this.privateAccountList = [];
      }
    },
    validRequired() {
      let accountIdList = this.getAccountIdList();
      if (accountIdList && accountIdList.length == 0) {
        this.$Notice.error({ title: this.$t('page.tip'), desc: this.$t('term.cmdb.publicprivateaccountchooseoneaccountdesc') });
        this.connectTestResultList = [];
        return false;
      }
      return true;
    },
    saveAccount() {
      // if (!this.validRequired()) {
      //   return false;
      // }
      let data = {
        resourceId: this.resourceId,
        accountIdList: this.getAccountIdList()
      };
      this.$api.cmdb.asset.saveSingleAccount(data).then(res => {
        if (res.Status == 'OK') {
          this.closeDialog(true);
          this.handleTipsMessage(res, this.$t('message.savesuccess'));
        }
      });
    },
    getAccountIdList() {
      let privateAccountIdList = [];
      this.privateAccountList &&
        this.privateAccountList.forEach(item => {
          if (item.value) {
            privateAccountIdList.push(item.value);
          }
        });
      return [...this.settingConfig.accountList, ...privateAccountIdList];
    },
    handleTipsMessage(res, msg) {
      if (res.Return) {
        this.failureCount = res.Return.failureCount;
        this.successCount = res.Return.successCount;
      }
      // 失败，错误提示
      if (this.failureCount != 0 || (this.failureReasonList && this.failureReasonList.length > 0)) {
        this.$Notice.error({
          title: this.$t('page.tip'),
          duration: 10,
          render: h => {
            return h('div', [
              h('div', { class: 'text-success pb-md' }, [h('span', { class: 'text-success valid-icon tsfont-check-s' }, ''), this.$t('term.cmdb.successfullyboundaccountforassetstarget', {target: this.successCount || 0})]),
              h('div', { class: 'text-danger pb-md' }, [h('span', { class: 'valid-icon tsfont-close-s' }, ''), this.$t('term.cmdb.failedtobindaccountforassetstarget', {target: this.failureCount || 0})]),
              h(
                'ul',
                { class: 'pb-md', style: { lineHeight: '20px', display: this.failureReasonList && this.failureReasonList.length > 0 ? 'block' : 'none' } },
                this.failureReasonList.map(item => {
                  return h('li', {}, item || '');
                })
              )
            ]);
          }
        });
      }

      this.$emit('success', msg);
    },
    openPrivateAccount() {
      // 私有账号
      this.accountId = null;
      this.isShowNewAccount = true;
    },
    delPrivateAccount(row, index) {
      // 删除私有账号
      if (row && row.value) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: row.text }),
          btnType: 'error',
          okText: this.$t('page.delete'),
          'on-ok': vnode => {
            this.$api.cmdb.accountManage.deleteAccountById(row.value).then(res => {
              if (res && res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.privateAccountList.splice(index, 1);
                vnode.isShow = false;
              }
            });
          }
        });
      }
    },
    editPrivateAccount(item) {
      // 编辑私有账号
      if (item && item.value) {
        this.accountId = item.value;
        this.isShowNewAccount = true;
      }
    },
    closePrivateAccount(needRefresh) {
      this.isShowNewAccount = false;
      if (needRefresh) {
        this.getPrivateAccountList();
      }
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    gotoAccount() {
      window.open(HOME + '/cmdb.html#/account-manage?isNewAccountShow=' + true, '_blank');
    },
    editAccount() {
      window.open(HOME + '/cmdb.html#/account-manage', '_blank');
    },
    refreshAccountList() {
      this.$set(this.settingForm.account, 'params', { timeUuid: this.$utils.setUuid() });
      this.$set(this.settingForm.account, 'needCallback', true);
    },
    refreshSuccess() {
      this.$Message.success(this.$t('message.refreshsuccess'));
    },
    testConnect() {
      // 测试连接
      if (!this.validRequired()) {
        return false;
      }
      if (this.resourceId) {
        this.loadingShow = true;
        this.$api.cmdb.asset
          .testConnectAccount({ resourceId: this.resourceId, accountIdList: this.getAccountIdList() })
          .then(res => {
            if (res && res.Status == 'OK') {
              this.connectTestResultList = res.Return || [];
              if (this.connectTestResultList.every(item => item.exitValue == 0)) {
                this.$Message.success(this.$t('message.executesuccess'));
              }
            }
          })
          .finally(() => {
            this.loadingShow = false;
          });
      }
    },
    getConnectResultText(item) {
      let text = '';
      if (item && item.name) {
        text = item.name;
      }
      if (item && item.username) {
        text += `(${item.username})`;
      }
      if (item && item.protocol) {
        text += `/${item.protocol}`;
      }
      if (item && item.protocolPort) {
        text += `(${item.protocolPort})`;
      }
      return text;
    },
    mouseenter(item) {
      // 鼠标移入
      this.$set(item, 'isShow', true);
    },
    mouseleave(item) {
      // 鼠标移出
      this.$set(item, 'isShow', false);
    }
  },
  computed: {
    getItem() {
      return function(value) {
        if (value.length > 1) {
          return value.join('、') + '协议相同且用户名相同，同一资产不可绑定多个协议相同且用户名相同的账号。 ';
        } else {
          return;
        }
      };
    },
    getConnectStatus() {
      // 获取连接状态
      return function(value) {
        let statusObj = {
          0: 'text-success',
          1: 'text-danger',
          2: 'text-danger',
          3: 'text-danger'
        };
        return statusObj[value];
      };
    },
    getReasonText() {
      // 测试连接，成功失败原因
      return function(value) {
        let reasonObj = {
          0: '成功',
          1: '失败，连接错误',
          2: '失败，暂时不支持该协议测试连接，请创建作业测试。',
          3: '失败，节点信息错误，node的json缺少属性'
        };
        return reasonObj[value];
      };
    }
  },
  watch: {}
};
</script>
<style scoped lang="less">
.showValidMessage {
  background-color: #f8e3e3;
}
.form-error-tip {
  white-space: normal;
  text-overflow: ellipsis;
  word-break: break-all;
}
</style>
