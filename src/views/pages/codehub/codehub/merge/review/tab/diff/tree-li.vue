<template>
  <div>
    <div v-if="!isChildren" class="tree-top">
      <div style="display: flex;align-items: center;" class="mb-md">
        <RadioGroup
          v-model="showType"
          type="button"
          size="small"
        >
          <Radio v-for="(type,tindex) in typeList" :key="tindex" :label="type.name">
            <span :class="type.icon"></span>
          </Radio>
        </RadioGroup>
        <TsFormSelect
          v-model="fileName"
          class="ml-xs"
          v-bind="fileNameSelectConfig"
          :dataList="diffList"
          @on-change="selectFilename"
        ></TsFormSelect>
      </div>
    </div>
    <ul v-if="showType =='list'" :class="isChildren?'diff-treeul':'diff-treecontaner'" @scroll.stop="scrollContainer($event)">
      <li
        v-for="(li,dindex) in diffList"
        :key="dindex"
        class="diff-treeli"
        @click.stop="showChild(li)"
      >
        <span v-if="!li.children || !li.children.length" class="type-modified" :class="'modified-'+li.modifiedType"></span>
        <div 
          :id="'tree_'+li.filepathUuid" 
          class="diff-treediv"
          :class="setDivClass(li,selectedFile)"
          :title="li.path"
          :style="!li.children || !li.children.length?'padding-left:14px':''"
        >
          {{ li.name }}
          <div class="sum-count bg-op" :style="'right:-'+isChildren?left:scrollLeft+'px'">
            <span class="text-primary">+{{ li.insertedCount }} </span>
            <span class="text-danger">-{{ li.deletedCount }}</span>
          </div>          
        </div></li>
    </ul>
    <ul 
      v-else
      :class="isChildren?'diff-treeul':'diff-treecontaner'"
      @scroll.stop="scrollContainer($event)"
    >
      <li 
        v-for="(li,lindex) in list" 
        :key="lindex"
        class="diff-treeli"
        :class="setLiClass(li)"
        @click.stop="showChild(li)"
      >
        <span v-if="!li.children || !li.children.length" class="type-modified" :class="'modified-'+li.modifiedType"></span>
        <div 
          :id="!li.children || !li.children.length?'tree_'+li.filepathUuid:''" 
          class="diff-treediv"
          :class="setDivClass(li,selectedFile)"
          :title="li.name"
          :style="setDivStyle(li)"
        >
          <i 
            v-if="li.children && li.children.length>0" 
            class="tsfont-down btn-toggle"
          ></i>
          
          <span class="diff-name">{{ li.name }}</span>
          <div v-if="!li.children || !li.children.length" class="sum-count bg-op" :style="'right:-'+(isChildren?left+3:scrollLeft+3)+'px'">
            <span class="text-primary">+{{ li.insertedCount }} </span>
            <span class="text-danger" style="padding-right:2px;">-{{ li.deletedCount }}</span>
          </div>
        </div>
        <TreeLi 
          v-show="li.showChild"
          v-if="li.children && li.children.length>0" 
          isChildren 
          :treeList="li.children"
          :supportTypeList="supportTypeList"
          :selectedFile="selectedFile"
          :left="isChildren?left:scrollLeft"
          @onSelected="onSelected"
          @open-parent="openFolder(li)"
        ></TreeLi>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'TreeLi',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TreeLi: resolve => require(['pages/codehub/codehub/merge/review/tab/diff/tree-li'], resolve)
  },
  filters: {},
  props: {
    treeList: {
      type: Array 
    },
    isChildren: {
      type: Boolean,
      default: false
    },
    supportTypeList: {
      type: Array 
    },
    selectedFile: {
      type: String 
    },
    diffList: {
      type: Array
    },
    left: {
      type: Number
    }
  },
  data() {
    return {
      list: null,
      showType: 'tree', //树图显示的模式
      typeList: [{
        name: 'tree',
        icon: 'ts-workflow'
      }, {
        name: 'list',
        icon: 'tsfont-bar'        
      }],
      fileName: '',
      fileNameSelectConfig: {
        placeholder: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.filename')}),
        border: 'border',
        width: 124,
        search: true,
        clearable: true,
        valueName: 'filepathUuid',
        textName: 'name',
        transfer: true
      },
      scrollLeft: 0//x轴滚动偏移
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.list = this.$utils.deepClone(this.treeList);
    if (!this.isChildren) {
      this.$nextTick(() => {
        if (this.$el.querySelectorAll('.diff-treefile') && this.$el.querySelectorAll('.diff-treefile').length) {
          this.$el.querySelectorAll('.diff-treefile').forEach(d => {
            if (d.querySelector('.sum-count')?.getBoundingClientRect().width) {
              d.querySelector('.diff-name').style = 'padding-right:' + parseInt(d.querySelector('.sum-count').getBoundingClientRect().width + 1) + 'px';
            }
          });
        }
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
    showChild(item) {
      //只有文件类型的才展开收起有效
      if (item.type == 'file') {
        item.showChild = !item.showChild;
      } else {
        this.selectFile(item);
      }
    },
    selectFile(item, isExpend) {
      //定位到选中的
      this.$emit('onSelected', item, isExpend);
    },
    onSelected(item, isExpend, li) {
      this.$emit('onSelected', item, isExpend);
    },
    selectFilename(val, item) {
      let param = {
        filepathUuid: item.value,
        name: item.text
      };
      let selectDom = this.$el.querySelector('#tree_' + item.value);
      //元素定位
      if (selectDom) {
        try {
          selectDom.scrollIntoView(true);
        } catch (e) {
          console.error(e);
        }
      }
      this.selectFile(param);
    },
    openFolder(item) {
      item.showChild = true;
      this.$emit('open-parent');
    },
    scrollContainer(e) {
      if (!this.isChildren) {
        this.scrollLeft = Math.max(e.target.scrollLeft, 0) || 0;
      }
    }
  },
  computed: {
    setLiClass() {
      return function(item) {
        let str = '';
        if (!item.showChild) {
          str += 'hideChild';
        }
        if (item.children && item.children.length > 0) {
          str += ' hasChild';
        }
        return str;
      };
    },
    setDivClass() {
      return function(li, selectedFile) {
        let str = '';
        if (li.type != 'file') {
          str += 'diff-treefile ';
          if (this.supportTypeList.includes(li.type)) {
            str += 'tsfont-mm-' + li.type;
          } else {
            str += 'tsfont-mm-txt';
          }
        } else {
          if (li.showChild) {
            str += 'ts-folder-open';
          } else {
            str += 'ts-folder';
          }
        }
        if (selectedFile && selectedFile == li.filepathUuid && li.type != 'file') {
          str += ' text-href font-bold';
        } else {
          str += ' text-action';          
        }
        return str;
      };
    },
    setDivStyle() {
      return function(li) {
        let styles = {};
        if (!li.children || !li.children.length) {
          Object.assign(styles, {
            'padding-left': '14px'
          });
        }
        return styles;
      };
    }
  },
  watch: {
    selectedFile(val) {
      if (val && this.list.length > 0) {
        let matchLi = this.list.filter(li => {
          return val == li.filepathUuid && li.type != 'file';
        });
        if (matchLi.length) {
          this.$emit('open-parent');
        }
      }
    }
  }

};

</script>
<style lang='less' scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.diff-treecontaner{
  max-height: calc(100vh - 216px);
  overflow: auto;
  .diff-treediv{
    word-break: keep-all;
    white-space: nowrap;
    text-overflow: ellipsis;
    position: relative;
    display: block;
    text-align: left;
    margin-bottom: 6px;
    .btn-toggle{
      position: absolute;
      width: 16px;
      height: 16px;
      vertical-align: top;
      text-align: center;
      top:50%;
      left: 0;
      margin-top: -8px;
      transform: scale(0.8);
      opacity: .6;
    }
    .sum-count{
      transform: scale(0.8);
      font-weight: bolder;
      display: inline-block;
      position: absolute;
      right: -3px; 
    }
  }
  .diff-treeli{
    position: relative;
    margin-bottom: 6px;
    &.hideChild{
      >.diff-treeul{
        display: none;
      }
      >.diff-treediv>.btn-toggle{
        transform: scale(0.8) rotate(180deg);
      }
    }
    &.hasChild{
      .diff-treediv{
        padding-left: 18px;
      }
    }
  }
}
.diff-treeul{
  margin-left: 16px;

}
.tree-top{
  /deep/.ivu-radio-group-button.ivu-radio-group-small .ivu-radio-wrapper{
    padding: 0 4px;
  }
}
.type-modified{
  position: absolute;
  top: 50%;
  left: 0;
  width: 10px;
  height: 10px;
  line-height: 10px;
  margin-top: -6px;
  border: 1px solid;
  border-radius: 2px;
  &.modified-A{
    color:@default-success-color;
    &:before,&:after{
      content:'';
      position: absolute;
      background: @default-success-color;;
    }
    &:before{
      width: 2px;
      height: 6px;
      left: 3px;
      top: 1px;
    }
    &:after{
      width: 6px;
      height: 2px;
      top: 3px;
      left: 1px;  
    }
  }
  &.modified-D{
    color:@default-error-color;
    &:after{
      content:'';
      position: absolute;
      background: @default-error-color;
      width: 6px;
      height: 2px;
      top: 3px;
      left: 1px;  
    }
  }
    &.modified-M{
    color:@default-warning-color;
    &:after{
      content:'';
      position: absolute;
      background: @default-warning-color;
      width: 6px;
      height: 6px;
      top: 1px;
      left: 1px;  
      border-radius: 50%;
    }
  }
  &.modified-U{
    color:@default-warning-color;
    &:after{
      content: '?';
      position: absolute;
      width: 10px;
      height: 10px;
      line-height: 10px;
      top: -1px;
      left: -1px;
      border-radius: 50%;
      text-align: center;
      font-weight: 900;
      transform: scale(0.6);
    }
  }
  &.modified-R{
    color:@default-error-color;
    &:after{
      content: 'R';
      position: absolute;
      width: 10px;
      height: 10px;
      line-height: 10px;
      top: -1px;
      left: -1px;
      border-radius: 50%;
      font-weight: 900;
      transform: scale(0.6);
    }
  }
}
</style>
