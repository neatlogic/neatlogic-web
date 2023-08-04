<template>
  <div>
    <div class="tool-container bg-three">
      <template v-for="(tool,index) in toolList">
        <!-- icon类型 -->
        <Tooltip
          v-if="tool.type=='icon'"
          :key="index"
          :content="tool.title"
          placement="bottom"
          :disabled="tool.disabled"
          theme="light"
          :transfer="true"
        >
          <span :class="[tool.icon,{'disabled':tool.disabled,'active':tool.isActive}]" class="tool tool-icon" @mousedown.prevent="handlerClick(tool)"></span>
        </Tooltip>
        
        <!-- 文案类型 -->
        <span
          v-else-if="tool.type=='title'"
          :key="index"
          :title="tool.title"
          :class="[{'disabled':tool.disabled,'active':tool.isActive}]"
          class="tool"
          @mousedown.prevent="handlerClick(tool)"
        >{{ tool.title }}</span>
        <!-- 分割线 -->
        <span
          v-else-if="tool.type=='line'"
          :key="index"
          :title="tool.title"
          class="tool tool-line"
        ></span>
      </template>
    </div>
    <div v-if="search.searchShow" class="search-div dividing-color input-border">
      <span class="text-tip" style="padding-right:16px">{{ $t('page.find') }}</span>
      <div class="findDiv">
        <input
          ref="findValue"
          v-model="search.findValue"
          class="ivu-input ivu-input-default"
          style="display: inline-block; width:240px"
          :placeholder="$t('form.placeholder.pleaseinput',{target:$t('page.findcontent')})"
          @keyup="serchKeyUp"
          @input="handlerSearch()"
        />
        <span class="clipSpan text-tip">
          <span class="tsfont-left" :disabled="!searchNum" @click="goPrev"></span> 
          <span>{{ searchNum? enterNum+'/'+searchNum :$t('term.knowledge.notresult') }}</span>
          <span class="tsfont-right" :disabled="!searchNum" @click="goNext"></span>
        </span>
      </div>
      <span class="text-tip" style="padding:0px 16px">{{ $t('page.replacewith') }}</span>
      <input
        v-model="search.replaceValue"
        class="ivu-input ivu-input-default"
        style="display: inline-block; width:150px"
        :placeholder="$t('form.placeholder.pleaseinput',{target:$t('page.replacecontent')})"
      >
      <span class="search-btn text-btn bg-grey" :disabled="!searchNum" @click="replaceFn">{{ $t('page.replace') }}</span>
      <span class="search-btn text-btn bg-grey" :disabled="!searchNum" @click="replaceFn('all')">{{ $t('page.globalReplacement') }}</span>
      <span class="ts-remove text-tip" :title="$t('term.knowledge.tooltip.search')" @mousedown="searchFn()"></span>
    </div>
    <aDialog
      :showDialog.sync="showDialog"
      :type="aTool.id"
      :innerText="innerText"
      @on-ok="okDialog"
      @on-close="closeDialog"
    ></aDialog>
  </div>
