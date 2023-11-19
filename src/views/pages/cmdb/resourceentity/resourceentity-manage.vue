<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item tsfont-rotate-right" @click="rebuildAll()">{{ $t('term.cmdb.rebuildallview') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <InputSearcher v-model="keyword"></InputSearcher>
      </template>
      <template v-slot:content>
        <TsTable v-if="tbodyList" :theadList="theadList" :tbodyList="finalTbodyList">
          <template v-slot:name="{ row }">
            <a @click="editEntity(row)">{{ row.name }}</a>
          </template>
          <template v-slot:status="{ row }">
            <span v-if="row.status === 'error'" class="text-error">{{ $t('page.exception') }}</span>
            <span v-if="row.error">
              <Poptip :transfer="true" placement="right" trigger="hover">
                <i class="tsfont-warning-s text-error"></i>
                <div slot="content">
                  {{ row.error }}
                </div>
              </Poptip>
            </span>
            <span v-else-if="row.status === 'ready'" class="text-success">{{ $t('page.pending') }}</span>
            <span v-else-if="row.status === 'pending'" class="text-grey">{{ $t('page.notbuild') }}</span>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-circulation-s" @click="viewData(1, 10, row.name)">{{ $t('page.viewdata') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <ResourceEditDialog v-if="isEditShow" :name="currentEntityName" @close="closeEntityDialog"></ResourceEditDialog>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="close"
    >
      <TsTable
        :fixedHeader="false"
        v-bind="viewDataTable"
        @changeCurrent="viewData"
        @changePageSize="viewData(1, ...arguments)"
      ></TsTable>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    ResourceEditDialog: resolve => require(['./resourceentity-edit.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: {},
  data() {
    return {
      keyword: '',
      currentEntityId: null,
      isEditShow: false,
      theadList: [
        {
          key: 'name',
          title: this.$t('term.cmdb.view')
        },
        { key: 'label', title: this.$t('page.name') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'initTime', title: this.$t('page.inittime'), type: 'time' },
        { key: 'description', title: this.$t('page.description') },
        {
          key: 'action'
        }
      ],
      tbodyList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: false,
        width: 'large',
        title: '',
        hasFooter: false
      },
      viewDataTable: {},
      viewDataParams: {
        currentPage: 1,
        pageSize: 10,
        name: ''
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getResourceEntityList();
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
    editEntity(row) {
      this.currentEntityName = row.name;
      this.isEditShow = true;
    },
    getResourceEntityList() {
      this.$api.cmdb.resourceentity.searchResourceEntity().then(res => {
        this.tbodyList = res.Return;
      });
    },
    viewData(currentPage, pageSize, name) {
      console.log(name, 'name');
      if (currentPage) {
        this.viewDataParams.currentPage = currentPage;
      }
      if (pageSize) {
        this.viewDataParams.pageSize = pageSize;
      }
      if (name) {
        this.dialogConfig.title = name;
        this.viewDataParams.name = name;
      }
      this.$api.cmdb.resourceentity.getResourceEntityViewDataList(this.viewDataParams).then(res => {
        this.viewDataTable = res.Return;
        this.dialogConfig.isShow = true;
      });
    },
    close() {
      this.dialogConfig.isShow = false;
      this.viewDataTable = {};
      this.dialogConfig.title = '';
      this.viewDataParams.name = '';
    },
    closeEntityDialog(needRefresh) {
      this.isEditShow = false;
      if (needRefresh) {
        this.getResourceEntityList();
      }
    },
    rebuildAll() {
      this.$api.cmdb.resourceentity
        .rebuildAllResourceEntity()
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success('重建完毕');
          }
        })
        .finally(() => {
          this.getResourceEntityList();
        });
    }
  },
  filter: {},
  computed: {
    finalTbodyList() {
      if (this.keyword) {
        const k = this.keyword.toLowerCase();
        return this.tbodyList.filter(d => (d.name && d.name.toLowerCase().includes(k)) || (d.label && d.label.toLowerCase().includes(k)) || (d.description && d.description.toLowerCase().includes(k)));
      }
      return this.tbodyList;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
