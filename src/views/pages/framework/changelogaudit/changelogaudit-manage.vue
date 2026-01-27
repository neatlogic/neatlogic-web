<template>
  <div>
    <TsContain border="border">
      <template v-slot:topLeft>
      </template>
      <template v-slot:topRight>
        <div>
          <Row span="24" :gutter="16">
            <Col span="4"></Col>
            <Col span="8">
              <TsFormInput
                v-model.trim="searchParam.version"
                :placeholder="$t('page.versions')"
                @change="handleChange"
              ></TsFormInput>
            </Col>
            <Col span="4">
              <TsFormSelect
                v-model="statusSelectSetting.value"
                v-bind="statusSelectSetting"
                @change="handleChange"
              ></TsFormSelect>
            </Col>
            <Col span="8">
              <TsFormInput
                v-model.trim="searchParam.keyword"
                :placeholder="$t('page.keyword')"
                @change="handleChange"
              ></TsFormInput>
            </Col>
          </Row>
        </div>
      </template>
      <div slot="content">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          :theadList="theadList"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template slot="sqlStatus" slot-scope="{ row }">
            <span v-if="row.sqlStatus == 1" class="text-success">{{ $t('page.success') }}</span>
            <span v-else class="text-error">{{ $t('page.fail') }}</span>
          </template>
          <template slot="lcd" slot-scope="{ row }">
            {{ row.lcd | formatDate }}
          </template>
          <template v-slot:sql="{ row, index}">
            <Poptip
              v-if="row.sql"
              trigger="hover"
              :title="$t('term.framework.sqlsstatement')"
              word-wrap
              width="700"
              :transfer="true"
              placement="left"
            >
              <span class="tsfont-zirenwu" style="cursor:pointer"></span>
              <div
                slot="content"
                class="fz10 scroll"
                style="max-height:500px"
              >
                <div :id="'sql_' + row.version + '_' + row.moduleId + '_' + index">{{ row.sql }}</div>
                <div style="text-align:right"><Button size="small" @click="copySql('#sql_' + row.version + '_' + row.moduleId + '_' + index)">{{ $t('page.copy') }}</Button></div>
              </div>
            </Poptip>
          </template>
          <template v-slot:errorMsg="{ row, index}">
            <Poptip
              v-if="row.errorMsg"
              trigger="hover"
              :title="$t('term.framework.sqlsstatement')"
              word-wrap
              width="700"
              :transfer="true"
              placement="left"
            >
              <span class="tsfont-zirenwu" style="cursor:pointer"></span>
              <div
                slot="content"
                class="fz10 scroll"
                style="max-height:500px"
              >
                <div :id="'errorMsg_' + row.version + '_' + row.moduleId + '_' + index">{{ row.errorMsg }}</div>
                <div style="text-align:right"><Button size="small" @click="copySql('#errorMsg_' + row.version + '_' + row.moduleId + '_' + index)">{{ $t('page.copy') }}</Button></div>
              </div>
            </Poptip>
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
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue')
  },
  props: {},
  data() {
    return {
      searchParam: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      statusSelectSetting: {
        // 状态下拉
        defaultValueIsFirst: true, // 默认选中第一个
        dataList: [
          {
            value: 'all',
            text: this.$t('page.allofthem')
          },
          {
            value: '1',
            text: this.$t('page.success')
          },
          {
            value: '0',
            text: this.$t('page.fail')
          }
        ],
        transfer: true,
        placeholder: this.$t('page.status'),
        value: ''
      },
      theadList: [
        {
          key: 'version',
          title: this.$t('page.versions')
        },
        {
          key: 'moduleId',
          title: this.$t('page.module')
        },
        {
          key: 'sqlStatus',
          title: this.$t('page.status')
        },
        {
          key: 'sql',
          title: this.$t('term.framework.sqlsstatement')
        },
        {
          key: 'errorMsg',
          title: this.$t('term.framework.errorinfo')
        },
        {
          key: 'lcd',
          title: this.$t('term.autoexec.executiontime')
        }
      ],
      tableData: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    // this.searchChangelogAuditList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchChangelogAuditList() {
      this.$api.framework.changelogaudit.searchChangelogAuditList(this.searchParam).then(res => {
        this.tableData = res.Return;
      });
    },
    changePage(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.searchChangelogAuditList();
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchParam.currentPage = 1;
      this.searchChangelogAuditList();
    },
    handleChange() {
      if (this.statusSelectSetting.value == 1 || this.statusSelectSetting.value == 0) {
        this.searchParam.sqlStatus = this.statusSelectSetting.value;
      } else {
        this.searchParam.sqlStatus = null;
      }
      this.searchChangelogAuditList();
    },
    copySql(id) {
      this.$utils.copyText(id);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
