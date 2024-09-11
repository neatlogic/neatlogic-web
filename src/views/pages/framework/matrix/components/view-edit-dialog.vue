<template>
  <div>
    <TsDialog
      v-bind="editTsDialog"
      :isShow.sync="editTsDialog.isShow"
      :okBtnDisable="okBtnDisable"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <TsForm
        ref="mainForm"
        :item-list="formSetting"
        type="type"
        label-postion="right"
      >
        <template v-slot:fileId>
          <div>
            <TsUpLoad
              styleType="button"
              dataType="matrixview"
              className="smallUpload"
              type="drag"
              width="75%"
              :multiple="false"
              :uploadCount="1"
              :format="['xml']"
              :defaultList="defaultFileList"
              :fileDownurl="fileDownurl"
              :fileDownParam="fileDownParam"
              @remove="removeFile"
              @getFileList="selectFile"
            ></TsUpLoad>
            <Alert show-icon style="width:75%" :class="defaultFileList && defaultFileList.length == 0 ? 'mt-sm' : ''">
              <template slot="desc">
                {{ $t('message.framework.xmldesc') }}
                <Poptip
                  trigger="hover"
                  placement="right"
                  width="800"
                  :transfer="true"
                >
                  <a href="javascript:void(0)">{{ $t('page.viewexample') }}</a>
                  <div slot="content" class="api">
                    <pre>
&lt;view&gt;
   &lt;!--{{ $t('message.framework.viewmatrixsql') }}--&gt;
  &lt;attrs&gt;
    &lt;attr name="id" label="ID" /&gt;
    &lt;attr name="xuqiu" label="需求" /&gt;
    &lt;attr name="moduleName" label="名称" /&gt;
    &lt;attr name="midver" label="版本" /&gt;
    &lt;attr name="type" label="架构类型" /&gt;
    &lt;attr name="serviceName" label="中间件服务名" /&gt;
    &lt;attr name="port" label="端口" /&gt;
    &lt;attr name="app" label="应用基架资源规格" /&gt;
  &lt;/attrs&gt;
  &lt;sql&gt;
    SELECT
    &lt;!--{{ $t('message.framework.reqid') }}--&gt;
    a.`cientity_id` AS id,
    &lt;!--{{ $t('message.framework.requuid') }}--&gt;
    MD5(a.`cientity_id`) AS uuid,
    &lt;!--{{ $t('message.framework.reqattrs') }}--&gt;
    b.`name` AS moduleName,
    a.`midver` AS midver,
    a.`xuqiu` AS xuqiu,
    a.`baseline` AS baseline,
    a.`type` AS type,
    e.`name` AS serviceName,
    d.`port` AS port,
    f.`name` AS app
    FROM @{DATA_SCHEMA}.`ci_inframid_line` a
    JOIN @{DATA_SCHEMA}.`ci_ciroot` b ON a.cientity_id = b.`cientity_id`
    LEFT JOIN `cmdb_rel` cr0 ON cr0.`from_name` = 'inframid_line' AND cr0.`to_name` = 'cfgfw'
    LEFT JOIN `cmdb_relentity` cr ON cr.`from_cientity_id` = a.cientity_id AND  cr.`rel_id` = cr0.`id`
    LEFT JOIN @{DATA_SCHEMA}.`ci_cfgfw` d ON d.cientity_id = cr.to_cientity_id
    LEFT JOIN @{DATA_SCHEMA}.`ci_ciroot` e ON e.cientity_id = d.`cientity_id`

    LEFT JOIN `cmdb_rel` cr2 ON cr2.`from_name` = 'infrabase_line' AND cr2.`to_name` = 'inframid_line'
    LEFT JOIN `cmdb_relentity` cr1 ON cr1.`to_cientity_id` = a.cientity_id AND  cr1.`rel_id` = cr2.`id`
    LEFT JOIN @{DATA_SCHEMA}.`ci_ciroot` f ON f.cientity_id = cr1.from_cientity_id
  &lt;/sql&gt;
