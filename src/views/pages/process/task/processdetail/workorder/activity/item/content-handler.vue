<template>
  <div class="content-handler-box">
    <div class="content-handler-wrap">
      <div class="left-label-text text-grey">{{ config.typeName }}</div>
      <div :style="{'height':maxheight}" class="activity-content overflow-y" :class="{'activity-compare-grid': config.oldContent && config.newContent && config.changeType == 'update'}">
        <div v-if="config.changeType =='clear'" class="text-grey pr8 flew-shrink0">{{ $t('page.delete') }}</div>
        <div v-if="config.oldContent">
          <LongHtmlContent
            v-if="isLongHtml(config.oldContent)"
            :content="config.oldContent"
            sanitize
          ></LongHtmlContent>
          <div
            v-else
            v-imgViewer
            v-dompurify-html="config.oldContent"
            class="ck-content"
          ></div>
        </div>
        <div v-if="config.changeType == 'update'" class="change-text text-grey flew-shrink0" :class="{'activity-compare-marker': config.oldContent && config.newContent}">{{ $t('term.process.changeto') }}</div>
        <div v-if="config.newContent">
          <LongHtmlContent
            v-if="isLongHtml(config.newContent)"
            :content="config.newContent"
            sanitize
          ></LongHtmlContent>
          <div
            v-else
            v-imgViewer
            v-dompurify-html="config.newContent"
            class="ck-content"
          ></div>
        </div>
      </div>
    </div>
    <div v-if="showButton()" class="right-content-margin text-href pt-xs" @click="viewMoreContent">{{ maxheight == '200px' ? $t('page.viewmore') : $t('page.clickandputaway') }}</div>
  </div>
</template>
<script>
import imgViewer from '@/resources/directives/img-viewer.js';
import LongHtmlContent from '../../long-html-content.vue';
import {isLongHtml} from '../../long-html-content.js';
export default {
  name: '',
  components: {LongHtmlContent},
  directives: { imgViewer },
  filters: {},
  props: {
    config: Object
  },
  data() {
    return {
      maxheight: 'auto',
      isClickSeeMore: false
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
    isLongHtml,
    viewMoreContent() {
      if (this.maxheight == '200px') {
        this.maxheight = 'auto';
      } else {
        this.maxheight = '200px';
      }
      this.isClickSeeMore = true;
    },
    showButton() {
      let {newContent, oldContent} = this.config;
      if ((!isLongHtml(newContent) && newContent?.includes('<img')) || (!isLongHtml(oldContent) && oldContent?.includes('<img'))) {
        if (!this.isClickSeeMore) {
          this.maxheight = '200px';
        }
        return true;
      }
      return false;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
.activity-content {
  display: flex;
  flex: 1;
  min-width: 0;
  .pr8{
    padding-right: 8px;
  }
  .flew-shrink0{
    flex-shrink:0
  }
}
.overflow-y {
    overflow-y: hidden;
}
.content-handler-box {
  .content-handler-wrap {
    display: flex;
    > .left-label-text {
      flex: 0 0 72px;
    }
    .left-lable-width {
      display: inline-block;
    }
}
.right-content-margin {
    margin-left: 88px; // 88 左边文案的宽度
  }
}

</style>
