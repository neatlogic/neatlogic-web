<template>
  <div v-if="!loading" class="radius-lg bg-op">
    <div
      ref="tablecontainer"
      class="tstable-container"
      :class="setTableClass"
      style="height:100%"
    >
      <!-- 用于做固定的表头_start -->
      <div
        v-if="fixedHeader"
        ref="tabletop"
        :style="setTop(scrollbarWidth, scrollLeft)"
        class="bg-table"
      >
        <table class="table-top tstable-body" :style="setLayout" :class="{ fixtop: scrollTop && scrollTop > 0 }">
          <ColGroup :list="getColWidth(columnList, thList, tbodyWidthList)" :canResize="canResize"></ColGroup>
          <THead
            :columnList="columnList"
            :list="getshowList(thList)"
            :keyName="keyName"
            :theme="theme"
            :sortList="sortList"
            :tbodyList="tbodyList"
            :selectList="selectedIndexList"
            :sortSetting="sortSetting"
            :scrollLeft="scrollLeft"
            :sortConfig="sortConfig"
            :canResize="canResize"
            :canDrag="canDrag"
            :multiple="isMultiple"
            @toggleExpandAll="toggleExpandAll"
            @selectAll="selectAll"
            @switchStatus="switchStatus"
            @headerTitleOperation="headerTitleOperation"
          ></THead>
          <TBody
            v-if="getshowList(thList).length > 0 && tbodyList.length > 0"
            :tbodyList="tbodyList"
            :columnList="columnList"
            :colsList="getColWidth(columnList, thList, tbodyWidthList)"
            :theadList="getshowList(thList)"
            :selectList="selectedIndexList"
            :canDrag="canDrag"
            :canSelectRow="canSelectRow"
            :hideAction="hideAction"
            :keyName="keyName"
            :classKey="classKey"
            :scrollLeft="scrollLeft"
            :canExpand="canExpand"
            :offsetWidth="offsetWidth"
            :multiple="isMultiple"
            :readonlyTextIsHighlight="readonlyTextIsHighlight"
            @updateRowSort="updateRowSort"
            @clickTr="clickTr"
            @setWidth="setWidth"
            @selectOne="selectOne"
            @toggleExpand="toggleExpand"
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
                <slot name="noDataTip">
                  <div class="text-tip">{{ noDataText }}</div>
                </slot>
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
        :class="{ 'table-radius-main': !rowNum || !pageSize || !showPager }"
        :style="setTableheight(tableheight)"
        @scroll.stop="scrollTable($event)"
        @mouseenter.stop="caculateWidth"
        @mousewheel.stop
      >
        <table ref="tstable" class="table-main tstable-body" :style="setLayout">
          <ColGroup :list="getColWidth(columnList, thList, tbodyWidthList)"></ColGroup>
          <THead
            :theme="theme"
            :columnList="columnList"
            :list="getshowList(thList)"
            :keyName="keyName"
            :sortList="sortList"
            :tbodyList="tbodyList"
            :selectList="selectedIndexList"
            :sortSetting="sortSetting"
            :scrollLeft="scrollLeft"
            :sortConfig="sortConfig"
            :canResize="canResize"
            :canDrag="canDrag"
            :multiple="isMultiple"
            :isMain="fixedHeader"
            :disabled="disabled"
            :readonlyTextIsHighlight="readonlyTextIsHighlight"
            @toggleExpandAll="toggleExpandAll"
            @selectAll="selectAll"
            @switchStatus="switchStatus"
            @headerTitleOperation="headerTitleOperation"
          ></THead>
          <TBody
            v-if="getshowList(thList).length > 0 && tbodyList.length > 0"
            :columnList="columnList"
            :colsList="getColWidth(columnList, thList, tbodyWidthList)"
            :tbodyList="tbodyList"
            :theadList="getshowList(thList)"
            :selectList="selectedIndexList"
            :canDrag="canDrag"
            :theme="theme"
            :canSelectRow="canSelectRow"
            :hideAction="hideAction"
            :keyName="keyName"
            :classKey="classKey"
            :multiple="isMultiple"
            :scrollLeft="scrollLeft"
            :offsetWidth="offsetWidth"
            isMain
            :canExpand="canExpand"
            :disabled="disabled"
            @operation="operation"
            @updateRowSort="updateRowSort"
            @clickTr="clickTr"
            @setWidth="setWidth"
            @selectOne="selectOne"
            @toggleExpand="toggleExpand"
            @getTbodyWidth="getTbodyWidth"
            @updateTbodyList="updateTbodyList"
          >
            <template v-for="hitem in getshowList(thList)" :slot="hitem.key" slot-scope="{ row, index }">
              <slot
                v-if="hitem.type"
                :name="hitem.key"
                :row="row"
                :index="index"
              >
                <slot
                  v-if="hitem.type == 'action'"
                  :name="hitem.key"
                  :row="row"
                  :index="index"
                >
                  <div :key="hitem.key" class="tstable-action">
                    <ul class="tstable-action-ul">
                      <li v-for="(ops, j) in hitem.operations" :key="j">
                        <span class="mask" :style="setWidgetUl()"></span>
                        <span v-if="ops.type == 'text'" @click="operation(ops.action, row)">
                          <span v-if="ops.readonly" :class="[ops.isGreaterThanZero ? getDisableStatus(true, row[ops.value]) : getDisableStatus(false, row[ops.value]), ops.icon + ' icon ' + ops.style]" :title="getHoverTitle(ops.isGreaterThanZero, row[ops.value], ops.hoverTitle)">
                            <span>{{ ops.name }}</span>
                          </span>
                          <span v-else class="icon" :class="ops.icon + ' ' + ops.style">{{ ops.name }}</span>
                        </span>
                        <span v-else-if="ops.type == 'switch'">
                          <span v-if="ops.disabled">
                            <!-- 是否能点击 -->
                            <TsFormSwitch
                              v-model="row['' + ops.key + '']"
                              :true-value="1"
                              :false-value="0"
                              :class="{ 'text-grey disable': row[ops.value] > 0 }"
                              :disabled="row[ops.value] > 0"
                              showStatus
                              @on-change="operation(ops.action, row)"
                            ></TsFormSwitch>
                          </span>
                          <span v-else>
                            <TsFormSwitch
                              v-model="row['' + ops.key + '']"
                              :true-value="1"
                              :false-value="0"
                              :class="ops.style"
                              showStatus
                              @on-change="operation(ops.action, row)"
                            ></TsFormSwitch>
                          </span>
                        </span>
                      </li>
                    </ul>
                  </div>
                </slot>
                <slot
                  v-else
                  :name="hitem.key"
                  :row="row"
                  :index="index"
                ></slot>
              </slot>
              <slot
                v-else
                :name="hitem.key"
                :row="row"
                :index="index"
              ></slot>
            </template>
            <template v-if="canExpand" slot="expand" slot-scope="{ row, index }">
              <slot name="expand" :row="row" :index="index"></slot>
            </template>
          </TBody>
          <tbody v-else>
            <tr>
              <td :colspan="getshowList(thList).length || 0" class="text-center">
                <slot name="noDataTip">
                  <div class="text-tip">{{ noDataText }}</div>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Poptip
        v-if="canEdit"
        placement="bottom-end"
        transfer
        width="300"
        class="btn-setting"
        popper-class="sort-drop"
        @on-popper-show="toggleDrop(true)"
        @on-popper-hide="toggleDrop(false)"
      >
        <div v-if="isshowdrop" class="tsfont-close icon-setting"></div>
        <div v-else class="tsfont-list icon-setting"></div>
        <div slot="content">
          <div class="sort-container">
            <div class="sort-thead padding-xs">
              <div class="sort-handle text-grey" style="text-align:center">{{ $t('page.order') }}</div>
              <div class="sort-show text-grey" style="text-align:center">{{ $t('page.display') }}</div>
              <div class="sort-name text-grey">{{ $t('page.fieldname') }}</div>
            </div>
            <draggable
              v-if="thList"
              v-model="thList"
              class="sort-group"
              handle=".sort-handle"
              scroll
              :delay="0"
              @update="updateColSort"
            >
              <div
                v-for="li in thList.filter(d => d.key != 'action')"
                :key="li.key"
                class="padding-xs"
                :class="['sort-item', { disabled: li.key == 'selection' || li.disabled }]"
              >
                <div class="tsfont-drag sort-handle" style="text-align:center"></div>
                <div class="sort-show" style="text-align:center">
                  <Checkbox
                    v-model="li.isShow"
                    :true-value="1"
                    :disabled="li.isDisabled || false"
                    :false-value="0"
                    @on-change="checkshow(li.key, li.isShow)"
                  ></Checkbox>
                </div>
                <div class="text overflow">{{ li.title ? li.title : '_' }}</div>
              </div>
            </draggable>
          </div>
        </div>
      </Poptip>
    </div>
    <div v-if="isBigDataPage" ref="tablepage" class="tstable-page text-right">
      <!-- 大数据模式显示分页数据 -->
      <ul v-if="rowNum.indexOf('+') !== -1 || (rowNum.indexOf('+') === -1 && Number(rowNum) > pageSize && pageSize > 0 && (!pageType || pageType != 'carousel') && showPager)" ref="tablepage" class="ivu-page mini">
        <span class="ivu-page-total">{{ $t('page.intotaltarget', {target: rowNum}) }}</span>
        <li
          :title="$t('page.previouspage')"
          class="ivu-page-prev"
          :class="{ 'ivu-page-disabled': currentPage === 1 }"
          @click="getCarouselPage('prev')"
        >
          <a><i class="ivu-icon ivu-icon-ios-arrow-back"></i></a>
        </li>
        <li
          v-for="(item, index) in bigDataPageList"
          :key="index"
          :title="item"
          class="ivu-page-item"
          :class="{ 'ivu-page-item-active': item === currentPage }"
          @click="getPage(item)"
        >
          <a>{{ item }}</a>
        </li>
        <li
          :title="$t('page.nextpage')"
          class="ivu-page-next"
          :class="{ 'ivu-page-disabled': isNextDisabled }"
          @click="getCarouselPage('next')"
        >
          <a><i class="ivu-icon ivu-icon-ios-arrow-forward"></i></a>
        </li>
        <Select v-model="bigDataPageSize" style="width:90px" @on-change="getPageSize(bigDataPageSize)">
          <Option v-for="item in pageSizeOpts" :key="item" :value="item">{{ $t('page.itemspagetarget', {target: item}) }} </Option>
        </Select>
      </ul>
    </div>
    <div v-else>
      <!-- 默认模式显示分页数据 -->
      <div v-if="rowNum > defaultShowSize && pageSize > 0 && (!pageType || pageType != 'carousel') && showPager" ref="tablepage" class="tstable-page text-right">
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
      <div v-else-if="pageSize > 0 && pageType == 'carousel'" ref="tablepage" class="tstable-page text-center">
        <Button :disabled="current == 1" @click.native="getCarouselPage('prev')">{{ $t('page.previouspage') }}</Button>
        <Button class="ml-md" @click.native="getCarouselPage('next')">{{ $t('page.nextpage') }}</Button>
      </div>
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
// import UserCard from './UserCardNew/UserCard.vue';
// import Liquid from '@/resources/components/SimpleGraph/Liquid.vue';