</template>
<script>
import aDialog from '../component/tooltip/a-dialog.vue';
import toolMixins from '../component/common/toolMixins.js';
import editorUtils from '@/views/pages/knowledge/edit/component/common/editor-util.js';
import {BTNCONFIG, TITLELIST, TOOLLIST} from '@/views/pages/knowledge/edit/component/common/editor-config.js';
export default {
  name: '',
  components: {aDialog},
  mixins: [toolMixins],
  props: {
    focusUuid: {
      type: [String, Number],
      default: null
    },
    toolBtnConfig: Object,
    history: Number,
    back: Number
  },
  data() {
    let _this = this;
    return {
      range: null,
      showDialog: false,
      enterNum: 0,
      searchNum: 0,
      aTool: {}, //链接出现的数据配置
      search: {//搜索替换对应的参数
        findValue: '',
        replaceValue: '',
        searchShow: false
      },
      //type icon
      toolList: _this.$utils.deepClone(TOOLLIST),
      innerText: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    
  },
  beforeUpdate() {},
  updated() {
    //this.handlerSearch();
  },
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    // clearSearch() {
    //   this.search.findValue = '';
    //   this.handlerSearch();
    // },
    handlerClick(tool) {
      // this.getContainerTag();
      let _this = this;
      if (tool && (tool.disabled)) {
        return;
      } else if (tool.id == 'h1' || tool.id == 'h2' || tool.id == 'b' || tool.id == 'i' || tool.id == 'u' || tool.id == 'innerA' || tool.id == 'outerA') {
        this.comChangeType(tool);
      } else if (tool.id == 'ul' || tool.id == 'ol') {
        let typeConfig = {ol: 'cjk-ideographic', ul: 'disc'};
        this.liFn(tool, typeConfig[tool.id]);
      } else {
        this[tool.id + 'Fn'] && this[tool.id + 'Fn'](tool);
      }
    },
    repealFn() { //撤销
      this.$parent.dealHistory('historyList');
    },
    recoverFn() { //恢复
      this.$parent.dealHistory('backList');
    },
    liFn(tool, type) { //有序列表无序列表
      if (tool && (tool.disabled)) {
        return;
      }
      let _this = this;
      let range = this.comGetCursor();
      let $target = editorUtils.comGetTargetCom();
      if (!$target) {
        return;
      }
      //当没有选中的数据，利用焦点元素
      let activeRange = {startContainer: range.startContainer, startOffset: range.startOffset, commonAncestorContainer: range.commonAncestorContainer};
      if (range.collapsed) {
        if (tool.isActive) { //激活的状态 之后变成p标签
          let $insertDom = $target;
          $target.querySelectorAll('li') && $target.querySelectorAll('li').forEach(item => {
            let newNode = editorUtils.createDom({uuid: _this.$utils.setUuid(), handler: 'p', content: ''}, item);
            editorUtils.insertAfter($insertDom, newNode);
            $insertDom = newNode;
          });
          $target.remove();
        } else { //其他标签变成指定列表类型
          let handler = tool.id.toUpperCase();
          let config = { handler: handler, uuid: _this.$utils.setUuid(), content: '' };
          let newNode = editorUtils.createDom(config);
          editorUtils.comInsertAfter($target, newNode);
          if ($target.nodeName == 'OL' || $target.nodeName == 'UL') {
            for (let i = 0; $target.children.length > 0;) {
              newNode.appendChild($target.children[i]);
            }
          } else if ($target.nodeName == 'P') {
            let $li = document.createElement('li');
            newNode.appendChild($li);
            for (let i = 0; $target.childNodes.length > 0;) {
              $li.appendChild($target.childNodes[i]);
            }
          }
          $target.remove();
        }
        editorUtils.comSetfocusByRange(activeRange); 
        return;
      }
     
      //当有选中的数据
      let $parent = [];
      if (tool.isActive) { //激活状态
        let $liList = range.cloneContents().querySelectorAll('li');
        if ($liList.length == 0) {
          let $li = editorUtils.comGetTargetCom(range.startContainer, 'li');
          $li && ($liList = [$li]);
        }
        (range.commonAncestorContainer.nodeName.toLowerCase() == tool.id) && $parent.push(range.commonAncestorContainer);
        $liList && $liList.forEach(item => {
          let dom = item.parentNode;
          $parent.indexOf(dom) < 0 && dom.nodeName.toLowerCase() == tool.id && $parent.push(dom);
        });
        $parent = $parent.map(item => { //cloneContents()的元素不存在页面上 需要额外塞值
          return document.querySelector(`#rightSider [data_id="${item.getAttribute('data_id')}"]`) || null;
        });
        $parent.forEach(dom => {
          let $insertDom = dom;
          dom.querySelectorAll('li').forEach(cc => {
            let newNode = editorUtils.createDom({uuid: _this.$utils.setUuid(), handler: 'p', content: ''}, cc);
            editorUtils.comInsertAfter($insertDom, newNode);
            $insertDom = newNode;
          });
          dom.remove();
        });
      } else { //没有激活状态
        let $liList = range.cloneContents().querySelectorAll('li');
        if ($liList.length == 0) {
          let $li = editorUtils.comGetTargetCom(range.startContainer, 'li');
          $li && ($liList = [$li]);
        }
        if ($liList && $liList.length > 0) { //存在li 需要变成不同的ul
          let ultype = tool.id == 'ol' ? 'ul' : 'ol';
          (range.commonAncestorContainer.nodeName.toLowerCase() == ultype) && $parent.push(range.commonAncestorContainer);
          $liList && $liList.forEach(item => {
            let dom = item.parentNode;
            $parent.indexOf(dom) < 0 && dom.nodeName.toLowerCase() == ultype && $parent.push(dom);
          });
          $parent = $parent.map(item => { //cloneContents()的元素不存在页面上 需要额外塞值
            return document.querySelector(`#rightSider [data_id="${item.getAttribute('data_id')}"]`) || null;
          });
          $parent.forEach(dom => {
            let newNode = editorUtils.createDom({handler: tool.id, uuid: _this.$utils.setUuid(), content: ''}, dom);
            editorUtils.comInsertAfter(dom, newNode);
            dom.remove();
          });
          editorUtils.comSetfocusByRange(activeRange); 
        } else { //不存在 直接变成ul
          let $p = Array.from(range.cloneContents().querySelectorAll('p') || []);
          let lihtml = '';
          $p = $p.map(item => { //cloneContents()的元素不存在页面上 需要额外塞值
            return document.querySelector(`#rightSider [data_id="${item.getAttribute('data_id')}"]`) || null;
          });
          if (range.startContainer.nodeType == 3) {
            $p[0] = _this.getTarget(range.startContainer);
          }
          if (range.endContainer.nodeType == 3) {
            $p[$p.length - 1] = _this.getTarget(range.endContainer);
          }

          if (range.startContainer == range.endContainer && $p.length == 0) {
            $p[0] = _this.getTarget(range.startContainer);
          }
          $p.forEach(item => {
            item && (lihtml = lihtml + '<li>' + item.innerHTML + '</li>');
          });
          let newNode = editorUtils.createDom({handler: tool.id, uuid: _this.$utils.setUuid(), content: lihtml});
          editorUtils.comInsertAfter($target, newNode);
          $p.forEach(item => {
            item.remove();
          });
        }
      }
      this.$fn.setHistory();
    },
    fileFn() { //添加附件
      this.$parent.uploadFile();
    },
    tagFn() { //添加标题
      this.$parent.showTag();
    },
    changeToolState() { //改变工具栏的按钮的状态
      let $target = document.querySelector(`#rightSider [data_id="${this.focusUuid}"]`);
      let _this = this;
      if ($target) {
        let type = $target.nodeName.toLowerCase();
        this.toolList.forEach((ele, g) => {
          if (BTNCONFIG[type]) {
            BTNCONFIG[type].disabled.indexOf(ele.id) >= 0 ? ele.disabled = true : ele.disabled = false;
            BTNCONFIG[type].active.indexOf(ele.id) >= 0 ? ele.isActive = true : ele.isActive = false;
            _this.toolBtnConfig.toolActiveList.indexOf(ele.id) >= 0 && (ele.isActive = true);
            _this.toolBtnConfig.toolAccessList.indexOf(ele.id) < 0 || ele.disabled == true ? ele.disabled = true : ele.disabled == false;
          }
          if (ele.id == 'repeal') {
            this.history > 1 ? ele.disabled = false : ele.disabled = true;
          }
          if (ele.id == 'recover') {
            this.back > 0 ? ele.disabled = false : ele.disabled = true;
          }
        });
        this.history >= 0; 
        this.back >= 0;
        //内标签和外标签的特殊处理;
        if (_this.toolBtnConfig.toolActiveList.indexOf('innerA') >= 0) {
          this.toolList.find(item => {
            if (item.id == 'outerA' && !item.isActive) {
              item.disabled = true;
            }
          });
        } else if (_this.toolBtnConfig.toolActiveList.indexOf('outerA') >= 0) {
          this.toolList.find(item => {
            if (item.id == 'innerA' && !item.isActive) {
              item.disabled = true;
            }
          });
        }
      } else { //全部不可以编辑
        let list = ['repeal', 'recover', 'b', 'i', 'u', 'h1', 'h2', 'ol', 'ul', 'innerA', 'outerA'];
        this.toolList.forEach(ele => {
          list.indexOf(ele.id) >= 0 ? ele.disabled = true : ele.disabled = false;
          ele.isActive = false;
        });
      }
    },
    searchFn(tool) { //搜索按钮
      if (tool && (tool.disabled)) {
        return;
      } 
      this.search.findValue = '';
      this.search.replaceValue = '';
      this.enterNum = 0;
      this.searchNum = 0;
      this.search.searchShow = !this.search.searchShow;
      document.querySelector('.scrollContian').style.height = this.search.searchShow ? 'calc(100% - 40px - 53px)' : 'calc(100% - 40px)';
      !this.search.searchShow && this.removeMark();
      this.$nextTick(function() {
        this.search.searchShow && this.$refs.findValue.focus();
      });
    },
    handlerSearch(time, enterNum) { //搜索条用方法  time代表从外部调用搜索方法的间隔时间，同时不需要滚动到指定位置
      let _this = this; 
      this.searchTimeout && clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        _this.searchNum = 0;
        _this.enterNum = enterNum || 0;
        //当没有选中的数据，利用焦点元素
        let value = _this.search.findValue.trim();
        let $target = document.getElementById('rightSider');
        if (value) {
          this.removeMark();
          if ($target.innerText.indexOf(value) >= 0) {
            let $focusTarget = editorUtils.comGetTargetCom();
            $target.children.forEach(child => {
              let typeList = ['code', 'table', 'img'];
              if (typeList.indexOf(child.getAttribute('type')) >= 0) {
                return;
              }
              if (child.innerText.indexOf(value) >= 0) {
                if ($focusTarget == child) { //焦点元素处理特殊处理，在焦点那里塞一个标识
                  let range = editorUtils.comGetCursor();
                  let $signRange = document.createElement('sign');
                  $signRange.setAttribute('class', 'signRange');
                  range.insertNode($signRange);
                } 
                let regtext = '';
                for (let i of value) {
                  regtext = regtext + (regtext ? '(<[^\<>(' + value + ')]*>)*' + i : '(?<!<[^>]*)' + i);
                }
                let rre = new RegExp(regtext, 'g');
                let config = {
                  '&nbsp;': ' ',
                  '&amp;': '&', 
                  '&gt;': '>', 
                  '&lt;': '<'
                };
                let str = child.innerHTML;
                for (let key in config) {
                  str = str.replace(new RegExp(key, 'g'), config[key]);
                }
                child.innerHTML = str.replace(rre, function(m, i) {
                  let str = '';
                  if (m == value) {
                    str = `<mark data_num="${_this.searchNum}">${m}</mark>`;
                  } else {
                    str = m.replace(/([^<>]+)(<[\s\S]*?>)*/g, `<mark class="part" data_num="${_this.searchNum}">$1</mark>$2`);
                  }
                  _this.searchNum++;
                  return str;
                });
                if ($focusTarget == child) { //焦点元素处理，，在焦点那里获取焦点
                  let $signRange = child.querySelector('.signRange');
                  editorUtils.comAppendSelfFocus($signRange);
                } 
              }
            });
            _this.gotoSearchItem(time);
          }
        } else {
          this.removeMark();
        }
        _this.searchTimeout = null;
      }, time || 250);
    },
    removeMark() { //移除高亮元素
      let $focusTarget = editorUtils.comGetTargetCom();
      let $target = document.getElementById('rightSider');
      if ($target.querySelector('mark')) {
        // let range = this.comGetCursor();
        // //当没有选中的数据，利用焦点元素
        let range = editorUtils.comGetCursor();
        let activeRange = {startContainer: range.startContainer, startOffset: range.startOffset, commonAncestorContainer: range.commonAncestorContainer};
        $target.children.forEach(child => {
          let $mark = child.querySelectorAll('mark');
          if ($mark && $mark.length > 0) {
            if ($focusTarget == child) {
              $mark.forEach($el => {
                let $parent = $el.parentNode;
                let childrenList = $parent.childNodes;
                let $clone = $parent.cloneNode();
                $clone.innerHTML = '';
                editorUtils.insertAfter(child, $clone);
                for (let c = 0; c < childrenList.length;) {
                  let item = childrenList[c];
                  if (item.nodeName.toLowerCase() == 'mark') {
                    for (let inner = 0; inner < item.childNodes.length;) {
                      $clone.appendChild(item.childNodes[inner]);
                    }
                    c++;
                  } else {
                    $clone.appendChild(item);
                  }
                }
                $parent.remove();
              }); 
              editorUtils.comSetfocusByRange(activeRange);
            } else {
              child.innerHTML = child.innerHTML.replace(/<mark[\s\S]*?>([\s\S]*?)<\/mark>/g, '$1');
            }
          }
        });
        // editorUtils.comSetfocusByRange(activeRange); 
      }
    },
    serchKeyUp(e, isClick) { //寻找高亮的元素
      if (e.keyCode == '13') {
        this.gotoSearchItem();
      }
    },
    gotoSearchItem(time) { //time代表是通过输入产生的搜索，这个时候不需要滚动
      let $target = document.getElementById('rightSider');
      $target.querySelectorAll('mark.selected').forEach(item => {
        this.$utils.toggleClass(item, 'selected', 'remove');
      });
       
      if ($target.querySelector('mark')) {
        this.enterNum >= this.searchNum && (this.enterNum = 0);
        this.enterNum < 0 && (this.enterNum = this.searchNum - 1);
        let $markList = $target.querySelectorAll('mark[data_num="' + this.enterNum + '"]');
        $markList.forEach(item => {
          this.$utils.toggleClass(item, 'selected', 'add');
        });
        ++this.enterNum;
        if (!time && $markList[0]) { //如果搜索的元素超出了显示区域，需要进行滚动
          let $scroll = document.querySelector('.scrollContian');
          $scroll.clientHeight - 30 < ($markList[0].offsetTop - $scroll.scrollTop) ? $scroll.scrollTop = $markList[0].offsetTop - ($scroll.clientHeight / 2) 
            : $markList[0].offsetTop <= $scroll.scrollTop ? $scroll.scrollTop = $markList[0].offsetTop - ($scroll.clientHeight / 2) : '';
        }
      }
    },
    hasAhref($mark) {
      let hasA = false;
      if ($mark.querySelector('a')) {
        hasA = true;
      } else {
        hasA = !!editorUtils.comGetTargetCom($mark, ['a']);
      }
      return hasA;
    },
    replaceFn(type) { //替换方法
      let _this = this;
      let excludeTag = ['IMG', 'TABLE', 'SECTION'];
      let $target = document.getElementById('rightSider');
      if (!this.searchNum) {
        return;
      }
      let containLength = _this.search.replaceValue.match(new RegExp(_this.search.findValue, 'g'));//替换字段里面是否包含搜索字段，如果有替换之后，enterNum 需要加上对应的长度
      containLength = containLength ? containLength.length : 0;
      if (type == 'all') {
        if ($target.querySelector('mark')) {
          let includeANum = '';
          this.$utils.toggleClass($target.querySelector('mark.selected'), 'selected', 'remove');
          $target.querySelectorAll('mark').forEach(child => { //标记是否可以替换元素
            if (this.hasAhref(child)) {
              includeANum++;
              return;
            }
            child.setAttribute('can_replace', true);//标志是否可以替换，在下面的替换的时候起作用
            if (child.className.includes('part')) { //有分开的情况，去掉其他的情况
              let num = child.getAttribute('data_num');
              let $elList = $target.querySelectorAll('mark.part[data_num="' + num + '"]');
              $elList.forEach((item, i) => {
                if (i !== 0) {
                  item.parentNode.removeChild(item);
                }
              });
            }
          }); 
          $target.querySelectorAll('mark').forEach(child => { //替换元素
            child.parentNode && (child.parentNode.innerHTML = child.parentNode.innerHTML.replace(/<mark[^>]*can_replace[^>]*>([\s\S]*?)<\/mark>/g, _this.search.replaceValue));
          }); 
          if (includeANum) {
            this.$Message.warning(this.$i18n.tc('knowledge.tooltip.replace1', this.searchNum - includeANum));
          } else {
            this.$Message.info(this.$i18n.tc('knowledge.tooltip.replace2', this.searchNum));
          }
          this.$fn.updataMenuList();
          this.$fn.setHistory();
          this.enterNum = 0;
        }
      } else {
        let $replace = $target.querySelector('mark.selected') || $target.querySelector('mark');
        if (this.hasAhref($replace)) {
          this.$Message.warning(this.$t('term.knowledge.tooltip.replace'));
          return;
        }
        if ($replace) {
          if (this.hasAhref($replace)) {
            this.$Message.warning(this.$t('term.knowledge.tooltip.replace'));
            return;
          }
          if ($replace.className.includes('part')) { //有分开的情况，去掉其他的情况
            let num = $replace.getAttribute('data_num');
            let $elList = $target.querySelectorAll('mark.part[data_num="' + num + '"]');
            $elList.forEach((item, i) => {
              if (i !== 0) {
                item.parentNode.removeChild(item);
              }
            });
          }
          this.$utils.toggleClass($replace, 'selected', 'add');
          $replace.parentNode.innerHTML = $replace.parentNode.innerHTML.replace(/<mark[^>]*class="[^>]*selected[^>]*"[^>]*>([\s\S]*?)<\/mark>/g, this.search.replaceValue);
          
          let $com = editorUtils.comGetTargetCom($replace);
          if ($com && TITLELIST.indexOf($com.nodeName.toLowerCase()) >= 0) {
            this.$fn.updataMenuList();
          }
          this.$fn.setHistory();
          this.enterNum = this.enterNum + containLength - 1;
        }
      }
      this.handlerSearch(null, this.enterNum);
    },
    goPrev() {
      this.enterNum = this.enterNum - 2;
      this.gotoSearchItem();
    },
    goNext() {
      this.gotoSearchItem();
    }
  },
  filter: {},
  computed: {
    
  },
  watch: {
    // focusUuid: {
    //   handler(val) {
    //     // this.changeToolState();
    //     // console.log('toolBtnConfig1');
    //   },
    //   immediate: true
    // },
    toolBtnConfig: {
      handler(val) {
        this.changeToolState();
      },
      immediate: true,
      deep: true
    },
    history(val) {
      this.toolList.forEach((ele, g) => {
        if (ele.id == 'repeal') {
          this.history > 1 ? ele.disabled = false : ele.disabled = true;
        }
        if (ele.id == 'recover') {
          this.back > 0 ? ele.disabled = false : ele.disabled = true;
        }
      });
    },
    back(val) {
      let _this = this;
      this.toolList.forEach((ele, g) => {
        if (ele.id == 'repeal') {
          this.history > 1 ? ele.disabled = false : ele.disabled = true;
        }
        if (ele.id == 'recover') {
          this.back > 0 ? ele.disabled = false : ele.disabled = true;
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.tool-container{
  height: 40px;
  .tool{
    display: inline-block;
    cursor: pointer;
    line-height: 2.5;
    padding: 0px 4px;
    margin: 0px 4px;
    &.tool-icon{
      font-size:16px;
    }
    &.tool-line{
      position: relative;
      height: 40px;
      &::before{
        content: '';
        position: absolute;
        top: 10px;
        bottom: 10px;
        right: 0;
        width: 1px;
        opacity: 0.8;
      }
    }
    &.disabled{
       opacity: 0.5;
       cursor: not-allowed;
    }
  }
}
.search-div{
  border-bottom: 1px solid;
  padding: 10px 30px;
  .findDiv{
    display: inline;
    position: relative;
    .clipSpan{
      position: absolute;
      right: 0px;
      Z-INDEX: 1;
      top: -5px;
      line-height: 26px;
      >i{
        padding:3px;
        opacity: 0.6;
        cursor: pointer;
        &:not([disabled]):hover{
          opacity: 1;
        }
      }
      >span{
        opacity: 0.6;
      }
    }
  }
  .search-btn{
    display: inline-block;
    line-height: 2.2;
    padding: 0px 8px;
    margin-left: 10px;
    cursor: pointer;
    border-radius: 3px;
    &[disabled]{
       cursor: not-allowed;
    }
  }
  .tsfont-close{
    float: right;
    line-height: 32px;
    font-size: 12px;
    padding:0px 3px;
    cursor: pointer;
  }
}
</style>
