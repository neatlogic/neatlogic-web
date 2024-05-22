
<template>
  <div v-if="config">
    <div class="item-list">
      <div class="text-title">{{ $t('page.inputparam') }}</div>
      <div v-if="config.inputParamList && config.inputParamList.length > 0">
        <TsTable
          :theadList="theadList"
          :tbodyList="config.inputParamList"
        >
          <template v-slot:isRequired="{row}">
            <div>{{ row.isRequired == 1 ? $t('page.require') : $t('page.notrequired') }}</div>
          </template>
        </TsTable>
      </div>
      <div v-else class="line-2 text-tip">{{ $t('page.notarget', {target: $t('page.inputparam')}) }}</div>
    </div>
    <div class="item-list">
      <div class="text-title">{{ $t('page.outputparam') }}</div>
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
      <div v-else class="line-2 text-tip">{{ $t('page.notarget', {target: $t('page.outputparam')}) }}</div>
    </div>
    <div class="item-list">
      <div class="text-title require-label">{{ $t('term.autoexec.scriptparser') }}</div>
      <div>
        {{ config.parser }}
      </div>
    </div>
    <div class="item-list">
      <div class="text-title require-label">{{ $t('term.autoexec.scriptcontent') }}</div>
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
    TsTable: () => import('@/resources/components/TsTable/TsTable')
  },
  filters: {
  },
  props: {
    config: Object
  },
  data() {
    return {
      theadList: [
        { title: this.$t('page.englishname'), key: 'key' },
        { title: this.$t('page.chinesename'), key: 'name' },
        { title: this.$t('page.type'), key: 'typeText'},
        { title: this.$t('page.defaultvalue'), key: 'defaultValue'},
        { title: this.$t('page.description'), key: 'description'},
        { title: this.$t('page.isrequired'), key: 'isRequired' }
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
