
<template>
  <div class="batch-upgrade-wrap">
    <TsContain>
      <div slot="top" class="top">
        <div class="bar-top">
          <div class="bar-top-left wrapper">
            <div class="action-group">
              <template>
                <span class="text-action tsfont-left" @click="goBack()">{{ $t('term.framework.tagentlist') }}</span>
              </template>
            </div>
          </div>
          <div class="bar-top-right">
            <div class="flex-start">
              <!-- 升级记录 -->
              <UpgradeRecord></UpgradeRecord>
              <Button type="primary" @click="handlerUpgrade()">{{ $t('page.upgrade') }}</Button>
            </div>
          </div>
        </div>
      </div>
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
                  <div class="text-center actions">
                    <div
                      v-if="tableConfig.tbodyList.length>1"
                      class="tsfont-close-o text-action"
                      @click="handlerOperation('del', index)"
                    ></div>
                    <div class="tsfont-plus-o text-action" @click="handlerOperation('add',index)"></div>
                  </div>
                </template>
              </TsTable>
            </template>
          </TsForm>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm.vue';
import TsTable from '@/resources/components/TsTable/TsTable.vue';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import UpgradeRecord from './upgrade-record.vue'; // 升级记录
export default {
  name: 'BatchUpgrade', // 批量升级
  components: {
    TsForm,
    TsTable,
    TsFormInput,
    UpgradeRecord
  },
  filters: {
  },
  props: {
  },
  data() {
    const _this = this;
    return {
      itemList: {
        version: {
          type: 'select', 
          label: this.$t('term.framework.upgradeversion'),
          value: '',
          labelPosition: 'top',
          dataList: [],
          defaultValueIsFirst: true,
          validateList: [{ name: 'required' }]
        },
        selectType: {
          type: 'select',
          label: this.$t('page.type'),
          labelPosition: 'top',
          value: null,
          clearable: false,
          validateList: [{ name: 'required' }],
          dataList: [
            { text: this.$t('term.framework.ipportselect'), value: 'ipPort' },
            { text: this.$t('term.framework.networkselect'), value: 'network' }
          ],
          onChange(val) {
            _this.changeSelectType(val);
          }
        },
        ipPortList: {
          type: 'textarea',
          label: this.$t('term.framework.ipportselect'),
          value: '',
          labelPosition: 'top',
          placeholder: `192.168.0.25:3939\n192.168.0.33:3939\n192.168.1.80:3939`,
          validateList: [{ name: 'ipAndPort' }]
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
            validateIpList: [{ name: 'ip' }],
            validateMaskList: [{ name: 'mask' }]
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getVersionList();
    this.changeSelectType(this.itemList.selectType.value);
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
    getVersionList() {
      // 获取升级版本列表
      this.$api.framework.tagent.getInstallPackageList().then((res) => {
        let data = res.Return.tbodyList;
        let version = '';
        data && data.forEach((val) => {
          if (val.version != version) {
            this.itemList.version.dataList.push({
              text: val.version,
              value: val.version
            });
            version = val.version;
          }
        });
      });
    },
    resetNetworkRows() {
      this.tableConfig.tbodyList = [
        {
          networkIp: '',
          mask: '',
          validateIpList: [{ name: 'ip' }],
          validateMaskList: [{ name: 'mask' }]
        }
      ];
    },
    changeSelectType(selectType) {
      this.itemList.selectType.value = selectType;
      this.$set(this.itemList.ipPortList, 'isHidden', selectType !== 'ipPort');
      this.$set(this.itemList.networkVoList, 'isHidden', selectType !== 'network');
      this.$set(this.itemList.ipPortList, 'validateList', selectType === 'ipPort' ? [{ name: 'required' }, { name: 'ipAndPort' }] : [{ name: 'ipAndPort' }]);
      if (selectType !== 'ipPort') {
        this.itemList.ipPortList.value = '';
      }
      if (selectType !== 'network') {
        this.resetNetworkRows();
      }
    },
    handlerOperation(type, index) {
      // 添加网段
      if (type == 'add') { // 添加
        this.tableConfig.tbodyList.splice(index, 0, {networkIp: '', mask: '', validateIpList: [{ name: 'ip' }], validateMaskList: [{ name: 'mask' }]});
      } else { // 删除
        this.tableConfig.tbodyList.splice(index, 1);
      }
    },
    goBack() {
      this.$router.push({
        path: '/tagent-manage'
      });
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
        if (item.networkIp && !item.mask) {
          this.$set(item, 'validateMaskList', [{ name: 'required' }, { name: 'mask' }]);
        } else if (!item.networkIp && item.mask) {
          this.$set(item, 'validateIpList', [{ name: 'required' }, { name: 'ip' }]);
        } else {
          this.$set(item, 'validateIpList', [{ name: 'ip' }]);
          this.$set(item, 'validateMaskList', [{ name: 'mask' }]);
        }
      });
      let requiredList = this.tableConfig.tbodyList.filter((item) => {
        const ipRequired = (item.validateIpList || []).some(v => v === 'required' || (typeof v === 'object' && v.name === 'required'));
        const maskRequired = (item.validateMaskList || []).some(v => v === 'required' || (typeof v === 'object' && v.name === 'required'));
        return ipRequired || maskRequired;
      }) || [];
      if (requiredList && requiredList.length > 0) {
        this.$nextTick(() => {
          return this.validNetwork();
        });
      } else {
        return this.validNetwork();
      }
    },
    setNetworkRequired() {
      this.tableConfig.tbodyList.forEach((item) => {
        this.$set(item, 'validateIpList', [{ name: 'required' }, { name: 'ip' }]);
        this.$set(item, 'validateMaskList', [{ name: 'required' }, { name: 'mask' }]);
      });
    },
    handleIpPortList() {
      let form = this.$refs.form.getFormValue();
      let ipPortList = [];
      let ipPort = form.ipPortList;
      if (this.$utils.isEmpty(ipPort)) {
        ipPortList = [];
      } else {
        if (ipPort && ipPort.indexOf('\n') != -1) {
          ipPort.split('\n').forEach((val) => {
            ipPortList.push({
              ip: val.split(':')[0],
              port: val.split(':')[1]
            });
          });
        } else {
          if (ipPort && ipPort.indexOf(':') != -1) {
            ipPortList = [
              {
                ip: ipPort.split(':')[0],
                port: ipPort.split(':')[1]
              }
            ];
          } else {
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
    handleNetworkList() {
      let networkList = [];
      let tbodyList = this.$utils.deepClone(this.tableConfig.tbodyList) || [];
      if (this.isEmptyArr().length > 0) {
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
    getBatchParams(selectType, form) {
      if (selectType === 'ipPort') {
        return {
          ipPortList: this.handleIpPortList(),
          networkVoList: []
        };
      }
      return {
        ipPortList: [],
        networkVoList: this.handleNetworkList()
      };
    },
    handlerUpgrade() {
      // 检测批量升级
      let formRefs = this.$refs.form;
      let form = formRefs.getFormValue();
      const selectType = form.selectType || this.itemList.selectType.value;
      if (!formRefs.valid()) {
        return false;
      }
      if (selectType === 'network' && this.isEmptyArr().length == 0) {
        this.setNetworkRequired();
        this.$nextTick(() => {
          this.validNetwork();
        });
        return false;
      }
      if (selectType === 'network' && this.isEmptyArr().length > 0 && this.valid() == false) {
        // 验证网段
        return false;
      }
      let params = this.getBatchParams(selectType, form);
      this.$api.framework.tagent.checkVersion(params).then((res) => {
        if (res.Status == 'OK') {
          this.saveBatchUpgrade(res.Return, params);
        }
      });
    },
    saveBatchUpgrade(tagentNumbers, batchParams) {
      // 批量升级， tagentNumbers 升级tagent数量
      let form = this.$refs.form.getFormValue();
      this.$createDialog({
        title: this.$t('dialog.title.batchupgradeconfirm'),
        content: this.$t('dialog.content.batchupgradetagent', {target: tagentNumbers}),
        btnType: 'error',
        'on-ok': vnode => {
          let params = Object.assign({ pkgVersion: form.version }, batchParams);
          this.$api.framework.tagent.saveBatchUpgrade(params).then((res) => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
            }
          });
          vnode.isShow = false;
        }
      });
    },
    isEmptyArr(type = 'all') {
      let arr = this.tableConfig.tbodyList.filter((val) => {
        return type == 'all' ? (val.networkIp || val.mask) : (type == 'ip' ? val.networkIp : (type == 'mask' ? val.mask : []));
      });
      return arr;
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
  ::v-deep div:first-of-type {
  //  解决网段IP和掩码有错误提示，高度不对齐问题
    height: 50px;
    line-height: 40px;
  }
  ::v-deep .form-error-tip {
    position: absolute;
    top: 34px;
  }
  ::v-deep .ivu-input-icon {
    line-height: 38px;
  }
}
.batch-upgrade-wrap {
  .actions {
    display: flex;
    justify-content: center;
    height: 50px;
    line-height: 39px;
  }
  .inner-table{
    ::v-deep .tstable-container .tstable-body tbody tr .action-div {
      // 解决操作一栏一直显示问题
      display: block !important;
      position: relative;
    }
    ::v-deep .tstable-container .tstable-body .action-tr {
      opacity: 1;
    }
  }
}
</style>
