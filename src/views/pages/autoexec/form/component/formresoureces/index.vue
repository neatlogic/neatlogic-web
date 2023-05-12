<template>
  <div>
    <div v-if="!readonly && !disabled">
      <Button icon="tsfont tsfont-plus" @click="addResoureces">{{ $t('term.autoexec.executetarget') }}</Button>
    </div>
    <div v-if="value" class="view-detail">
      <!-- 过滤器 -->
      <template v-if="!$utils.isEmpty(value.filter)">
        <FilterSearch :defaultValue="value.filter" :readonly="true" class="filter-text"></FilterSearch>
        <span class="text-tip-active detail-btn pl-sm" @click="lookDetail()">{{ $t('page.viewdetails') }}</span>
      </template>
      <!-- 输入文本 -->
      <template v-if="!$utils.isEmpty(value.inputNodeList)">
        <span
          v-for="(item,index) in getShowList(value.inputNodeList)"
          :key="index"
          class="item border-color bg-op overflow tag-item-text"
          :class="readonlyTextHighlightClass"
          :title="targetText(item)"
        >{{ targetText(item) }}</span>
        <span v-if="value.inputNodeList.length>showNumber" class="text-tip-active detail-btn" @click="lookDetail()">
          ...{{ $t('page.viewdetails') }}
        </span>
      </template>
      <!-- 节点 -->
      <template v-if="!$utils.isEmpty(value.selectNodeList)">
        <span
          v-for="(item,index) in getShowList(value.selectNodeList)"
          :key="index"
          class="item border-color bg-op overflow tag-item-text"
          :class="readonlyTextHighlightClass"
          :title="targetText(item)"
        >{{ targetText(item) }}</span>
        <span class="text-tip-active detail-btn" @click="lookDetail()">
          <span v-if="value.selectNodeList.length>showNumber">...</span>
          {{ $t('page.viewdetails') }}
        </span>
      </template>
    </div>
    <ResourecesDialog
      v-if="isShowResourecesDialog"
      :config="value"
      :canEdit="!disabled && !readonly"
      @close="close"
    ></ResourecesDialog>
    <ResourecesView
      v-if="isShowView"
      :isShow="isShowView"
      :currentValue="value"
      @close="isShowView=false"
    ></ResourecesView>
  </div>
</template>
<script>
import base from '@/resources/plugins/TsSheet/form/component/base.vue';
import validmixin from '@/resources/plugins/TsSheet/form/component/common/validate-mixin.js';
export default {
  name: '',
  components: {
    FilterSearch: resolve => require(['@/views/pages/autoexec/components/common/filter-search.vue'], resolve),
    ResourecesDialog: resolve => require(['./resoureces-dialog'], resolve),
    ResourecesView: resolve => require(['./resoureces-view'], resolve)
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      isShowResourecesDialog: false,
      isShowView: false,
      showNumber: 5
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
    addResoureces() {
      this.isShowResourecesDialog = true;
    },
    close(config) {
      if (config) {
        this.setValue(config);
      }
      this.isShowResourecesDialog = false;
    },
    lookDetail() {
      this.isShowView = true;
    }
  },
  filter: {},
  computed: {
    targetText() {
      return data => {
        return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
      };
    },
    getShowList() {
      return (list) => {
        let showList = !this.knowledgeView ? list.slice(0, this.showNumber) : list;
        return showList;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.view-detail {
  padding-top: 10px;
  .filter-text {
    display: inline-block;
  }
  .detail-btn{
    display: inline-block;
    width: 70px;
  }
  .item{
    display: inline-block;
    padding: 0 4px;
    line-height: 30px;
    max-width: 150px;
    border:1px solid;
    margin-bottom: 10px;
    margin-right: 10px;
    border-radius: 4px;
  }
  /deep/ .tag-item-text{
    margin-bottom: 10px;
  }
}
</style>
