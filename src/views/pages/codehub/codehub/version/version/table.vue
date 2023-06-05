<template>
  <TsTable v-bind="tableData" @changeCurrent="updatePage" @changePageSize="updateSize">
    <template slot="appSystemVo" slot-scope="{ row }">
      <div v-if="row.appSystemVo">
        <div>{{ getAppSystemVoName(row.appSystemVo) }}</div>
      </div>
    </template>
    <template slot="appModuleVo" slot-scope="{ row }">
      <div v-if="row.appModuleVo">
        <div>{{ getAppSystemVoName(row.appModuleVo) }}</div>
      </div>
    </template>
    <template slot="sourceBranch" slot-scope="{ row }">
      {{ row.sourceBranch || 'master' }}
    </template>
    <template slot="targetBranch" slot-scope="{ row }">
      {{ row.targetBranch || 'develop' }}
    </template>
    <template slot="action" slot-scope="{ row }">
      <div v-if="row.canEdit || canDelete" class="tstable-action">
        <ul class="tstable-action-ul">
          <li v-if="row.canEdit" class="tsfont-plus-o" @click="addMr(row.id)">{{ $t('term.codehub.createmergerequest') }}</li>
          <li v-if="canDelete" class="tsfont-trash-o" @click="deleteVersion(row.id)">{{ $t('page.delete') }}</li>
        </ul>
      </div>
    </template>
  </TsTable>
</template>

<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  props: {
    versionData: {
      type: Object
    },
    statusList: {
      type: Object
    },
    canDelete: {
      type: Boolean
    }
  },
  data() {
    return {
      tableData: {
        theadList: [
          {
            title: this.$t('page.name'),
            key: 'version'
          },
          {
            title: this.$t('page.sourcebranch'),
            key: 'sourceBranch'
          },
          {
            title: this.$t('page.targetbranch'),
            key: 'targetBranch'
          },
          {
            title: this.$t('page.system'),
            key: 'appSystemVo'
          },
          {
            title: this.$t('page.subsystem'),
            key: 'appModuleVo'
          },
          {
            title: this.$t('term.process.dealwithuser'),
            key: 'fcu',
            type: 'user'
          },
          {
            title: this.$t('page.status'),
            key: 'status'
          },
          {
            title: this.$t('page.time'),
            key: 'fcd',
            type: 'time'
          },
          {
            key: 'action'
          }
        ],
        tbodyList: []
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.versionData) {
      Object.assign(this.tableData, {
        pageCount: this.versionData.pageCount,
        rowNum: this.versionData.rowNum,
        pageSize: this.versionData.pageSize,
        currentPage: this.versionData.currentPage,
        tbodyList: this.versionData.tbodyList
      });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updatePage(page) {
      this.$emit('updatePage', page);
    },
    updateSize(size) {
      this.$emit('updateSize', size);
    },
    addMr(id) {
      this.$emit('addMr', id);
    },
    deleteVersion(id) {
      this.$emit('deleteVersion', id);
    }
  },
  filter: {},
  computed: {
    getAppSystemVoName() {
      // 获取应用简称(名称)
      return (appSystemVo) => {
        return appSystemVo.abbrName ? (appSystemVo.name ? `${appSystemVo.abbrName}(${appSystemVo.name})` : appSystemVo.abbrName) : (appSystemVo.name);
      };
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
