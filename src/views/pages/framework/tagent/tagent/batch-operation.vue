/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="batch-operation-wrap">
    <TsContain>
      <Loading :loadingShow="isLoading" type="fix"></Loading>
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topRight>
        <Button type="primary" @click="checkTagentNumber">{{ action == 'reload' ? $t('page.restart') : $t('page.updatepwd') }}</Button>
      </template>
      <template v-slot:content>
        <div>
          <TsForm ref="form" :itemList="itemList">
            <template v-slot:networkVoList>
              <TsTable v-bind="tableConfig" class="inner-table">
                <template v-slot:networkIp="{row}">
                  <div>
                    <TsFormInput
                      ref="formNetworkList"
                      v-model="row.networkIp"
                      clearable
                      class="network"
                      :validateList="row.validateIpList"
                    ></TsFormInput>
                  </div>
                </template>
                <template v-slot:mask="{row}">
                  <div>
                    <TsFormInput
                      ref="formNetworkList"
                      v-model="row.mask"
                      clearable
                      class="network"
                      :validateList="row.validateMaskList"
                    ></TsFormInput>
                  </div>
                </template>
                <template v-slot:action="{index}">
                  <ul class="text-center actions">
                    <li
                      v-if="tableConfig.tbodyList.length>1"
                      class="tsfont-close-o text-action pr-sm"
                      @click="operationRow('del', index)"
                    ></li>
                    <li class="tsfont-plus-o text-action" @click="operationRow('add',index)"></li>
                  </ul>
                </template>
              </TsTable>
            </template>
          </TsForm>
        </div>
      </template>
    </TsContain>
    <BatchOperationDialog
      v-if="isShowBatchOperationDialog"
      :params="batchParams"
      :tagentNumber="tagentNumber"
      @close="closeBatchOperation"
    ></BatchOperationDialog>
  </div>
