<template>
  <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
    <template v-slot:header>
      <div v-if="operateType == 'accountEdit'">帐号管理</div>
      <div v-else-if="operateType == 'addAccount'">批量添加帐号</div>
      <div v-else>批量删除帐号</div>
    </template>
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
                <div v-for="(value, key, index) in selectValidConfig" :key="index" class="form-error-tip">
                  {{ getItem(value) }}
                </div>
              </template>
            </div>
          </template>
        </TsFormSelect>
        <ul v-if="connectTestResultList && connectTestResultList.length > 0" class="mt-md">
          <li v-for="(item, index) in connectTestResultList" :key="index" :class="getConnectStatus(item.exitValue)">
            <span class="valid-icon" :class="item.exitValue == 0 ? 'tsfont-check-s' : 'tsfont-close-s'"></span>
            <span> {{ getConnectResultText(item) }} {{ getReasonText(item.exitValue) }}</span>
          </li>
        </ul>
      </template>
    </TsForm>
    <template v-slot:footer>
      <Button @click="closeDialog">取消</Button>
      <!-- 单个帐号管理才有测试连接，批量暂时不用 -->
      <Button v-if="operateType == 'accountEdit'" type="primary" @click="testConnect">测试连接</Button>
      <Button type="primary" @click="save">确定</Button>
    </template>
  </TsDialog>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect
  },
  filters: {},
  props: {
    operateType: String,
    resourceId: Number,
    resourceIdList: Array,
    accountList: Array,
    accountslist: Object
  },
  data() {
    let _this = this;
    return {
      validMessage: '', //是否显示自定义校验信息
      failureCount: 0, //错误校验信息条数
      successCount: 0, //成功校验信息条数
      failureReasonList: [], //失败校验信息详情
      selectValidConfig: {},
      selectValidList: [],
      connectTestResultList: [], // 连接测试结果列表
      loadingShow: false,
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: '',
        maskClose: false,
        width: '700px'
      },
      settingConfig: {
        accountList: []
      },
      accountIdList: [],
      resourceIdArray: [],
      list: [],
      settingForm: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        account: {
          type: 'slot',
          name: 'account',
          label: '帐号',
          transfer: true,
          multiple: true,
          firstText: '添加帐号',
          firstLi: true,
          dynamicUrl: 'api/rest/resourcecenter/account/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAccountNodeList,
          needCallback: false,
          validateList: ['required'],
          onChange: function(val, textlist, list) {
            if (list.length == 0) {
              _this.validMessage = '';
            } else {
              _this.validMessage = 'noValidMessage';
            }

            let obj = {};
            _this.selectlist = list;
            list.forEach(item => {
              let str = item.config.account + '/' + item.config.protocol;
              if (obj[str]) {
                obj[str].push(item.text);
              } else {
                obj[str] = [item.text];
              }
            });
            _this.selectValidConfig = obj;
            _this.dealObjData(obj);
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.settingConfig.accountList = this.accountList;
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async listAccount() {
      await this.$api.cmdb.accountManage.searchAccount({}).then(res => {
        let resdata = res.Return || {};
        this.settingForm.account.datalist = resdata;
      });
    },
    save() {
      let formSelect = this.$refs.formSelect;
      let resourceIdArray = [];
      let data = {
        resourceId: this.resourceId,
        accountIdList: this.settingConfig.accountList
      };
      if (this.resourceIdList.length > 0) {
        resourceIdArray = this.resourceIdList;
        resourceIdArray = resourceIdArray.map(item => {
          return item.id;
        });
      }
      let batchData = {
        resourceIdList: resourceIdArray,
        accountIdList: this.settingConfig.accountList
      };
      if (formSelect.valid()) {
        if (this.operateType == 'accountEdit') {
          this.$api.cmdb.asset.saveSingleAccount(data).then(res => {
            if (res.Status == 'OK') {
              this.closeDialog(true);
              this.message(res, this.$t('message.savesuccess'));
            }
          });
        } else if (this.operateType == 'addAccount') {
          this.$api.cmdb.asset.batchAddAccount(batchData).then(res => {
            if (res.Status == 'OK') {
              this.failureReasonList = res.Return.failureReasonList;
              this.message(res, this.$t('message.savesuccess'));
              if (this.failureCount != 0 || this.failureReasonList.length != 0) {
                return;
              }
              this.closeDialog(true);
            }
          });
        } else if (this.operateType == 'delAccount') {
          this.$api.cmdb.asset.batchDelAccount(batchData).then(res => {
            if (res.Status == 'OK') {
              this.closeDialog(true);
              this.message(res, this.$t('message.deletesuccess'));
            }
          });
        }
      }
    },
    message(res, msg) {
      if (res.Return) {
        this.failureCount = res.Return.failureCount;
        this.successCount = res.Return.successCount;
      }
      // 失败，错误提示
      if (this.failureCount != 0 || (this.failureReasonList && this.failureReasonList.length > 0)) {
        this.$Notice.error({
          title: '错误提示',
          duration: 10,
          render: h => {
            return h('div', [
              h('div', {class: 'text-success pb-md'}, [h('span', {class: 'text-success valid-icon tsfont-check-s'}, ''), (this.successCount || 0) + '条资产绑定帐号成功']),
              h('div', {class: 'text-danger pb-md'}, [h('span', {class: 'valid-icon tsfont-close-s'}, ''), (this.failureCount || 0) + '条资产绑定帐号失败']),
              h('ul', {class: 'pb-md', style: {lineHeight: '20px', display: this.failureReasonList && this.failureReasonList.length > 0 ? 'block' : 'none'}}, this.failureReasonList.map((item) => {
                return h('li', {}, item || '');
              }))
            ]);
          }
        });
      }
     
      this.$emit('success', msg);
    },
    closeDialog: function(needRefresh) {
      this.$emit('closeDialog', needRefresh);
      sessionStorage.removeItem('assetIpList');
    },
    gotoAccount() {
      window.open(HOME + '/cmdb.html#/account-manage?isNewAccountShow=' + true, '_blank');
    },
    refreshAccountList() {
      this.$set(this.settingForm.account, 'params', { timeUuid: this.$utils.setUuid() });
      this.$set(this.settingForm.account, 'needCallback', true);
    },
    refreshSuccess() {
      this.$Message.success('刷新成功');
    },
    editAccount() {
      window.open(HOME + '/cmdb.html#/account-manage', '_blank');
    },
    //处理返回的对象数据
    dealObjData(list) {
      Object.keys(list).forEach(item => {
        if (list[item].length > 1) {
          this.validMessage = 'validMessage';
        }
      });
    },
    testConnect() {
      // 测试连接
      if (this.resourceId && (this.settingConfig.accountList && this.settingConfig.accountList.length > 0)) {
        this.loadingShow = true;
        this.$api.cmdb.asset.testConnectAccount({resourceId: this.resourceId, accountIdList: this.settingConfig.accountList}).then((res) => {
          if (res && res.Status == 'OK') {
            this.connectTestResultList = res.Return || [];
            if (this.connectTestResultList.every((item) => item.exitValue == 0)) { this.$Message.success('连接成功'); }
          }
        }).finally(() => {
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
    }
  },
  computed: {
    getItem() {
      return function(value) {
        if (value.length > 1) {
          return value.join('、') + '协议相同且用户名相同，同一资产不可绑定多个协议相同且用户名相同的帐号。 ';
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
          2: '失败，协议不支持',
          3: '失败，节点信息错误，node的json缺少属性'
        };
        return reasonObj[value];
      };
    }
  },
  watch: {
  }
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
