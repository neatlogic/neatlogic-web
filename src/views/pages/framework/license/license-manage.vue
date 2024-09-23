<template>
  <div>
    <TsContain>
      <template v-slot:content>
        <div v-if="licenseData" class="padding">
          <TsFormItem :label="$t('term.framework.authorizedto')">
            {{ licenseData.purchaser }}
          </TsFormItem>
          <TsFormItem v-if="!licenseData.isExpired" :label="$t('term.framework.expiredate')">
            {{ licenseData.expirationDate | formatDate('yyyy-mm-dd') }}
          </TsFormItem>
          <TsFormItem v-else :label="$t('term.framework.expiredate')">
            {{ licenseData.expirationDate | formatDate('yyyy-mm-dd') }}
            <span class="form-error-tip ">
              {{ $t('page.exception') }}:{{ $t('page.licenseexpired') }}
            </span>
          </TsFormItem>
          <TsFormItem v-if="!licenseData.isEnd" :label="$t('term.framework.serveceenddate')">
            {{ licenseData.endDate | formatDate('yyyy-mm-dd') }}
          </TsFormItem>
          <TsFormItem v-else :label="$t('term.framework.serveceenddate')">
            {{ licenseData.endDate | formatDate('yyyy-mm-dd') }}
            <span class="form-error-tip">
              {{ $t('page.exception') }}:{{ $t('page.licenseend') }}
            </span>
          </TsFormItem>
          <TsFormItem v-if="licenseData.isValid" :label="$t('term.rdm.dburl')">
            {{ licenseData.dbUrl }}
          </TsFormItem>
          <TsFormItem v-else :label="$t('term.rdm.dburl')">
            {{ licenseData.dbUrl }}
            <span class="form-error-tip">
              {{ $t('page.exception') }}: {{ $t('page.licensedberror') }}
            </span>
          </TsFormItem>
          <TsFormItem v-if="!licenseData.modulesPolicy && licenseData.isValid && !licenseData.isEnd" :label="$t('term.rdm.modulelist')">
            <div>
              <Tag
                v-for="(m,index) in licenseData.moduleList"
                :key="index"
                size="large"
                color="success"
              >{{ m.name || '' }}·{{ m.id || '' }}</Tag>
            </div>
          </TsFormItem>
          <TsFormItem v-if="licenseData.modulesPolicy" :label="$t('term.rdm.modulelist')">
            <div>
              <TsTable
                v-bind="tableConfig"
                :theadList="theadList"
              >
                <template slot="isBanModule" slot-scope="{ row }">
                  <span>{{ row.isBanModule == 1 ? $t('page.yes') : $t('page.no') }}</span>
                </template>
                <template slot="expirationDate" slot-scope="{ row }">
                  <span>{{ $utils.getDateByFormat(row.expirationDate, 'yyyy-MM-dd') }}</span>
                </template>
                <template slot="policy" slot-scope="{ row }">
                  <span v-for="(policy,index) in row.policy" :key="index">{{ policy.text||'' }}</span>
                  <span v-if="!row.policy || row.policy.length == 0"></span>
                </template>
              </TsTable>
            </div>
          </TsFormItem>
        </div>
        <NoData v-else :text="$t('page.notarget', { target: 'license' })"></NoData>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {},
  data() {
    return {
      licenseData: null,
      isShowAuth: false,
      theadList: [
        // 选中列表表头字段
        { key: 'module', title: this.$t('term.autoexec.modulename') },
        { key: 'expirationDate', title: this.$t('term.framework.expiredate') },
        { key: 'gracePeriod', title: this.$t('term.license.graceperiod') },
        { key: 'isBanModule', title: this.$t('term.license.isbanmodule') },
        { key: 'policy', title: this.$t('page.rule') }
      ],
      tableConfig: {
        currentPage: 1,
        pageSize: 50,
        pageCount: 1,
        classKey: ['expiredClass']
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getLicense();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getLicense() {
      this.$api.framework.license.getLicense().then(res => {
        this.licenseData = res.Return;
        if (this.licenseData) {
          this.licenseData.moduleList = this.licenseData.moduleList.filter(module => module !== null);
          this.tableConfig.tbodyList = res.Return.modulesPolicy;
          this.tableConfig.tbodyList.forEach(element => {
            if (element.isEnd || element.isInvalidPolicy) {
              element.expiredClass = 'bg-error-grey';
            } else {
              //element.expiredClass = 'bg-success-grey';
            }
          });
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.content-grid {
  display: grid;
  width: 80%;
  margin: auto;
  grid-gap: 16px 0px;
  grid-template-columns: 100px auto;
}
.card-grid {
  display: grid;
  width: 100%;
  grid-template-columns: 50px auto;
  .title {
    line-height: 26px;
  }
}
</style>
