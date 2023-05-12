<template>
  <div class="comparison-main compare">
    <slot name="top"></slot>
    <div class="comparison-detail" :style="{ 'padding-left':navWidth}">
      <loading :loadingShow="taskLoading" type="fix"></loading>
      <div v-if="navWidth != '0px'" class="left-nav dividing-color" :style="{'width':navWidth}">
        <div class="nav-top text-tip">{{ $t('page.catalogue') }}</div>
        <LeftNav :dataList="dataList" :isFile="isFile" @togoItem="togoItem"></LeftNav>
        <div v-if="config && config.fileList && config.fileList.length > 0" class="li-div text-action" @click="togoItem('file')">{{ $t('page.accessory') }}</div>
      </div>
      <div
        ref="comparisonContent"
        v-imgViewer
        class="right-content"
        style="white-space: pre-wrap;"
        @mouseover="getMouseover"
        @scroll="getScroll()"
      >
        <div v-if="config && config.tagList && config.tagList.length > 0" class="tag-style">
          <TagList :list="config.tagList"></TagList>
        </div>
        <div
          :is="'item-' + list.handler"
          v-for="list in dataList"
          :key="list.uuid"
          :ref="'item_' + list.uuid"
          :config="list.config"
          :handler="list.handler"
          :uuid="list.uuid"
          :content="list.content"
          :changeType="list.changeType"
        ></div>
        <div v-if="config.fileList && config.fileList.length > 0">
          <div id="item_file" ref="item_file" class="fileContain">
            <h6>{{ $t('page.accessory') }}</h6>
            <div v-for="file in config.fileList" :key="file.id" class="file-list overflow">
              <span v-download="downurl('/api/binary/file/download', file.id)" class="tsfont-attachment text-action">{{ file.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import items from '../items/index.js';
import LeftNav from '@/views/pages/knowledge/common/nav-detail.vue';
import download from '@/resources/directives/download.js';
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: '',
  components: {
    TagList: resolve => require(['@/views/pages/knowledge/common/tag-list.vue'], resolve),
    ...items,
    LeftNav
  },
  directives: { download, imgViewer },
  filters: {},
  props: {
    config: { type: Object, default: null },
    navWidth: { type: String, default: '200px' }
  },
  data() {
    return {
      taskLoading: true,
      dataList: []
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
    getMouseover() {
      this.$emit('updateMouseover');
    },
    getScroll() {
      let scrollTop = this.$refs.comparisonContent.scrollTop;
      this.$emit('updateScrollTop', scrollTop);
    },
    setScroll(scrollTop) {
      this.$refs.comparisonContent.scrollTop = scrollTop;
    },
    togoItem(item) {
      this.$emit('updateMouseover');
      if (item) {
        let _this = this;
        if (item != 'file') {
          let scrollTop = _this.$refs[`item_${typeof item == 'object' ? item.uuid : item}`][0].$el.offsetTop;
          _this.$refs.comparisonContent.scrollTop = scrollTop;
        } else {
          _this.$el.querySelector('#item_file').scrollIntoView();
        }
      }
    }
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    },
    isFile() {
      return this.config.fileList && this.config.fileList.length > 0;
    }
  },
  watch: {
    config: {
      handler(val) {
        if (val) {
          this.title = val.title;
          this.dataList = val.lineList;
          this.taskLoading = false;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/compare.less';
.comparison-main {
  width: 100%;
  height: 100%;
  .nav-top {
    padding: 16px 16px 10px 16px;
  }
}
.comparison-detail {
  position: relative;
  width: 100%;
  height: 100%;
  padding-left: 201px;
  height: calc(100% - 40px);
  .left-nav {
    position: absolute;
    left: 0;
    top: 0;
    width: 200px;
    height: 100%;
    border-right: 1px solid;
    overflow: auto;
  }
  .right-content {
    width: 100%;
    height: 100%;
    padding: 12px 16px;
    line-height: 20px;
    overflow: auto;
  }
  .tag-style {
    padding-top: 10px;
  }
  .li-div{
    padding: 0 8px;
  }
}
</style>
