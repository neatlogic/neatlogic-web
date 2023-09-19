<template>
  <div class="tsSheet">
    <div class="sheetbuilder-style border-color">
      <SheetStylesetting :stylelist="selectedStyle"></SheetStylesetting>
    </div>
    <div class="sheet-content input-border">
      <div class="sheet-top"></div>
      <div class="sheet-left"></div>
      <div
        ref="hotContainer"
        style="height: calc(100vh - 210px);overflow: auto"
        @drop="drop($event)"
        @dragover.prevent
        @wheel.stop
      ></div>
    </div>
    <!-- 底部添加的扩展组件 -->
    <div class="form-footer bg-grey dividing-color">
      <template v-for="(custom, index) in controllerList">
        <p v-if="custom.config.isFooter && !custom.componentDelete" :key="index" @click="editComponent(custom.uuid,custom.handler)">
          <span v-if="custom.config.validList && custom.config.validList.length>0" class="tsfont-danger-s text-danger" title="组件信息不完整"></span>
          <i :class="custom.config.icon"></i>
          <i class="tsfont-close-o" title="删除" @click.stop="removeComponent(custom.uuid,custom.handler,true)"></i>
          <span class="overflow">{{ custom.label }}</span>
        </p>
      </template>
    </div>
    <div :class="setContentclass">
      <!-- 表单验证 -->
      <Card v-if="validCardOpen && (validList || (rulevalidList && rulevalidList.length > 0))" style="width:320px;position: absolute; z-index: 10; left: -325px;" :padding="0">
        <p slot="title">校验</p>
        <a slot="extra" href="javascript:void(0);" @click.prevent="validCardOpen = false">
          <Icon custom="tsfont-close" color="#868686"></Icon>
        </a>
        <CellGroup style="max-height: 340px; overflow: auto;">
          <div v-for="(valid, key) of validList" :key="key">
            <Cell
              v-for="(title, index) in valid"
              :key="index"
              :title="title"
              @click.native="validItemClick(key)"
            >
              <Icon
                slot="icon"
                custom="tsfont-close-o"
                size="20"
                class="text-danger"
              ></Icon>
            </Cell>
          </div>
          <div v-for="(rule, rindex) in rulevalidList" :key="rindex">
            <Cell :title="rule.text" @click.native="validRule(rule)">
              <Icon
                slot="icon"
                custom="tsfont-close-o"
                size="20"
                class="text-danger"
              ></Icon>
            </Cell>
          </div>
        </CellGroup>
      </Card>
      <!--  右侧表单编辑_组件_start -->
      <FormcomEdit
        v-if="formeditContent && isEditcomponent"
        ref="refFormeditContent"
        :controller-list="getComponentList"
        :rowLength="rowLength"
        v-bind="formeditContent"
      ></FormcomEdit>
      <!--  右侧表单编辑_组件_end -->
      <!--  右侧表单编辑_公共部分_start -->
      <FormEdit
        v-if="isFormedit"
        ref="formedit"
        v-model="globalSetting"
        :controllerList="controllerList"
        :rowLength="rowLength"
        :componentRuleuuid="componentRuleuuid"
        @closeEditform="closeEditform"
        @toggleWidth="toggleWidth"
        @hightlight="hightlight"
        @adjustwidth="adjustWidth"
        @clearRuleuuid="componentRuleuuid = null"
      ></FormEdit>
      <!--  右侧表单编辑_公共部分_end -->
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import 'handsontable/dist/handsontable.full.css';
import 'handsontable/languages/zh-CN';
import Handsontable from 'handsontable';
import CellCom from './view/sheet-components.vue';
import SheetStylesetting from './components/SheetStylesetting.vue';
import { componentListConfig as initComponentConfig} from './componentConfig.js';
// 组件
window.Vue = Vue;
window.handsontable = Handsontable;

let _this;
let Vm;

// 注册celltype组件
Handsontable.renderers.registerRenderer('formCell', function(instance, TD, row, col, prop, value, cellProperties) {
  if (value && typeof value === 'object') {
    // 纠正row，col数据
    if (value.component) {
      formCellTypes(instance, TD, row, col, prop, value, cellProperties);
    } else {
      Handsontable.renderers.TextRenderer.apply(this, [instance, TD, row, col, prop, value.content, cellProperties]);
    }
  } else {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
  }
  // 类名
  if (value && value.hasOwnProperty('className') && value.className) {
    let classNameLength = (value.className).split(' ');
    if (classNameLength && classNameLength.length >= 2) {
      TD.classList.add(classNameLength[0], classNameLength[1]);
    } else {
      TD.classList.add(classNameLength[0]);
    }
  }
  // style
  if (value && value.style) {
    for (var sty in value.style) {
      if (sty === 'borderWidth' || sty === 'border') {
        // if (value.style[sty] === 'all') {
        //     TD.style['border'] = "1px solid red"
        // } else TD.style['border'] = null;
      } else TD.style[sty] = value.style[sty];
    }
  }
});

class CustomTextEditor extends Handsontable.editors.TextEditor {
  // eslint-disable-next-line no-useless-constructor
  constructor(hotInstance) {
    super(hotInstance);
  }

  getValue() {
    let value = this.originalValue;
    if (this.originalValue && typeof this.originalValue === 'object') {
      this.originalValue.content = this.TEXTAREA.value;
    } else {
      value = this.TEXTAREA.value;
    }
    return value;
  }

  setValue(newValue) {
    this.TEXTAREA.value = this.originalValue && typeof this.originalValue === 'object' && this.originalValue.hasOwnProperty('content') ? this.originalValue.content || '' : this.originalValue || '';
  }
}
Handsontable.editors.registerEditor('formCell', CustomTextEditor);

