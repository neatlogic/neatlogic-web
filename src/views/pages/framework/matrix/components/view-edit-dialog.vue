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
              :disabled="isDisabledUpload"
              :disabledTitle="isDisabledUpload ? $t('message.framework.notcaneditmatrixtip') : ''"
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
                  width="400"
                  :transfer="true"
                >
                  <a href="javascript:void(0)">{{ $t('page.viewexample') }}</a>
                  <div slot="content" class="api">
                    <pre>
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;ci&gt;
   &lt;!--{{ $t('message.framework.cimatrixsql') }}--&gt;
  &lt;attrs&gt;
    &lt;attr name="user_id" label="{{ $t('page.userid') }}"/&gt;
    &lt;attr name="user_name" label="{{ $t('page.username') }}"/&gt;
    &lt;attr name="teamName" label="{{ $t('page.group') }}"/&gt;
  &lt;/attrs&gt;
  &lt;sql&gt;
    SELECT
    &lt;!--{{ $t('message.framework.reqciid') }}--&gt;
    `u`.`id` AS id,
    &lt;!--{{ $t('message.framework.reqciname') }}--&gt;
    `u`.`user_name` AS name,
    &lt;!--{{ $t('message.framework.reqciattrs') }}--&gt;
    `u`.`user_id` as user_id,
    `u`.`user_name` as user_name,
    group_concat( `t`.`name`) AS teamName
    FROM
    `user` `u`
    LEFT JOIN `user_team` `ut`
    ON `u`.`uuid` = `ut`.`user_uuid`
    LEFT JOIN `team` `t`
    ON `t`.`uuid` = `ut`.`team_uuid`
    GROUP BY u.uuid
  &lt;/sql&gt;
&lt;/ci&gt;
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
      this.$api.framework.matrix.saveMatrixViewList(data).then(res => {
        if (res.Status == 'OK') {
          this.editTsDialog.isShow = false;
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true);
        }
      });
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
