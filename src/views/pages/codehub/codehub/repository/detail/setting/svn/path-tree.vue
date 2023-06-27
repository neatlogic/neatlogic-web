<template>
  <div v-if="myList">
    <ul v-if="myList && myList.length" :class="isChildren ? 'path-child' : 'path-first'">
      <li
        v-for="li in myList"
        :key="li.path"
        class="path-li"
        :class="{hasnext:li.type && li.type=='D'}"
      >
        <div class="tree-name" :class="selectPath.indexOf(li.fullpath)>-1 ? 'text-href' : 'text-action'" @click="selectedThis(li)">
          <span
            v-if="li.type && li.type == 'D'"
            class="btn-shownext"
            :class="li.showchild?'ts-angle-down':'ts-angle-up'"
            @click.stop="getNext(li)"
          ></span>
          <span class="btn-check" :class="selectPath.indexOf(li.fullpath)>-1?'text-href bg-primary active':'text-action'">
            <span v-if="selectPath.indexOf(li.fullpath)>-1" class="ts-check text-op selected-check-icon"></span>
          </span>
          {{ li.path }}
        </div>
        <div v-show="li.showchild" v-if="li.type && li.type=='D'">
          <PathTree
            v-if="li.children"
            :list="$utils.deepClone(li.children)"
            isChildren
            :selectPath="selectPath"
            :floor="parseInt(floor)+1"
            @selectedPath="selectedPath"
          ></PathTree>
          <Loading v-else loadingShow></Loading>
        </div>
      </li>
    </ul>
    <NoData v-else-if="!isChildren"></NoData>
  </div>
  
</template>
<script>
export default {
  name: 'PathTree',
  components: {
    PathTree: resolve => require(['./path-tree'], resolve)
  },
  filters: {},
  inject: ['repositoryId'],
  props: {
    list: [Array, String],
    isChildren: {
      type: Boolean,
      default: false
    },
    selectPath: Array,
    floor: {//位于树图的第几层
      type: [Number, String],
      default: 1
    } 
  },
  data() {
    return {
      myList: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.myList = this.list;
    //点开授权滑窗后，前端触发子目录加载，加载两层目录如下（加上根目录，总的显示3层目录）
    if (parseInt(this.floor) < 3 && this.myList.length) {
      this.myList.forEach(li => {
        this.getNext(li, true);
      });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getNext(li, isEmit) {
      //已经加载过的就有children,没有就是展开然后调用接口
      if (li.children) {
        Object.assign(li, {
          showchild: !li.showchild
        });
      } else {
        let param = {
          repositoryId: this.repositoryId,
          parentPath: (li.parentPath ? li.parentPath + '/' : li.parentPath) + li.path
        };
        Object.assign(li, {
          showchild: true
        });
        this.$api.codehub.repositorydetail.getSvnAuthTree(param).then(res => {
          if (res.Status == 'OK') {
            if (res.Return && res.Return.length) {
              Object.assign(li, {
                children: res.Return.map(r => {
                  return {
                    path: r.path,
                    type: r.type,
                    hasChild: r.type && r.type == 'D',
                    children: null,
                    showchild: false,
                    parentPath: (li.parentPath ? li.parentPath + '/' : li.parentPath) + li.path,
                    fullpath: ((li.parentPath ? li.parentPath + '/' : li.parentPath) + li.path + '/' + r.path).replace(/^\/+/, '/')
                  };
                })
              });
            } else {
              Object.assign(li, {
                children: []
              });
            }
            this.$forceUpdate();
          } else {
            Object.assign(li, {
              children: []
            });
            this.$forceUpdate();
          }
        }).finally(res => {
          if (isEmit) {
            //this.$emit('finish');
          }
        });
      }
    },
    selectedThis(li) {
      this.$emit('selectedPath', li.fullpath, this.selectPath.indexOf(li.fullpath) > -1);
    },
    selectedPath(path, isIn) {
      this.$emit('selectedPath', path, isIn);
    }
  },
  computed: {},
  watch: {}
};

</script>
<style lang='less' scoped>
/deep/ .tree-name{
  position: relative;
  line-height: 26px;
  padding-left: 16px;
}
/deep/ .path-li{
  word-break: keep-all;
  white-space: nowrap;
    .btn-check{
      width: 12px;
      height: 12px;
      border: 1px solid;
      position: absolute;
      left: 0;
      top: 50%;
      margin-top: -7px;
    }
}
/deep/.hasnext{
  padding-left: 22px;
  >.tree-name{
    .btn-shownext{
      font-size:90%;
      position: absolute;
      top: 50%;
      left: -16px;
      width: 14px;
      height: 16px;
      line-height: 16px;
      cursor: pointer;
      margin-top: -8px;
    }
  }
}
.selected-check-icon {
  display: block;
  width: 12px;
  margin-left: -2px;
  line-height: 12px;
  font-weight: bolder;
  text-align: left;
}
</style>
