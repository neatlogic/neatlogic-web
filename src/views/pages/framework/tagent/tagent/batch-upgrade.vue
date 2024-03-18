
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
                      :validateList="validConfig.validIp"
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
                      :validateList="validConfig.validMask"
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
    return {
      validConfig: { 
        validIp: ['ip'], // ip
        validMask: ['mask'] // 位数
      }, 
      itemList: {
        version: {
          type: 'select', 
          label: this.$t('term.framework.upgradeversion'),
          value: '',
          labelPosition: 'top',
          dataList: [],
          defaultValueIsFirst: true,
          validateList: ['required']
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
            mask: ''
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getVersionList();
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
      let versionList = [];
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
    handlerOperation(type, index) {
      // 添加网段
      if (type == 'add') { // 添加
        this.tableConfig.tbodyList.splice(index, 0, {networkIp: '', mask: ''}); 
      } else { // 删除
        this.tableConfig.tbodyList.splice(index, 1);
      }
    },
    goBack() {
      this.$router.push({
        path: '/tagent-manage'
      });
    },
    valid() {
      let networkRef = this.$refs.formNetworkList; 
      let isBool = true;
      if (networkRef.$parent.$children) {
        networkRef.$parent.$children.forEach((val) => {
          if (val.valid() == false) {
            isBool = false;
          } 
        });
      } 
      return isBool;
    },
    handlerUpgrade() {
      // 检测批量升级
      let formRefs = this.$refs.form;
      let form = formRefs.getFormValue();
      if (this.$utils.isEmpty(form.ipPortList) && this.isEmptyArr().length == 0) {
        // IP端口和网段至少有一个
        this.$Notice.warning({ title: '', desc: this.$t('message.framework.upgradedesc') });
        return false;
      }
      if (this.isEmptyArr().length > 0 && this.valid() == false) {
        // 验证网段
        return false;
      }
      if (!formRefs.valid()) {
        // 验证升级版本
        return false;
      }
      let ipPortList = [];
      let ipPort = form.ipPortList;
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
      let params = {networkVoList: this.isEmptyArr().length > 0 ? this.tableConfig.tbodyList : [], ipPortList: ipPortList};
      this.$api.framework.tagent.checkVersion(params).then((res) => {
        if (res.Status == 'OK') {
          this.saveBatchUpgrade(res.Return, ipPortList);
        }
      });
    },
    saveBatchUpgrade(tagentNumbers, ipPortList) {
      // 批量升级， tagentNumbers 升级tagent数量
      let form = this.$refs.form.getFormValue();
      this.$createDialog({
        title: this.$t('dialog.title.batchupgradeconfirm'),
        content: this.$t('dialog.content.batchupgradetagent', {target: tagentNumbers}),
        btnType: 'error',
        'on-ok': vnode => {
          let params = {
            pkgVersion: form.version, // 版本
            ipPortList: ipPortList, // ip + port
            networkVoList: this.isEmptyArr().length > 0 ? this.tableConfig.tbodyList : [] // 网段
          };
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
        return type == 'all' ? (val.networkIp || val.mask) : (type == 'ip' ? val.mask : (type == 'ip' ? val.networkIp : []));
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
.batch-upgrade-wrap {
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
