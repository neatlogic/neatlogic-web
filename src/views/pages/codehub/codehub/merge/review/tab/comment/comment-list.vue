<template>
  <div v-if="!$utils.isEmpty(commitList)" :class="!isChildren?'commitlist-ul':'commitlist-next'">
    <div v-for="(li, lindex) in commitList" :key="lindex" class="commitlist-li border-color pt-xs pb-xs">
      <div class="flex-between">
        <div class="flex-start">
          <UserCard
            v-if="li.editor"
            :uuid="li.editor"
          ></UserCard>
          <div v-if="!li.filePath && tab !='diff' && !isChildren" class="ml-sm text-tip">
            {{ $t('term.codehub.postmergerequestcomments') }}
          </div>
        </div>
        <div>
          <span class="text-tip">{{ li.lcd | formatDate }}</span>
        </div>
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
        :commitList="li.children"
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
export default {
  name: 'CommentList',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    CommentLi: resolve => require(['./comment-item.vue'], resolve),
    CommentList: resolve => require(['./comment-list.vue'], resolve)
  },
  props: {
    commitList: {
      type: Array,
      default: () => {
        return [];
      }
    },
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
  computed: {},
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
.theme(@primary-grey){
.commitlist-li{
  &:hover{
    background: @primary-grey;
    /deep/.block-reply{
      opacity: 1;
    }
  }
}
}
html {
  .theme(@default-primary-grey);
  &.theme-dark {
    .theme(@dark-primary-grey );
  }
}
</style>
