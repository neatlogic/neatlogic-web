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
  <div class="tagent-manage">
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="tsfont-refresh action-item" @click="goPages('batchUpgrade')">{{ $t('term.framework.batchupgrade') }}</span>
          <span class="tsfont-restart action-item" @click="goPages('batchReboot')">{{ $t('term.framework.batchreboot') }}</span>
          <span class="tsfont-edit action-item" @click="goPages('batchResetcred')">{{ $t('term.framework.batchresetcred') }}</span>
          <span class="tsfont-anzhuangbao action-item" @click="goPages('installationPackage')">{{ $t('term.framework.installpackage') }}</span>
          <span class="tsfont-question-s action-item" @click="openInstallTipsDialog">{{ $t('term.framework.tagentinstall') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="getTableData()"></CombineSearcher>
      </template>
      <div slot="content">
        <TsTable
          v-bind="tableData"
          :theadList="theadList"
          @changeCurrent="getTableData"
          @changePageSize="getTableData(1, ...arguments)"
          @headerTitleOperation="headerTitleOperation"
        >
          <template v-slot:ip="{ row }">
            <span>{{ row.ip }}: {{ row.port }}</span>
          </template>

          <template v-slot:status="{ row }">
            <div v-if="row.loading">
              <Loading :loadingShow="row.loading"></Loading>
            </div>
            <div v-else>
              <span v-if="row.status == 'connected'" class="green">{{ $t('term.framework.connected') }}</span>
              <span v-else>
                <Tooltip
                  v-if="row.disConnectReason"
                  :content="row.disConnectReason"
                  :max-width="300"
                  transfer
                  placement="bottom-start"
                >
                  <span class="red cursor">{{ $t('term.framework.notconnected') }}</span>
                </Tooltip>
                <span v-else class="red">
                  {{ $t('term.framework.notconnected') }}
                </span>
              </span>
            </div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-rotate-right" @click="operation('restart', row)">{{ $t('page.restart') }}</li>
                <li class="tsfont-file-single" @click="operation('list', row)">{{ $t('page.log') }}</li>
                <li class="tsfont-circulation-s" @click="operation('searchpwd', row)">{{ $t('page.password') }}</li>
                <li class="tsfont-edit-s" @click="operation('edit', row)">{{ $t('page.config') }}</li>
                <li class="tsfont-restart" @click="operation('reset', row)">{{ $t('page.resetpwd') }}</li>
                <li class="tsfont-refresh" @click="operation('versionUpdate', row)">{{ $t('page.upgrade') }}</li>
                <li class="tsfont-trash-o" @click="operation('del', row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsDialog
      type="modal"
      :isShow="pwdisShow"
      :title="$t('page.viewtarget',{'target':$t('page.password')})"
      :hasFooter="false"
      @on-close="close"
    >
      <template v-slot>
        <TsFormInput v-model="pwdData" :disabled="disabled">
        </TsFormInput>
      </template>
    </TsDialog>
    <TsDialog
      type="modal"
      :isShow="configisShow"
      :title="$t('page.config')"
      @on-close="close"
      @on-ok="saveConfigDetail"
    >
      <template>
        <div class="config-detail-box">
          <Alert show-icon>
            <template slot="desc">“<span class="require-label"></span>”<span class="text-tip">{{ $t('term.framework.reqparamstip') }}</span></template>
          </Alert>
          <div class="radius-sm border-color bg-op block-border">
            <div v-for="(item, index) in configData" :key="index" class="config-detail-li">
              <div class="left-number-box bg-grey border-color">
                <span class="text-tip">{{ index+1 }}</span>
                <span class="required-box" :class="getRequiredClass(item) ? 'require-label' : ''"></span>
              </div>
              <div ref="codeValue" class="right-code-box" contenteditable="true">
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </template>

    </TsDialog>
    <TsDialog
      type="modal"
      :isShow="listisShow"
      :title="$t('page.log')"
      :hasFooter="false"
      @on-close="close"
    >
      <template v-slot>
        <TsTable v-bind="listData" :theadList="theadLists">
          <template v-slot:download="{ row,index }">
            <span class="action-group tagent-manage-download-box">
              <span
                class="text-href action-item"
                :class="[isDownloading == index ? 'disable' : '']"
                :title="isDownloading == index ? $t('page.downloadloadingtip') : ''"
                @click="downloadLogFile(row, index)"
              >
                <Icon
                  v-if="isDownloading == index ? true : false"
                  type="ios-loading"
                  size="16"
                  class="loading"
                ></Icon>
                {{ $t('term.framework.logdownload') }} {{ row.id }}
              </span>
            </span>
          </template>
        </TsTable>
      </template>
    </TsDialog>
    <TsDialog
      type="modal"
      :isShow="isShowVersionUpdate"
      :title="$t('term.framework.upgradeversion')"
      @on-cancel="versionUpgradeOkBtn('close')"
      @on-close="versionUpgradeOkBtn('close')"
      @on-ok="versionUpgradeOkBtn('ok')"
    >
      <template v-slot>
        <TsForm ref="versionUpdateForm" :itemList="versionUpdateConfig"></TsForm>
      </template>
    </TsDialog>
    <InstallTipsDialog v-if="isShowInstallTips" @close="closeInstallTipsDialog"></InstallTipsDialog>
  </div>
</template>
<script>
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue'; // 漏斗下拉组件
import TsTable from '@/resources/components/TsTable/TsTable.vue';
export default {
  name: 'TagentManage',
  components: {
    TsTable,
    CombineSearcher,
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    InstallTipsDialog: resolve => require(['./tagent/install-tips-dialog'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      requiredFieldList: [], // 配置详情，必填字段
      tagentId: '',
      isDownloading: -1, // 是否正在下载
      jsonList: [{ 'content': '#!/bin/bash', 'contentHash22': 'f46e2d3f5f3ed2f93bae1ee4cdd4ea68'}],
      tableData: {},
      loadingShow: false, // 日志加载效果
      listData: {
        tbodyList: []
      },
      idData: {},
      configData: null,
      pwdData: '',
      keyword: '',
      disabled: true,
      pwdisShow: false,
      configisShow: false,
      listisShow: false,
      isShowVersionUpdate: false, // 升级版本
      isShowInstallTips: false,
      versionUpdateConfig: {
        // 升级版本form表单
        pkgVersion: {
          type: 'select',
          label: this.$t('term.framework.pkgversion'),
          validateList: ['required'],
          value: '',
          dataList: [],
          transfer: true
        },
        tagentId: {
          type: 'text',
          isHidden: true,
          value: '',
          label: 'tagentId'
        }
      },
      searchVal: {}, // 搜索关键字对象
      searchConfig: {
        // 搜索列表配置
        placeholder: this.$t('term.framework.tagentsearchpla'),
        searchList: [
          {
            type: 'select',
            name: 'osId',
            label: this.$t('term.framework.ostype'),
            placeholder: this.$t('form.placeholder.pleaseselect', {'target': this.$t('term.framework.ostype')}),
            url: '/api/rest/tagent/ostype/list',
            textName: 'name',
            valueName: 'id',
            search: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'version',
            label: this.$t('page.versions'),
            dynamicUrl: '/api/rest/tagent/version/list',
            transfer: true
          },
          {
            type: 'select',
            name: 'status',
            label: this.$t('page.status'),
            url: '/api/rest/universal/enum/get',
            params: {enumClass: 'neatlogic.framework.tagent.enums.TagentStatus'},
            transfer: true
          },
          {
            type: 'select',
            name: 'runnerGroupId',
            label: this.$t('term.framework.runnergroup'),
            dynamicUrl: '/api/rest/runnergroup/search',
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            search: true,
            transfer: true
          }
        ]
      },
      theadLists: [
        { key: 'log', title: this.$t('page.filename')},
        { key: 'download', title: this.$t('term.framework.logdownload')}
      ],
      theadList: [
        { key: 'name', title: this.$t('page.name'), textValue: 'views'},
        { key: 'ip', title: 'IP:PORT' },
        { key: 'status', title: this.$t('page.status'), headerIcon: 'tsfont-refresh'},
        { key: 'ipList', title: this.$t('term.framework.includeip'), type: 'tag' },
        { key: 'osNameVersion', title: this.$t('term.framework.osversion'), maxLength: 30 },
        { key: 'osbit', title: this.$t('term.framework.osbit') },
        { key: 'version', title: this.$t('page.versions') },
        { key: 'runnerIp', title: 'runnerIp' },
        { key: 'runnerGroupName', title: this.$t('term.deploy.runnergroup') },
        { key: 'pcpu', title: 'CPU', type: 'company', value: '%'},
        { key: 'mem', title: this.$t('term.framework.mem'), type: 'company', value: 'MB' },
        { key: 'lcd', title: this.$t('page.updatetime'), type: 'time' },
        { key: 'action'}
      ]
    };
  },
  beforeCreate() {},
  created() {

  },
  beforeMount() {},
  mounted() {
    this.getTableData(); // 获取列表数据
    this.getVersionList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getVersionList() {
      // 获取版本列表
      let newArr = [];
      this.$api.framework.tagent.getInstallPackageList().then((res) => {
        let arr = res.Return.tbodyList;
        arr && arr.forEach((item) => {
          newArr.push({
            text: item.version,
            value: item.version
          });
          let obj = {};
          let uniqueArr = [];
          uniqueArr = newArr.reduce(function(a, b) {
            obj[b.value] ? '' : obj[b.value] = true && a.push(b);
            return a;
          }, []);
          this.$set(this.versionUpdateConfig.pkgVersion, 'dataList', uniqueArr);
        });
      });
    },
    headerTitleOperation() {
      // 状态刷新
      if (!this.$utils.isEmpty(this.tableData.tbodyList)) {
        for (let i = 0; i < this.tableData.tbodyList.length; i++) {
          this.$set(this.tableData.tbodyList[i], 'loading', true);
        }
        let promiseArr = [];
        promiseArr = this.tableData && this.tableData.tbodyList && this.tableData.tbodyList.map((item, index) => {
          return this.$api.framework.tagent.updateStatus({tagentId: item.id}).then((res) => {
            if (res.Status == 'OK') {
              let data = res.Return;
              this.$set(this.tableData.tbodyList[index], 'loading', false);
              this.$set(this.tableData.tbodyList[index], 'status', data.status);
              this.$set(this.tableData.tbodyList[index], 'disConnectReason', data.disConnectReason);
            }
          }).catch(() => {
            this.$set(this.tableData.tbodyList[index], 'loading', false);
            this.$set(this.tableData.tbodyList[index], 'status', 'disconnected');
            this.$set(this.tableData.tbodyList[index], 'disConnectReason', data.disConnectReason);
          });
        });
        Promise.all(promiseArr).then(() => {
          this.$Message.success(this.$t('message.refreshsuccess'));
        }).catch(() => {
        });
      }
    },
    goPages(type) {
      if (type == 'batchUpgrade') {
        // 批量升级
        this.$router.push({ 
          path: '/batch-upgrade'
        }); 
      } else if (type == 'batchReboot') {
        // 批量重启
        this.$router.push({ 
          path: '/batch-operation',
          query: {type: 'reload'}
        }); 
      } else if (type == 'batchResetcred') {
        this.$router.push({ 
          path: '/batch-operation',
          query: {type: 'resetcred'}
        });
      } else {
        // 安装包管理
        this.$router.push({ 
          path: '/installation-package'
        }); 
      }
    },
    downloadLogFile: function(row, index) {
      //文件下载
      let data = {
        path: row.log,
        tagentId: this.tagentId
      };
      if (this.isDownloading >= 0) {
        // 防止重复点击下载
        return false;
      }
      // this.$utils.download(this, '/api/binary/tagent/exec/log/download', data, 'post');
      this.isDownloading = index;
      let url = '/api/binary/tagent/exec/log/download';
      this.$https.post(url, data, {responseType: 'blob'}).then(res => {
        if (res.status == '200') {
          const aLink = document.createElement('a');
          let blob = new Blob([res.data], {
            type: 'application/x-msdownload'
          });
          aLink.href = URL.createObjectURL(blob);
          let contentDisposition = decodeURI(res.headers['content-disposition']);
          let fileName = contentDisposition.substring(22, contentDisposition.length - 1);
          aLink.download = fileName;
          aLink.click();
          document.body.appendChild(aLink);
          this.isDownloading = -1;
        } else {
          this.isDownloading = -1;
        }
      }).catch(() => {
        this.isDownloading = -1;
      });
    },
    getTableData(currentPage, pageSize) {
      // 获取数据方法
      const data = {};
      Object.assign(data, this.searchVal);
      if (currentPage || pageSize) {
        data.currentPage = currentPage || this.tableData.currentPage;
        data.pageSize = pageSize || this.tableData.pageSize;
      } else {
        data.currentPage = 1;
        data.pageSize = 20;
      }
      this.loadingShow = true;
      this.$api.framework.tagent.searchTagent(data).then(res => {
        if (res.Status == 'OK') {
          this.loadingShow = false;
          this.tableData = res.Return;
          this.tableData.theadList = this.theadList;
        }
      }).catch((err) => {
        this.loadingShow = false;
      });
    },
    operation(views, row) {
      switch (views) {
        case 'del': // 删除
          this.deleteTagent(row);
          break;
        case 'edit':
          this.editConfig(row);
          break;
        case 'reset':
          this.resetTagent(row);
          break;
        case 'searchpwd':
          this.searchPwd(row);
          break;
        case 'list':
          this.workList(row);
          break;
        case 'restart':
          this.restart(row);
          break;
        case 'versionUpdate': // 升级版本
          this.versionUpdate(row);
          break;
        default:
          this.searchPwd(row);
          break;
      }
    },
    versionUpdate(row) {
      // 升级版本
      if (row && !row.id) {
        return false;
      }
      this.isShowVersionUpdate = true;
      this.$set(this.versionUpdateConfig.tagentId, 'value', row.id);
    },
    versionUpgradeOkBtn(type) {
      // 版本升级-确定操作
      if (type == 'ok') {
        let form = this.$refs.versionUpdateForm;
        if (!form.valid()) {
          return false;
        }
        let params = form.getFormValue();
        this.$api.framework.tagent.versionUpgrade(params).then((res) => {
          if (res.Status == 'OK') {
            form.resetForm();
            this.isShowVersionUpdate = false;
            this.$Message.success(this.$t('message.executesuccess'));
          }
        });
      } else {
        this.isShowVersionUpdate = false;
      }
    },
    workList(row) {
      let params = {
        tagentId: row.id
      };
      this.tagentId = row.id;
      this.loadingShow = true;
      this.$api.framework.tagent.getWorkList(params)
        .then((res) => {
          if (res.Status == 'OK') {
            this.listisShow = true;
            this.loadingShow = false;
            this.listData.tbodyList = res.Return;
          }
        }).catch((err) => {
          this.loadingShow = false;
        });
    },
    searchPwd(row) {
      if (!row.id) {
        return false;
      }
      this.pwdisShow = true;
      let params = {
        id: row.accountId
      };
      this.$api.framework.tagent.getAccountById(params)
        .then((res) => {
          this.pwdData = res.Return.passwordPlain;
        });
    },
    editConfig(row) {
      if (!row.id) {
        return false;
      }
      let params = {
        tagentId: row.id
      };
      this.idData = row.id;
      this.loadingShow = true;
      this.$api.framework.tagent.getTagentConfig(params)
        .then((res) => {
          if (res.Status == 'OK') {
            this.loadingShow = false;
            this.configData = [];
            if (!this.$utils.isEmpty(res.Return)) {
              this.requiredFieldList = res.Return.requiredFieldList || [];
              this.configData = res.Return.configJson && res.Return.configJson.std ? res.Return.configJson.std : [];
            }
            this.configisShow = true;
          }
        }).catch((err) => {
          this.loadingShow = false;
          this.configisShow = false;
        });
    },
    saveConfigDetail() {
      // 保存配置详情
      let codeData = [];
      if (this.$refs.codeValue && this.$refs.codeValue instanceof Array) {
        this.$refs.codeValue.forEach((item) => {
          if (item && item.innerText) {
            codeData.push(item.innerText + '\n');
          }
        });
      }
      let params = {
        tagentId: this.idData,
        data: codeData
      };
      this.$api.framework.tagent.saveTagentConfig(params)
        .then((res) => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
          }
          this.configisShow = false;
        });
    },
    restart(row) {
      if (!row.id) {
        return false;
      }
      let params = {
        tagentId: row.id
      };
      this.$createDialog({
        title: this.$t('page.tip'),
        content: this.$t('message.framework.tagentconfirm'),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.tagent.restart(params)
            .then((res) => {
              if (res.Status == 'OK') {
                this.getTableData(1);
                this.$Message.success(this.$t('message.executesuccess'));
              }
            }).finally(res => {
              vnode.isShow = false;
            });
        }
      });
    },
    resetTagent(row) {
      if (!row.id) {
        return false;
      }
      let params = {
        tagentId: row.id
      };
      this.$createDialog({
        title: this.$t('page.tip'),
        content: this.$t('message.framework.tagentresetpwd'),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.tagent.resetPassword(params)
            .then((res) => {
              if (res.Status == 'OK') {
                this.getTableData(1);
                this.$Message.success(this.$t('message.executesuccess'));
              }
            }).finally(res => {
              vnode.isShow = false;
            });
        }
      });
    },
    deleteTagent(row) {
      if (!row.id) {
        return false;
      }
      let params = {
        id: row.id
      };
      // 删除确认提示框
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', {target: 'Tagent？'}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.tagent.deleteTagents(params)
            .then((res) => {
              this.getTableData(1);
              if (res.Status == 'OK') {
                this.getTableData();
                this.$Message.success(this.$t('message.deletesuccess'));
              }
            }).finally(res => {
              vnode.isShow = false;
            });
        }
      });
    },
    close() {
      this.configisShow = false;
      this.listisShow = false;
      this.pwdisShow = false;
    },
    openInstallTipsDialog() {
      this.isShowInstallTips = true;
    },
    closeInstallTipsDialog() {
      this.isShowInstallTips = false;
    }
  },
  computed: {
    getRequiredClass(item) {
      return function(item) {
        let fieldname = item ? (item.split('=') ? item.split('=')[0] : '') : '';
        return this.requiredFieldList.indexOf(fieldname) != -1;
      };
    }
  },
  watch: {}
};
</script>

<style lang="less" scoped>
.config-detail-box {
  /deep/ .require-label::before {
    font-size: 21px;
  }
  .config-detail-li {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    .left-number-box {
      display: flex;
      justify-content: center;
      position: relative;
      width: 49px;
      border-right: 1px solid;
      margin-right: 8px;
      .required-box {
        position: absolute;
        right: 5px;
        top: -3px;
      }
  }
  .right-code-box {
      width: calc(100% - 58px);
    .code-input {
        width: 100%;
        outline: none;
        border: none;
        background: none;
      }
    }
  }
}
</style>
<style lang="less">
.tagent-manage-download-box{
    // 解决下载日志，宽度变化的问题
    display: inline-block;
    width: 100px;
  }
</style>
