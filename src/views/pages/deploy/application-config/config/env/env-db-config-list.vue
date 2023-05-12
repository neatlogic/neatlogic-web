<template>
  <div class="env-db-config-list">
    <ul class="pl-nm add-text-box">
      <li v-if="hasEditConfigAuth" class="tsfont-plus text-href" @click="openDbConfigEdit">{{ $t('page.add') }}</li>
      <template v-else>
        <li v-if="!hasEditConfigAuth">{{ $t('term.deploy.noconfigauthtip') }}</li>
      </template>
    </ul>
    <div class="content-box bg-op">
      <ul v-if="!hasDbConfig && hasEditConfigAuth" class="flex-center">
        <li>
          <span>{{ $t('term.deploy.currentmodulenotadddbconfig') }}</span>
          <span class="tsfont-plus text-href" @click="openDbConfigEdit">{{ $t('term.deploy.dbconfig') }}</span></li>
      </ul>
      <template v-if="hasDbConfig">
        <div
          v-for="(item, index) in dbConfigList"
          :key="index"
          class="pb-lg db-list-box border-color"
          :class="index == 0 ? (!item.isShow ? 'pt-nm pb-nm' : 'pt-nm') : (!item.isShow ? 'pt-nm pb-nm' : 'pt-lg')"
        >
          <header class="header-box pl-nm pr-nm" :class="item.isShow ? 'pb-nm' : ''">
            <div>
              <span class="text-grey title">{{ $t('term.deploy.databaseschema') }}</span>
              <span>{{ item.dbSchema }}</span>
            </div>
            <div class="action-group">
              <span v-show="hasEditConfigAuth" class="action-item tsfont-edit" @click="editDbConfig(item.id)"></span>
              <span v-show="hasEditConfigAuth" class="action-item tsfont-trash-o" @click="delDbConfig(item)"></span>
              <span class="action-item" :class="item.isShow ? 'tsfont-down' : 'tsfont-up'" @click="handleDownUp(item, index)"></span>
            </div>
          </header>
          <ul v-if="item.isShow" class="ul-box pl-nm pr-nm">
            <li class="pb-nm">
              <span class="text-grey title">{{ $t('page.database') }}</span>
              <span class="db-user-text-box">
                <TsFormSelect
                  v-model="item.dbResourceId"
                  v-bind="dbSetting"
                ></TsFormSelect>
              </span>
            </li>
            <li class="pb-nm flex-box">
              <span class="text-grey title">{{ $t('page.account') }}</span>
              <span class="db-user-text-box">
                <TsFormSelect
                  v-model="item.accountId"
                  v-bind="userSetting"
                ></TsFormSelect>
              </span>
            </li>
            <template v-if="item.config">
              <li v-for="(configItem, key , cIndex) of item.config" :key="cIndex" class="pb-nm">
                <span class="text-grey title">{{ advancedConfig[key] }}</span>
                <span>{{ handleShowText(key, configItem) }}</span>
              </li>
            </template>
          </ul>
        </div>
      </template>
    </div>
    <EnvDbConfigEdit
      v-if="isShowDbConfigEdit"
      :id="dbConfigId"
      :params="params"
      @close="closeEnvDbConfigEdit"
    ></EnvDbConfigEdit>
  </div>
