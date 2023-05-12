<template>
  <ul v-if="navList.length >0" class="nav-detail" :class="isFirst ? 'menu-ul' : 'nav-ul'">
    <li v-for="item in navList" :key="item.uuid" class="nav-li">
      <div
        v-if="item.changeType !='fillblank'"
        class="overflow nav-title cursor-pointer"
        :title="removeHTMLTag(item.content)"
        :class="item.changeType?('nav-'+item.changeType):''"
        @click="gotoItem(item)"
      >
        <span
          v-if="item.children &&item.children.filter(c => {return c.handler == 'h2';}).length > 0 && item.handler == 'h1'"
          class="btn-toggle "
          :class="item.showNext != false ? 'tsfont-drop-down' : 'tsfont-drop-right'"
          @click.stop="showChildren(item)"
        ></span>
        <span v-if="item.children && item.children.length == 0 && item.handler == 'h1'" class="tsfont-dot btn-toggle"></span>
        <span :class="item.selectNavUuid == true || (!isComparison && navUuid == item.uuid)? 'text-primary':''" class="nav-text" v-html="!item.content ?emptyHtml:item.content"></span>
      </div>
      <NavList
        v-if="item.children && item.children.filter(c => { return c.handler == 'h2'; }).length > 0 && item.handler == 'h1' "
        v-show="item.showNext != false"
        :dataList="item.children"
        :isFirst="nextTag"
        @togoItem="gotoItem"
      ></NavList>
    </li>
  </ul>
  <div v-else-if="!isFile && navList.length == 0" class="text-center"> <NoData></NoData></div>
</template>
<script>
export default {
  name: 'NavList',
  components: {},
  filters: {},
  props: {
    dataList: { type: Array, default: () => [] },
    isFirst: {
      type: Boolean,
      default: true
    },
    isComparison: {type: Boolean, default: true}, //是否需要对比
    navUuid: {type: String, default: null},
    isFile: {type: Boolean, default: true} //判断存在附件
  },
  data() {
    return {
      navList: [],
      nextTag: false, //第二层开始的有个标志不是第一层的标志
      emptyHtml: this.$t('message.knowledge.notcatalog')
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
    getNavList(li) {
      let list = [];
      if (li && li.length > 0) {
        //从有h1的第一个开始展示数据,然后把第一个h1之前的数据单独存起来（这一部分与左侧树图无关）
        let startId = -1;
        let typeArr = ['h1', 'h2'];
        for (var i = 0; i < li.length; i++) {
          //标题和内容是否有改变
          if (this.isComparison && typeArr.indexOf(li[i].handler) > -1) {
            if (!li[i].changeType) {
              for (var j = i + 1; j < li.length; j++) {
                if (li[j].changeType) {
                  this.$set(li[i], 'changeType', 'change');
                }
                //下一个h1/h2退出循环
                if (typeArr.indexOf(li[j].handler) > -1) {
                  break;
                }
              }
            } 
          }
        }
        li.forEach(item => { //把数据设置为层级
          if (typeArr.indexOf(item.handler) >= 0) { //目录标题的拿取text值
            let copyItem = this.$utils.deepClone(item);
            if (list.length == 0) {
              list.push(copyItem); 
            } else if (copyItem.handler == 'h1' || copyItem.handler == list[list.length - 1].handler) {
              list.push(copyItem);
            } else {
              let menu = list[list.length - 1];
              menu.children ? menu.children.push(copyItem) : menu.children = [copyItem];
            }
          }
        });
      }
      this.navList = list;
    },
    showChildren(item) {
      //是否显示二级
      if (item.showNext != false) {
        this.$set(item, 'showNext', false);
      } else {
        this.$set(item, 'showNext', true);
      }
    },
    gotoItem(item) {
      this.$emit('togoItem', item);
    }
    
  },
  computed: {
    //去除html字符
    removeHTMLTag() {
      return function(str) {
        if (str) {
          str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
          str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
          str = str.replace(/\n[\s| | ]*\r/g, '\n'); //去除多余空行
        }
        return str;
      };
    }
  },
  watch: {
    dataList: {
      handler(val) {
        this.navList = [];
        if (this.isFirst) {
          let list = this.$utils.deepClone(val);
          this.getNavList(list);
        } else {
          this.navList = val;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
ul.nav-detail{
   white-space: pre;
   .nav-li {
     
    // line-height: 36px;
    .nav-title{
        position: relative;
        padding-left: 24px;
        font-size: 110%;
        line-height: 36px;
        white-space: pre;
        .nav-text{
          display: inline-block;
          /deep/ span{
            vertical-align: baseline;
          }
        }
      .btn-toggle{
        position: absolute;
        left: 4px;
        top: 0;
        font-size: 20px;
      }
    }
  }
}

</style>