&lt;/view&gt;
                    </pre>
                  </div>
                </Poptip>
              </template>
            </Alert>
            <div v-if="showFileError" class="form-error-tip">{{ $t('term.framework.upconfigfile') }}</div>
          </div>
        </template>
      </TsForm>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue')
  },
  props: {
    matrixUuid: {
      type: [String, Number]
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showFileError: false,
      defaultFileList: [],
      isDisabledUpload: false,
      editTsDialog: {
        type: 'modal',
        title: this.$t('dialog.title.edittarget', {'target': this.title}),
        maskClose: false,
        isShow: true,
        width: 'medium',
        height: '220px',
        className: 'matrix-external-modal'
      },
      formSetting: {
        matrixUuid: {
          type: 'text',
          name: 'matrixUuid',
          value: null,
          defaultValue: null,
          isHidden: true,
          label: this.$t('term.framework.matrixprimarykey'),
          validateList: ['required']
        },
        fileId: {
          type: 'slot',
          name: 'fileId',
          label: this.$t('term.cmdb.configfile'),
          value: null,
          transfer: true,
          width: '75%',
          valueName: 'uuid',
          textName: 'name',
          validateList: ['required']
        }
      },
      okBtnDisable: true,
      fileDownurl: '/api/binary/matrix/view/xmlfile/download',
      fileDownParam: {
        matrixUuid: this.matrixUuid
      }
    };
  },
  beforeCreate() {},
  async created() {
    this.isDisabledUpload = await this.$frameworkUtils.isDependency(this.matrixUuid, 'matrix');
    this.getFileList();
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
    okDialog() {
      if (!this.fileId) {
        return;
      }
      let data = {
        uuid: this.matrixUuid || null,
        fileId: this.fileId
      };
      if (this.isDisabledUpload) {
        //矩阵被引用时保存确认
        this.saveOk(data);
        return false;
      } else {
        this.$api.framework.matrix.saveMatrixViewList(data).then(res => {
          if (res.Status == 'OK') {
            this.editTsDialog.isShow = false;
            this.$Message.success(this.$t('message.savesuccess'));
            this.closeDialog(true);
          }
        });
      }
    },
    closeDialog(needRefresh) {
      this.$emit('close', needRefresh);
    },
    removeFile() {
      this.defaultFileList = [];
      this.fileId = null;
      this.okBtnDisable = true;
      this.showFileError = true;
    },
    selectFile(fileList) {
      let fileObj = {};
      if (fileList) {
        fileObj = {
          fileId: fileList[0].id,
          name: fileList[0].name,
          matrixUuid: this.matrixUuid
        };
        this.fileId = fileList[0].id;
        this.okBtnDisable = false;
      }
      this.defaultFileList.push(fileObj);
      this.showFileError = false;
    },
    getFileList() {
      this.$api.framework.matrix
        .getMatrixViewList({ uuid: this.matrixUuid })
        .then(res => {
          if (res.Status == 'OK') {
            if (!this.$utils.isEmpty(res.Return)) {
              this.defaultFileList = [];
              let {type, uuid, matrixUuid, fileName, id} = res.Return;
              let fileObj = {};
              fileObj = {
                name: fileName,
                id: id,
                type: type,
                uuid: uuid,
                matrixUuid: matrixUuid
              };
              this.defaultFileList.push(fileObj);
            }
          }
        });
    },
    saveOk(data) {
      //矩阵被引用时保存确认
      this.$createDialog({
        title: this.$t('page.confirm'),
        content: '矩阵已被引用，是否确认修改？',
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.framework.matrix.saveMatrixViewList(data).then(res => {
            if (res.Status == 'OK') {
              this.editTsDialog.isShow = false;
              this.$Message.success(this.$t('message.savesuccess'));
              this.closeDialog(true);
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.matrix-external-modal {
  .col-3 {
    display: inline-block;
    padding-right: 6px;
  }
  .static-main {
    .static-title {
      width: 75%;
      opacity: 0.6;
      > label {
        line-height: 1;
        margin-bottom: 8px;
        display: inline-block;
        &.col-3 {
          width: 33.3%;
          &:nth-child(1) {
            padding-right: 10px;
          }
          &:nth-child(2) {
            padding: 0px 5px;
          }
          &:nth-child(3) {
            padding-left: 10px;
          }
        }
        &.col-4 {
          width: 25%;
          &:nth-child(1) {
            padding-right: 10px;
          }
          &:nth-child(2),
          &:nth-child(3) {
            padding: 0px 5px;
          }
          &:nth-child(4) {
            padding-left: 10px;
          }
        }
      }
    }
    .dataSource-ul {
      list-style: none;
      > li {
        position: relative;
        margin-bottom: 8px;
        width: 75%;
        .static-item {
          display: inline-block;
          vertical-align: top;
          &.col-3 {
            width: 33.3%;
            &:nth-child(1) {
              padding-right: 10px;
            }
            &:nth-child(2) {
              padding: 0px 5px;
            }
            &:nth-child(3) {
              padding-left: 10px;
            }
          }
          &.col-4 {
            width: 25%;
            &:nth-child(1) {
              padding-right: 10px;
            }
            &:nth-child(2),
            &:nth-child(3) {
              padding: 0px 5px;
            }
            &:nth-child(4) {
              padding-left: 10px;
            }
          }
        }
        .btn-container {
          position: absolute;
          top: 0px;
          left: 102%;
          width: 100px;
          .span-btn {
            width: 20px;
            height: 28px;
            line-height: 28px;
            text-align: center;

            cursor: ns-resize;
            vertical-align: middle;
            &.btn-add {
              right: 40px;
              cursor: pointer;
            }
            &.btn-remove {
              right: 20px;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
  .editForm {
    .action-list {
      position: absolute;
      left: 75%;
      top: 0;
      line-height: 32px;
      .action-item{
         &+.action-item{
           padding-left: 0px;
         }
      }
    }
  }
}
</style>
