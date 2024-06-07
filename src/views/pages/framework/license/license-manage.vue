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
          <TsFormItem v-if="licenseData.isValid && !licenseData.isEnd" :label="$t('term.rdm.modulelist')">
            <div>
              <Tag
                v-for="(m,index) in licenseData.moduleList"
                :key="index"
                size="large"
                color="success"
              >{{ m.name || '' }}·{{ m.id || '' }}</Tag>
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
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  props: {},
  data() {
    return {
      licenseData: null,
      isShowAuth: false
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
