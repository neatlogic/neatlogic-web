<template>
  <div>
    <TsContain :hideHeader="true">
      <template v-slot:content>
        <div v-if="loading && datasource">
          <div class="mb-nm mt-nm">{{ $t('page.database') }}</div>
          <TsFormItem v-for="(value, key) in datasource" :key="key" :label="key">
            {{ value }}
          </TsFormItem>
        </div>
        <div v-if="loading && mongodb">
          <div class="mb-nm mt-nm">mongodb</div>
          <TsFormItem v-for="(value, key) in mongodb" :key="key" :label="key">
            {{ value }}
          </TsFormItem>
        </div>
        <div v-if="loading && elasticsearch">
          <div class="mb-nm mt-nm">elasticsearch</div>
          <TsFormItem v-for="(value, key) in elasticsearch" :key="key" :label="key">
            {{ value }}
          </TsFormItem>
        </div>
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
      loading: false,
      datasource: {},
      mongodb: {},
      elasticsearch: {}
    };
  },
  beforeCreate() {},
  created() {
    this.getMiddlewareConfig();
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
    getMiddlewareConfig() {
      this.loading = false;
      this.$api.framework.tenantconfig.getMiddlewareConfig({})
        .then(res => {
          if (res.Status === 'OK') {
            this.datasource = res.Return.datasource;
            this.mongodb = res.Return.mongodb;
            this.elasticsearch = res.Return.elasticsearch;
          }
        })
        .finally(() => {
          this.loading = true;
        });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scope></style>