let autoRowHeightSetTime;
function cellComponent(data, td, row, col) {
  const component = data.component;
  return Vue.extend({
    components: {
      CellCom
    },
    data() {
      const selectConfig = Vm.controllerList.find(d => d.uuid === component.uuid) || {};
      const globalSetting = Vm.globalSetting || {};
      selectConfig.config && this.$delete(selectConfig.config, 'componentDelete'); // 如果是撤销删除操作，删除标识删除的key值
      return {
        config: selectConfig,
        height: td.offsetHeight,
        componentList: Vm.controllerList,
        isReadonly: true,
        formView: false,
        globalSetting: globalSetting,
        hasRule: false,
        userInfo: Vm.$store.state.userInfo || null,
        componentRuleuuid: Vm.componentRuleuuid,
        allconfig: data
      };
    },
    created() {},
    methods: {
      removeComponent(e) {
        Vm.$hot.setDataAtCell(data.row, data.col, '');
      },
      showRule() {
        Vm.componentRuleuuid = this.config.uuid;
        Vm.showComponentrule(this.config.uuid);
      },
      getValidMessage(validList) {
        let message = '';
        validList && validList.forEach((item) => {
          if (item.message) {
            message += `${item.message}<br/>`;
          }
        });
        return message;
      }
    },
    watch: {
      'config.config': {
        handler(val) {
          //Vm.$hot.getDataAtCell(data.row-1, data.col);
          clearTimeout(autoRowHeightSetTime);
          autoRowHeightSetTime = setTimeout(() => {
            if (Vm && Vm.$hot) {
              const manual = Vm.$hot.getPlugin('ManualRowResize');
              const h = td.firstChild.offsetHeight;
              let h1 = manual.manualRowHeights[row];
              if (!h1) h1 = hotSetting.rowHeights;
              if (h1 < h) {
                manual.setManualSize(row, h < 42 ? 42 : h);
              } 
              Vm.$hot.setDataAtCell(row, col, this.allconfig);
              // else {
              // manual.setManualSize(row, h < 42 ? 42 : h);
              // //}
            }
            //Vm.$hot.render();
          }, 0);
        },
        deep: true
      },
      globalSetting: {
        handler: function(val) {
          this.hasRule = false;
          if (val && val.ruleList && val.ruleList.length > 0) {
            val.ruleList.forEach(ru => {
              if (ru.conditionList && ru.conditionList.length > 0) {
                ru.conditionList.forEach(co => {
                  if (co.list && co.list.length > 0) {
                    co.list.forEach(li => {
                      if (li.component && li.component == component.uuid) {
                        this.hasRule = true;
                      }
                    });
                  }
                });
              }
            });
          }
        },
        deep: true,
        immediate: true
      },
      'config.label': {
        handler: function(val) {
          if (this.allconfig.col) {
            let prevText = Vm.$hot.getDataAtCell(this.allconfig.row, this.allconfig.col - 1);
            if (typeof prevText == 'string' && !prevText) {
              // preText 左边没有值，名称替换，否则不替换
              Vm.$hot.setDataAtCell(this.allconfig.row, this.allconfig.col - 1, val);
            }
          }
        }
      }
    },
    template: `
        <div>
            <div class="cellComponent" :uuid="config.uuid" v-if="config.uuid" :id="'comuuid_'+config.uuid">
                <div style="height: 0; position: relative;">
                  <i @mousedown.stop @click.stop="removeComponent" class="tsfont-close-s remove" style="position: absolute; top: -3px; right: -3px;" />
                </div>
                <div class="cell-container">
                  <CellCom ref="cell" :setting="config" :formView="formView" :componentList="componentList"></CellCom>
                </div>
            </div>
            <div class="tips">
              <div class="tsfont-lightning cursor-pointer btn-showrule text-warning" v-if="hasRule" @mousedown.stop @click.stop="showRule"></div>
              <div class="tsfont-eye-off text-danger" v-if="config.config && config.config.isHide"></div>
              <div class="tips-valid" v-if="config.config && config.config.validList && config.config.validList.length>0">
                <Tooltip transfer theme="light">
                    <div class="tsfont-danger-s text-danger"></div>
                    <div slot="content">
                    <div v-html="getValidMessage(config.config.validList) || config.config.validList.join('<br/>')"></div>
                    </div>
                </Tooltip>
              </div>
            </div>
        </div>
      `
  });
}
const defaultBorderColor = {
  left: { color: '#333' },
  top: { color: '#333' },
  right: { color: '#333' },
  bottom: { color: '#333' }
};
// <i class="tsfont-danger-s celltips" v-if="!config.isValid"></i>
const cellComponetVms = {};

function formCellTypes(instance, td, row, col, prop, value, cellProperties) {
  if (value) {
    try {
      const vm = cellComponent(value, td, row, col);
      const div = document.createElement('div');
      td.innerHTML = '';
      td.setAttribute('class', 'component-tr component-tr-' + value.vm);
      td.appendChild(div);
      value.vm && cellComponetVms[value.vm] && cellComponetVms[value.vm].$destroy(true);
      value.vm = value.component.uuid;
      // eslint-disable-next-line new-cap
      cellComponetVms[value.vm] = new vm().$mount(div);
      // 关掉单元格的编辑功能
      // cellProperties.readOnly = true;
      cellProperties.editor = false;
    } catch (e) {
      console.error(e);
    }
  }
}

const initSetting = {
  // 提取出来主要是为了避免引用数据被改变，导致新建表单时出现上一个表单的数据
  language: 'zh-CN',
  readOnlyCellClassName: 'plugin-tr',
  persistentState: true,
  copyable: true,
  fillHandle: false,
  headerTooltips: true,
  columnHeaderHeight: 38,
  width: '100%',
  colWidths: 170,
  rowHeights: 45,
  data: Handsontable.helper.createEmptySpreadsheetData(10, 5),
  startRows: 10,
  renderer: 'formCell',
  editor: 'formCell',
  minCols: 1,
  minRows: 1,
  maxCols: 20,
  maxRows: 80,
  rowHeaders: true,
  colHeaders: true,
  allowHtml: true,
  manualColumnResize: true,
  manualRowResize: true,
  autoColumnSize: true,
  autoRowSize: false,
  autoWrapRow: true,
  mergeCells: true,
  selectionMode: 'range',
  outsideClickDeselects: false,
  customBorders: [
    {
      row: 2,
      col: 2,
      ...defaultBorderColor
    }
  ],
  className: 'defaultStyle htMiddle htRight',
  // dataSchema: {content: 1111, type: 'formtext', row: 0, col: 0},
  // contextMenu: {
  //   callback(){
  //     console.log('44444444444444---------')
  //   }
  // },
  contextMenu: {
    items: {
      mergeCells: {},
      row_above: {
        name: '向上插一行'
      },
      row_below: {
        name: '向下插一行'
      },
      col_left: {
        name: '向左插一列'
      },
      col_right: {
        name: '向右插一列'
      },
      hsep1: '---------',
      remove_row: {
        name: '删除当前行'
      },
      remove_col: {
        name: '删除当前列'
      },
      undo: {
        name: '撤销'
      },
      hsep2: '---------',
      copy: {
        name: '复制'
      },
      cut: {
        name: '剪切'
      },
      paste: {
        name: '<div id="handsontableCopy">粘贴</div>',
        isCommand: false // Prevent clicks from executing command and closing the menu
      }
      // visible_row: {
      //   name: '设置当前行',
      //   callback: function() {
      //     console.log('asdfaaaaaaaaaaaaaaaaa');
      //   },
      // }
    }
  }
};

