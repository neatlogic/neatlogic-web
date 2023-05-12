<template>
  <div>
    <TsContain> 
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addStatement()">{{ $t('term.report.screen') }}</span>
      </template>
      <template slot="topRight">
        <InputSearcher
          v-model="searchParam.keyword"
          @change="searchStatement()"
        ></InputSearcher>
      </template>
      <div slot="content" ref="maintable" class="content">
        <TsTable
          v-if="statementData"
          :theadList="theadList"
          v-bind="statementData"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template slot="name" slot-scope="{ row }">
            <span class="text-href" @click.stop="viewStatement(row.id)">{{ row.name }}</span>
          </template>
          <template v-slot:area="{ row }">
            {{ row.width }} * {{ row.height }}
          </template>
          <template v-slot:isActive="{ row }">
            <span v-if="row.isActive" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li @click.stop>
                  <TsFormSwitch
                    v-model="row.isActive"
                    :true-value="1"
                    :false-value="0"
                    showStatus
                    @on-change="toggleStatementActive(row)"
                  ></TsFormSwitch>
                </li>
                <li
                  class="tsfont-edit"
                  @click="editReport(row)"
                >{{ $t('page.edit') }}</li>
                <li
                  class="tsfont-trash-o"
                  @click="deleteReport(row)"
                >{{ $t('page.delete') }}</li>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: {},
  data() {
    return {
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('term.report.canvassize'),
          key: 'area'},
        {
          title: this.$t('term.report.isactive'),
          key: 'isActive'
        },
        {
          title: this.$t('page.explain'),
          key: 'description'
        },
        {
          title: '',
          key: 'action',
          align: 'right'
        }
      ],
      statementData: { 
       
      },
      searchParam: {
        keyword: ''
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchStatement();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addStatement() {
      this.$router.push({path: '/statement-edit'});
    },
    viewStatement(id) {
      this.$router.push({path: '/statement-view/' + id});
    },
    changePageSize: function(pageSize) {
      if (pageSize) {
        this.searchParam.pageSize = pageSize;
      } else {
        this.searchParam.pageSize = 20;
      }
      this.searchStatement();
    },
    changePage: function(currentPage) {
      this.searchStatement(currentPage);
    },
    editReport(row) {
      this.$router.push({path: '/statement-edit/' + row.id});
    },
    deleteReport(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.report.statement.deleteStatement(row.id).then(res => {
            vnode.isShow = false;
            this.searchStatement();
          });
        }
      });
    },
    toggleStatementActive: function(row) {
      this.$api.report.statement.toggleStatementActive({ id: row.id, isActive: row.isActive }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    searchStatement(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.report.statement.searchStatement(this.searchParam).then(res => {
        this.statementData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
