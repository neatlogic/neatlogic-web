<template>
  <div v-if="list && list.length>0" :class="!isChildren?'commitlist-ul':'commitlist-next'">
    <div v-for="(li, lindex) in list" :key="lindex" class="commitlist-li border-color">
      <div class="top clearfix">
        <h6 class="d_f user-name ts-user">{{ li.editor }}</h6>
        <!-- <div v-if="li.filePath && tab !='diff'" class="d_f ml-10 text-tip" style="padding-top: 12px;">发表了行评论</div> -->
        <div v-if="!li.filePath && tab !='diff' && !isChildren" class="d_f ml-10 text-tip" style="padding-top: 12px;">发表了MR评论</div>
        <div class="d_f_r"><span class="text-tip" style="line-height:3;">{{ li.lcd|formatDate }}</span></div>
      </div>
      <CommentLi
        :li="li"
        :tab="tab"
        :isChildren="isChildren"
        @reload="reload"
        @selectFile="selectFile"
      ></CommentLi>
      <CommentList
        v-if="li.children && li.children.length>0"
        :list="li.children"
        :tab="tab"
        isChildren
        @reload="reload"
        @selectFile="selectFile"
      ></CommentList>
    </div>
  </div>
  <NoData v-else></NoData>
</template>
<script>
import CommentLi from './comment-item.vue';
export default {
  name: 'CommentList',
  components: {
    CommentLi
  },

  props: {
    list: Array,
    isChildren: {
      type: Boolean,
      default: false
    },
    tab: String
  },
  data() {
    return {
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
    reload() {
      this.$emit('reload');
    },
    selectFile(path) {
      this.$emit('selectFile', path);
    }
  },
  computed: {
    setLineType() {
      return function(type) {
        let str = '';
        if (type && type == 'right') {
          str = '目标';
        } else {
          str = '源';
        }
        return str;
      };
    }
  },
  watch: {}

};

</script>
<style lang='less' scoped>
@import (reference)  '~@/resources/assets/css/variable.less';
.commitlist-ul{
  >.commitlist-li{
    padding-left: 10px;
    padding-right: 10px;
    border: 1px solid;
    margin-bottom: 20px;
    border-radius: 4px;
    position: relative;
    >.commitlist-next{
      padding-left: 20px;
      .commitlist-li{
        &:not(:last-child){
          border-bottom: 1px solid ;
        }
        
      }
    }
    &:not(:last-child){
      &:after{
      content: '';
      position: absolute;
      width: 1px;
      height: 22px;
      top: 100%;
      left: 10px;
      border: 1px solid @default-dividing;
      }
    }

  }
}
.commitlist-li{
  padding: 6px 0;
  
  .user-name{
    line-height: 2;
    font-weight: bold;
    &:before{
      margin-right: 5px;
      font-size: 18px;
    }
  }
  &:hover{
    background: @default-primary-grey;
    /deep/.block-reply{
      opacity: 1;
    }
  }
}
</style>
