<template>
  <div class="matrix-external-edit">
    <TsContain border="none">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <div slot="topLeft">
        <navTopLeft
          :matrixUuid="matrixUuid"
        ></navTopLeft>
      </div>
      <div slot="topRight" class="bar-top">
        <div class="bar-top-right action-group text-right">
          <span v-if="tableData && tableData.tbodyList && tableData.tbodyList.length>0" v-download="downurl" class="action-item tsfont-export">{{ $t('term.pbc.exportdata') }}</span>
          <span v-else class="action-item disable tsfont-export">{{ $t('term.pbc.exportdata') }}</span>
          <span class="action-item tsfont-export" @click="exportMatrix">{{ $t('page.export') }}</span>
          <span class="action-item tsfont-edit" @click="editMatrix()">{{ $t('page.edit') }}</span>
          <span v-if="tableData" class="action-item block-item">
            <ReferenceSelect
              :uuid="matrixUuid"
              :isIcon="true"
              :isMargin="true"
              calleeType="matrix"
              :referenceCount="tableData.referenceCount"
            ></ReferenceSelect>
          </span>
          <div v-if="tableData && tableData.referenceCount > 0" class="action-item"><Button :title="$t('message.framework.delmatrixtip')" type="error" disabled>{{ $t('page.delete') }}</Button></div>
          <div v-else class="action-item"><Button type="error" @click="delMatrix">{{ $t('page.delete') }}</Button></div>
        </div>
      </div>
      <template v-slot:content>
        <Loading :loading-show="loadingShow" type="fix"></Loading>
        <TsTable v-bind="tableData" @changeCurrent="searchMatrixView" @changePageSize="changePageSize">
          <template v-for="(item) in tableData.theadList" :slot="item.key" slot-scope="{row}">
            {{ row[item.key] && row[item.key].text !==null && row[item.key].text !==undefined ? row[item.key].text :row[item.key] }}
          </template>
        </TsTable>
      </template>
    </TsContain>
    <CmdbEdit
      v-if="editTsDialogCmdb.isShow"
      :ciId="ciId"
      :typeView="typeView"
      :fileObj="fileObj"
      :showAttributeLabelList="showAttributeLabelList"
      :modelAttributeList="modelAttributeList"
      :editTsDialogCmdb="editTsDialogCmdb"
      @isOk="isOk"
    ></CmdbEdit>
    <CmdbCustomViewEdit
      v-if="editTsDialogCmdbCustomView.isShow"
      :customViewId="customViewId"
      :typeView="typeView"
      :fileObj="fileObj"
      :showAttributeLabelList="showAttributeLabelList"
      :modelAttributeList="modelAttributeList"
      :editTsDialogCmdbCustomView="editTsDialogCmdbCustomView"
      @isOk="isOk"
    ></CmdbCustomViewEdit>
    <ExternalEditDialog
      v-if="isShowExternalEditDialog"
      :matrixUuid="matrixUuid"
      :title="matrixName"
      @close="closeExternalEditDialog"
    ></ExternalEditDialog>
    <ViewEditDialog
      v-if="isShowViewEditDialog"
      :matrixUuid="matrixUuid"
      :title="viewEditDialogTitle"
      @close="closeViewEditDialog"
    ></ViewEditDialog>
  </div>
</template>

