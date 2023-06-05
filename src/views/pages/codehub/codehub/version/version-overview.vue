<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="editVersion()">{{ $t('page.versions') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <TsRow>
          <Col span="20">
            <CombineSearcher
              v-model="searchVal"
              v-bind="searchConfig"
              @change="() => searchList(1)"
            ></CombineSearcher>
          </Col>
          <Col span="4">
            <RadioGroup v-model="showType" type="button" class="toggle-btn">
              <Radio label="tabletab"><span class="tsfont-list"></span></Radio>
              <Radio label="cardtab"><span class="tsfont-blocklist"></span></Radio>
            </RadioGroup>
          </Col>
        </TsRow>
      </template>
      <div slot="content">
        <div 
          :is="showType" 
          v-if="versionData &&!loadingShow" 
          :versionData="versionData" 
          :statusList="statusList" 
          :canDelete="versionData.hasVersionManageRole"
          @updatePage="updatePage" 
          @updateSize="updateSize" 
          @addMr="addMr" 
          @deleteVersion="deleteVersion"
        ></div>
        <Loading v-else loadingShow type="fix"></Loading>
      </div>
    </TsContain>
    <VersionEditDialog
      v-if="isEdit"
      :id="versionId"
      :appModuleId="appModuleId"
      :appSystemId="appSystemId"
      @close="close"
    ></VersionEditDialog>
  </div>
</template>

<script>
import list from './version/index.js';
export default {
  name: '',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    VersionEditDialog: resolve => require(['./edit/version-edit-dialog.vue'], resolve),
    ...list
  },
  props: [''],
  data() {
    return {
      showType: 'cardtab',
      appSystemId: null,
      appModuleId: null,
      keyword: '',
      loadingShow: true,
      isEdit: false, //是否编辑
      versionId: null, // 版本id
      versionData: {
        currentPage: 1,
        pageSize: 20
      },
      searchVal: {},
      statusList: {
        succeed: 'success',
        failed: 'error'
      },
      searchConfig: {
        search: true,
        searchList: [
          {
            name: 'appSystemId',
            type: 'select',
            label: this.$t('page.system'),
            transfer: true,
            dynamicUrl: '/api/rest/codehub/appsystem/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            value: this.appSystemId,
            onChange: (val) => {
              this.appSystemId = val;
              this.updateSubSystem(val);
              this.getSearch();
            }
          },
          {
            name: 'appModuleId',
            type: 'select',
            label: this.$t('page.subsystem'),
            transfer: true,
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            value: this.appModuleId,
            onChange: (val) => {
              this.appModuleId = val;
              this.getSearch();
            }
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addMr(id, type) {
      this.$router.push({ path: 'merge-create', query: {versionid: id, type: type} });
    },
    editVersion(id) {
      this.isEdit = true;
      if (id) {
        this.versionId = id;
      }
    },
    deleteVersion(id) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.versions')}),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.version.delete({id: id}).then((res) => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchList();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    updatePage(page) {
      this.versionData.currentPage = page;
      this.searchList();
    },
    updateSize(size) {
      this.versionData.pageSize = size;
      this.searchList();
    },
    getSearch() {
      this.versionData.currentPage = 1;
      this.searchList();
    },
    searchList() {
      let param = {
        currentPage: this.versionData.currentPage,
        pageSize: this.versionData.pageSize,
        ...this.searchVal
      };
      this.$addWatchData('searchVal', this.searchVal);
      this.$addWatchData('currentPage', param.currentPage);
      this.$addWatchData('pageSize', param.pageSize);
      this.loadingShow = true;
      this.$api.codehub.version.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.versionData = res.Return;
        } else {
          this.versionData = null;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    restoreHistory(historyData) {
      if (historyData['searchVal']) {
        this.searchVal = historyData['searchVal'];
      }
      if (historyData['currentPage']) {
        this.versionData.currentPage = historyData['currentPage'];
      }
      if (historyData['pageSize']) {
        this.versionData.pageSize = historyData['pageSize'];
      }
    },
    close(isreload) {
      this.isEdit = false;
      this.versionId = null;
      if (isreload) {
        this.getSearch();
      }
    },
    updateSubSystem(val) {
      this.appModuleId = '';
      if (val) {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'appModuleId')) {
            this.$set(item, 'params', {systemId: val});
            this.$set(item, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
          } 
        });
      } else {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'appModuleId')) {
            this.$set(item, 'params', {});
            this.$set(item, 'dynamicUrl', '');
          } 
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    showType(val) {
      this.loadingShow = true;
      this.versionData.currentPage = 1;
      this.versionData.pageSize = val == 'tabletab' ? 20 : 10;
      this.searchList();      
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.text-label {
  line-height: 54px;
}
.text-icon{
  margin-right: 4px;
}
.branch-sep{
  margin-left: 20px;
  margin-right: 20px;
}
/deep/ .tscard-li {
  .version-card {
    border-left: 3px solid @default-border;
  }
  &.li-1 {
    .version-card {
      border-color: @default-primary-color;
    }
  }
}
</style>
