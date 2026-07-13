<template>
  <div>
    <div v-if="valueList.length > 0" class="clearfix">
      <Tag v-for="(value, index) in valueList" :key="index" @click.native="toCiEntity(value.value)">
        <span v-if="wordList && wordList.length > 0" v-html="highlightKeywords(formatValue(value), wordList)"></span>
        <span v-else> {{ formatValue(value) }}</span>
      </Tag>
      <a
        v-if="hasMore"
        href="javascript:void(0)"
        @click="showMoreAttrEntity"
      ><i class="tsfont-option-horizontal text-href"></i>
      </a>
    </div>
    <TsDialog
      v-if="isShow"
      :is-show="isShow"
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot:header>
        <div>{{ $t('term.cmdb.datadetail') }}</div>
      </template>
      <template v-slot>
        <div>
          <TsTable
            v-if="tableData"
            v-bind="tableData"
            :fixedHeader="false"
            @changeCurrent="changePage"
            @changePageSize="changePageSize"
          >
            <template v-slot:name="{ row }">
              <a href="javascript:void(0)" @click="toCiEntity(row.id)">{{ row.name }}</a>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  directives: {},
  components: { TsTable: () => import('@/resources/components/TsTable/TsTable.vue') },
  props: {
    wordList: { type: Array },
    mode: { type: String, default: 'list' },
    ciEntity: {type: Object},
    attrEntity: { type: Object }
  },
  data() {
    return {
      isShow: false,
      hasMore: false,
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: false,
        width: 'small',
        hasFooter: false
      },
      tableData: {},
      theadList: [{key: 'name', title: this.attrEntity.label}],
      searchParam: {
        ciId: this.attrEntity.targetCiId,
        attrId: this.attrEntity.attrId,
        fromCiEntityId: this.ciEntity && this.ciEntity.id}
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
  methods: {
    highlightKeywords(text, wordList) {
      if (!wordList || wordList.length === 0) return text;
      const escapedWords = wordList.map(word => this.escapeRegExp(word));
      const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi'); // 匹配关键字，忽略大小写
      return text.replace(regex, '<span class="highlight text-error">$1</span>'); // 使用span加上高亮样式
    },
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义正则特殊字符
    },
    formatValue(value) {
      return (value.text && typeof value.text === 'object' && value.text.text) ? value.text.text : value.text; 
    },
    toCiEntity(targetCiEntityId) {
      this.$router.push({ path: '/ci/' + this.attrEntity.targetCiId + '/cientity-view/' + targetCiEntityId });
    },
    showMoreAttrEntity() {
      this.isShow = true;
      this.searchCiEntity();
    },
    searchCiEntity(currentPage) {
      this.searchParam.currentPage = currentPage || 1;
      this.$api.cmdb.cientity.searchCiEntity(this.searchParam).then(res => {
        this.tableData = res.Return;
        this.tableData.theadList = this.theadList;
      });
    },
    changePage(currentPage) {
      this.searchCiEntity(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchCiEntity();
    },
    close() {
      this.isShow = false;
    }
  },
  filter: {},
  computed: {
    valueList() {
      const list = [];
      if (this.attrEntity.valueList && this.attrEntity.valueList.length > 0 && this.attrEntity.actualValueList && this.attrEntity.valueList.length === this.attrEntity.actualValueList.length) {
        this.attrEntity.actualValueList.forEach((a, index) => {
          if (a != null) {
            if (this.ciEntity && this.ciEntity.maxAttrEntityCount) {
              if (index < this.ciEntity.maxAttrEntityCount) {
                list.push({value: this.attrEntity.valueList[index], text: a});
              } else {
                this.hasMore = true;
              }
            } else {
              list.push({value: this.attrEntity.valueList[index], text: a});
            }
          }
        });
      }
      return list;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
::v-deep .highlight {
  font-weight: bold;
  /* 保证和普通文字对齐 */
  line-height: 1; /* 确保高亮的行高与文字一致 */
  vertical-align: baseline; /* 水平对齐方式 */
}</style>