</template>
<script>
export default {
  name: '', // DB配置
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    EnvDbConfigEdit: resolve => require(['./env-db-config-edit'], resolve)
  },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    hasEditConfigAuth: {
      // 是否有编辑配置权限
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dbConfigId: null,
      isShowDbConfigEdit: false,
      hasDbConfig: false,
      dbConfigList: [],
      dbSetting: {
        readonly: true,
        dynamicUrl: '/api/rest/deploy/app/config/env/database/search',
        params: {...this.params},
        rootName: 'tbodyList',
        dealDataByUrl: (nodeList) => { return this.dealDataByUrl(nodeList); }
      },
      userSetting: {
        readonly: true,
        dynamicUrl: '/api/rest/resourcecenter/account/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getAccountNodeList
      },
      advancedConfig: {
        custom: this.$t('term.deploy.customparameter'),
        logonTimeout: this.$t('term.deploy.connectiontimeout'),
        locale: 'DBLocale',
        fileCharset: this.$t('page.filecoding'),
        autocommit: this.$t('term.deploy.autocommit'),
        dbVersion: this.$t('term.deploy.dbversion'),
        ignoreErrors: this.$t('term.deploy.ignoreerrors'),
        dbaRole: this.$t('term.deploy.dbarole'),
        oraWallet: 'oraWallet',
        db2SqlTerminator: 'db2SqlTerminator',
        db2ProcTerminator: 'db2ProcTerminator'
      }
    };
  },
  beforeCreate() {},
  created() {
    this.searchDbConfig();
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
    dealDataByUrl(nodeList) { 
      let databaseList = [];
      if (nodeList && nodeList.length > 0) {
        nodeList.forEach(item => {
          databaseList.push({
            text: this.getText(item),
            value: item.id
          });
        });
      }
      return databaseList;
    },
    getText(item) {
      // 模型/ip:port/名称
      let textName = '';
      if (item) {
        const {typeLabel, ip, port, name} = item;
        let ipPort = ip ? (port ? `${ip}:${port}` : ip) : '';
        textName = ipPort ? (typeLabel ? (name ? `${typeLabel}/${ipPort}/${name}` : `${typeLabel}/${ipPort}`) : (name ? `${ipPort}/${name}` : `${ipPort}`)) : (typeLabel || (name || ''));
      }
      return textName;
    },
    openDbConfigEdit() {
      this.dbConfigId = null;
      this.isShowDbConfigEdit = true;
    },
    closeEnvDbConfigEdit(needRefresh) {
      this.isShowDbConfigEdit = false;
      if (needRefresh) {
        this.searchDbConfig();
      }
    },
    editDbConfig(id) {
      this.dbConfigId = id;
      this.isShowDbConfigEdit = true;
    },
    searchDbConfig() {
      if (this.params) {
        this.$api.deploy.applicationConfig.getEnvInfo(this.params).then((res) => {
          if (res && res.Status == 'OK') {
            let {DBConfigList} = res.Return;
            if (DBConfigList && DBConfigList.length > 0) {
              this.hasDbConfig = true;
              this.dbConfigList = [];
              this.dbConfigList = DBConfigList;
              this.dbConfigList && this.dbConfigList.forEach((item) => {
                item.isShow = true;
              });
            } else {
              this.hasDbConfig = false;
              this.dbConfigList = [];
            }
          }
        });
      }
    },
    delDbConfig(item) {
      if (item && !item.id) {
        return false;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.deploy.dbconfig')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.deploy.env.delEnvDbConfigById({id: item.id}).then((res) => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchDbConfig();
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    handleDownUp(item, index) {
      item.isShow = !item.isShow;
      this.$set(this.dbConfigList, index, item);
    },
    handleShowText(key, value) {
      let textName = '';
      if (key == 'autocommit' || key == 'oraWallet') {
        textName = value ? this.$t('page.yes') : this.$t('page.no');
      } else {
        textName = value;
      }
      return textName;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.env-db-config-list {
  height: calc(100vh - 50px - 50px - 32px - 16px); // （头部高度 + 导航高度 + tab高度 + 底部间隙高度）
  overflow: hidden;
  border-radius: 0 10px 10px;
  .add-text-box {
  padding-top: 20px;
}
.content-box {
  height: calc(100% - 40px);
  overflow-y: scroll;
}
.header-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.flex-box {
  display: flex;
}
.db-list-box {
  border-bottom: 1px solid;
  &:last-child {
    border-bottom: none;
  }
}
.ul-box {
  li {
    width: 100%;
    &:last-child {
      padding-bottom: 0;
    }
  }
}
 .title {
    display: inline-block;
    width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .db-user-text-box {
    /deep/ .form-li {
      display: inline-block;
    }
  }
}
</style>