export default {
  name: 'TsTable',
  components: {
    draggable,
    THead,
    TBody,
    ColGroup,
    // UserCard,
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
    // Liquid
  },
  directives: { scrollHidden },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    // 大数据分页模式开始
    endPage: { type: Number }, //结束页数
    processingOfMineCount: { type: String }, //显示总数
    startPage: { type: Number }, //开始页数
    isAutoScroll: { type: Boolean, default: false }, //自动滚动
    // 大数据分页模式结束
    rowNum: [Number, String], //总个数
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
    isBigDataPage: {
      //是否用大数据分页
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
      type: [Boolean, String, Number],
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
    theme: Object, //自定义主题,
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
    styleType: {
      //table样式类型,支持多个类型空格隔开的字符串。跟type的区别是type针对排版块状还是列表，styleType针对普通的table常用的样式比如线条还是斑马支持多个字符串  [border,stripe]
      type: String,
      default: GLOBAL_TABLESTRYLE || 'border'
    },
    loading: {
      type: Boolean,
      default: false
    },
    canSelectRow: {
      //当支持选中时是否触发整行点击选中，默认否（当仅当整行无其他整行点击事件时可以设置为true不然事件会多次触发）
      type: Boolean,
      default: true
    },
    canExpand: {
      //是否有展开行查看更多的功能
      type: Boolean,
      default: false
    },
    multiple: {
      //是否支持选中多行
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
    },
    fixedHeader: {
      //表格头部是否固定，如果不需要固定，则不回计算表格的高度，高度自适应
      type: Boolean,
      default: true
    },
    readonlyTextIsHighlight: { // 只读模式下，表格表头背景是否需要高亮
      type: Boolean,
      default: false
    }
  },
  data() {
    let _this = this;
    return {
      resizeTimer: null,
      scrollTimmer: null,
      current: 1,
      thList: [],
      tableheight: '1000px',
      scrollTop: 0,
      scrollLeft: 0,
      isshowdrop: false, //设置表单格是否打开
      offsetWidth: 0,
      topleft: null,
      selectedIndexList: [], //选中列表数据(只有keyName)
      selectedItemList: [], //选中列表数据(每一行完整的数据)
      sortConfig: {}, //表头排序用
      sortSetting: {
        up: 'ASC',
        down: 'DESC',
        none: ''
      }, //排序对应的字段
      sortTypeList: ['up', 'down', 'none'], //排序数组
      scrollbarWidth: 0, //滚动条的宽度，当tbody有高度时thead的宽度比tbody多了一个滚动条宽度，需减去
      tbodyWidthList: [],
      tableWidth: '100%',
      isMultiple: false,
      bigDataPageList: [], //分页区间数据
      isNextDisabled: false, //下一页是否可被点击
      bigDataPageSize: _this.pageSize, //分页
      isRendered: true, //表格渲染需要时间导致第一次取值有问题，这里标记是否需要从新计算offsetWidth的值
      resizeEvent: null,
      defaultShowSize: 10 //小于10条数据，不显示分页
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    /*
    if (this.value && this.value.length && this.keyName) {
      //初始化的时候如果有选中的，需要回调一次选中数据的方法getSelected
      let selectedList = [];
      this.value.forEach(v => {
        let selectItem = this.tbodyList.find(t => {
          return t[this.keyName] == v;
        });
        selectItem && selectedList.push(selectItem);
      });
      this.selectedItemList = selectedList;

      this.$emit('getSelected', this.value, selectedList);
    }*/
    if (this.height) {
      this.tableheight = this.height;
      this.setWidth();
    } else {
      window.addEventListener('resize', this.initTable);
    }
  },
  beforeDestroy() {
    if (!this.height) {
      window.removeEventListener('resize', this.initTable);
    }
  },
  updated() {
    if (!this.height) {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = null;
      }
      this.resizeTimer = setTimeout(() => {
        this.initTable();
      }, 100);
    }
  },
  methods: {
    isBigDataPageFn() {
      if (this.isBigDataPage) {
        this.bigDataPageList = [];
        for (let i = this.startPage; i <= this.endPage; i++) {
          this.bigDataPageList.push(i);
        }
        if (this.currentPage === this.endPage) {
          this.isNextDisabled = true;
        } else {
          this.isNextDisabled = false;
        }
      }
    },
    getHoverTitle(isBool, value, title) {
      let returnValue = '';
      if (isBool) {
        returnValue = value > 0 ? title : '';
      } else {
        returnValue = value == 0 || value == 'true' ? title : '';
      }
      return returnValue;
    },
    getDisableStatus(isBool, value) {
      // 获取禁用状态,isBool true 表示数字大于0禁用，等于0可删除，否则相反
      let returnValue = '';
      let className = 'text-grey text-disabled';
      if (isBool) {
        returnValue = value > 0 ? className : '';
      } else {
        returnValue = value == 0 || value == 'true' ? className : '';
      }
      return returnValue;
    },
    headerTitleOperation() {
      // 点击表头文字加刷新icon，点击操作
      this.$emit('headerTitleOperation');
    },
    getPage(page) {
      this.current = page;
      this.$emit('changeCurrent', this.current);
    },
    getCarouselPage(type) {
      if (type == 'prev') {
        this.current = Math.max(1, parseInt(this.currentPage) - 1);
        if (this.currentPage > 1) {
          this.$emit('changeCurrent', this.current);
        }
      } else {
        if (!this.isNextDisabled) {
          this.current = Math.max(1, parseInt(this.currentPage) + 1);
          this.$emit('changeCurrent', this.current);
        }
      }
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
      this.$emit('checkshow', this.thList, val);
    },
    initTable() {
      const height = window.innerHeight;
      let tableheight = height - (this.$refs.tablemain ? this.$refs.tablemain.getBoundingClientRect().top : 0);
      if (this.$refs.tablepage) {
        tableheight = tableheight - this.$refs.tablepage.clientHeight;
      }
      this.$set(this, 'tableheight', Math.max(tableheight - 20, 40) + 'px');
      this.setWidth();
    },
    setScrollTop(st) {
      this.scrollTop = st;
      this.$refs['tablemain'].scrollTop = st;
    },
    scrollTable: function(e) {
      let sTop = e.srcElement.scrollTop;
      let sLeft = e.srcElement.scrollLeft;
      this.scrollTop = sTop;
      this.scrollLeft = sLeft;
      this.$emit('scroll', sTop);
    },
    unActiveAutoScroll: function() {
      if (this.scrollTimmer) {
        clearInterval(this.scrollTimmer);
        this.scrollTimmer = null;
      }
    },
    activeAutoScroll: function() {
      //激活自动滚动
      if (this.$refs['tablemain']) {
        let scrollHeight = this.$refs['tablemain'].scrollHeight;
        let offsetHeight = this.$refs['tablemain'].offsetHeight;
        if (this.scrollTimmer) {
          clearInterval(this.scrollTimmer);
          this.scrollTimmer = null;
        }
        if (scrollHeight > offsetHeight) {
          this.scrollTimmer = setInterval(() => {
            let scrollHeight = this.$refs['tablemain'].scrollHeight;
            let offsetHeight = this.$refs['tablemain'].offsetHeight;
            let scrollTop = this.$refs['tablemain'].scrollTop;
            if (scrollHeight <= offsetHeight) {
              clearInterval(this.scrollTimmer);
              this.scrollTimmer = null;
              return;
            }
            let i = 0;
            const that = this;
            requestAnimationFrame(function fn() {
              that.$refs['tablemain'].scrollTop += 1;
              if (scrollTop == that.$refs['tablemain'].scrollTop) {
                that.$refs['tablemain'].scrollTop = 0; //如果滚到底自动回到最上面重新滚动
              } else {
                i += 1;
              }
              if (i <= 35) {
                requestAnimationFrame(fn);
              }
            });
          }, 3000);
        }
      }
    },
    selectOne: function(item, index) {
      if (this.disabled) {
        return;
      }
      if (!item.isDisabled) {
        let currenVal = this.keyName ? item[this.keyName] : index;
        let isSelected = this.checkIsSelected(item, index);
        if (isSelected) {
          //原来选中，取消选中
          this.selectedItemList.splice(this.selectedIndexList.indexOf(currenVal), 1);
          this.selectedIndexList.splice(this.selectedIndexList.indexOf(currenVal), 1);
          //取消选中
          if (item.hasOwnProperty('isSelected')) {
            this.$set(item, 'isSelected', false);
          }
          if (item.hasOwnProperty('_selected')) {
            this.$set(item, '_selected', false);
          }
          this.$emit('cancelSelected', item);
        } else {
          //原来没选中
          if (this.isMultiple) {
            //多选直接选中
            this.selectedIndexList.push(currenVal);
            this.selectedItemList.push(item);
            this.$set(item, 'isSelected', true);
            this.$set(item, '_selected', true);
            this.$emit('selectedItem', item);
          } else {
            //单选的话直接替换掉当前选中
            this.selectedItemList.forEach(oldItem => {
              if (oldItem.hasOwnProperty('isSelected')) {
                this.$set(oldItem, 'isSelected', false);
              }
              if (oldItem.hasOwnProperty('_selected')) {
                this.$set(oldItem, '_selected', false);
              }
            });
            this.selectedIndexList = [currenVal];
            this.selectedItemList = [item];
            this.$set(item, 'isSelected', true);
            this.$set(item, '_selected', true);
            this.$emit('selectedItem', item);
          }
        }
        this.$forceUpdate();
        this.getSelectList();
      }
    },
    toggleExpand(row) {
      this.$emit('toggleExpand', row);
    },
    toggleExpandAll() {
      if (this.tbodyList && this.tbodyList.length > 0) {
        let hasUnExpanded = false;
        this.tbodyList.forEach(element => {
          if (!element['_expand'] && element['_expander'] != false) {
            hasUnExpanded = true;
            return false;
          }
        });
        if (hasUnExpanded) {
          //展开所有
          this.tbodyList.forEach(element => {
            if (element['_expander'] != false) {
              //有展开按钮的才展示
              this.$emit('toggleExpand', element, true);
            }
          });
        } else {
          //收起所有
          this.tbodyList.forEach(element => {
            //有没有展开按钮的可以关闭
            this.$emit('toggleExpand', element, false);
          });
        }
      }
    },
    selectAll() {
      if (this.disabled) {
        return;
      }
      if (this.tbodyList && this.tbodyList.length > 0) {
        let isSelecedall = true;
        this.tbodyList.forEach((d, dindex) => {
          if (!this.checkIsSelected(d, dindex) && !d.isDisabled) {
            isSelecedall = false;
          }
        });
        if (isSelecedall) {
          //取消全选
          this.tbodyList.forEach((d, dindex) => {
            if (!d.isDisabled) {
              this.$nextTick(() => {
                if (this.selectedIndexList.indexOf(d[this.keyName] || dindex) > -1) {
                  this.selectedItemList.splice(this.selectedIndexList.indexOf(d[this.keyName] || dindex), 1);
                  this.selectedIndexList.splice(this.selectedIndexList.indexOf(d[this.keyName] || dindex), 1);
                }
              });
            }
          });
        } else {
          //全选
          this.tbodyList.forEach((d, dindex) => {
            if (!d.isDisabled) {
              this.$nextTick(() => {
                if (!this.selectedIndexList.includes(d[this.keyName] || dindex)) {
                  this.selectedIndexList.push(d[this.keyName] || dindex);
                  this.selectedItemList.push(d);
                }
              });
            }
          });
        }
      }
      this.$nextTick(() => {
        this.getSelectList();
      });
    },
    getSelectList() {
      //统一出口获取选中列表
      this.$emit('change', this.selectedIndexList);
      this.$emit('getSelected', this.selectedIndexList, this.selectedItemList);

      this.tbodyList &&
        this.tbodyList.length &&
        this.tbodyList.forEach((t, tindex) => {
          let isSelected = false;
          if (this.selectedIndexList.length > 0) {
            if (
              this.selectedIndexList.findIndex(s => {
                return s == (this.keyName ? t[this.keyName] : tindex);
              }) > -1
            ) {
              isSelected = true;
            }
          }
          this.$set(t, '_selected', isSelected);
        });
    },
    checkIsSelected(item, index) {
      //检查当前项是否选中,返回：false，true
      let isSelected = false;
      let key = this.keyName || index;
      if (item && (key || typeof key == 'number')) {
        if (this.selectedIndexList.length > 0) {
          let itemval = item[this.keyName] || index;
          if (this.selectedIndexList.indexOf(itemval) > -1) {
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
    setWidgetUl() {
      if (this.theme) {
        if (this.theme.TsTable) {
          let style = { filter: 'inherit' };
          let list = {};
          let temConfig = this.$utils.mergeObj(this.theme.TsTable.tr, this.theme.TsTable.td);
          Object.keys(temConfig).forEach(v => {
            if (v === 'background' || v === 'backgroundColor') {
              list[v] = temConfig[v] + '!important';
            }
          });
          if (Object.keys(list).length > 0) {
            let config = this.$utils.mergeObj(list, style);
            return config;
          }
        }
      }
    },
    setWidth() {
      if (this.$refs.tstable) {
        this.offsetWidth = Math.max(0, this.$refs.tstable.getBoundingClientRect().width - this.$el.getBoundingClientRect().width);
      }
    },
    setTopleft() {},
    switchStatus(item) {
      this.setStatusclass(item.key);
      this.$nextTick(() => {
        this.$emit('updateSort', this.sortConfig);
      });
    },
    setStatusclass(keyname) {
      //更新排序状态
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
        let newval = this.sortTypeList[this.sortTypeList.indexOf(classkey) == this.sortTypeList.length - 1 ? 0 : Math.floor(this.sortTypeList.indexOf(classkey)) + 1];
        let newobj = {};
        newobj[keyname] = this.sortSetting[newval];
        if (!this.sortMulti) {
          this.sortConfig = newobj;
        } else {
          if (isExsit && newobj[keyname]) {
            Object.assign(this.sortConfig, newobj);
          } else if (isExsit && !newobj[keyname]) {
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
        let newval = this.sortTypeList[this.sortTypeList.indexOf(classkey) == this.sortTypeList.length - 1 ? 0 : Math.floor(this.sortTypeList.indexOf(classkey)) + 1];
        obj[keyname] = this.sortSetting[newval];
        Object.assign(this.sortConfig, obj);
      }
      this.$forceUpdate();
    },
    updateRowSort(event, list) {
      this.$emit('updateRowSort', event, list);
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
      this.selectedIndexList = [];
      this.selectedItemList = [];
      this.$nextTick(() => {
        this.getSelectList();
      });
    },
    updateColSort(event) {
      this.$emit('checkshow', this.thList);
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
        width == this.offsetWidth && (this.isRendered = false);
      }
    },
    operation(action, row) {
      this.$emit('operation', action, row);
    },
    rowArr(row, valueKey) {
      let name = '';
      if (row.length > 0) {
        row.forEach(v => {
          name += v['' + valueKey + ''] + ',';
        });
        name = name.substr(0, name.length - 1);
      } else {
        name = '';
      }
      return name;
    },
    statesArr(value, stateArr) {
      let name = '';
      stateArr.forEach(v => {
        if (v.value == value) {
          name = v.name;
        }
      });
      return name;
    }
  },
  computed: {
    getshowList() {
      return function(list) {
        let showList = [];
        if (list && list.length > 0) {
          showList = list.filter(th => {
            return th.isShow || th.isShow == undefined;
          });
        }
        return showList;
      };
    },
    setTableheight() {
      return function(tableheight) {
        if (this.fixedHeader) {
          //38是头部高度
          let pageHeight = 0;
          if (this.$refs.tablepage) {
            pageHeight = this.$refs.tablepage.clientHeight;
          }
          return { maxHeight: typeof tableheight == 'number' ? tableheight - 38 - pageHeight + 'px' : tableheight };
        } else {
          return null;
        }
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
      if (!this.fixedHeader) {
        classlist += ' tstable-no-fixedHeader';
      }
      if (!this.showPager || !this.rowNum > 10 || this.pageSize == 0 || (this.pageType && this.pageType != 'carousel')) {
        classlist += ' radius-lg';
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
        let thList = [];
        let showList = [];
        if (columnList && columnList.length > 0) {
          thList.push({ key: 'columnWidth' });
        }
        if (this.canDrag) {
          thList.push({ key: 'dragWidth', width: 30 });
        }
        if (list && list.length > 0) {
          showList = list.filter(th => {
            return th.isShow || th.isShow == undefined;
          });
        }
        if (showList && showList.length) {
          showList.forEach(s => {
            thList.push({ key: s.key + 'Width', width: s.width && s.width > 1 ? s.width : s.key == 'selection' ? 40 : null });
          });
        }
        return thList;
      };
    }
  },
  watch: {
    height(val) {
      if (val) {
        this.tableheight = val;
      }
    },
    theadList: {
      handler(val, oldval) {
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
        this.isBigDataPageFn();
        if (!this.selectedRemain) {
          this.selectedIndexList = [];
          this.selectedItemList = [];
        } else if (this.value && this.value.length > 0) {
          this.selectedIndexList = this.$utils.deepClone(this.value);
        } else {
          this.selectedIndexList = [];
        }
        if (val && val.length > 0) {
          val.forEach((v, vindex) => {
            if (!v.hasOwnProperty('_selected')) {
              v['_selected'] = !!v.isSelected;
            }
            if (v['_selected']) {
              let isExists = false;
              if (this.keyName) {
                isExists = this.selectedIndexList.includes(v[this.keyName]);
              } else {
                isExists = this.selectedIndexList.includes(vindex);
              }
              if (!isExists) {
                this.selectedIndexList.push(this.keyName ? v[this.keyName] : vindex);
                this.selectedItemList.push(v);
              }
            }
          });
        }
        if (!oldval || val.length != oldval.length) {
          this.actionstatusList = [];
          if (val && val.length > 0) {
            val.forEach(v => {
              this.actionstatusList.push(false);
            });
          }
        }
        this.$forceUpdate();
        this.getScrollbarwidth();
        this.$nextTick(() => {
          this.setWidth();
          if (this.isAutoScroll) {
            this.activeAutoScroll();
          }
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
        if (this.isAutoScroll) {
          this.activeAutoScroll();
        }
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
            let isObj = typeof val[0] == 'object';
            if (isObj) {
              val.forEach(s => {
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
          val.forEach(el => {
            Object.assign(this.sortConfig, el);
          });
        } else {
          this.sortConfig = {};
        }
      },
      deep: true,
      immediate: true
    },
    isAutoScroll: {
      handler: function(val) {
        if (val) {
          this.activeAutoScroll();
        } else {
          this.unActiveAutoScroll();
        }
      }
    },
    value: {
      handler: function(val) {
        if (val) {
          this.selectedIndexList = this.$utils.deepClone(val) || [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
.m-img {
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.corner {
  width: 100%;
  height: 100%;
}
.drag-container {
  width: 30px;
  min-width: 20px;
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
// tr {
//   th:first-child,
//   td:first-child {
//     padding-left: 24px;
//   }
//   th:last-child,
//   td:last-child {
//     padding-right: 24px;
//   }
// }
.m-poptipno {
  visibility: hidden;
}
</style>
<style lang="less" scope>
.tstable-action-ul {
  li {
    span {
      vertical-align: baseline !important;
    }
  }
}
</style>
