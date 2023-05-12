<template>
  <section
    :data_id="uuid"
    type="table"
    contenteditable="false"
    z-index="0"
    @click="handlerClick"
    @paste.stop.prevent
  >
    <div ref="editorTable" class="editor-table">
      <div class="tool bg-op shadow"><span class="tsfont-trash-s" :title="baseLanguageT('dialog.title.deletetarget', {target: baseLanguageT('page.table')})" @click="removeItem"></span></div>
      <div
        ref="hotContainer"
        class="table"
        @keydown.stop
        @keyup.stop
        @input.stop
      ></div>
    </div>
    <span
      ref="editorSpan"
      class="editorSpan"
      contenteditable
      @keydown.stop="complexComHandlerKeydown"
      @input.stop="complexComHandlerKeydown"
    ></span>
  </section>
</template>
<script>
import editorMixins from './common/mixins.js';
import 'handsontable/dist/handsontable.full.css';
import 'handsontable/languages/zh-CN';
import Handsontable from 'handsontable';
import { $t } from '@/resources/init.js';

export default {
  name: '',
  components: {
  },
  filters: {},
  mixins: [editorMixins],
  props: {
    uuid: String,
    content: String,
    config: Object
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$nextTick(function() {
      let setting = this.$utils.deepClone(initSetting);
      if (this.config && this.config.tableList) {
        setting.data = this.config.tableList;
        setting.manualRowResize = this.config.lefterList && this.config.lefterList.length > 0 ? this.config.lefterList : setting.data.map(item => setting.rowHeights);
        setting.manualColumnResize = this.config.headerList && this.config.headerList.length > 0 ? this.config.headerList : setting.data.map(item => setting.colWidths);
      }
      this.$hot = new Handsontable(this.$refs.hotContainer, setting);
      this.$refs.hotContainer;
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getContent() {
      if (this.$hot) {
        let tableList = this.$hot.getData();
        const lefterList = this.$hot.getPlugin('ManualRowResize').manualRowHeights;
        const headerList = this.$hot.getPlugin('ManualColumnResize').manualColumnWidths;
        let mergeData = this.$hot.getPlugin('MergeCells').mergedCellsCollection.mergedCells || [];
        mergeData = mergeData.map(d => ({
          row: d.row,
          col: d.col,
          rowspan: d.rowspan,
          colspan: d.colspan
        }));
        return {
          config: {
            tableList: tableList,
            lefterList: lefterList,
            headerList: headerList,
            mergeData: mergeData
          }
        };
      } else {
        return null;
      }
    },
    handlerClick(e) {
      this.comClick();
      if (e.target == this.$refs.editorTable || e.target.className == 'wtHolder' || e.target == this.$el) {
        this.$refs.editorSpan && this.$refs.editorSpan.focus();
      }
    }
  },
  computed: {},
  watch: {
    item: {
      handler: function(val) {
       
      },
      immediate: true,
      deep: true
    }
  }

};

const initSetting = {
  // 提取出来主要是为了避免引用数据被改变，导致新建表单时出现上一个表单的数据
  language: 'zh-CN',
  readOnlyCellClassName: 'plugin-tr',
  persistentState: true,
  copyable: true,
  fillHandle: false,
  headerTooltips: true,
  columnHeaderHeight: 30,
  width: '100%',
  colWidths: 150,
  rowHeights: 30,
  data: Handsontable.helper.createEmptySpreadsheetData(3, 5),
  rowHeaders: true,
  colHeaders: true,
  manualColumnResize: true,
  manualRowResize: true,
  autoColumnSize: true,
  autoRowSize: true,
  autoWrapRow: true,
  mergeCells: true,
  selectionMode: 'range',
  className: 'defaultStyle htMiddle',
  contextMenu: {
    items: {
      mergeCells: {},
      row_above: {
        name: $t('term.framework.insetup')
      },
      row_below: {
        name: $t('term.framework.insetdown')
      },
      col_left: {
        name: $t('term.framework.insetleft')
      },
      col_right: {
        name: $t('term.framework.insetright')
      },
      hsep1: '---------',
      remove_row: {
        name: $t('term.framework.delrow')
      },
      remove_col: {
        name: $t('term.framework.delcol')
      }
    }
  }
};

</script>
<style lang="less">
@import '~@/resources/components/FormMaker/formedit/sheet.less';
</style>
<style lang='less' scoped>
section{
  position: relative;
  /deep/.table{
    width: 100%;
    overflow-x: auto;
    .handsontable .wtSpreader{
      width: 100%;
    }
    .ht_master .wtHolder{
      height: auto !important;
    }
    .handsontable td{
     border-bottom: 1px solid;
    }
  }
  .editor-table{
    position: relative;
    padding:10px;
    &:hover{
      .tool{
        display: block;
      }
    }
  }
  &:hover{
    border: 1px solid transparent !important;
  }
  .tool{
    position: absolute;
    top: -40px;
    left: 0px;
    z-index: 10;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    padding: 5px;
    display: none;
    z-index: 1;
    &>span{
          padding: 7px 8px;
          cursor: pointer;
    }
  }
  .editorSpan{
    position: absolute;
    right: 1px;
    bottom: 0px;
    width: 3px;
    height: 24px;
    outline: none;
    z-index: 3;
  }
}

</style>
