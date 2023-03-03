
<template>
  <div v-if="config">
    <div class="item-list">
      <div class="text-title">{{ $t('autoexec.inputParam') }}</div>
      <div v-if="config.inputParamList && config.inputParamList.length > 0">
        <TsTable
          :theadList="theadList"
          :tbodyList="config.inputParamList"
        >
          <template v-slot:isRequired="{row}">
            <div>{{ row.isRequired == 1 ? '必填' : '非必填' }}</div>
          </template>
        </TsTable>
      </div>
      <div v-else class="line-2 text-tip">{{ $t('autoexec.tips.empty.input') }}</div>
    </div>
    <div class="item-list">
      <div class="text-title">{{ $t('autoexec.outputParam') }}</div>
      <div v-if="config.outputParamList && config.outputParamList.length > 0">
        <TsTable
          :theadList="theadList"
          :tbodyList="config.outputParamList"
        >
          <template v-slot:isRequired="{row}">
            <div>{{ row.isRequired == 1 ? $t('page.yes') : $t('page.no') }}</div>
          </template>
        </TsTable>
      </div>
      <div v-else class="line-2 text-tip">{{ $t('autoexec.tips.empty.output') }}</div>
    </div>
    <div class="item-list">
      <div class="text-title require-label">脚本解析器</div>
      <div>
        {{ config.parser }}
      </div>
    </div>
    <div class="item-list">
      <div class="text-title require-label">脚本内容</div>
      <div class="line-box">
        <div v-for="(item,index) in config.lineList" :key="index">{{ item.content }}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  filters: {
  },
  props: {
    config: Object
  },
  data() {
    return {
      theadList: [
        { title: '英文名称', key: 'key' },
        { title: '中文名称', key: 'name' },
        { title: '类型', key: 'typeText'},
        { title: '默认值', key: 'defaultValue'},
        { title: this.$t('page.description'), key: 'description'},
        { title: '是否必填', key: 'isRequired' }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  computed: {},
  watch: {}
};
</script>