const hotSetting = {
  afterOnCellMouseDown(e) {
    Vm.setStyleFlag = true;
  },
  afterOnCellMouseUp() {
    Vm.setStyleFlag = false;
  },
  afterChange: changes => {
    changes &&
      changes.forEach(([row, prop, oldValue, newValue]) => {
        if (oldValue && oldValue.component && !newValue) {
          Vm.removeComponent(oldValue.component.uuid, oldValue.component.handler);
          if (Vm.formeditContent && oldValue.component.uuid === Vm.formeditContent.uuid) {
            Vm.cancelComponent();
          }
          const cellMeta = Vm.$hot.getCellMeta(row, prop);
          delete cellMeta.editor;
        }
      });
  },
  afterSelection(row, column, row2, column2, preventScrolling, selectionLayerLevel) {
    const cellData = Vm.$hot.getDataAtCell(row, column);
    if (cellData && cellData.component && !Vm.componentRuleuuid) {
      Vm.editComponent(cellData.component.uuid, cellData.component.handler);
      Vm.editCellData = cellData;
    } else {
      Vm.cancelComponent();
      Vm.componentRuleuuid = null;
    }
    if (row === row2 && column === column2) {
      Vm.setSelectedStyle((cellData && cellData.style && Object.keys(cellData.style).length && cellData.style) || defaultSelectedStyle);
    } else {
      Vm.setSelectedStyle(defaultSelectedStyle);
    }
  },
  beforeRemoveCol(index, amount, physicalRows, source) {
    // 在删除列之前，把对应controllerList里面的数据进行做删除标记
    var arry = Vm.$hot.getData(0, index, Vm.$hot.countRows(), index + amount - 1);

    arry.forEach(function(row, i) {
      row.forEach(function(col, c) {
        col && col.component && col.component.uuid && Vm.removeComponent(col.component.uuid, col.component.handler);
      });
    });
  },
  beforeRemoveRow(index, amount, physicalRows, source) {
    // 在删除行之前，把对应controllerList里面的数据进行做删除标记
    var arry = Vm.$hot.getData(index, 0, index + amount - 1, Vm.$hot.countCols());
    arry.forEach(function(row, i) {
      row.forEach(function(col, c) {
        col && col.component && col.component.uuid && Vm.removeComponent(col.component.uuid, col.component.handler);
      });
    });
  },
  afterColumnResize(currentRow, newSize) {
    Vm.$hot.getPlugin('ManualColumnResize').setManualSize(currentRow, Math.floor(newSize / 10) * 10);
    Vm.$hot.render();
  },
  afterRowResize(row, newSize) {
  },
  afterRemoveRow(index, amount, physicalRows, source) {
    var arry = Vm.$hot.getData();
    Vm.rowLength = arry.length;
  },
  afterCreateRow() {
    var arry = Vm.$hot.getData();
    Vm.rowLength = arry.length;
  },
  afterUndo(action) {
    // console.log(action);
    // Vm.$hot.render();
    // console.log(Vm.$hot.getData());
    action.data && action.data.forEach(item => {
      item && item.forEach(com => {
        com && Vm.setCellData(com);
      });
    });
  },
  beforeMergeCells(cellRange) {
    const cells = [];
    if (!Vm.$hot) return;
    for (let i = cellRange.from.row; i <= cellRange.to.row; i++) {
      for (let j = cellRange.from.col; j <= cellRange.to.col; j++) {
        const cellData = Vm.$hot.getDataAtCell(i, j);
        cells.push([i, j, cellData, 'merge']);
      }
    }
    let firstData = '';
    cells.forEach(arr => {
      if (arr[2] && !firstData) firstData = arr[2];
      arr[2] = '';
    });
    const aa = Vm.controllerList.find(d => firstData && firstData.component && firstData.component.uuid === d.uuid);

    Vm.$hot.setDataAtCell(cells);
    Vm.afterMergeData = [firstData, aa];
  },
  afterMergeCells(cellRange) {
    if (Vm.afterMergeData && Vm.afterMergeData[0]) {
      if (Vm.afterMergeData[1]) {
        // Vm.controllerList.push(Vm.afterMergeData[1]);
        // 切到編輯
        Vm.editComponent(Vm.afterMergeData[1].uuid, Vm.afterMergeData[1].handler);
        Vm.editCellData = Vm.afterMergeData[0];
      }
      if (typeof Vm.afterMergeData[0] === 'object') {
        Vm.afterMergeData[0].row = cellRange.from.row;
        Vm.afterMergeData[0].col = cellRange.from.col;
      }
      Vm.$hot.setDataAtCell(cellRange.from.row, cellRange.from.col, Vm.afterMergeData[0], 'merge');
      Vm.afterMergeData = '';
    }
  },
  afterLoadData() {},
  afterContextMenuShow() {
    //主要针对粘贴，进行特殊处理
    let $menu = document.querySelector('.htMenu.htContextMenu.handsontable #handsontableCopy');
    if ($menu) {
      $menu.onclick = function(event) {
        Vm.copyFn();
        event.stopPropagation();
      };
    }
  },
  afterCopy() {
    Vm.copyConfig = {
      componentList: arguments[0],
      cell: arguments[1][0],
      type: 'copy'
    };
  },
  afterCut() {
    Vm.copyConfig = {
      componentList: arguments[0],
      cell: arguments[1][0],
      type: 'cut'
    };
  },
  beforePaste() {
    if (Vm.copyConfig) {
      let cell = arguments[1][0];
      // 如果拖动的单元格已经有了组件着需要删除组件c

      let newList = [];
      let selectCell = {};
      Vm.copyConfig.componentList &&
        Vm.copyConfig.componentList.forEach(item => {
          item.forEach(c => {
            if (c && (c.component || c.content)) {
              let oldCell = Vm.copyConfig.cell;
              let copycom = c.component ? _this.controllerList.find(item => item.uuid == c.component.uuid) : null;
              let ccopy = Vm.$utils.deepClone(copycom ? Object.assign(c, {component: copycom}) : c);
              ccopy.col = ccopy.col - oldCell.startCol + cell.startCol;
              ccopy.row = ccopy.row - oldCell.startRow + cell.startRow;
              newList.push(ccopy);
              selectCell.startRow = selectCell.startRow !== undefined && selectCell.startRow < ccopy.row ? selectCell.startRow : ccopy.row;
              selectCell.endRow = selectCell.endRow !== undefined && selectCell.endRow > ccopy.row ? selectCell.endRow : ccopy.row;
              selectCell.startCol = selectCell.startCol !== undefined && selectCell.startCol < ccopy.col ? selectCell.startCol : ccopy.col;
              selectCell.endCol = selectCell.endCol !== undefined && selectCell.endCol > ccopy.col ? selectCell.endCol : ccopy.col;
            }
          });
        });
      selectCell.startRow = selectCell.startRow === undefined ? cell.startRow : selectCell.startRow;
      selectCell.endRow = selectCell.endRow === undefined ? cell.endRow : selectCell.endRow;
      selectCell.startCol = selectCell.startCol === undefined ? cell.startCol : selectCell.startCol;
      selectCell.endCol = selectCell.endCol === undefined ? cell.endCol : selectCell.endCol;
      const oldComponent = Vm.$hot.getData(selectCell.startRow, selectCell.startCol, selectCell.endRow, selectCell.endCol);
      let oldList = [];
      oldComponent.forEach(item => {
        item &&
          item.length > 0 &&
          item.forEach(c => {
            c && (c.component || c.content) && oldList.push(c);
          });
      });

      if (oldList.length > 0) {
        Vm.$createDialog({
          title: '警告',
          content: '选中的区域不为空,复制之后将覆盖原来数据,确定复制数据？',
          'on-ok': function(vnode) {
            Vm.copyComponent(oldList, newList, selectCell);
            vnode.isShow = false;
          },
          'on-close': function() {
            Vm.copyConfig = '';
          }
        });
      } else {
        Vm.copyComponent(oldList, newList, selectCell);
      }
    } else {
      Vm.copyConfig = '';
    }

    return false;
  }
};

