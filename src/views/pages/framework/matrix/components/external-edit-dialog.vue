<template>
  <div>
    <TsDialog
      v-bind="dialogData"
      :is-show="true"
      class-name="matrix-external-modal"
      height="100px"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div class="editForm input-border">
          <TsForm
            ref="mainForm"
            :item-list="formSetting"
            type="type"
            label-postion="right"
          >
            <template v-slot:integrationUuid>
              <div>
                <TsFormSelect
                  v-model="integrationUuid"
                  v-bind="formSetting.integrationUuid"
                  :dataList="integrationUuidList"
                >
                  <template v-slot:first-ul>
                    <li class="tsfont-plus text-href first-slot" @click="addIntegration()">{{ $t('page.config') }}</li>
                  </template>
                </TsFormSelect>
                <div class="action-group action-list">
                  <span class="action-item tsfont-rotate-right" :title="$t('page.refresh')" @click="getIntegrationUuidList(true)"></span>
                  <span v-if="isDisabledEditMatrix" class="action-item tsfont-edit text-disabled" :title="$t('message.framework.notcaneditmatrixtip')"></span>
                  <template v-else>
                    <span
                      v-if="integrationUuid"
                      class="action-item tsfont-edit"
                      :title="$t('term.framework.selectintgn')"
                      @click="goEditIntegration"
                    ></span>
                  </template>
                </div>
              </div>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 外部数据源
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
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
      integrationUuid: null,
      isDisabledEditMatrix: false, // 是否禁用矩阵不可编辑
      integrationUuidList: [],
      dialogData: {
        type: 'modal',
        title: this.$t('dialog.title.edittarget', {'target': this.title}),
        maskClose: false,
        isShow: false,
        width: 'medium'
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
        integrationUuid: {
          type: 'slot',
          name: 'integrationUuid',
          label: this.$t('term.framework.integrationsetting'),
          transfer: true,
          width: '75%',
          valueName: 'uuid',
          textName: 'name',
          value: null,
          disabled: false,
          disabledHoverTitle: '',
          validateList: [
            'required'
          ],
          onChange: (val) => {
            if (!val) {
              this.getIntegrationUuidList();
            }
          }
        }
      }
    };
  },
  beforeCreate() {},
  async created() {
    this.getIntegrationUuidList();
    this.getIntegrationUuid();
    let isDisabled = await this.$frameworkUtils.isDependency(this.matrixUuid, 'matrix');
    for (let i in this.formSetting) {
      if (i == 'integrationUuid') {
        this.formSetting[i].disabled = isDisabled;
        this.formSetting[i].disabledHoverTitle = isDisabled ? this.$t('message.framework.notcaneditmatrixtip') : '';
      }
    }
    this.isDisabledEditMatrix = isDisabled;
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
      if (this.$refs.mainForm.valid()) {
        let data = {
          uuid: this.matrixUuid,
          integrationUuid: this.integrationUuid
        };
        this.$api.framework.matrix.saveExternal(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.closeDialog(true);
          }
        });
      }
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    getIntegrationUuidList(isClick) {
      this.$api.framework.matrix
        .getIntegrationList()
        .then(res => {
          if (res.Status == 'OK') {
            this.integrationUuidList = res.Return.tbodyList.filter(item => item.isActive);
            if (isClick) {
              this.$Message.success(this.$t('message.refreshsuccess'));
            }
          }
        });
    },
    getIntegrationUuid() {
      this.$api.framework.matrix
        .getExternalConfig({ uuid: this.matrixUuid })
        .then(res => {
          if (res.Status == 'OK') {
            if (res.Return && res.Return.integrationUuid) {
              this.integrationUuid = res.Return.integrationUuid;
            } else {
              this.integrationUuid = null;
            }
          }
        });
    },
    addIntegration() {
      //跳转到集成管理的页面
      window.open(HOME + '/framework.html#/integration-manage?isIntegrationDialogShow=true', '_blank');
    },
    goEditIntegration() {
      //跳转到集成编辑的页面
      window.open(HOME + '/framework.html#/integration-manage?isIntegrationDialogShow=true' + '&&integrationUuid=' + this.integrationUuid, '_blank');
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
