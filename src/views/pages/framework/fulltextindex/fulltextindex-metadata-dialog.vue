<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div>
        <Loading
          :loadingShow="loadingShow"
          type="fix"
        ></Loading>
        <NoData v-if="error" :text="error"></NoData>
        <template v-if="metadata">
          <TsRow class=" mb-md">
            <Col
              v-for="item in metadataSummaryList"
              :key="item.key"
              :span="4"
            >
              <div class="text-grey mb-sm">{{ item.label }}</div>
              <div>{{ item.value }}</div>
            </Col>
          </TsRow>
          <NoData v-if="!metadata.indexExists" :text="$t('term.framework.elasticsearchindexnotexists')"></NoData>
          <TsTable
            v-else
            :tbodyList="metadata.fieldList"
            :theadList="theadList"
            :fixedHeader="false"
          >
            <template v-slot:path="{ row }">
              <span>{{ row.path }}</span>
              <Poptip
                v-if="hasMoreConfig(row)"
                trigger="hover"
                placement="left"
                :transfer="true"
              >
                <span class="tsfont-info-o text-action metadata-info-icon" :title="$t('term.framework.moreconfig')"></span>
                <div slot="content">
                  <div
                    v-for="item in getMoreConfigList(row)"
                    :key="item.key"
                    class="metadata-config-item"
                  >
                    <span class="text-grey">{{ item.name }}</span>
                    <span>{{ item.value }}</span>
                  </div>
                </div>
              </Poptip>
            </template>
          </TsTable>
        </template>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close">{{ $t('page.close') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    audit: { type: Object }
  },
  data() {
    return {
      loadingShow: false,
      metadata: null,
      error: '',
      dialogConfig: {
        title: this.$t('term.framework.indexmetadata'),
        type: 'slider',
        maskClose: true,
        isShow: true,
        width: 'large'
      },
      theadList: [
        { key: 'path', title: this.$t('page.field') },
        { key: 'type', title: this.$t('page.type') },
        { key: 'analyzer', title: this.$t('term.framework.analyzer') },
        { key: 'searchAnalyzer', title: this.$t('term.framework.searchanalyzer') },
        { key: 'normalizer', title: this.$t('term.framework.normalizer') }
      ]
    };
  },
  created() {
    this.getMetadata();
  },
  methods: {
    getMetadata() {
      if (!this.audit) {
        return;
      }
      this.loadingShow = true;
      this.error = '';
      this.$api.framework.fulltextindex.getFullTextIndexMetadata({
        handler: this.audit.handler,
        type: this.audit.type
      }).then(res => {
        this.metadata = res.Return || {};
      }).catch(error => {
        this.metadata = null;
        this.error = error && error.Message ? error.Message : this.$t('term.framework.getindexmetadatafailed');
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    close() {
      this.$emit('close');
    },
    getMoreConfigList(row) {
      const configList = [];
      if (row && row.format) {
        configList.push({ key: 'format', name: this.$t('term.framework.dateformat'), value: row.format });
      }
      return configList;
    },
    hasMoreConfig(row) {
      return this.getMoreConfigList(row).length > 0;
    }
  },
  computed: {
    metadataSummaryList() {
      if (!this.metadata) {
        return [];
      }
      return [
        { key: 'typeName', label: this.$t('term.framework.indextype'), value: this.metadata.typeName },
        { key: 'type', label: this.$t('term.framework.indexkey'), value: this.metadata.type },
        { key: 'indexName', label: this.$t('term.framework.esindexname'), value: this.metadata.indexName },
        {
          key: 'indexExists',
          label: this.$t('term.framework.indexexists'),
          value: this.metadata.indexExists ? this.$t('page.yes') : this.$t('page.no'),
          className: this.metadata.indexExists ? 'text-success' : 'text-error'
        },
        { key: 'indexCount', label: this.$t('term.framework.indexcount'), value: this.metadata.indexCount || 0 }
      ];
    }
  }
};
</script>
<style scoped lang="less">
</style>
