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
          @change="() => changeCurrentPage(1)"
        ></InputSearcher>
      </template>
      <div slot="content">
        <Loading
          :loadingShow="loadingShow"
          type="fix"
        ></Loading>
        <TsCard
          v-bind="versionData"
          headerPosition="right"
          @updatePage="changeCurrentPage"
          @updateSize="changePageSize"
        >
          <template slot="header" slot-scope="{ row }">
            <div class="action-group">
              <div v-if="!row.isReserve" class="action-item">
                <TsFormSwitch
                  v-model="row.isActive"
                  :true-value="1"
                  :false-value="0"
                  :showStatus="true"
                  @on-change="val => {changeStatus(val, row);}"
                ></TsFormSwitch>
              </div>
              <div class="action-item tsfont-edit" @click="editVersion(row)">{{ $t('page.edit') }}</div>
              <div v-if="!row.isReserve" class="action-item tsfont-trash-o" @click="deleteVersion(row.id)">{{ $t('page.delete') }}</div>
            </div>
          </template>
          <template slot-scope="{ row }">
            <ul class="padding-sm">
              <li :class="row.name ? 'mb-xs' : ''">
                <span>{{ row.name }}</span>
                <Poptip
                  v-if="row.help"
                  width="450"
                  transfer
                  trigger="hover"
                  word-wrap
                >
                  <div class="tsfont-question-o ml-xs text-action"></div>
                  <div slot="content" style="height: 500px;overflow-y: auto;">
                    <div v-html="row.help"></div>
                  </div>
                </Poptip>
              </li>
              <li class="overflow" :title="row.description">{{ row.description || '-' }}</li>
              <li v-if="row.lct" class="text-tip mt-xs">{{ row.lct }}</li>
            </ul>
          </template>
        </TsCard>
      </div>
    </TsContain>
    <VersiontypeEditDialog
      v-if="isShowVersionTypeEditDialog"
      :id="versionTypeId"
      :isReserve="isReserve"
      @close="close"
    ></VersiontypeEditDialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    VersiontypeEditDialog: resolve => require(['./edit/versiontype-edit-dialog.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      keyword: '',
      isShowVersionTypeEditDialog: false,
      loadingShow: true,
      versionTypeId: null,
      isReserve: null, // isReserve为1就是表示内置版本类型
      versionData: {
        classname: 'version-card',
        classKey: 'isActive',
        padding: false,
        span: 24,
        sm: 24,
        md: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        tbodyList: [],
        currentPage: 1,
        pageSize: 20,
        pageType: 'number',
        boxShadow: false,
        hasHoverShadow: true
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
    editVersion(row) {
      this.isShowVersionTypeEditDialog = true;
      if (row) {
        this.versionTypeId = row.id;
        this.isReserve = row.isReserve;
      }
    },
    deleteVersion(id) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.versiontype')}),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.versiontype.delete({id: id}).then((res) => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.changeCurrentPage(1);
              vnode.isShow = false;
            }
          });
        }
      });
    },
    changeCurrentPage(currentPage) {
      this.versionData.currentPage = currentPage;
      this.searchList();
    },
    changePageSize(pageSize) {
      this.versionData.currentPage = 1;
      this.versionData.pageSize = pageSize;
      this.searchList();
    },
    searchList() {
      let param = {
        currentPage: this.versionData.currentPage,
        pageSize: this.versionData.pageSize,
        keyword: this.keyword
      };
      this.loadingShow = true;
      this.$api.codehub.versiontype.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          const properties = ['pageCount', 'rowNum', 'pageSize', 'currentPage', 'tbodyList'];
          properties.forEach(prop => {
            const value = res?.Return?.[prop];
            this.$set(this.versionData, prop, value);
          });
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    close(needRefresh) {
      this.isShowVersionTypeEditDialog = false;
      this.versionTypeId = null;
      this.isReserve = null;
      if (needRefresh) {
        this.searchList();
      }
    },
    changeStatus(val, row) {
      let params = {
        id: row.id,
        isActive: val
      };
      this.$api.codehub.versiontype.updateStatus(params).then(res => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        } else {
          this.$set(row, 'isActive', val ? 0 : 1);
        }
      }).catch(() => {
        this.$set(row, 'isActive', val ? 0 : 1);
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
