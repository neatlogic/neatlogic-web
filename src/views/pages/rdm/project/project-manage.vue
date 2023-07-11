<template>
  <div>
    <TsContain>
      <template v-slot:content>
        <TsTable
          v-bind="projectData"
          :theadList="theadList"
          @changeCurrent="searchProject"
          @changePageSize="changePageSize"
        >
          <template v-slot:name="{ row }">
            <a @click="editProject(row)">{{ row.name }}</a>
          </template>
          <template v-slot:isClose="{ row }">
            <span v-if="row.isClose" class="text-grey">{{ $t('term.rdm.isclosed') }}</span>
            <span v-else class="text-success">{{ $t('term.rdm.isopened') }}</span>
          </template>
          <template v-slot:startDate="{ row }">
            <span>{{ row.startDate | formatDate('yyyy-mm-dd') }}</span>
          </template>
          <template v-slot:endDate="{ row }">
            <span>{{ row.endDate | formatDate('yyyy-mm-dd') }}</span>
          </template>
          <template v-slot:appList="{ row }">
            <div v-if="row.appList && row.appList.length > 0">
              <Tag v-for="(app, index) in row.appList" :key="index">
                {{ app.name }}
              </Tag>
            </div>
          </template>
          <template v-slot:color="{ row }">
            <div class="color-block radius-sm" :style="{ background: row.color }"></div>
          </template>
        </TsTable>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      theadList: [
        {
          key: 'name',
          title: this.$t('page.name')
        },
        {
          key: 'isClose',
          title: this.$t('term.rdm.isclose')
        },
        {
          key: 'type',
          title: this.$t('page.type')
        },
        {
          key: 'appList',
          title: this.$t('term.rdm.applist')
        },
        {
          key: 'startDate',
          title: this.$t('page.startdate')
        },
        {
          key: 'endDate',
          title: this.$t('page.enddate')
        },

        {
          key: 'color',
          title: this.$t('page.color')
        },
        {
          key: 'description',
          title: this.$t('page.description')
        }
      ],
      projectData: {},
      searchParam: {}
    };
  },
  beforeCreate() {},
  created() {
    this.searchProject();
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
    editProject(project) {
      this.$router.push({ path: '/project-edit/' + project.id });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchProject();
    },
    searchProject(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.rdm.project.searchProject(this.searchParam).then(res => {
        this.projectData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.color-block {
  height: 20px;
  width: 20px;
}
</style>