<script>
import download from '@/resources/directives/download.js';
export default {
  name: 'MatrixExternal',
  components: {
    CmdbEdit: resolve => require(['./components/cmdb-edit'], resolve),
    CmdbCustomViewEdit: resolve => require(['./components/cmdb-customview-edit'], resolve),
    navTopLeft: resolve => require(['./components/navTopLeft'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve),
    ExternalEditDialog: resolve => require(['./components/external-edit-dialog'], resolve), // 外部数据源
    ViewEditDialog: resolve => require(['./components/view-edit-dialog'], resolve) // 视图数据源
  },
  directives: { download },
  props: [''],
  data() {
    return {
      ciId: '',
      customViewId: '',
      title: '',
      showAttributeLabelList: [],
      modelAttributeList: [], // 模型属性列表
      fileObj: {},
      isShowExternalEditDialog: false,
      isShowViewEditDialog: false,
      viewEditDialogTitle: '',
      editTsDialogCmdb: {
        type: 'modal',
        title: '',
        maskClose: false,
        isShow: false,
        width: 'medium'
      },
      editTsDialogCmdbCustomView: {
        type: 'modal',
        title: '',
        maskClose: false,
        isShow: false,
        width: 'medium'
      },
      typeView: '',
      loadingShow: true,
      validJson: ['required'],
      nameValidateList: ['required', {
        name: 'searchUrl',
        url: 'api/rest/matrix/save', 
        message: this.$t('message.targetisexists', {'target': this.$t('page.matrixname')}),
        key: 'name',
        params: () => ({uuid: this.matrixUuid})
      }],
      tableData: { referenceCount: 0 },
      editDialog: false,
      matrixUuid: '', //矩阵uuid
      matrixName: '', //矩阵名
      matrixType: '', //矩阵获取数据类型
      searchParam: {}
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.name) {
      this.matrixName = this.$route.query.name;
    }
    this.matrixUuid = this.$route.query.uuid || null;
    this.matrixType = this.$route.query.type || null;
    if (this.$route.query.isAddMatrix) {
      if (this.matrixType == 'custom') {
        this.editMatrix();
      }
      this.viewEditDialogTitle = '';
      this.viewEditDialogTitle = this.$route.query.name;
    }
    this.searchMatrixView();
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
    isOk() {
      this.searchMatrixView();
    },
    //返回矩阵列表
    toMatrixList: function() {
      this.$router.push({
        path: '/matrix-overview'
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
    editMatrix() {
      this.viewEditDialogTitle = this.matrixName;
      this.$api.framework.matrix
        .getMatrixViewList({ uuid: this.matrixUuid })
        .then(res => {
          if (res.Status == 'OK') {
            let type = res.Return.type;
            if (type == 'cmdbci') {
              let dataInfo = res.Return;
              this.ciId = dataInfo.ciId;
              this.typeView = dataInfo.type;
              this.editTsDialogCmdb.isShow = true;
              this.editTsDialogCmdb.title = this.$t('dialog.title.edittarget', {'target': this.matrixName});
              if (res.Return.config) {
                this.showAttributeLabelList = res.Return.config.showAttributeLabelList;
                this.modelAttributeList = res.Return.config.showAttributeList || [];
              }
              this.fileObj = JSON.parse(JSON.stringify(res.Return));
            } else if (type == 'cmdbcustomview') {
              let dataInfo = res.Return;
              this.customViewId = dataInfo.customViewId;
              this.typeView = dataInfo.type;
              this.editTsDialogCmdbCustomView.isShow = true;
              this.editTsDialogCmdbCustomView.title = this.$t('dialog.title.edittarget', {'target': this.matrixName});
              if (res.Return.config) {
                this.showAttributeLabelList = res.Return.config.showAttributeLabelList;
                this.modelAttributeList = res.Return.config.showAttributeList || [];
              }
              this.fileObj = JSON.parse(JSON.stringify(res.Return));
            } else if (type == 'external') {
              this.isShowExternalEditDialog = true;
            } else {
              this.isShowViewEditDialog = true;
            }
          }
        });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchMatrixView(1);
    },
    //获取表格数据
    searchMatrixView(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      if (this.matrixUuid) {
        let params = { ...this.searchParam, matrixUuid: this.matrixUuid };
        this.$api.framework.matrix
          .getExternalData(params)
          .then(res => {
            if (res.Status == 'OK') {
              this.tableData = res.Return;
            }
          }).finally(() => {
            this.loadingShow = false;
          });
      }
    },
    //删除矩阵
    delMatrix: function() {
      if (this.tableData.referenceCount > 0) {
        return false;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.matrixName}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = {
            uuid: this.matrixUuid
          };
          this.$api.framework.matrix
            .deleteMatrix(data)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.toMatrixList();
              }
            });
        }
      });
    },
    closeExternalEditDialog() {
      this.isShowExternalEditDialog = false;
    },
    closeViewEditDialog(needRefresh) {
      this.isShowViewEditDialog = false;
      if (needRefresh) {
        this.searchMatrixView(1);
      }
    }
  },

  filter: {},
  computed: {
    downurl() {
      return {
        url: '/api/binary/matrix/data/export',
        params: { matrixUuid: this.matrixUuid, fileType: 'csv'}
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scope>
@import (reference) '~@/resources/assets/css/variable.less';
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
</style>