const defaultSelectedStyle = {
  fontSize: 'normal',
  fontWeight: 'normal',
  color: '',
  background: '',
  verticalAlign: 'middle',
  textAlign: 'right',
  border: 'none'
};

import FormEdit from './edit/formedit-global.vue';
export default {
  name: 'TsSheet',
  inject: {
    $labelName: {
      default: {}
    }
  },
  components: {
    // HotTable,
    FormEdit,
    FormcomEdit: resolve => require(['./edit/formedit-content.vue'], resolve),
    SheetStylesetting
  },
  props: {
    contentJson: {
      type: Object
    },
    isFormedit: Boolean
  },
  data() {
    return {
      selectedStyle: {
        // 样式栏的参数设置
        ...defaultSelectedStyle
      },
      borderColor: {
        ...defaultBorderColor
      },
      borderStyle: 'underline', // 表单组件的边框样式
      setStyleFlag: true,
      controllerList: [], // 组件数据
      sheetsConfig: {}, // 布局数据
      formeditContent: null, // 编辑组件弹窗的数据
      isEditcomponent: false, // 是否显示编辑组件
      editContentUuid: '', // 正在编辑的组件的uuid
      validList: 'false', // 校验不通过的信息
      validCardOpen: false, // 是否打开校验面板
      rowLength: 10, //table多少行
      globalSetting: { defaultHiderow: [], ruleList: [], scriptsConfig: '' }, //全局的表单参数
      editWidth: 'normal', //编辑侧滑窗宽度是否需要变大
      editWithlist: ['normal', 'large'], //2个尺寸
      highlightuuid: null, //新增高亮哪一个组件
      rulevalidList: [], // 联动规则校验不通过的信息，需要跟组件校验的信息分开防止id定位问题
      componentRuleuuid: null //当前需要单独展示联动规则的组件uuid
    };
  },
  beforeCreate() {
    Object.assign(hotSetting, JSON.parse(JSON.stringify(initSetting)));
  },
  created() {
    window.addEventListener('touchmove’', function() {}, { passive: false });
  },
  mounted() {
    _this = this;
    Vm = this;
    this.$nextTick(function() {
      this.fromJson();
      _this.$emit('updateContent', _this.getSheetdata()); // 20200214_zqp_修复由于后台改变前端数据顺序导致的序列化后数据位置不一致
    });

    window.vm = this;

    // 处理resize
    // let timeoutCount = "";
    // this.resizeHot = () => {
    //   clearTimeout(timeoutCount);
    //   timeoutCount = setTimeout(() => {
    //     this.$hot.render();
    //   }, 200);
    // };
    // window.addEventListener("resize", this.resizeHot);
  },
  destroyed() {
    // window.removeEventListener("resize", this.resizeHot);
  },
  methods: {
    fromJson() {
      this.controllerList = (this.contentJson && this.contentJson.controllerList) || [];
      this.oldcontrollerList = (this.contentJson && this.contentJson.controllerList) || [];
      this.globalSetting = (this.contentJson && this.contentJson.globalSetting) || { ruleList: [], defaultHiderow: [], scriptsConfig: '' };
      this.sheetsConfig = (this.contentJson && this.contentJson.sheetsConfig) || {};
      this.tableList = this.sheetsConfig ? this.sheetsConfig.tableList : hotSetting.data || [];

      //把原来挨个组件的联动提取到全局表单设置
      let oldRulelist = [];
      if (this.controllerList && this.controllerList.length > 0) {
        this.controllerList.forEach(con => {
          if (con.config && con.config.ruleList && con.config.ruleList.length > 0) {
            con.config.ruleList.forEach(r => {
              let item = {
                conditionList: [
                  {
                    rel: 'and',
                    list: [
                      {
                        component: con.uuid,
                        expression: r.conditionConfig.expression,
                        rel: 'and',
                        value: r.conditionConfig.value
                      }
                    ]
                  }
                ],
                actionList: []
              };
              if (r.actionList && r.actionList.length > 0) {
                let newAction = r.actionList.map(a => {
                  return {
                    component: a.unit == 'component' ? a.value : a.type == 'setvalue' ? a.unit : '',
                    action: a.type,
                    type: a.unit,
                    value: a.unit == 'row' || a.type == 'setvalue' ? a.value : ''
                  };
                });
                Object.assign(item, {
                  actionList: newAction
                });
              }
              oldRulelist.push(item);
            });
          }
        });
        if (oldRulelist.length > 0) {
          Object.assign(this.globalSetting, {
            ruleList: oldRulelist
          });
          this.$nextTick(() => {
            this.controllerList.forEach(con => {
              con.config.ruleList = [];
            });
          });
        }
      }
      // this.borderStyle = this.sheetsConfig.borderType||'underline';
      hotSetting.data = this.tableList || hotSetting.data;
      hotSetting.mergeCells = this.sheetsConfig.mergeList || [];
      if (this.sheetsConfig.headerList && this.sheetsConfig.headerList.length) {
        const arr = this.sheetsConfig.headerList;

        for (let i = 0; i < this.tableList[0].length; i++) {
          if (!arr[i]) {
            arr[i] = hotSetting.colWidths;
          }
        }
        hotSetting.colWidths = this.sheetsConfig.headerList;
      }
      if (this.sheetsConfig.lefterList && this.sheetsConfig.lefterList.length) {
        const arr = this.sheetsConfig.lefterList;
        for (let i = 0; i < this.tableList[0].length; i++) {
          if (!arr[i]) {
            arr[i] = hotSetting.rowHeights;
          }
        }
        // hotSetting.rowHeights = this.sheetsConfig.lefterList;
      }
      if (this.sheetsConfig.mergeList && this.sheetsConfig.mergeList.length) {
        hotSetting.mergeList = this.sheetsConfig.mergeList;
      }
      // border
      hotSetting.customBorders = this.sheetsConfig.customBorders || [];
      // manual
      // hotSetting.manualRowResize = hotSetting.data[0].map((d,i) => Array.isArray(this.sheetsConfig.lefterList) ? this.sheetsConfig.lefterList[i] || 45 : this.sheetsConfig.lefterList);
      hotSetting.manualRowResize = this.sheetsConfig.lefterList && this.sheetsConfig.lefterList.length > 0 ? this.sheetsConfig.lefterList : hotSetting.data.map(item => hotSetting.rowHeights);
      // hotSetting.manualColumnResize = hotSetting.data.map((d,i) => Array.isArray(hotSetting.colWidths) ? hotSetting.colWidths[i] || 170 : hotSetting.colWidths);
      hotSetting.manualColumnResize = this.sheetsConfig.headerList && this.sheetsConfig.headerList.length > 0 ? this.sheetsConfig.headerList : hotSetting.data[0].map(item => hotSetting.colWidths);
      this.$hot = new Handsontable(this.$refs.hotContainer, hotSetting);
      this.rowLength = (this.tableList && this.tableList.length) || 10;
      // window.hot = this.$hot;
      setTimeout(() => {
        this.$hot.render();
      }, 0);
    },
    setCellData(data) {
      if (Array.isArray(data)) {
        this.$hot.setDataAtCell(data);
      } else {
        this.$hot.setDataAtCell(data.row, data.col, data);
      }
    },
    getCellData(data) {
      return this.$hot.setDataAtCell(data.row, data.col);
    },
    drop: function(event) {
      const target = this.getTd(event.target);
      if (target) {
        let dropConfig = event.dataTransfer.getData('item');
        dropConfig = dropConfig ? JSON.parse(dropConfig) : {};
        //扩展组件拖动
        if (dropConfig.isFooter) { //拖动到底部，不显示在表单
          let isExist = this.controllerList.find(item => item.handler == dropConfig.handler && !item.config.componentDelete);
          if (!isExist || dropConfig.addMultiple == 'true') {
            let config = {uuid: this.$utils.setUuid(), handler: dropConfig.handler, label: dropConfig.name, type: dropConfig.type, config: {icon: dropConfig.icon}};
            this.addComponent(config);
            this.editComponent(config.uuid, config.handler);
          } else {
            this.$Message.warning('组件已经存在');
          }
          return;
        }

        //  基础组件拖动
        const Coords = Vm.$hot.getCoords(target); //获取元素的坐标
        const rowindex = Coords.row;
        const colindex = Coords.col;
        const component = {
          row: rowindex,
          col: colindex,
          style: { verticalAlign: 'middle' },
          component: {
            handler: dropConfig.handler,
            uuid: this.$utils.setUuid(),
            label: dropConfig.name,
            config: { validList: [], width: '75%', ruleList: [] }
          }
        };

        // 如果拖动的单元格已经有了组件着需要删除组件
        const oldComponent = Vm.$hot.getDataAtCell(rowindex, colindex);
        if (oldComponent && oldComponent.component) {
          this.removeComponent(oldComponent.component.uuid, oldComponent.component.handler);
        }
        // 添加组件编辑数据
        this.addComponent(component.component);
        this.editCellData = component;
        // 设置单元格的值
        this.setCellData(component);
        // 选中单元格
        this.$hot.selectCell(component.row, component.col, component.row, component.col);
      }
    },
    getTd: function(target) {
      // 获取td一层
      if (target.nodeName.indexOf('TD') !== -1) {
        return target;
      }
      while (target.nodeName.indexOf('TD') === -1 && target.className.indexOf('handsontable') < 0) {
        target = target.parentNode;
      }
      if (target.className.indexOf('handsontable') > -1) {
        target = null;
      }
      return target;
    },
    getSheetdata: function() {
      let controllerListUuid = []; //组件uuid
      let mergeData = this.$hot.getPlugin('MergeCells').mergedCellsCollection.mergedCells || [];
      mergeData = mergeData.map(d => ({
        row: d.row,
        col: d.col,
        rowspan: d.rowspan,
        colspan: d.colspan
      }));
      let allData = this.$hot.getData();
      const lefterList = this.$hot.getPlugin('ManualRowResize').manualRowHeights;
      //获取头部宽度
      const headerList = [];
      this.$hot.getColHeader().forEach((item, index) => {
        headerList.push(this.$hot.getColWidth(index));
      });
      let allWidth = headerList.reduce((acc, cur) => acc + cur);
      let perWidthList = headerList.map(width => width / allWidth * 100 + '%');
      //this.headerList =this.$hot.getPlugin('ManualColumnFreeze').manualColumnWidths;
      const customBorders = this.$hot.getPlugin('customBorders').getBorders();
      allData = allData.map((d, i) => {
        return d.map((c, j) => {
          if (c) {
            if (Handsontable.helper.isObject(c)) {
              //小屏时：展示的组件无vm
              c.component && c.component.uuid && controllerListUuid.push(c.component.uuid); //获取所有组件uuid
              if (c.hasOwnProperty('vm')) {
                // c.component && c.component.uuid && controllerListUuid.push(c.component.uuid); //获取所有组件uuid
                // 组件数据
                return {
                  row: i,
                  col: j,
                  component: c.component,
                  content: '',
                  style: c.style || {}
                };
              } else {
                // 文本数据
                c.content = (c.content && c.content) || '';
                return c;
              }
            } else {
              return {
                row: i,
                col: j,
                content: c
              };
            }
          } else return '';
        });
      });
      this.controllerList = this.controllerList.filter(item => {
        !item.config.hasOwnProperty('value') && (item.config.value = null);
        return !item.config.componentDelete;
      });
      this.controllerList = this.controllerList.filter(item => { //过滤掉表格中不存在的组件
        return item.handler == 'formpriority' ? true : controllerListUuid.includes(item.uuid);
        // 不过滤修改优先级组件，修改优先级组件，不在中间TsSheet 区域，解决修改优先级组件编辑时，不显示问题
      });
      const formdata = {
        sheetsConfig: {
          tableList: allData,
          mergeList: mergeData,
          lefterList: lefterList,
          headerList: headerList,
          customBorders: customBorders,
          perWidthList: perWidthList
        },
        controllerList: this.controllerList,
        globalSetting: this.globalSetting
      };
      return formdata;
    },
    setSelectedStyle(style) {
      Object.assign(this.selectedStyle, style || defaultSelectedStyle);
      this.oldSelectedStyle = this.$utils.deepClone(this.selectedStyle);//记录选中的样式，主要是为了给后面存在多选时设置只，防止样式被覆盖
    },
    setCellBorder(data) {
      if (!this.$hot) return;
      if (data) {
        this.$hot.getPlugin('customBorders').setBorders(this.$hot.getSelectedRange(), data);
      } else {
        this.$hot.getPlugin('customBorders').clearBorders(this.$hot.getSelectedRange());
      }
    },
    autoRowHeight() {
      this.$hot.getPlugin('autoRowSize').recalculateAllRowsHeight();
    },
    addComponent: function(config) {
      const _this = this;
      // 添加组件
      const newComponent = {
        uuid: config.uuid,
        handler: config.handler,
        label: (config.label || _this.$labelName[config.handler]) + '_' + (this.controllerList.length + 1),
        type: config.type || 'form',
        config: Object.assign(config.config || {}, _this.getComponentsetting(config.handler)) 
        // isValid:true
      };
      this.controllerList.push(newComponent);
    },
    removeComponent: function(uuid, handler, isDelete) {
      // 删除组件，20200202由于最终数据结构不以uuid为每个组件数组的键名，需遍历组件数组里uuid等于当前组件(并且组件类型一致)的再删除这个下标
      let index = null;
      this.formeditContent && this.formeditContent.uuid == uuid ? this.formeditContent = null : '';
      const item = this.controllerList.find((d, i) => { 
        if (d.uuid === uuid) {
          index = i; 
          return d.uuid === uuid; 
        }
        return false;
      });
      if (item && isDelete) {
        this.controllerList.splice(index, 1);
      } else if (item) {
        item.config.componentDelete = true;
      }
    },
    editComponent(uuid, type) {
      if (this.formeditContent && this.formeditContent.uuid != uuid) {
        // 去除重复点击时的校验
        this.$refs.refFormeditContent && this.$refs.refFormeditContent.validComponent(); // 改变组件数据时校验数据
      }
      const component = this.controllerList.find(d => d.uuid === uuid);
      this.formeditContent = component;
      this.editContentUuid = uuid;
      this.isEditcomponent = true;
      this.$emit('closeEditform');
    },
    cancelComponent() {
      this.$refs.refFormeditContent && this.$refs.refFormeditContent.validComponent(); // 当关闭右边编辑时进行校验
      this.formeditContent = null;
      this.editContentUuid = '';
      this.isEditcomponent = false;
      this.editCellData = null;
    },
    updateComponent(uuid, key, value) {
      // 更新编辑组件的编辑信息
      const component = this.controllerList.find(d => d.uuid === uuid);
      if (component) {
        this.$set(component, key, value); // 解决component为空时，拖动组件，控制台报错问题
      }
      // component[key] = value;
      if (key == 'handler') {
        this.editCellData.component.handler = value;
        delete this.editCellData.vm;
        this.setCellData(this.editCellData);
      }
    },
    updateStyle(key, value) {},
    validItemClick(uuid) {
      // 选中指定的组件
      const tableList = this.$hot.getData();
      let tableSetting = false;
      for (let a = 0; a < tableList.length; a++) {
        for (let b = 0; b < tableList[a].length; b++) {
          const td = tableList[a][b];
          if (td && td.component && td.component.uuid == uuid) {
            tableSetting = { col: td.col, row: td.row };
            break;
          }
        }
        if (tableSetting) {
          break;
        }
      }
      if (tableSetting) {
        this.$hot.selectCell(tableSetting.row, tableSetting.col, tableSetting.row, tableSetting.col, true);
      } else {
        this.editComponent(uuid);
      }
      this.$nextTick(function() {
        _this.$refs.refFormeditContent && _this.$refs.refFormeditContent.validComponent();
      });
    },
    validRule(item) {
      this.$emit('openEditform');
      this.$nextTick(() => {
        this.$refs.formedit && _this.$refs.formedit.validItem('rule', item);
      });
    },
    getValidList(validateList) {
      // 额外处理组件名称重复的验证规则和兼容之前旧验证规则
      let validList = [];
      if (validateList && validateList.length > 0) {
        validateList.forEach((item) => {
          if (item.hasOwnProperty('type')) {
            validList.push(item.message);
          } else {
            validList.push(item);
          }
        });
      }
      return validList;
    },
    getRepeatLabelUuidList() {
      // 根据label相同，合并id
      let uuidLabelList = []; // 重复label的所有id
      let uuidList = []; // 所有有label的uuid集合
      this.controllerList && this.controllerList.forEach((item) => {
        let newLabel = uuidLabelList.find((i) => i.label == item.label);
        if (!newLabel) {
          uuidLabelList.push({label: item.label, uuids: [item.uuid]});
        } else {
          newLabel.uuids.push(item.uuid);
        }
      });
      uuidLabelList && uuidLabelList.forEach((item) => {
        if (item.uuids && item.uuids.length >= 2) {
          uuidList.push(...item.uuids);
        }
      });
      return uuidList;
    },
    validComponent(uuid) {
      // 校验组件是否通过
      const _this = this;
      let repeatLabelUuidList = this.getRepeatLabelUuidList();
      _this.$refs.refFormeditContent && _this.$refs.refFormeditContent.validComponent();
      let validList = false;
      if (repeatLabelUuidList && repeatLabelUuidList.length == 0) {
        // 无组件名称重名，去掉多余验证重名规则
        _this.controllerList.forEach(item => {
          if (item.config.validList && item.config.validList.length > 0 && !item.config.componentDelete) {
            item.config.validList.forEach((innerItem, index) => {
              if (innerItem.hasOwnProperty('type') && innerItem.type == 'nameRepeat') {
                item.config.validList.splice(index, 1); // 删除某个对象
              }
            });
          }
        });
      }
      _this.controllerList.forEach((item, index) => {
        if (item.config.validList && item.config.validList.length > 0 && !item.config.componentDelete) {
          typeof validList == 'object' ? '' : (validList = {});
          validList[item.uuid] = _this.getValidList(item.config.validList);
        }
      });
      if (repeatLabelUuidList && repeatLabelUuidList.length > 0) {
        // 有组件重名，但是没有点击某个组件验证时，需要找到重名组件，添加验证规则
        let uuidList = repeatLabelUuidList;
        let validIdList = Object.keys(validList);
        if (typeof validList == 'object') {
          uuidList = uuidList && uuidList.filter((item) => {
            return !validIdList.includes(item);
          });
          uuidList && uuidList.forEach((item) => {
            validList[item] = ['名称：组件名称已存在'];
          });
        } else if (typeof validList == 'boolean') {
          validList = {};
          uuidList.forEach((item) => {
            validList[item] = ['名称：组件名称已存在'];
          });
        }
      }
      _this.$set(_this, 'validList', validList);
      // 校验联动规则是否完整
      let rulevalidList = [];
      if (_this.globalSetting && _this.globalSetting.ruleList && _this.globalSetting.ruleList.length > 0) {
        _this.globalSetting.ruleList.forEach((rule, rindex) => {
          if (rule.conditionList && rule.conditionList.length > 0) {
            //条件没填写完成
            let isPass = true;
            rule.conditionList.forEach((con, cindex) => {
              if (con.list && con.list.length > 0) {
                con.list.forEach(li => {
                  if (!li.component || !li.expression) {
                    isPass = false;
                  }
                });
              }
            });
            if (!isPass) {
              rulevalidList.push({ text: '表单设置：第' + _this.toChinese((rindex + 1).toString()) + '个联动的条件填写不完整', index: rindex, type: 'condition' });
            }
          }
          if (rule.actionList && rule.actionList.length > 0) {
            //动作没填写完成
            let isFinish = true;
            rule.actionList.forEach(action => {
              if (!action.action) {
                isFinish = false;
              } else if (action.type == 'component' && !action.component) {
                isFinish = false;
              } else if (action.type == 'row' && (!action.value || action.value.length < 0)) {
                isFinish = false;
              }
            });
            if (!isFinish) {
              rulevalidList.push({ text: '表单设置：第' + _this.toChinese((rindex + 1).toString()) + '个联动的动作填写不完整', index: rindex, type: 'action' });
            }
          }
        });
      }
      if (this.isFormedit) {
        this.$nextTick(() => {
          this.$refs.formedit && _this.$refs.formedit.validItem();
        });
      }
      _this.$set(_this, 'rulevalidList', rulevalidList);
      if (_this.validList || _this.rulevalidList.length > 0) {
        _this.validCardOpen = true;
        return false;
      }
      return true;
    },
    getComponentsetting(type) {
      // 通过不同的组件类型来初始化组件config数据
      // 组件自定义属性
      var config = {};
      if (initComponentConfig[type]) {
        config = initComponentConfig[type];
      } else {
        config = initComponentConfig.common;
      }
      return JSON.parse(JSON.stringify(config));
    },
    closeEditform() {
      this.$emit('closeEditform');
    },
    toggleWidth() {
      if (this.isFormedit) {
        this.editWidth == 'large' ? (this.editWidth = 'normal') : (this.editWidth = 'large');
      } else {
        this.editWidth = 'normal';
      }
    },
    hightlight(uuid) {
      this.highlightuuid = uuid || null;
    },
    adjustWidth(width) {
      //console.log(width);
    },
    getFormrulelength(list) {
      this.$emit('getFormrule', list.length || 0);
    },
    toChinese: function(values) {
      let len = values.length; //统计出长度
      let arr = [];
      let chin_list = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
      let chin_lisp = ['万', '千', '百', '十'];

      for (let i = 0; i < len; i++) {
        arr.push(Math.floor(values[i])); //输入的数据按下标存进去   存进去的只是数字
        arr[i] = len == 2 && arr[i] == '1' && i == 0 ? '' : chin_list[arr[i]]; //是根据我们输入的输入的数字，对应着我们的chin_list这个数组
      } //123['壹','佰','贰','拾','叁']
      for (let i = len - 1, j = 1; i > 0; i--) {
        //i =2	1		//倒序		为了添加进制，方便我们去观看
        arr.splice(i, 0, chin_lisp[chin_lisp.length - j++]); //j=2
      }
      return arr.join('');
    },
    showComponentrule(uuid) {
      this.componentRuleuuid = uuid || null;
      this.$emit('openEditform');
    },
    copyComponent(oldList, newList, selectCell) {
      let _this = this;
      oldList.forEach(c => {
        Vm.$hot.setDataAtCell(c.row, c.col, '');
        if (c.component) {
          c.component.componentDelete = true;
          this.removeComponent(c.component.uuid, c.component.handler);
        }
      });
      //把数据赛道表格中
      newList.forEach(ccopy => {
        if (ccopy && (ccopy.component || ccopy.content)) {
          if (_this.copyConfig.type == 'copy' && ccopy.component) {
            ccopy.vm = ccopy.component.uuid = _this.$utils.setUuid();
            ccopy.label = ccopy.label + 'copy';
            _this.controllerList.push(ccopy.component);
          } else {
            _this.$hot.setDataAtCell(ccopy.row, ccopy.col, ccopy.content);
          }
          ccopy.component && _this.$hot.setDataAtCell(ccopy.row, ccopy.col, ccopy);
        }
      });
      this.$hot.selectCell(selectCell.startRow, selectCell.startCol, selectCell.endRow, selectCell.endCol);
      this.copyConfig = '';
    },
    copyFn() {
      if (this.copyConfig) {
        let cell = this.$hot.getSelected()[0];
        cell && cell.length > 0 && hotSetting.beforePaste('', [{ startRow: cell[0], startCol: cell[1], endRow: cell[2], ednCol: cell[3] }]);
      }
    },
    setClassNameByColorPicker(type, value) {
      // 设置拾色器值
      let colorPicker = {
        '#EFF0F3': 'color-picker-th-',
        '#F5F6FA': 'color-picker-',
        '#E5E5E5': 'color-picker-border-',
        '#A1A1A1': 'color-picker-tip-',
        '#212121': 'color-picker-text-', 
        '#1670F0': 'color-picker-info-',
        '#FFBA5A': 'color-picker-warning-',
        '#25B864': 'color-picker-success-',
        '#F33B3B': 'color-picker-error-',
        '#E7F0FF': 'color-picker-info-grey-',
        '#FFF5E7': 'color-picker-warning-grey-',
        '#E4F6EC': 'color-picker-success-grey-',
        '#F8E3E3': 'color-picker-error-grey-',
        '#F9F9F9': 'color-picker-form-sheet-style-setting-'
      };
      return colorPicker[value] + type;
    }
  },
  computed: {
    getComponentList() {
      const componetList = [];
      this.controllerList.forEach(item => {
        if (!item.config.hasOwnProperty('componentDelete')) {
          componetList.push({
            value: item.uuid,
            text: item.label,
            handler: item.handler
          });
        }
      });
      return componetList;
    },
    setContentclass() {
      let contenclass = '';
      if ((this.formeditContent && this.isEditcomponent) || this.isFormedit) {
        contenclass = 'rightContent';
      } else {
        contenclass = 'rightContent hideedit';
      }
      if (this.isFormedit) {
        contenclass += ' largewidth';
      }
      return contenclass;
    }
  },
  watch: {
    borderStyle(newValue, oldValue) {
      // 选中单元格
      // this.$hot.selectCell(
      //   component.row,
      //   component.col,
      //   component.row,
      //   component.col
      // );
    },
    selectedStyle: {
      handler(newValue, oldValue) {
        if (this.setStyleFlag) return;
        const selecedCells = this.$hot.getSelected();
        if (!selecedCells) return;
        const cellsData = [];
        selecedCells.forEach(arr => {
          if (arr[0] > arr[2]) {
            const a = arr[0];
            arr[0] = arr[2];
            arr[2] = a;
          }
          if (arr[1] > arr[3]) {
            const a = arr[1];
            arr[1] = arr[3];
            arr[3] = a;
          }
          for (let i = arr[0]; i <= arr[2]; i++) {
            for (let j = arr[1]; j <= arr[3]; j++) {
              var cellData = this.$hot.getDataAtCell(i, j);
              if (cellData && typeof (cellData) == 'object' && !cellData.hasOwnProperty('style')) {
                // 解决设置颜色报错问题
                cellData.style = {};
              }
              let className = '';
              if (cellData && typeof cellData === 'object') {
                for (let key in newValue) {
                  if (newValue[key] != this.oldSelectedStyle[key]) {
                    cellData.style[key] = newValue[key];
                  } else if (key == 'border') {
                    cellData.style[key] = newValue[key]; // 修复点击多次边框，预览边框样式不生效问题
                  }
                }
                // cellData.style = JSON.parse(JSON.stringify(Object.assign(cellData.style, newValue)));
                if (cellData && cellData.hasOwnProperty('style')) {
                  if (cellData.style['background']) {
                    if (cellData.style['color']) {
                      className = _this.setClassNameByColorPicker('color', [cellData.style['color']]) + ' ' + _this.setClassNameByColorPicker('bg', [cellData.style['background']]);
                    } else {
                      className = _this.setClassNameByColorPicker('bg', [cellData.style['background']]);
                    }
                  } else if (cellData.style['color']) {
                    if (className) {
                      className += ' ' + _this.setClassNameByColorPicker('color', [cellData.style['color']]);
                    } else {
                      className += _this.setClassNameByColorPicker('color', [cellData.style['color']]);
                    }
                  }
                  cellData.className = className;
                }
               
                cellsData.push([i, j, cellData, 'style', 'className']);
              } else {
                const o = {
                  row: i,
                  col: j,
                  content: cellData,
                  style: JSON.parse(JSON.stringify(newValue))
                };
                /* 
                 cellData 单元格值，newValue 默认样式值，没有设置值，取得是newValue 
                 有背景颜色+(有字体颜色或者无字体颜色）
                 有字体颜色+(有背景颜色或无背景颜色)
                */
                let cellStyle = cellData || { style: newValue};
                if (cellStyle && cellStyle.hasOwnProperty('style') && cellStyle.style) {
                  if (cellStyle.style['background']) {
                    if (cellStyle.style['color']) {
                      className = _this.setClassNameByColorPicker('color', [cellStyle.style['color']]) + ' ' + _this.setClassNameByColorPicker('bg', [cellStyle.style['background']]);
                    } else {
                      className = _this.setClassNameByColorPicker('bg', [cellStyle.style['background']]);
                    }
                  } else if (cellStyle.style['color']) {
                    if (className) {
                      className += ' ' + _this.setClassNameByColorPicker('color', [cellStyle.style['color']]);
                    } else {
                      className += _this.setClassNameByColorPicker('color', [cellStyle.style['color']]);
                    }
                  }
                  o.className = className;
                }
                cellsData.push([i, j, o, 'style', 'className']);
              }
            }
          }
        });
        this.$hot.setDataAtCell(cellsData);
        // 添加边框
        if (newValue.border === 'all') {
          this.setCellBorder(this.borderColor);
        } else {
          this.setCellBorder();
        }
      },
      deep: true
    },
    highlightuuid(val) {
      //待补充选中移上去效果
      if (val) {
        this.$refs.hotContainer.querySelectorAll('.component-tr').forEach(item => {
          item.classList.remove('hover');
        });
        if (typeof val == 'object') {
          val.length > 0 &&
            val.forEach(v => {
              let item = this.$refs.hotContainer.querySelector('.component-tr-' + v);
              item && item.classList.add('hover');
            });
        } else {
          let item = this.$refs.hotContainer.querySelector('.component-tr-' + val);
          item && item.classList.add('hover');
        }
      } else {
        this.$refs.hotContainer.querySelectorAll('.component-tr').forEach(item => {
          item.classList.remove('hover');
        });
      }
    },
    'globalSetting.ruleList': {
      handler: function(val) {
        val && this.getFormrulelength(val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
@import './sheet.less';
.form-footer{
  padding: 10px;
  border-top:1px solid;
  >p{
    display: inline-block;
    padding: 0px 5px;
    height: 50px;
    max-width: 100px;
    cursor: pointer;
    position: relative;
    .tsfont-close-o{
      position: absolute;
      top: 0px;
      right: 0px;
      display: flow-root;
      width: 15px;
      height: 10px;
      line-height: 1;
      font-size: 12px;
      display: none;
      z-index: 5;
    }
    &:hover{
      .tsfont-close-o{
        display: block;
      }
    }
    >i{
      font-size: 24px;
      height: 30px;
      line-height: 30px;
      display: block;
      text-align: center;
    }
    >span{
      height: 25px;
      line-height: 25px;
      font-size: 12px; 
      display: inline-block;
      width: 100%;
      text-align: center;  
    }
    >.tsfont-danger-s{
      position: absolute;
      top: 0px;
      left: 0px;
      display: flow-root;
      width: 15px;
      height: 10px;
      line-height: 1;
    }
  }
}
</style>
