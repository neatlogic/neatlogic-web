<template>
  <div class="matrix-external-edit">
    <TsContain border="none">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$backTo('/matrix-overview')">{{ $getFromPage('矩阵管理') }}</span>
      </template>
      <div slot="topLeft">
        <navTopLeft
          :matrixUuid="matrixUuid"
        ></navTopLeft>
      </div>
      <div slot="topRight" class="bar-top">
        <div class="bar-top-right action-group text-right">
          <span v-if="tableData && tableData.tbodyList && tableData.tbodyList.length>0" v-download="downurl" class="action-item tsfont-export">导出</span>
          <span v-else class="action-item disable tsfont-export">导出</span>
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
          <div v-if="tableData && tableData.referenceCount > 0" class="action-item"><Button title="当前矩阵被引用，无法删除" type="error" disabled>删除矩阵</Button></div>
          <div v-else class="action-item"><Button type="error" @click="delMatrix">删除矩阵</Button></div>
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
      v-if="isShow"
      :ciId="ciId"
      :typeView="typeView"
      :fileObj="fileObj"
      :showAttributeLabelList="showAttributeLabelList"
      :modelAttributeList="modelAttributeList"
      :editTsDialogCmdb="editTsDialogCmdb"
      @isOk="isOk"
    ></CmdbEdit>
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
      title: '',
      showAttributeLabelList: [],
      modelAttributeList: [], // 模型属性列表
      fileObj: {},
      isShow: false,
      isShowExternalEditDialog: false,
      isShowViewEditDialog: false,
      viewEditDialogTitle: '',
      editTsDialogCmdb: {
        type: 'modal',
        title: '',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      typeView: '',
      loadingShow: true,
      validJson: ['required'],
      nameValidateList: ['required', {
        name: 'searchUrl',
        url: 'api/rest/matrix/save', 
        message: '矩阵名称已存在',
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
      if (this.matrixType != 'cmdbci') {
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
      this.isShow = false;
      this.searchMatrixView();
    },
    //返回矩阵列表
    toMatrixList: function() {
      this.$router.push({
        path: '/matrix-overview'
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
              this.isShow = true;
              this.editTsDialogCmdb.isShow = true;
              this.editTsDialogCmdb.title = `编辑${this.matrixName}`;
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
        content: '确定删除矩阵：' + this.matrixName + '?',
        btnType: 'error',
        'on-ok': vnode => {
          let data = {
            uuid: this.matrixUuid
          };
          this.$api.framework.matrix
            .deleteMatrix(data)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.content.deletesuccess'));
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
        url: '/api/binary/matrix/export',
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
