<template>
  <div class="matrix-external-edit">
    <TsContain border="none">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$backTo('/matrix-overview')">{{ $getFromPage($t('router.framework.matrixmanage')) }}</span>
      </template>
      <div slot="topLeft">
        <navTopLeft
          :matrixUuid="matrixUuid"
        ></navTopLeft>
      </div><div slot="topRight">
        <div class="bar-top-right action-group text-right">
          <span class="action-item tsfont-export" @click="exportMatrix">{{ $t('page.export') }}</span>
          <span class="action-item tsfont-edit" @click="editMatrix()">{{ $t('page.edit') }}</span>
          <span v-if="tableData" class="action-item block-item">
            <ReferenceSelect
              :uuid="matrixUuid"
              :isIcon="true"
              calleeType="matrix"
              :referenceCount="tableData.referenceCount"
              :isMargin="true"
            ></ReferenceSelect>
          </span>
          <div v-if="tableData && tableData.referenceCount > 0" class="action-item"><Button :title="$t('message.framework.delmatrixtip')" type="error" disabled>{{ $t('page.delete') }}</Button></div>
          <div v-else class="action-item"><Button type="error" @click="delMatrix">{{ $t('page.delete') }}</Button></div>
        </div>
      </div>
      <template v-slot:content>
        <Loading :loading-show="loadingShow" type="fix"></Loading>
        <TsTable v-bind="tableData" @changeCurrent="searchMatrixExternal" @changePageSize="changePageSize">
          <template v-for="(item) in tableData.theadList" :slot="item.key" slot-scope="{row}">
            {{ row[item.key] && row[item.key].text !==null && row[item.key].text !==undefined ? row[item.key].text :row[item.key] }}
          </template>
        </TsTable>
      </template>
    </TsContain>
    <ExternalEditDialog
      v-if="isShowExternalEditDialog"
      :matrixUuid="matrixUuid"
      :title="matrixName"
      @close="closeExternalEditDialog"
    ></ExternalEditDialog>
  </div>
</template>

<script>
export default {
  name: 'MatrixExternal',
  components: {
    navTopLeft: resolve => require(['./components/navTopLeft'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve),
    ExternalEditDialog: resolve => require(['./components/external-edit-dialog'], resolve) // 编辑外部数据源矩阵
  },
  props: [''],
  data() {
    return {
      isShowExternalEditDialog: false,
      loadingShow: true,
      tableData: { referenceCount: 0 },
      searchParam: {},
      matrixUuid: '', //矩阵uuid
      matrixName: '' //矩阵名
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.name) {
      this.matrixName = this.$route.query.name;
    }
    this.matrixUuid = this.$route.query.uuid || null;
    if (this.$route.query.isAddMatrix) {
      this.editTsDialog.isShow = true;
      this.isShowExternalEditDialog = true;
      this.matrixName = this.$t('dialog.title.edittarget', {'target': this.$route.query.name});
    }
    this.searchMatrixExternal(1);
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
      this.isShowExternalEditDialog = true;
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchMatrixExternal(1);
    },
    //获取表格数据
    searchMatrixExternal(currentPage) {
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
              this.loadingShow = false;
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
    closeExternalEditDialog(needRefresh) {
      this.isShowExternalEditDialog = false;
      if (needRefresh) {
        this.searchMatrixExternal(1);
      }
    }
  },
  filter: {},
  computed: {},
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
