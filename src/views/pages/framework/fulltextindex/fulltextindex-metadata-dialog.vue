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
          <NoData v-if="!metadata.indexExists" text="不存在当前 Elasticsearch 索引"></NoData>
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
                <span class="tsfont-info-o text-action metadata-info-icon" title="更多配置"></span>
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
        title: '索引元数据',
        type: 'slider',
        maskClose: true,
        isShow: true,
        width: 'large'
      },
      theadList: [
        { key: 'path', title: '字段' },
        { key: 'type', title: '类型' },
        { key: 'analyzer', title: '分词器' },
        { key: 'searchAnalyzer', title: '搜索分词器' },
        { key: 'normalizer', title: '标准化器' }
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
        this.error = error && error.Message ? error.Message : '获取索引元数据失败';
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
        configList.push({ key: 'format', name: '日期格式', value: row.format });
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
        { key: 'typeName', label: '索引类型', value: this.metadata.typeName },
        { key: 'type', label: '索引标识', value: this.metadata.type },
        { key: 'indexName', label: 'ES索引名', value: this.metadata.indexName },
        {
          key: 'indexExists',
          label: '是否存在',
          value: this.metadata.indexExists ? '是' : '否',
          className: this.metadata.indexExists ? 'text-success' : 'text-error'
        },
        { key: 'indexCount', label: '索引数量', value: this.metadata.indexCount || 0 }
      ];
    }
  }
};
</script>
<style scoped lang="less">
</style>
