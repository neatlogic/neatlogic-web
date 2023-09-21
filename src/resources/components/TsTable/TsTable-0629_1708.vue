<template>
  <div v-if="!loading" class="radius-md bg-op">
    <div class="tstable-container" :class="setTableClass">
      <!-- 用于做固定的表头_start -->
      <div ref="toptable" :style="setTop(scrollbarWidth,scrollLeft)" class="bg-table">
        <table class="table-top tstable-body" :style="setLayout" :class="{'fixtop':scrollTop&& scrollTop>0}">
          <ColGroup :list="getColWidth(columnList,thList,tbodyWidthList)"></ColGroup>
          <THead
            :columnList="columnList"
            :list="getshowList(thList)"
            :keyName="keyName"
            :sortList="sortList"
            :tbodyList="tbodyList"
            :selectList="selectList"
            :sortSetting="sortSetting"
            :scrollLeft="scrollLeft"
            :sortConfig="sortConfig"
            :canResize="canResize"
            :canDrag="canDrag"
            :multiple="isMultiple"
            @selectAll="selectAll"
            @switchStatus="switchStatus"
          ></THead>
          <TBody
            v-if="getshowList(thList).length > 0 && tbodyList.length > 0"
            :tbodyList="tbodyList"
            :columnList="columnList"
            :colsList="getColWidth(columnList,thList,tbodyWidthList)"
            :theadList="getshowList(thList)"
            :selectList="selectList"
            :canDrag="canDrag"
            :canSelectRow="canSelectRow"
            :hideAction="hideAction"
            :keyName="keyName"
            :classKey="classKey"
            :scrollLeft="scrollLeft"
            :canExpand="canExpand"
            :offsetWidth="offsetWidth"
            :multiple="isMultiple"
            @updateRowSort="updateRowSort"
            @clickTr="clickTr"
            @setWidth="setWidth"
            @selectOne="selectOne"
            @getTbodyWidth="getTbodyWidth"
            @updateTbodyList="updateTbodyList"
          >
            <template v-for="hitem in getshowList(thList)" :slot="hitem.key" slot-scope="{ row }">
              <slot :name="hitem.key" :row="row"></slot>
            </template>
            <template v-if="canExpand" slot="folder" slot-scope="{ row }">
              <slot name="folder" :row="row"></slot>
            </template>
          </TBody>
          <tbody v-else>
            <tr>
              <td :colspan="getshowList(thList).length || 0" class="text-center">
                <slot name="noDataTip"><div class="text-tip">{{ noDataText }}</div></slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 用于做固定的表头_end -->
      <div
        ref="tablemain"
        v-scrollHidden
        class="tstable-main bg-op"
        :class="{'table-radius-main':(!rowNum || !pageSize || !showPager )}"
        :style="setTableheight(tableheight)"
        @scroll.stop="scrollTable($event)"
        @mouseenter.stop="caculateWidth"
        @mousewheel.stop
      >
        <table ref="tstable" class="table-main tstable-body" :style="setLayout">
          <ColGroup :list="getColWidth(columnList,thList,tbodyWidthList)"></ColGroup>
          <THead
            :columnList="columnList"
            :list="getshowList(thList)"
            :keyName="keyName"
            :sortList="sortList"
            :tbodyList="tbodyList"
            :selectList="selectList"
            :sortSetting="sortSetting"
            :scrollLeft="scrollLeft"
            :sortConfig="sortConfig"
            :canResize="canResize"
            :canDrag="canDrag"
            :multiple="isMultiple"
            isMain
            @selectAll="selectAll"
            @switchStatus="switchStatus"
          ></THead>
          <TBody
            v-if="getshowList(thList).length > 0 && tbodyList.length > 0"
            :columnList="columnList"
            :colsList="getColWidth(columnList,thList,tbodyWidthList)"
            :tbodyList="tbodyList"
            :theadList="getshowList(thList)"
            :selectList="selectList"
            :canDrag="canDrag"
            :canSelectRow="canSelectRow"
            :hideAction="hideAction"
            :keyName="keyName"
            :classKey="classKey"
            :multiple="isMultiple"
            :scrollLeft="scrollLeft"
            :offsetWidth="offsetWidth"
            isMain
            :canExpand="canExpand"
            @updateRowSort="updateRowSort"
            @clickTr="clickTr"
            @setWidth="setWidth"
            @selectOne="selectOne"
            @getTbodyWidth="getTbodyWidth"
            @updateTbodyList="updateTbodyList"
          >
            <template v-for="hitem in getshowList(thList)" :slot="hitem.key" slot-scope="{ row }">
              <slot :name="hitem.key" :row="row"></slot>
            </template>
            <template v-if="canExpand" slot="expand" slot-scope="{ row }">
              <slot name="expand" :row="row"></slot>
            </template>
          </TBody>
          <tbody v-else>
            <tr>
              <td :colspan="getshowList(thList).length || 0" class="text-center">
                <slot name="noDataTip"><div class="text-tip">{{ noDataText }}</div></slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Poptip
        v-if="canEdit"
        placement="bottom-end"
        width="200"
        transfer
        class="btn-setting"
        popper-class="sort-drop"
        @on-popper-show="toggleDrop(true)"
        @on-popper-hide="toggleDrop(false)"
      >
        <div v-if="isshowdrop" class="tsfont-close icon-setting"></div>
        <div v-else class="tsfont-list icon-setting"></div>
        <div slot="content">
          <div class="sort-container">
            <div class="sort-thead">
              <div class="sort-handle">{{ $t('page.order') }}</div>
              <div class="sort-name">{{ $t('page.fieldname') }}</div>
              <div class="sort-show">{{ $t('page.display') }}</div>
            </div>
            <draggable
              v-model="thList"
              tag="ul"
              class="sort-group"
              handle=".sort-handle"
              scroll
              :delay="0"
              @update="updateColSort"
            >
              <li v-for="li in thList.filter(d => d.key != 'action')" :key="li.key" :class="['sort-item', {disabled: li.key == 'selection' || li.disabled}]">
                <i class="tsfont-bar sort-handle"></i>
                <span class="text">{{ li.title ? li.title : '_' }}</span>
                <div class="sort-show">
                  <Checkbox
                    v-model="li.isShow"
                    :true-value="1"
                    :false-value="0"
                    @on-change="checkshow(li.key, li.isShow)"
                  ></Checkbox>
                </div>
              </li>
            </draggable>
          </div>
        </div>
      </Poptip>
    </div>
    <div v-if="rowNum > 0 && pageSize > 0 && (!pageType ||pageType!='carousel') && showPager" ref="tablepage" class="tstable-page text-right">
      <Page
        size="small"
        :showSizer="showSizer"
        :showTotal="showTotal"
        :total="rowNum"
        :current="currentPage"
        :page-size="pageSize"
        :page-size-opts="pageSizeOpts"
        :transfer="true"
        @on-change="getPage"
        @on-page-size-change="getPageSize"
      />
    </div>
    <div v-else-if="pageSize > 0 && pageType=='carousel'" ref="tablepage" class="tstable-page text-center">
      <Button :disabled="current==1" @click.native="getCarouselPage('prev')">{{ $t('page.previouspage') }}</Button>
      <Button class="ml-md" @click.native="getCarouselPage('next')">{{ $t('page.nextpage') }}</Button>
    </div>
  </div>
  <Loading v-else loadingShow></Loading>
