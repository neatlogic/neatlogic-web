<template>
  <div class="matrix-edit">
    <Loading :loading-show="loadingShow" type="fix"></Loading>
    <TsContain border="none">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$backTo('/matrix-overview')">{{ $getFromPage($t('router.framework.matrixmanage')) }}</span>
      </template>
      <div slot="topLeft">
        <navTopLeft
          :matrixUuid="matrixUuid"
        ></navTopLeft>
      </div>
      <div slot="topRight" style="text-align:right">
        <div class="bar-top-right action-group">
          <div v-if="matrixDataSelectList.length > 0" class="action-item tsfont-trash-o cursor-pointer" @click="deleteMatrixData(matrixDataSelectList, 'empty')">{{ $t('page.batchdelete') }}</div>
          <div class="action-item">
            <Dropdown trigger="click" transfer>
              <span class="tsfont-cloud">{{ $t('page.import') }}/{{ $t('page.export') }}</span>
              <DropdownMenu slot="list" class="dropdown">
                <DropdownItem v-if="tabledata && tabledata.tbodyList && tabledata.tbodyList.length>0" v-download="downurl">
                  <div>{{ $t('term.pbc.exportdata') }}</div>
                </DropdownItem>
                <DropdownItem v-else>
                  <div class="btn-disable">{{ $t('term.pbc.exportdata') }}</div>
                </DropdownItem>
                <DropdownItem @click.native="exportAttributeMatrix">
                  <div>{{ $t('term.pbc.exporttemplate') }}</div>
                </DropdownItem>
                <DropdownItem @click.native="$refs.uploadDialog.showDialog">
                  <span>{{ $t('page.importdata') }}</span>
                  <UploadDialog
                    ref="uploadDialog"
                    :actionUrl="`${actionUrl}?matrixUuid=${matrixUuid}`"
                    :formatList="formatList"
                    :multiple="false"
                    @on-all-upload="getMatrixData"
                  />
                </DropdownItem>
                <DropdownItem @click.native="exportMatrix">
                  <div>{{ $t('page.export') }}</div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <template v-if="matrixType == 'custom'">
            <div class="action-item tsfont-plus" @click="addMatrixAttribute">{{ $t('page.field') }}</div>
            <div v-if="processMatrixAttributeList && processMatrixAttributeList.length > 0" class="action-item tsfont-plus" @click="editMatrixData()">{{ $t('page.row') }}</div>
            <div v-else class="action-item tsfont-plus disable" :title="$t('message.framework.plesrow')">{{ $t('page.row') }}</div>
          </template>
          <template v-else>
            <div class="action-item tsfont-plus">{{ $t('page.data') }}</div>
          </template>
          <div v-if="tabledata" class="action-item block-item">
            <ReferenceSelect
              :uuid="matrixUuid"
              calleeType="matrix"
              :referenceCount="tabledata.referenceCount"
              :isIcon="true"
              :isMargin="true"
            ></ReferenceSelect>
          </div>
          <div v-if="tabledata && tabledata.referenceCount > 0" class="action-item"><Button :title="$t('message.framework.delmatrixtip')" type="error" disabled>{{ $t('page.delete') }}</Button></div>
          <div v-else class="action-item"><Button type="error" @click="delMatrix">{{ $t('page.delete') }}</Button></div>
        </div>
      </div>
      <div slot="content" class="matrix-content">
        <div v-if="processMatrixAttributeList && processMatrixAttributeList.length > 0" class="tabel-icon" @click="addMatrixAttribute">
          <i class="tsfont-list"></i>
        </div>
        <TsTable
          v-if="tabledata"
          :pageSize="tabledata.pageSize"
          :currentPage="tabledata.currentPage"
          :pageCount="tabledata.pageCount"
          :rowNum="tabledata.rowNum"
          :tbodyList="tabledata.tbodyList || []"
          :theadList="tabledata.theadList"
          multiple
          canDrag
          @getSelected="getSelect"
          @changeCurrent="getPagedata"
          @changePageSize="changePageSize"
          @updateRowSort="updateRowSort"
        >
          <template v-for="(item, index) in tabledata.theadList" :slot="item.key" slot-scope="{ row }">
            <div v-if="isUserSelect(row[item.key])" :key="index">
              {{ showText(row[item.key]) }}
            </div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit icon" @click.stop="editMatrixData(row)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o icon" @click.stop="deleteMatrixData(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <RowEdit
      v-if="matrixDataDialog"
      :data="currentData"
      :matrixUuid="matrixUuid"
      @close="closeDataDialog"
    ></RowEdit>
    <ColumnEdit v-if="attributeDialog" :matrixUuid="matrixUuid" @close="closeAttributeDialog"></ColumnEdit>
  </div>
</template>

<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    navTopLeft: resolve => require(['./components/navTopLeft'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    UploadDialog: resolve => require(['@/resources/components/UploadDialog/UploadDialog.vue'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve),
    ColumnEdit: resolve => require(['./components/column-edit.vue'], resolve),
    RowEdit: resolve => require(['./components/row-edit.vue'], resolve)
    // UserSelect: resolve => require(["@/resources/components/UserSelect/UserSelect.vue"], resolve)
  },
  directives: { download },
  props: [''],
  data() {
    let _this = this;
    return {
      currentData: null, //当前编辑行
      actionUrl: BASEURLPREFIX + '/api/binary/matrix/data/import',
      formatList: ['xls', 'xlsx'], //导入文件格式
      loadingShow: true,
      selectData: [], //选中数据
      matrixUuid: '', //矩阵uuid
      matrixName: '', //矩阵名
      // initMatrixName: '', //初始化矩阵名
      matrixType: '', //矩阵获取数据类型
      tabledata: null, //表格数据
      attributeDialog: false, //属性弹框
      matrixDataDialog: false, //数据弹框
      pageSize: 10,
      matrixAttributeList: [], //矩阵属性
      nameValidateList: ['required', {
        name: 'searchUrl',
        url: 'api/rest/matrix/save', 
        message: this.$t('message.targetisexists', {'target': this.$t('page.matrixname')}),
        key: 'name',
        params: () => ({uuid: this.matrixUuid})
      }],
      specialJson: ['name-special'],
      matrixDataDialogTitle: this.$t('dialog.title.addtarget', {'target': this.$t('page.row')}),
      matrixDataSelectList: [], //多选列表
      processMatrixAttributeList: []
    };
  },

  beforeCreate() {},

  created() {
    if (this.$route.query.name) {
      this.matrixName = this.$route.query.name;
      // this.initMatrixName = this.$route.query.name;
    }
    if (this.$route.query.isAddMatrix) {
      this.attributeDialog = true;
    }
    this.matrixUuid = this.$route.query.uuid || null;
    this.matrixType = this.$route.query.type || null;
    this.getMatrixData();
    this.getMatrixAttrList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    //返回矩阵列表
    toMatrixList: function() {
      this.$router.push({
        path: '/matrix-overview'
      });
    },
    //翻页
    getPagedata(current) {
      if (current) {
        this.tabledata.currentPage = current;
      }
      let param = {
        pageSize: this.pageSize,
        currentPage: this.tabledata.currentPage ? this.tabledata.currentPage : 1,
        matrixUuid: this.matrixUuid
      };
     
      this.getMatrixData(param);
    },
    //改变页数
    changePageSize(size) {
      this.pageSize = size;
      let param = {
        pageSize: this.pageSize,
        currentPage: this.tabledata.currentPage ? this.tabledata.currentPage : 1,
        matrixUuid: this.matrixUuid
      };
      this.getMatrixData(param);
    },
    getMatrixAttrList() {
      this.$api.framework.matrix.getMatrixAttributeByUuid({
        matrixUuid: this.matrixUuid
      }).then(res => {
        if (res.Status == 'OK') {
          this.processMatrixAttributeList = res.Return.tbodyList;
        } 
      }); 
    },
    //获取矩阵数据
    getMatrixData: function(param) {
      let data = param;
      if (data == undefined) {
        data = {
          matrixUuid: this.matrixUuid
        };
      }
      this.$api.framework.matrix.searchMatrix(data).then(res => {
        if (res.Status == 'OK') {
          this.tabledata = res.Return;
          this.pageSize = res.Return.pageSize;
          this.matrixDataSelectList.splice(0);
          setTimeout(() => {
            this.loadingShow = false;
          }, 200);
        } else {
          this.tabledata = null;
        }
      });
    },
    getSelect: function(v, val) {
      this.selectData = val;
      let list = [];
      val.length > 0 &&
        val.forEach(item => {
          let uuid = item.uuid;
          list.push(uuid);
        });
      this.matrixDataSelectList = list;
    },
    //导出矩阵
    exportMatrixData: function() {
      let data = {
        matrixUuid: this.matrixUuid,
        fileType: 'excel'
      };
      this.$api.framework.matrix
        .exportMatrixData(data)
        .then(res => {
          if (res.status == '200') {
            const aLink = document.createElement('a');
            let blob = new Blob([res.data], {
              type: 'application/x-msdownload'
            });
            aLink.href = URL.createObjectURL(blob);
            let contentDisposition = decodeURI(res.headers['content-disposition']);
            let fileName = contentDisposition.substring(22, contentDisposition.length - 1);
            aLink.download = fileName;
            aLink.click();
            document.body.appendChild(aLink);
          }
        })
        .catch(error => {
          console.log(error);
          this.$Notice.error({
            title: this.$t('page.exporterror')
          });
        });
    },
    //导出矩阵模板
    exportAttributeMatrix: function(uuid) {
      let data = {
        matrixUuid: this.matrixUuid
      };
      this.$api.framework.matrix
        .exportAttributeMatrix(data)
        .then(res => {
          if (res.status == '200') {
            const aLink = document.createElement('a');
            let blob = new Blob([res.data], {
              type: 'application/x-msdownload'
            });
            aLink.href = URL.createObjectURL(blob);
            let contentDisposition = decodeURI(res.headers['content-disposition']);
            let fileName = contentDisposition.substring(22, contentDisposition.length - 1);
            aLink.download = fileName;
            aLink.click();
            document.body.appendChild(aLink);
          }
        })
        .catch(error => {
          console.log(error);
          this.$Notice.error({
            title: this.$t('page.exporterror')
          });
        });
    },
    exportMatrix() {
      let data = {
        uuid: this.matrixUuid
      };
      this.$api.framework.matrix.exportMatrix(data).then(res => {
        if (res.status == '200') {
          const aLink = document.createElement('a');
          let blob = new Blob([res.data], {
            type: 'application/x-msdownload'
          });
          aLink.href = URL.createObjectURL(blob);
          let contentDisposition = decodeURI(res.headers['content-disposition']);
          let fileName = contentDisposition.substring(22, contentDisposition.length - 1);
          aLink.download = fileName;
          aLink.click();
          document.body.appendChild(aLink);
        }
      }).catch(error => {
        this.$Notice.error({
          title: this.$t('page.exporterror')
        });
      });
    },
    //添加属性
    addMatrixAttribute: function() {
      this.attributeDialog = true;
    },
    //删除矩阵
    delMatrix: function() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.matrixName}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = {
            uuid: this.matrixUuid
          };
          this.$api.framework.matrix.deleteMatrix(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.toMatrixList();
            }
          });
        }
      });
    },
    //删除行数据
    deleteMatrixData: function(val, type) {
      let uuid = [];
      if (val instanceof Array) {
        val.forEach(item => {
          uuid.push(item.value);
        });
      } else {
        uuid.push(val.uuid.value);
      }
      let data = {
        matrixUuid: this.matrixUuid,
        uuidList: uuid
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.matrixDataSelectList.length === 1 ? this.$t('dialog.content.deleterowdata') : this.$t('dialog.content.deleteselectdata'),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.matrix.deleteMatrixData(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              let param = {
                matrixUuid: this.matrixUuid,
                pageSize: this.pageSize
              };
              this.getMatrixData(param);
              if (type && type === 'empty') {
                this.matrixDataSelectList.splice(0);
              }
            }
          });
        }
      });
      // deleteMatrixData
    },
    //获取表单属性
    /*getFormHandler: function() {
      let data = {};
      this.$api.process.process.getFormHandler(data).then(res => {
        if (res.Status == 'OK') {
          // this.attributeDialogForm[1].dataList = res.Return;
        }
      });
    },*/
    //编辑行数据
    editMatrixData(val) {
      //this.getMatrixAttrList(false, val);
      //this.matrixDataDialogTitle = '编辑行';
      this.matrixDataDialog = true;
      this.currentData = val || null;
    },
    closeAttributeDialog(needRefresh) {
      this.attributeDialog = false;
      if (needRefresh) {
        this.getMatrixData();
        this.getMatrixAttrList();
      }
    },
    closeDataDialog(needRefresh) {
      this.matrixDataDialog = false;
      if (needRefresh) {
        this.getMatrixData();
      }
    },
    updateRowSort({ oldIndex, newIndex }) {
      if (oldIndex == newIndex) {
        return;
      }
      let tbodyList = this.tabledata.tbodyList;
      let uuid = tbodyList[oldIndex].uuid.value;
      let toUuid = tbodyList[newIndex].uuid.value;
      const param = {
        matrixUuid: this.matrixUuid,
        uuid: uuid, 
        toUuid: toUuid
      };
      this.$api.framework.matrix.moveMatrixData(param)
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
          } else throw res;
        }).finally(() => {
          this.getMatrixData();
        });
    }
  },
  filter: {},
  computed: {
    isUserSelect() {
      return function(val) {
        let KEY = false;
        // if (val  && (val.indexOf('user#') != '-1' || val.indexOf('role#') != '-1' || val.indexOf('team#') != '-1')) {
        //   KEY = true;
        // }
        // else {
        //   KEY = false;
        // }
        if (val != undefined) {
          KEY = true;
        } else {
          KEY = false;
        }
        return KEY;
      };
    },
    showText() {
      return function(val) {
        let text = '';
        if (val != undefined) {
          text = val.text;
        }
        return text;
      };
    },
    downurl() {
      return {
        url: '/api/binary/matrix/data/export',
        params: { matrixUuid: this.matrixUuid, fileType: 'excel'}
      };
    }
  },

  watch: {
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';

.matrix-edit {
  .bar-top {
    .input-contain {
      display: inline-block;
      line-height: 30px;
      padding: 0px 15px;
      padding-left: 0;
      .form-error-tip {
        display: inline-block;
        line-height: 1.8;
        position: absolute;
        top: 20px;
      }
    }
  }
  .matrix-content {
    position: relative;
    .tabel-icon {
      position: absolute;
      right: 28px;
      z-index: 9;
      padding: 10px;
      cursor: pointer;
    }
  }
}

</style>