</template>
<script>
export default {
  name: '', // 批量操作
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    BatchOperationDialog: resolve => require(['./batch-operation-dialog'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      action: '', // tagent 动作类型，reload(重启)，resetcred(重启密码)
      isLoading: false,
      isShowBatchOperationDialog: false,
      batchParams: {},
      tagentNumber: 0,
      itemList: {
        runnerGroupIdList: {
          type: 'select', 
          label: this.$t('term.framework.runnergroup'),
          labelPosition: 'top',
          dynamicUrl: '/api/rest/runnergroup/search',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          search: true,
          transfer: true,
          multiple: true
        },
        ipPortList: {
          type: 'textarea',
          label: this.$t('term.framework.ipportselect'),
          value: '',
          labelPosition: 'top',
          placeholder: `192.168.0.25:3939\n192.168.0.33:3939\n192.168.1.80:3939`,
          validateList: ['ipAndPort']
        },
        networkVoList: {
          type: 'slot',
          label: this.$t('term.framework.networkselect'),
          value: '',
          labelPosition: 'top',
          width: '75%'
        }
      },
      tableConfig: {
        hideAction: false,
        theadList: [
          {
            title: 'IP',
            key: 'networkIp'
          },
          {
            title: this.$t('term.framework.mask'),
            key: 'mask'
          },
          {
            key: 'action',
            title: ''
          }
        ],
        tbodyList: [
          {
            networkIp: '',
            mask: '',
            validateIpList: ['ip'], 
            validateMaskList: ['mask']
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query || {};
    if (query && !this.$utils.isEmptyObj(query)) {
      this.action = query.type;
    }
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
    operationRow(type, index) {
      // 添加网段
      if (type == 'add') { // 添加
        this.tableConfig.tbodyList.splice(index, 0, {networkIp: '', mask: '', validateIpList: ['ip'], validateMaskList: ['mask']}); 
      } else { // 删除
        this.tableConfig.tbodyList.splice(index, 1);
      }
    },
    handleNetworkList() {
      // 处理网关，删除多余的字段
      let networkList = [];
      let tbodyList = this.$utils.deepClone(this.tableConfig.tbodyList) || [];
      if (this.isEmptyNetworkVoList().length > 0) {
        tbodyList.forEach((item) => {
          if (item.networkIp && item.mask) {
            networkList.push({
              networkIp: item.networkIp,
              mask: item.mask
            });
          }
        });
      }
      return networkList;
    },
    handleIpPortList() {
      let formRefs = this.$refs.form;
      let form = formRefs.getFormValue();
      let ipPortList = [];
      let ipPort = form.ipPortList;
      if (this.$utils.isEmpty(ipPort)) {
        ipPortList = [];
      } else {
        if (ipPort && ipPort.indexOf('\n') != -1) {
        // ip+port 判断是否有换行符
          ipPort.split('\n').forEach((val) => {
            ipPortList.push({
              ip: val.split(':')[0],
              port: val.split(':')[1]
            });
          });
        } else {
        // ip和port 判断已冒号进行分割 如：192.168.0.25:8081
          if (ipPort && ipPort.indexOf(':') != -1) {
            ipPortList = [
              {
                ip: ipPort.split(':')[0],
                port: ipPort.split(':')[1]
              }
            ];
          } else {
          // ip
            ipPortList = [
              {
                ip: ipPort
              }
            ];
          }
        }
      }
      return ipPortList;
    },
    validNetwork() {
      let networkRef = this.$refs.formNetworkList; 
      let isValid = true;
      if (networkRef && networkRef.$parent && networkRef.$parent.$children) {
        networkRef.$parent.$children.forEach((val) => {
          if (!val.valid()) {
            isValid = false;
          } 
        });
      }
      return isValid;
    },
    valid() {
      this.tableConfig.tbodyList.forEach((item) => {
        // 解决如果有ip和位数，有一个设置值，另外一个也必填
        if (item.networkIp && !item.mask) {
          this.$set(item, 'validateMaskList', ['required', 'mask']);
        } else if (!item.networkIp && item.mask) {
          this.$set(item, 'validateIpList', ['required', 'ip']);
        } else {
          this.$set(item, 'validateIpList', ['ip']);
          this.$set(item, 'validateMaskList', ['mask']);
        }
      });
      let requiredList = this.tableConfig.tbodyList.filter((item) => item.validateIpList.includes('required') || item.validateMaskList.includes('required')) || [];
      if (requiredList && requiredList.length > 0) {
        // 为了验证，ip和位数，一个有值，另一个必须是必填
        this.$nextTick(() => {
          return this.validNetwork();
        });
      } else {
        return this.validNetwork();
      }
    },
    checkTagentNumber() {
      // 检测tagent的数量
      let form = this.$refs.form.getFormValue();
      if (this.$utils.isEmpty(form.runnerGroupIdList) && this.$utils.isEmpty(form.ipPortList) && this.isEmptyNetworkVoList().length == 0) {
        // 代理组、IP端口、网段、至少有一个
        this.$Notice.warning({ title: '', desc: this.$t('message.framework.checktagentnumberdesc') });
        return false;
      }
      if (this.isEmptyNetworkVoList().length > 0 && !this.valid()) {
        // 验证网段
        return false;
      }
      let params = {
        networkVoList: this.handleNetworkList(), 
        ipPortList: this.handleIpPortList(), 
        runnerGroupIdList: form.runnerGroupIdList
      };
      this.isLoading = true;
      this.batchParams = {};
      this.$api.framework.tagent.checkVersion(params).then((res) => {
        if (res.Status == 'OK') {
          this.tagentNumber = res.Return;
          this.batchParams = {
            action: this.action,
            runnerGroupIdList: form.runnerGroupIdList, // 版本
            ipPortList: this.handleIpPortList(), // ip + port
            networkVoList: this.handleNetworkList() // 网段
          };
          this.isShowBatchOperationDialog = true;
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    isEmptyNetworkVoList(type = 'all') {
      let dataList = this.tableConfig.tbodyList.filter((val) => {
        return type == 'all' ? (val.networkIp || val.mask) : (type == 'ip' ? val.mask : (type == 'ip' ? val.networkIp : []));
      });
      return dataList;
    },
    closeBatchOperation() {
      this.isShowBatchOperationDialog = false;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.network {
  display: flex;
   position: relative;
  /deep/ div:first-of-type {
  //  解决网段IP和掩码有错误提示，高度不对齐问题
    height: 50px;
    line-height: 40px;
  }
  /deep/ .form-error-tip {
    position: absolute;
    top: 34px;
  }
  /deep/ .ivu-input-icon {
    line-height: 38px;
  }
}
.batch-operation-wrap {
  .actions {
    display: flex;
    justify-content: center;
    height: 50px;
    line-height: 39px;
  }
  .inner-table{
    /deep/ .tstable-container .tstable-body tbody tr .action-div {
      // 解决操作一栏一直显示问题
      display: block !important;
      position: relative;
    }
    /deep/ .tstable-container .tstable-body .action-tr {
      opacity: 1;
    }
  }
}
</style>
