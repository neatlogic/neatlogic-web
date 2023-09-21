<template>
  <div>
    <div class="list noShadow" :class="[like ? 'collection' : '', seritem.currentSelected ? 'active border-primary bg-info-grey' : 'bg-op']" @click="goWorkOrder(seritem)">
      <div v-show="isShowLike" :class="like ? 'favorite like text-primary' : 'favorite text-primary'" @click.stop="toggleLike">
        <i :class="like ? 'tsfont-star' : 'tsfont-star-border'"></i>
      </div>
      <div class="logo">
        <i class="logo-icon" :class="seritem.icon ? seritem.icon : 'tsfont-ip-list'" :style="{'color': item.color}"></i>
      </div>
      <div class="content">
        <div class="title">{{ seritem.name }}</div>
        <Tooltip
          class="text"
          transfer
          placement="bottom-start"
          max-width="300"
          theme="light"
        >
          <div slot="content" class="tooltip-content" v-html="seritem.desc ? removeHTMLTag(escape2Html(seritem.desc)) : ''"></div>
          <div class="desc" v-html="seritem.desc ? removeHTMLTag(escape2Html(seritem.desc)) : '-'"></div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: '',

  components: {},
  props: {
    item: {
      type: Object,
      default: function() {
        return {};
      }
    },
    isLike: [Number, String],
    parentId: {
      type: String,
      default: ''
    },
    isShowLike: {
      type: Boolean,
      default: true
    },
    hasCallBackMethod: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      seritem: this.item,
      like: this.isLike,
      parentid: this.parentId
    };
  },

  created() {},

  beforeMount() {},

  mounted() {},

  methods: {
    toggleLike: function() {
      this.changeLike();
      this.fatherMethod();
    },
    changeLike: function() {
      this.like = !this.like;
    },
    fatherMethod: function() {
      this.$emit('fatherMethod');
    },
    //跳转到工单上报
    goWorkOrder: function(item) {
      if (!this.hasCallBackMethod) {
        let uuid = item.uuid;
        this.$router.push({
          path: '/task-dispatch',
          query: {
            uuid: uuid
          }
        });
      }
    }
  },

  computed: {
    //去除html字符
    removeHTMLTag() {
      return function(str) {
        str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
        str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
        //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
        str = str.replace(/ /gi, ''); //去掉
        return str;
      };
    },
    //去除转义字符
    escape2Html() {
      return function(str) {
        const arrEntities = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' };
        return str.replace(/&(lt|gt|nbsp|amp|quot);/gi, function(all, t) {
          return arrEntities[t];
        });
      };
    }
  },

  watch: {
    isLike: function() {
      if (this.isLike == 0) {
        this.like = false;
      } else {
        this.like = true;
      }
    },
    item: function() {
      this.seritem = this.item;
    }
  }
};
</script>
<style lang="less" scoped>
.noShadow{
  box-shadow: 0px 0px 0px 0px rgb(0 0 0 / 10%)!important;
  border-radius: 10px!important;
}
.tooltip-content {
  white-space: normal;
}
.text {
  width: 100%;
}
.desc {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