</template>
<script>
import scrollHidden from '@/resources/directives/scroll-hidden.js';
import draggable from 'vuedraggable';
import THead from './component/table-thead.vue';
import TBody from './component/table-tbody.vue';
import ColGroup from './component/col-group.vue';

export default {
  name: 'TsTable',
  components: {
    draggable,
    THead,
    TBody,
    ColGroup
  },
  directives: {scrollHidden},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    rowNum: { type: Number }, //总个数
    currentPage: { type: Number }, //当前第几页
    pageSize: {
      type: Number,
      default: 20
    }, //每一页多少
    pageSizeOpts: {
      //每页条数切换的配置
      type: Array,
      default: () => [10, 20, 30, 40]
    },
    canEdit: {
      //是否可编辑
      type: Boolean,
      default: false
    },
    canDrag: {
      //是否可拖拽排序
      type: Boolean,
      default: false
    },
    canResize: {
      //是否可拖拽改变宽度
      type: Boolean,
      default: false
    },
    theadList: { type: Array }, //表头数据
    tbodyList: {
      type: Array,
      default: function() {
        return [];
      }
    }, //正文数据
    columnList: { type: Array }, //纵列表头数据
    storage: {
      //是否需要存本地
      type: [Boolean, String],
      default: false
    },
    size: {
      type: String,
      default: 'normal'
    },
    border: {
      type: [Boolean, String],
      default: true
    },
    height: {
      type: [Boolean, String],
      default: false
    },
    hideAction: {
      //是否可以收起浮动操作栏
      type: Boolean,
      default: true
    },
    selectedRemain: {
      //是否分页保留每一页选中状态,默认不需要，如果为true，需要传keyName回显唯一标志
      type: Boolean,
      default: false
    },
    keyName: {
      //每一行的唯一标志（分页保留需要，不然回显没标志判断）
      type: String
    },
    classKey: {
      // 给每个<tr>标签设置值为row[classKey]的class，其中row为tbodyList数组的元素
      type: [String, Array]
    },
    disabledHover: {
      //是否需要禁用移上高亮效果
      type: Boolean,
      default: false
    },
    type: {
      //样式类型,默认没有，目前只有card,跟styleType的区别是type针对排版块状还是列表，styleType针对普通的table常用的样式比如线条还是斑马支持多个字符串
      type: [Boolean, String],
      default: false    
    },
    noDataText: {
      type: String,
      default() {
        return this.$t('page.nodata');
      } 
    },
    showTotal: {
      //是否显示总条数
      type: Boolean,
      default: true   
    },
    showSizer: {
      //是否显示分页页数下拉
      type: Boolean,
      default: true   
    },
    showPager: {
      //是否显示分页器
      type: Boolean,
      default: true   
    },
    sortList: {
      //支持排序的表头,默认无，如有需传递一个['a','b'],或者[{a:'ASC'},{b:'DESC'}]
      type: [Boolean, Array],
      default: false        
    },
    sortMapping: {
      //排序对应的映射，支持值修改但是数据必须是
      //{
      //   up: 'ASC',
      //   down: 'DESC',
      //   none: ''
      // }
      type: Object,
      default: function() {
        return {
          down: 'ASC',
          up: 'DESC',
          none: ''          
        };
      } 
    },
    sortMulti: {
      type: Boolean,
      default: true     
    },
    sortOrder: {
      type: [Array, Object],
      default: function() {
        return {};
      } 
    },
    value: {
      // 如果有选中的记录选中列（只会存标志位的list）
      type: Array      
    },
    styleType: {//table样式类型,支持多个类型空格隔开的字符串。跟type的区别是type针对排版块状还是列表，styleType针对普通的table常用的样式比如线条还是斑马支持多个字符串  [border,stripe]
      type: String,
      default: 'border'        
    },
    loading: {
      type: Boolean,
      default: false        
    },
    canSelectRow: {//当支持选中时是否触发整行点击选中，默认否（当仅当整行无其他整行点击事件时可以设置为true不然事件会多次触发）
      type: Boolean,
      default: true  
    },
    canExpand: {//是否有展开行查看更多的功能
      type: Boolean,
      default: false  
    },
    multiple: {//是否支持选中多行
      type: Boolean,
      default: false        
    },
    disabled: {
      //true  false  默认为false
      type: Boolean,
      default: false
    },
    pageType: {
      //['pagination','carousel']pagination:页码形式，carousel：类似走马灯的上下翻页形式
      type: String,
      default: 'pagination' 
    }

  },
  data() {
    let _this = this;
    return {
      current: 1,
      thList: [],
      tableheight: '1000px',
      scrollTop: 0,
      scrollLeft: 0,
      isshowdrop: false, //设置表单格是否打开
      offsetWidth: 0,
      topleft: null,
      selectList: [], //选中列表数据(只有keyName)
      selectallConfig: [], //选中列表数据(每一行完整的数据)
      sortConfig: {}, //表头排序用
      sortSetting: {
        up: 'ASC',
        down: 'DESC',
        none: ''
      }, //排序对应的字段
      sorttypeList: ['up', 'down', 'none'], //排序数组
      scrollbarWidth: 0, //滚动条的宽度，当tbody有高度时thead的宽度比tbody多了一个滚动条宽度，需减去
      tbodyWidthList: [],
      tableWidth: '100%',
      isMultiple: false,
      isRendered: true//表格渲染需要时间导致第一次取值有问题，这里标记是否需要从新计算offsetWidth的值
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let _this = this;
    if (this.value && this.value.length && this.keyName) {
      //初始化的时候如果有选中的，需要回调一次选中数据的方法getSelected
      let selectedList = [];
      _this.value.forEach(v => {
        let selectItem = _this.tbodyList.find(t => {
          return t[_this.keyName] == v;
        });
        selectItem && selectedList.push(selectItem);
      });
      this.selectallConfig = selectedList;
      this.$emit('getSelected', this.value, selectedList);
    }
    this.$nextTick(() => {
      if (this.height) {
        this.tableheight = this.height;
        this.setWidth();
      } else {
        _this.initTable();
        window.addEventListener('resize', _this.initTable);
      }
    });
  },
  beforeDestroy() {
    let _this = this;
    if (!_this.height) {
      window.removeEventListener('resize', _this.initTable);
    }
  },
  methods: {
    getPage(page) {
      this.current = page;
      this.$emit('changeCurrent', this.current);
    },
    getCarouselPage(type) {
      if (type == 'prev') {
        this.current = Math.max(1, parseInt(this.currentPage) - 1);
      } else {
        this.current = Math.max(1, parseInt(this.currentPage) + 1);
      }
      this.$emit('changeCurrent', this.current);
    },
    getPageSize(size) {
      this.$emit('changePageSize', size);
    },
    checkshow(key, val) {
      this.thList.forEach(th => {
        if (th.key == key) {
          this.$set(th, 'isShow', val);
        }
      });
    },
    initTable() {
      let tableheight = window.innerHeight - (this.$refs.tablemain ? this.$refs.tablemain.getBoundingClientRect().top : 0);
      if (this.$refs.tablepage) {
        tableheight = tableheight - this.$refs.tablepage.clientHeight;
      }
      this.$set(this, 'tableheight', Math.max(tableheight - 20, 40) + 'px');
      this.setWidth();
    },
    scrollTable: function(e) {
      let sTop = e.srcElement.scrollTop;
      let sLeft = e.srcElement.scrollLeft;
      this.scrollTop = sTop;
      this.scrollLeft = sLeft;
    },
    selectOne: function(item, index) {
      if (this.disabled) {
        return;
      }
      if (!item.isDisabled) {
        let currenVal = this.keyName ? item[this.keyName] : index;
        let isSelected = this.checkIsselected(item, index);
        if (isSelected) {
          //原来选中，取消选中
          this.selectallConfig.splice(this.selectList.indexOf(currenVal), 1);
          this.selectList.splice(this.selectList.indexOf(currenVal), 1);
          this.$emit('cancelSelected', item);
        } else {
          //原来没选中
          if (this.isMultiple) {
            //多选直接选中
            this.selectList.push(currenVal);
            this.selectallConfig.push(item);
            this.$emit('selectedItem', item);
          } else {
            //单选的话直接替换掉当前选中
            this.selectList = [currenVal];
            this.selectallConfig = [item];
            this.$emit('selectedItem', item);
          }
        }
        this.$forceUpdate();
        this.getSelectlist();
      }
    },
    selectAll() {
      let _this = this;
      if (this.disabled) {
        return;
      }
      if (this.tbodyList && this.tbodyList.length > 0) {
        let isSelecedall = true;
        this.tbodyList.forEach((d, dindex) => {
          if (!_this.checkIsselected(d, dindex) && !d.isDisabled) {
            isSelecedall = false;
          }
        });
        if (isSelecedall) {
          //取消全选
          this.tbodyList.forEach((d, dindex) => {
            if (!d.isDisabled) {
              _this.$nextTick(() => {
                if (_this.selectList.indexOf(d[_this.keyName] || dindex) > -1) {
                  _this.selectallConfig.splice(_this.selectList.indexOf(d[_this.keyName] || dindex), 1);
                  _this.selectList.splice(_this.selectList.indexOf(d[_this.keyName] || dindex), 1);
                }
              });
            }
          });
        } else {
          //全选
          this.tbodyList.forEach((d, dindex) => {
            if (!d.isDisabled) {
              _this.$nextTick(() => {
                if (_this.selectList.indexOf(d[_this.keyName] || dindex) < 0) {
                  _this.selectList.push(d[_this.keyName] || dindex);
                  _this.selectallConfig.push(d);
                }
              });
            }
          });
        }
      }
      this.$nextTick(() => {
        this.getSelectlist();
      });
    },
    getSelectlist() {
      //统一出口获取选中列表
      let _this = this;
      this.$emit('change', this.selectList);
      this.$emit('getSelected', this.selectList, this.selectallConfig);
      this.tbodyList && this.tbodyList.length && this.tbodyList.forEach((t, tindex) => {
        let isSelected = this.selectList.length ? this.selectList.find(s => { return s == (_this.keyName ? t[_this.keyName] : tindex); }) : false;
        this.$set(t, '_selected', !!isSelected);
      });
    },
    checkIsselected(item, index) {
      //检查当前项是否选中,返回：false，true
      let isSelected = false;
      let key = this.keyName || index;
      if (item && (key || typeof key == 'number')) {
        if (this.selectList.length > 0) {
          let itemval = item[this.keyName] || index;
          if (this.selectList.indexOf(itemval) > -1) {
            isSelected = true;
          }
        }
      }
      return isSelected;
    },
    toggleDrop(status) {
      if (status) {
        this.isshowdrop = true;
      } else {
        this.isshowdrop = false;
        this.$emit('changeHeader', this.thList);
      }
    },
    clickTr(item, index) {
      this.$emit('clickTr', item, index);
    },
    setWidth() {
      if (this.$refs.tstable) {
        this.offsetWidth = Math.max(0, this.$refs.tstable.getBoundingClientRect().width - this.$el.getBoundingClientRect().width);
      }
    },
    setTopleft() {
    },
    switchStatus(item) {
      this.setStatusclass(item.key);
      this.$nextTick(() => {
        this.$emit('updateSort', this.sortConfig);
      });
    },
    setStatusclass(keyname) {
      //更新排序状态
      let _this = this;
      if (this.sortConfig && Object.keys(this.sortConfig).length > 0) {
        //获取当前key对应的值
        let keyval = '';
        let isExsit = false;
        Object.entries(this.sortConfig).forEach(([key, val]) => {
          if (key == keyname) {
            keyval = val;
            isExsit = true;
          }
        });
        //值对应的映射
        let classkey = '';
        for (let i in this.sortSetting) {
          if (keyval === this.sortSetting[i]) {
            classkey = i;
          }
        }
        let newval = this.sorttypeList[this.sorttypeList.indexOf(classkey) == this.sorttypeList.length - 1 ? 0 : Math.floor(this.sorttypeList.indexOf(classkey)) + 1];
        let newobj = {};
        newobj[keyname] = this.sortSetting[newval];
        if (!this.sortMulti) {
          this.sortConfig = newobj;
        } else {
          if (isExsit && keyval) {
            Object.assign(this.sortConfig, newobj);
          } else if (isExsit && !keyval) {
            delete this.sortConfig[keyname];
          } else {
            Object.assign(this.sortConfig, newobj);
          }
        }
      } else {
        let obj = {};
        //值对应的映射
        let classkey = '';
        for (let i in this.sortSetting) {
          if (!this.sortSetting[i]) {
            classkey = i;
          }
        }
        let newval = this.sorttypeList[this.sorttypeList.indexOf(classkey) == this.sorttypeList.length - 1 ? 0 : Math.floor(this.sorttypeList.indexOf(classkey)) + 1];
        obj[keyname] = this.sortSetting[newval];
        Object.assign(this.sortConfig, obj);
      }
      this.$forceUpdate();
    },
    updateRowSort(event) {
      this.$emit('updateRowSort', event);
    },
    getScrollbarwidth() {
      let width = 0;
      this.$nextTick(() => {
        let outwidth = this.$refs.tablemain && this.$refs.tablemain.offsetWidth ? this.$refs.tablemain.offsetWidth : 0;
        let inwidth = this.$refs.tablemain && this.$refs.tablemain.clientWidth ? this.$refs.tablemain.clientWidth : 0;
        this.$set(this, 'scrollbarWidth', Math.max(0, outwidth - inwidth));
      });
    },
    clearSelected() {
      this.selectList = [];
      this.selectallConfig = [];
      this.$nextTick(() => {
        this.getSelectlist();
      });      
    },
    updateColSort(event) {
    },
    getTbodyWidth(type, val) {
      if (type && type == 'total') {
        this.tableWidth = val;
      } else {
        this.tbodyWidthList = val;
      }
      this.$forceUpdate();
    },
    updateTbodyList(list) {
      this.$emit('update:tbodyList', list);
    },
    caculateWidth() {
      if (this.isRendered) {
        let width = this.offsetWidth;
        this.setWidth();
        (width == this.offsetWidth) && (this.isRendered = false);
      }
    }

  },
  computed: {
    getshowList() {
      return function(list) {
        let showList = [];
        if (list && list.length > 0) {
          showList = list.filter((th) => {
            return th.isShow || th.isShow == undefined;
          });
        }
        return showList;
      };
    },
    setTableheight() {
      return function(tableheight) {
        return {maxHeight: typeof tableheight == 'number' ? tableheight + 'px' : tableheight};
      };
    },
    fixLeft() {
      let translateStyle = '';
      if (this.scrollLeft && this.scrollLeft > 0) {
        translateStyle = 'translate3d(' + (this.scrollLeft % 2 == 0 ? Math.floor(this.scrollLeft) : Math.floor(this.scrollLeft) - 1) + 'px,0,0)';
      } else {
        translateStyle = 'none';
      }
      return {
        transform: translateStyle
      };
    },
    fixTopLeft() {
      let translateStyle = '';
      if ((this.scrollLeft && this.scrollLeft > 0) || (this.scrollTop && this.scrollTop > 0)) {
        translateStyle = 'translate3d(' + Math.floor(this.scrollLeft) + 'px,' + Math.floor(this.scrollTop) + 'px,0)';
      } else {
        translateStyle = 'none';
      }
      return {
        transform: translateStyle
      };
    },
    setTableClass() {
      let classlist = 'tstable-' + this.size;
      if (this.type) {
        classlist += ' tstable-' + this.type;
      }
      if (this.styleType) {
        classlist += ' ' + this.styleType;
      }
      classlist += '' + this.border && typeof this.border == 'string' ? ' tstable-' + this.border + 'border' : !this.border ? ' tstable-noborder' : '';
      if (this.disabledHover) {
        classlist += ' tstable-nohover';
      }
      if (this.disabled) {
        classlist += ' tstable-disabled';
      }
      return classlist;
    },
    setTop() {
      return function(right, left) {
        let styles = {};
        if (right) {
          Object.assign(styles, {
            paddingRight: right + 'px'
          });
        }
        if (left) {
          Object.assign(styles, {
            marginLeft: -left + 'px'
          });
        }
        return styles;
      };
    },
    setLayout() {
      return {
        'table-layout': this.layout || ''
      };
    },
    getColWidth() {
      return function(columnList, list, tbodyWidthList) {
        let _this = this;
        let thList = [];
        let showList = [];
        if (columnList && columnList.length > 0) {
          thList.push({'key': 'columnWidth'});
        }
        if (this.canDrag) {
          thList.push({'key': 'dragWidth', 'width': 40});
        }
        if (list && list.length > 0) {
          showList = list.filter((th) => {
            return th.isShow || th.isShow == undefined;
          });
        }
        if (showList && showList.length) {
          showList.forEach(s => {
            thList.push({'key': s.key + 'Width', 'width': s.width && s.width > 10 ? s.width : (s.key == 'selection' ? 40 : null)});
          });
        }
        // if (tbodyWidthList && tbodyWidthList.length) {
        //   thList.forEach((t, tindex) => {
        //     let tdWidth = tbodyWidthList[tindex];
        //     _this.$set(t, 'width', tdWidth);
        //   });
        // }
        return thList;
      };
    }
    // getExpand() {
    //   return function(list) {
    //     if (list && list.length) {
    //       let isExpand = list.find(l => { return l.key == 'expand'; });
    //       return !!isExpand;
    //     } else {
    //       return false;
    //     }
    //   };
    // }

  },
  watch: {
    height(val) {
      if (val) {
        this.tableheight = val;
      }
    },
    theadList: {
      handler(val, oldval) {
        let _this = this;
        let alllist = val;
        this.thList = alllist;
        let isMultiple = this.multiple;
        if (val && val.length) {
          let canSelect = val.find(t => {
            return t.key == 'selection';
          });
          if (canSelect && typeof canSelect == 'object') {
            if (Object.keys(canSelect).indexOf('multiple') > -1) {
              isMultiple = canSelect.multiple;
            }
          }
        }
        this.isMultiple = isMultiple;
      },
      deep: true,
      immediate: true
    },
    thList: {
      handler(val, oldval) {
        this.$nextTick(() => {
          this.setWidth();
        });
        this.$forceUpdate();
      },
      deep: true
    },
    tbodyList: {
      handler: function(val, oldval) {
        let _this = this;
        if (!_this.selectedRemain) {
          _this.selectList = [];
          _this.selectallConfig = [];
        } else {
          _this.selectList = _this.value || [];
        }
        if (val && val.length > 0) {
          val.forEach((v, vindex) => {
            v['_selected'] = !!v.isSelected;
            if (v.isSelected) {
              _this.selectList.push(_this.keyName ? v[_this.keyName] : vindex);
              _this.selectallConfig.push(v);
            }
          });
        }
        if (!oldval || val.length != oldval.length) {
          _this.actionstatusList = [];
          if (val && val.length > 0) {
            val.forEach(v => {
              _this.actionstatusList.push(false);
            });
          }
        }
        _this.$forceUpdate();
        this.getScrollbarwidth();
        this.$nextTick(() => {
          _this.setWidth();
        });
      },
      deep: true,
      immediate: true
    },
    scrollLeft: {
      handler: function(val, oldval) {
        this.setTopleft();
      },
      immediate: true
    },
    tableheight: {
      handler: function() {
        this.getScrollbarwidth();
      },
      immediate: true  
    },
    sortMapping: {
      handler: function(val) {
        if (val && val != this.sortSetting) {
          this.sortSetting = val;
        }
      },
      immediate: true,
      deep: true      
    },
    sortList: {
      handler: function(val, oldval) {
        if (val && val.length > 0) {
          //排序的可能['a','b'],或者[{a:'ASC'},{b:'DESC'}]
          if (Object.keys(this.sortConfig).length == 0) {
            let isObj = (typeof val[0] == 'object');
            if (isObj) {
              val.forEach((s) => {
                if (Object.values(s)) {
                  Object.assign(this.sortConfig, s);
                }
              });
            } 
          }
        }
      },
      immediate: true,
      deep: true         
    },
    sortOrder: {
      handler: function(val) {
        if (val && val.length > 0) {
          val.forEach((el) => {
            Object.assign(this.sortConfig, el);
          });
        } else {
          this.sortConfig = {};
        }
      },
      deep: true       
    },
    value: {
      handler: function(val) {
        if (val) {
          this.selectList = val || [];
        }
      },
      deep: true,
      immediate: true   
    }
  }
};
</script>
<style lang="less">
.corner {
  width: 100%;
  height: 100%;
}
.drag-container {
  width: 40px;
  min-width: 30px;
  text-align: center;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.table-action {
  tr {
    td {
      cursor: pointer;
    }
  }
}
tr {
  th:first-child,
  td:first-child {
    padding-left: 24px;
  }
  th:last-child,
  td:last-child {
    padding-right: 24px;
  }
}
.fontBold {
  font-weight: bold !important;
}
</style>
