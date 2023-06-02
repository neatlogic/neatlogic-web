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
              @change="getTableList(1)"
            ></CombineSearcher>
          </Col>
          <Col span="4">
            <RadioGroup v-model="showType" type="button" class="toggle-btn">
              <Radio label="tabletab"><span class="ts-list"></span></Radio>
              <Radio label="cardtab"><span class="ts-block"></span></Radio>
            </RadioGroup>
          </Col>
        </TsRow>
      </template>
      <div slot="content">
        <div 
          :is="showType" 
          v-if="versionData &&!isLoad" 
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
    <VersionEdit
      v-if="isEdit"
      :uuid="editUuid"
      :isShow="isEdit"
      :subsystemUuid="subsystemUuid"
      :systemUuid="systemUuid"
      @close="close"
    ></VersionEdit>
  </div>
</template>

<script>
import list from './version/index.js';
export default {
  name: '',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    VersionEdit: resolve => require(['./edit/version-edit.vue'], resolve),
    ...list
  },
  props: [''],
  data() {
    return {
      showType: 'cardtab',
      systemUuid: '',
      subsystemUuid: '',
      keyword: '',
      isLoad: true,
      isEdit: false, //是否编辑
      editUuid: null, //编辑弹窗对应的仓库id
      versionData: {
        currentPage: 1,
        pageSize: 20
      },
      searchVal: {},
      statusList: {
        'succeed': 'success',
        'failed': 'error'
      },
      searchConfig: {
        search: true,
        searchList: [
          {
            name: 'systemUuid',
            type: 'select',
            label: this.$t('page.system'),
            transfer: true,
            dynamicUrl: '/api/rest/codehub/system/search',
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            value: this.systemUuid,
            onChange: (val) => {
              this.systemUuid = val;
              this.updateSubSystem(val);
              this.getSearch();
            }
          },
          {
            name: 'subsystemUuid',
            type: 'select',
            label: this.$t('page.subsystem'),
            transfer: true,
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            value: this.subsystemUuid,
            onChange: (val) => {
              this.subsystemUuid = val;
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
    addMr(uuid, type) {
      this.$router.push({ path: 'merge-create', query: {versionid: uuid, type: type} });
    },
    editVersion(uuid) {
      this.isEdit = true;
      if (uuid) {
        this.editUuid = uuid;
      }
    },
    deleteVersion(uuid) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.versions')}),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.version.delete({uuid: uuid}).then((res) => {
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
      let param = {};
      if (this.versionData) {
        this.versionData.pageSize && Object.assign(param, { pageSize: this.versionData.pageSize });
        this.versionData.currentPage && Object.assign(param, { currentPage: this.versionData.currentPage });
      }
      this.keyword && Object.assign(param, { keyword: this.keyword });
      this.subsystemUuid && Object.assign(param, { subsystemUuid: this.subsystemUuid });
      this.systemUuid && Object.assign(param, { systemUuid: this.systemUuid });
      this.isLoad = true;
      this.$api.codehub.version.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.versionData = res.Return;
        } else {
          this.versionData = null;
        }
      }).finally(() => {
        this.isLoad = false;
      });
    },
    close(isreload) {
      this.isEdit = false;
      this.editUuid = null;
      if (isreload) {
        this.getSearch();
      }
    },
    updateSubSystem(val) {
      this.subsystemUuid = '';
      if (val) {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'subsystemUuid')) {
            this.$set(item, 'params', {systemId: val});
            this.$set(item, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
          } 
        });
      } else {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'subsystemUuid')) {
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
      this.isLoad = true;
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
