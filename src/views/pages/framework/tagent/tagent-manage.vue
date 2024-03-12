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
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="changeCurrent(1)"></CombineSearcher>
      </template>
      <div slot="content">
        <Loading
          v-if="loadingShow"
          :loadingShow="loadingShow"
          type="fix"
        ></Loading>
        <TsTable
          v-else
          v-bind="tableData"
          :theadList="theadList"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
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
                <li class="tsfont-rotate-right" @click="restartPassword(row)">{{ $t('page.restart') }}</li>
                <li class="tsfont-file-single" @click="openLogDialog(row)">{{ $t('page.log') }}</li>
                <li class="tsfont-circulation-s" @click="openPasswordDialog(row)">{{ $t('page.password') }}</li>
                <li class="tsfont-edit-s" @click="openConfigTagentDialog(row)">{{ $t('page.config') }}</li>
                <li class="tsfont-restart" @click="resetTagent(row)">{{ $t('page.resetpwd') }}</li>
                <li class="tsfont-refresh" @click="openVersionUpgradeDialog(row)">{{ $t('page.upgrade') }}</li>
                <li class="tsfont-trash-o" @click="deleteTagent(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <InstallTipsDialog v-if="isShowInstallTips" @close="closeInstallTipsDialog"></InstallTipsDialog>
    <ViewPasswordDialog v-if="isShowPasswordDialog" :accountId="accountId" @close="closeDialog"></ViewPasswordDialog>
    <ViewLogDialog v-if="isShowLogDialog" :tagentId="tagentId" @close="closeDialog"></ViewLogDialog>
    <UpgradeVersionDialog v-if="isShowVersionUpdate" :tagentId="tagentId" @close="closeDialog"></UpgradeVersionDialog>
    <TagentConfigDialog v-if="isShowConfigTagentDialog" :tagentId="tagentId" @close="closeDialog"></TagentConfigDialog>
  </div>
</template>
<script>
export default {
  name: 'TagentManage',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InstallTipsDialog: resolve => require(['./tagent/install-tips-dialog'], resolve),
    ViewPasswordDialog: resolve => require(['./tagent/view-password-dialog'], resolve), // 查看密码
    ViewLogDialog: resolve => require(['./tagent/view-log-dialog'], resolve), // 查看日志
    UpgradeVersionDialog: resolve => require(['./tagent/upgrade-version-dialog'], resolve), // 升级版本
    TagentConfigDialog: resolve => require(['./tagent/tagent-config-dialog'], resolve) // tagent配置
  },
  filters: {},
  props: {},
  data() {
    return {
      loadingShow: true,
      isShowPasswordDialog: false,
      isShowConfigTagentDialog: false,
      isShowLogDialog: false,
      isShowVersionUpdate: false, // 升级版本
      isShowInstallTips: false,
      tagentId: null,
      accountId: null,
      searchVal: {},
      tableData: {
        currentPage: 1,
        pageSize: 20,
        tbodyList: []
      },
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
    this.searchTagentData(); // 获取列表数据
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
    changeCurrent(currentPage = 1) {
      this.tableData.currentPage = currentPage;
      this.searchTagentData();
    },
    changePageSize(pageSize) {
      this.tableData.currentPage = 1;
      this.tableData.pageSize = pageSize;
      this.searchTagentData();
    },
    searchTagentData() {
      // 获取数据方法
      const params = {
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize,
        ...this.searchVal
      };
      this.loadingShow = true;
      this.$api.framework.tagent.searchTagent(params).then(res => {
        if (res.Status == 'OK') {
          Object.assign(this.tableData, res.Return || {});
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    openVersionUpgradeDialog(row) {
      // 升级版本
      this.tagentId = (row && row.id) || '';
      this.isShowVersionUpdate = true;
    },
    openLogDialog(row) {
      this.tagentId = (row && row.id) || '';
      this.isShowLogDialog = true;
    },
    openPasswordDialog(row) {
      this.accountId = (row && row.accountId) || null;
      this.isShowPasswordDialog = true;
    },
    openConfigTagentDialog(row) {
      this.tagentId = (row && row.id) || null;
      this.isShowConfigTagentDialog = true;
    },
    restartPassword(row) {
      // 重置密码
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
                this.changeCurrent();
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
                this.changeCurrent();
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
        content: this.$t('dialog.content.deletetargetconfirm', {target: 'Tagent'}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.tagent.deleteTagents(params)
            .then((res) => {
              if (res.Status == 'OK') {
                this.changeCurrent();
                this.$Message.success(this.$t('message.deletesuccess'));
              }
            }).finally(res => {
              vnode.isShow = false;
            });
        }
      });
    },
    openInstallTipsDialog() {
      this.isShowInstallTips = true;
    },
    closeInstallTipsDialog() {
      this.isShowInstallTips = false;
    },
    closeDialog() {
      this.tagentId = null;
      this.accountId = null;
      this.isShowConfigTagentDialog = false;
      this.isShowVersionUpdate = false;
      this.isShowLogDialog = false;
      this.isShowPasswordDialog = false;
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
</style>

