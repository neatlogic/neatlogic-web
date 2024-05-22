<template>
  <div>
    <TsContain>
      <div slot="topLeft">
        <TsFormRadio
          v-model="searchParam.schemaType"
          :dataList="[
            { value: 'main', text: $t('term.framework.corelibrary') },
            { value: 'data', text: $t('term.framework.subsidiarylibrary') }
          ]"
          @change="searchDatabaseFragment()"
        ></TsFormRadio>
      </div>
      <div slot="topRight">
        <InputSearcher
          v-model="searchParam.keyword"
          @change="searchDatabaseFragment()"
        ></InputSearcher>
      </div>
      <div slot="content">
        <TsTable
          :theadList="theadList"
          :sortList="sortList"
          v-bind="databaseFragmentData"
          @changeCurrent="changeCurrent"
          @updateSort="updateSort"
        >
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-rotate-right" @click="rebuild(row)">{{ $t('page.rebuildtable') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {},
  data() {
    return {
      searchParam: {schemaType: 'main'},
      sortList: ['name', 'dataRows', 'dataSize', 'indexSize', 'dataFree'],
      theadList: [
        { key: 'name', title: this.$t('page.tablename') },
        { key: 'engine', title: this.$t('page.engine') },
        { key: 'dataRows', title: this.$t('page.linenum') },
        { key: 'dataSizeText', title: this.$t('term.framework.datafootprint') },
        { key: 'indexSizeText', title: this.$t('term.framework.indexfootprint') },
        { key: 'dataFreeText', title: this.$t('term.framework.datafreespace') },
        { key: 'action', title: '' }
      ],
      databaseFragmentData: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchDatabaseFragment();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    rebuild(row) {
      this.$createDialog({
        title: this.$t('dialog.title.executeconfirm'),
        content: this.$t('dialog.content.rebuildtableconfirm', {target: row.name}),
        'on-ok': async vnode => {
          const res = await this.$api.framework.healthcheck.rebuildTable({schemaType: this.searchParam.schemaType, tableName: row.name});
          this.$Message.success(this.$t('message.executesuccess'));
          vnode.isShow = false;
        }
      });
    },
    changeCurrent(currentPage) {
      this.searchDatabaseFragment(currentPage);
    },
    updateSort(sort) {
      this.searchParam.sortConfig = sort;
      this.searchDatabaseFragment();
    },
    searchDatabaseFragment(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.framework.healthcheck.searchDatabaseFragment(this.searchParam).then(res => {
        this.databaseFragmentData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
