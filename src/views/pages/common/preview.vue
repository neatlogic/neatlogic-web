<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <TsContain>
      <template v-slot:topLeft>
        <span>{{ title }}</span>
      </template>
      <template v-slot:content>
        <ul v-if="txtData || tableData || wordData" class="mt-sm">
          <li v-if="txtData">
            <TsCodemirror
              v-model="txtData"
              codeMode="xml"
              :isReadOnly="true"
            ></TsCodemirror>
          </li>
          <li v-if="!$utils.isEmpty(tableNums)" id="preview-table-box">
            <Tabs v-model="tableIndex" :animated="false" @on-click="switchTabs">
              <TabPane
                v-for="(item, index) in tableNums"
                :key="index"
                :label="item"
                :name="index + ''"
              >
                <div style="width: 100%;overflow-x: auto;" v-html="tableData"></div>
              </TabPane>
            </Tabs>
          </li>
          <li>
            <div ref="previewDocx"></div>
          </li>
        </ul>
        <iframe
          v-else-if="pdfData"
          :src="pdfData + '#view=Fit'"
          class="border-color"
          type="application/x-google-chrome-pdf"
          width="100%"
          height="98%"
        ></iframe>
        <NoData v-else></NoData>
      </template>
    </TsContain>
  </div>
</template>
<script>
import ExcelJS from 'exceljs';
let docx = require('docx-preview'); // word预览
export default {
  name: '',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
  },
  props: {},
  data() {
    return {
      loadingShow: false,
      txtData: '',
      pdfData: '',
      tableData: '',
      wordData: '',
      excelData: '',
      tableNums: [],
      tableIndex: 0,
      currentPage: 1,
      pageCount: 1,
      title: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let query = this.$route.query;
    if (query && !this.$utils.isEmptyObj(query)) {
      this.getPreviewContentByUrl(query);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getPreviewContentByUrl(query) {
      if (query && !query.url) {
        return false;
      }
      let currentFileType = {
        xlsx: 'excel',
        xlx: 'excel',
        docx: 'word',
        doc: 'word',
        pdf: 'pdf',
        txt: 'txt',
        sql: 'txt',
        ctl: 'txt',
        exp: 'txt',
        imp: 'txt',
        prc: 'txt',
        pck: 'txt',
        pkg: 'txt',
        pkgh: 'txt',
        pkgb: 'txt',
        json: 'txt'
      };
      let {url, type = 'txt', title = '', urlParams = {}} = query; // url地址，type 文件类型，urlParams 请求参数
      this.title = title;
      let axiosParams = this.isJson(urlParams) ? JSON.parse(urlParams) : {};
      let fileType = currentFileType[type];
      let responseType = fileType == 'excel' ? {responseType: 'arraybuffer'} : (fileType == 'txt' ? {} : {responseType: 'blob'});
      if (this.$utils.isEmpty(fileType)) {
        // 其他文件格式，暂不支持
        this.$Notice.warning({
          title: this.$t('page.filepreviewfailed'),
          desc: this.$t('page.formatfilepreviewiscurrentlynotsupportedtarget', {target: type})
        });
        return false;
      }
      this.loadingShow = true;
      this.$https.post(url, axiosParams, responseType).then(res => {
        let {data = ''} = res;
        if (fileType == 'txt') {
          // txt
          this.txtData = res;
        } else if (fileType == 'pdf') {
          // pdf
          let blob = new Blob([data], {
            type: 'application/pdf;chartset=UTF-8'
          });
          let fileURL = URL.createObjectURL(blob);
          this.pdfData = fileURL;
        } else if (fileType == 'word') {
          // word
          this.wordData = data;
          this.$nextTick(() => {
            docx.renderAsync(data, this.$refs.previewDocx); // 渲染到页面
          });
        } else if (fileType == 'excel') {
          // excel
          this.excelData = data;
          this.renderExcel();
        }
        this.loadingShow = false;
      }).catch(() => {
        this.$Notice.error({
          title: this.$t('page.tip'),
          desc: this.$t('page.param') + this.$t('page.error')
        });
        this.loadingShow = false;
      });
    },
    async renderExcel() {
      if (!this.excelData) return;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(this.excelData);
      this.tableNums = workbook.worksheets.map(ws => ws.name);
      const worksheet = workbook.worksheets[this.tableIndex];
      if (!worksheet) return;
      // 获取第一行列数，用于列单元格补全
      const firstRow = worksheet.getRow(1);
      const maxColCount = firstRow.cellCount;
      let html = '<table>';
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        html += '<tr>';
        for (let colIndex = 1; colIndex <= maxColCount; colIndex++) {
          const cell = row.getCell(colIndex);
          let value = '';
          if (cell.value) {
            if (cell.value.richText) {
              value = cell.value.richText.map(t => t?.text).join('');
            } else if (cell.value.text) {
              value = cell.value.text;
            } else {
              value = cell.value;
            }
          }
          html += `<td>${value ?? ''}</td>`;
        }
        html += '</tr>';
      });
      html += '</table>';
      this.tableData = html;
    },
    isJson(str) {
      if (typeof str == 'string') {
        try {
          let obj = JSON.parse(str);
          if (obj && (typeof obj == 'object')) {
            return true;
          } else {
            return false;
          }
        } catch (e) {
          console.log(`error:${str}!!!${e}`);
          return false;
        }
      }
    },
    switchTabs() {
      this.renderExcel();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@op-color, @th-bg-color, @border-color-base){
#preview-table-box {
  width: 100%;
  overflow-x: scroll;
   table {
      width: 100%;
      border-collapse: collapse;
      overflow-x: auto;
    }
    table tr td {
      font-size: 13px;
      white-space: nowrap;
      padding: 9px;
    }
    table tr {
      background: @op-color;
      border-bottom: 1px solid @border-color-base;
    }
    table tr:first-of-type {
      background: @th-bg-color;
    }
    table tr:first-of-type td {
      font-size: 12px;
    }
    table tr:first-of-type td:first-of-type {
      border-top-left-radius: 10px;
    }
    table tr:first-of-type td:last-of-type {
      border-top-right-radius: 10px;
    }
     table tr:last-of-type td:first-of-type {
      border-bottom-left-radius: 10px;
    }
    table tr:last-of-type td:last-of-type {
      border-bottom-right-radius: 10px;
    }
}
}
html {
  .theme(@default-op, @default-th-bg-color, @default-border);
  &.theme-dark {
    .theme(@dark-op, @dark-th-bg-color, @dark-border);
  }
}
</style>
