<template>
  <div class="content-handler-box">
    <div class="content-handler-wrap">
      <div class="left-label-text text-grey">{{ config.typeName }}</div>
      <div :style="{'height':maxheight}" class="activity-content overflow-y">
        <div v-if="config.changeType =='clear'" class="text-grey pr8 flew-shrink0">{{ $t('page.delete') }}</div>
        <div v-if="config.oldContent">
          <div v-imgViewer v-dompurify-html="config.oldContent"></div>
        </div>
        <div v-if="config.changeType == 'update'" class="change-text text-grey flew-shrink0">{{ $t('term.process.changeto') }}</div>
        <div v-if="config.newContent">
          <div v-imgViewer v-dompurify-html="config.newContent"></div>
        </div>
      </div>
    </div>
    <div v-if="showButton()" class="right-content-margin text-href pt-xs" @click="viewMoreContent">{{ maxheight == '200px' ? $t('page.viewmore') : $t('page.clickandputaway') }}</div>
  </div>
</template>
<script>
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: '',
  components: {},
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
      if (newContent?.includes('<img') || oldContent?.includes('<img')) {
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
  width: calc(100% - 88px); // 88 左边文案的宽度
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
    .left-lable-width {
      display: inline-block;
    }
}
.right-content-margin {
    margin-left: 88px; // 88 左边文案的宽度
  }
}

</style>
