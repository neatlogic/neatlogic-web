<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="editVersion()">{{ $t('page.versions') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <TsRow :gutter="0">
          <Col span="4">
            <RadioGroup
              v-model="showType"
              type="button"
              class="mr-xs"
              @on-change="changeRadioGroup"
            >
              <Radio label="tabletab">
                <span class="tsfont-list"></span>
              </Radio>
              <Radio label="cardtab">
                <span class="tsfont-blocklist"></span>
              </Radio>
            </RadioGroup>
          </Col>
          <Col span="20">
            <CombineSearcher
              v-model="searchVal"
              v-bind="searchConfig"
              @change="() => searchList(1)"
            ></CombineSearcher>
          </Col>
       
        </TsRow>
      </template>
      <div slot="content">
        <component  
          :is="showType" 
          v-if="versionData && !loadingShow" 
          :versionData="versionData"
          :canDelete="versionData.hasVersionManageRole"
          @updatePage="updatePage" 
          @updateSize="updateSize" 
          @addMr="addMr" 
          @deleteVersion="deleteVersion"
        ></component>
        <Loading v-else loadingShow type="fix"></Loading>
      </div>
    </TsContain>
    <VersionEditDialog
      v-if="isEdit"
      :id="versionId"
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
      loadingShow: true,
      isEdit: false, //是否编辑
      versionId: null, // 版本id
      versionData: {
        currentPage: 1,
        pageSize: 20
      },
      searchVal: {},
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
            onChange: (val) => {
              this.updateAppModule(val);
            }
          },
          {
            name: 'appModuleId',
            type: 'select',
            label: this.$t('page.subsystem'),
            transfer: true,
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    this.searchList();
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
    updatePage(currentPage) {
      this.versionData.currentPage = currentPage;
      this.searchList();
    },
    updateSize(pageSize) {
      this.versionData.currentPage = 1;
      this.versionData.pageSize = pageSize;
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
    close(needRefresh) {
      this.isEdit = false;
      this.versionId = null;
      if (needRefresh) {
        this.updatePage(1);
      }
    },
    updateAppModule(appSystemId) {
      const params = appSystemId ? {appSystemId} : {};
      const dynamicUrl = appSystemId ? '/api/rest/codehub/appmodule/search' : '';
      this.searchConfig.searchList.forEach((item) => {
        if (item && (item.name == 'appModuleId')) {
          this.$set(item, 'params', params);
          this.$set(item, 'dynamicUrl', dynamicUrl);
        } 
      });
    },
    changeRadioGroup() {
      this.versionData.currentPage = 1;
      this.versionData.pageSize = 20;
      this.searchList(); 
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
