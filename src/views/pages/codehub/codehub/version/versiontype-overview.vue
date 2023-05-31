<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="editVersion()">{{ $t('page.versiontype') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <InputSearcher
          v-model="keyword"
          @change="getSearch"
        ></InputSearcher>
      </template>
      <div slot="content">
        <TsCard v-bind="versionData" headerPosition="right" @updatePage="updatePage">
          <template slot="header" slot-scope="{ row }">
            <div class="action-group">
              <div v-if="!row.isReserve" class="action-item text-action">
                <label class="mr-10">{{ $t('page.enabled') }}</label>
                <i-switch 
                  v-model="row.isActive"
                  :true-value="1"
                  :false-value="0"
                  @on-change="val => {changeStatus(val, row);}"
                ></i-switch>
              </div>
              <div class="action-item ts-edit text-action" @click="editVersion(row.uuid)">{{ $t('page.edit') }}</div>
              <div v-if="!row.isReserve" class="action-item ts-trash text-action" @click="deleteVersion(row.uuid)">{{ $t('page.delete') }}</div>
            </div>
          </template>
          <template slot-scope="{ row }">
            <div class="overflow">
              <span class="h2">{{ row.name }}</span>
              <Poptip
                v-if="row.help"
                transfer
                trigger="hover"
                word-wrap
              >
                <div class="ts-m-problem ml-10 text-action"></div>
                <div slot="content">
                  <div style="font-size:10px;line-height: 1.1;" v-html="row.help"></div>
                </div>
              </Poptip>
              
            </div>
            <div class="h4">{{ row.description||'-' }}</div>
            <div class="text-tip">{{ row.lct }}</div>
          </template>
        </TsCard>
      </div>
    </TsContain>
    <VersiontypeEditDialog
      v-if="isEdit"
      :uuid="editUuid"
      @close="close"
    ></VersiontypeEditDialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    VersiontypeEditDialog: resolve => require(['./edit/versiontype-edit-dialog.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      keyword: '',
      isEdit: false, //是否编辑
      editUuid: null, //编辑弹窗对应的仓库id
      versionData: {
        classname: 'version-card',
        classKey: 'isActive',
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        cardList: []
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
    sysnIssue() {
      this.showEdit = true;
    },
    saveAsyn() {
      this.showEdit = false;
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
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.versiontype')}),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.versiontype.delete({uuid: uuid}).then((res) => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.getSearch();
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
    getSearch() {
      this.versionData.currentPage = 1;
      this.searchList();
    },
    searchList() {
      let param = {};
      this.versionData.pageSize && Object.assign(param, {pageSize: this.versionData.pageSize});
      this.versionData.currentPage && Object.assign(param, {currentPage: this.versionData.currentPage});
      this.keyword && Object.assign(param, {keyword: this.keyword});
      this.isLoad = true;
      this.$api.codehub.versiontype.getList(param).then(res => {
        this.isLoad = false;
        if (res && res.Status == 'OK') {
          this.$set(this.versionData, 'pageCount', res.Return.pageCount);
          this.$set(this.versionData, 'rowNum', res.Return.rowNum);
          this.$set(this.versionData, 'pageSize', res.Return.pageSize);
          this.$set(this.versionData, 'currentPage', res.Return.currentPage);
          this.$set(this.versionData, 'cardList', res.Return.list);
        } else {
          this.$set(this.versionData, 'cardList', []);
        }
      });
    },
    close(isreload) {
      this.isEdit = false;
      this.editUuid = null;
      if (isreload) {
        this.searchList();
      }
    },
    changeStatus(val, config) {
      let listdata = {};
      Object.assign(listdata, {
        uuid: config.uuid,
        isActive: val
      });
      this.$api.codehub.versiontype.updateStatus(listdata).then(res => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        } else {
          this.$set(list, 'isActive', val ? 0 : 1);
        }
      }).catch(error => {
        this.$set(list, 'isActive', val ? 0 : 1);
      });      
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
@import (reference) '~@/resources/assets/css/variable.less';
/deep/ .version-card {
  .tscard-header {
    opacity: 0;
  }
  &:hover {
    .tscard-header {
      opacity: 1;
    }
  }
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
