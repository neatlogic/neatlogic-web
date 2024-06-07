<template>
  <div class="paramSetting">
    <TsFormInput
      v-model="keyword"
      class="input-border"
      search
      clearable
      @on-enter="getParamList"
      @on-clear="getParamList"
    ></TsFormInput>
    <div class="add-param border-color text-action" @click="addParam">
      <i class="tsfont-plus"></i>
    </div>
    <div v-if="paramList && paramList.length>0" class="param-box">
      <div v-for="(item,index) in paramList" :key="index" class="bg-block param-list radius-sm">
        <div class="overflow">
          {{ item.name }}
        </div>
        <div class="btn-box">
          <div class="btn-box-bg bg-block"></div>
          <div class="action-list">
            <i class="tsfont-edit text-tip-active padding-lf" :title="$t('page.edit')" @click="editParam(item)"></i>
            <i class="tsfont-trash-s text-tip-active padding-lf" :title="$t('page.delete')" @click="delParam(item)"></i>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <no-data></no-data>
    </div>
    <TsDialog
      type="modal"
      :isShow.sync="paramDialog"
      :title="dialogTitle"
      :maskClose="false"
      @on-ok="saveParam"
    >
      <template>
        <Alert v-if="paramId">{{ $t('term.process.paramstip') }}</Alert>
        <TsForm
          ref="paramForm"
          :itemList="paramForm"
          type="type"
          :labelWidth="80"
        ></TsForm>
      </template>
    </TsDialog>
    <TsDialog
      type="modal"
      :isShow.sync="delparamDialog"
      :title="$t('page.warning')"
      height="400px"
      btnType="error"
      :maskClose="false"
      @on-ok="okDelParam"
    >
      <template v-slot>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <Alert type="error">{{ $t('term.process.paramsdeltip') }}</Alert>
        <div style="padding-bottom:10px;">
          <div>
            <span class="text-title">{{ $t('page.referencelist') }}</span>
            <span class="tsfont-rotate-right text-action" style="padding-left:8px;" @click="refreshReference"></span>
          </div>
          <table v-if="referenceList.length>0" class="reference-table">
            <thead>
              <tr class>
                <th>{{ $t('term.process.stepname') }}</th>
                <th>{{ $t('term.process.soptemp') }}</th>
                <th>{{ $t('page.action') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) of referenceList" :key="index">
                <td>{{ item.name }}</td>
                <td>{{ item.changeSopName || item.changeSopId }}</td>
                <td>
                  <div class="action-group">
                    <div class="action-list">
                      <span class="action-item tsfont-edit last" @click="toStep(item)"></span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else>
            <no-data></no-data>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'ParamSetting',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  filters: {},
  props: {},
  data() {
    return {
      keyword: '',
      paramDialog: false,
      dialogTitle: this.$t('dialog.title.addtarget', {target: this.$t('term.process.changeparams')}),
      paramId: null,
      paramForm: [
        {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          width: '90%',
          validateList: ['required', 'parameter', {
            name: 'searchUrl', url: 'api/rest/change/param/save'
          }]
        },
        {
          type: 'select',
          name: 'mappingMethod',
          value: '',
          label: this.$t('term.process.mappingmethod'),
          width: '90%',
          transfer: true,
          validateList: ['required']
        }
      ],
      paramList: [],
      delparamDialog: false,
      loadingShow: true,
      referenceList: [],
      saving: false,
      deleting: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getParamList();
    this.getMappingMethodList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getParamList() {
      let data = {
        keyword: this.keyword
      };
      this.$api.process.change.getChangeParamList(data).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return;
          this.paramList = obj.changeParamList;
        }
      });
    },
    getMappingMethodList() {
      //映射方式列表
      let data = {};
      this.$api.process.change.changeParamMappingmethodList(data).then(res => {
        if (res.Status == 'OK') {
          this.paramForm[1].dataList = res.Return;
        }
      });
    },
    addParam() {
      this.paramForm.forEach(e => {
        e.value = '';
      });
      this.paramId = null;
      this.dialogTitle = this.$t('dialog.title.addtarget', {target: this.$t('term.process.changeparams')});
      this.paramDialog = true;
    },
    saveParam() {
      let paramForm = this.$refs.paramForm;
      if (paramForm.valid()) {
        if (!this.saving) {
          this.saving = true;
          let data = paramForm.getFormValue();
          if (this.paramId) {
            this.$set(data, 'id', this.paramId);
          }
          this.$api.process.change.saveChangeParam(data).then(res => {
            this.saving = false;
            if (res.Status == 'OK') {
              this.paramDialog = false;
              this.$Message.success(this.$t('message.savesuccess'));
              this.getParamList();
            }
          }).catch(error => {
            this.saving = false;
          });
        }
      }
    },
    editParam(obj) {
      this.paramForm[0].value = obj.name;
      this.paramForm[1].value = obj.mappingMethod;
      this.dialogTitle = this.$t('dialog.title.edittarget', {target: this.$t('term.process.changeparams')});
      this.paramId = obj.id;
      this.paramDialog = true;
    },
    getParamReferenceList(isReference) {
      return new Promise((resolve, reject) => {
        let data = {
          changeParamId: this.paramId
        };
        this.$api.process.change.getParamReferenceList(data).then(res => {
          if (res.Status == 'OK') {
            this.loadingShow = false;
            this.referenceList = res.Return || [];
            if (isReference) {
              this.$Message.success(this.$t('message.executesuccess'));
            }
            resolve(this.referenceList);
          }
        });
      });
    },
    refreshReference() {
      this.getParamReferenceList(true);
    },
    async delParam(obj) {
      this.paramId = obj.id;
      let referenceList = await this.getParamReferenceList();
      if (referenceList.length > 0) {
        this.delparamDialog = true;
      } else {
        this.okDelParam();
      }
    },
    okDelParam() {
      if (!this.deleting) {
        this.deleting = true;
        let data = {
          changeParamId: this.paramId
        };
        this.$api.process.change.delChangeParam(data).then(res => {
          this.deleting = false;
          if (res.Status == 'OK') {
            this.paramId = null;
            this.delparamDialog = false;
            this.$Message.success(this.$t('message.deletesuccess'));
            this.getParamList();
          }
        }).catch(error => {
          this.deleting = false;
        });
      }
    },
    toStep(obj) {
      window.open(HOME + '/process.html#/change-overview?changeSopId=' + obj.changeSopId + '&uuid=' + obj.uuid, '_blank');
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
.paramSetting {
  padding: 0 16px;
  .add-param {
    border: 1px dashed;
    height: 32px;
    line-height: 32px;
    cursor: pointer;
    text-align: center;
    margin: 16px 0;
  }
  .param-box {
    height: calc(100vh - 230px);
    overflow: auto;
  }
  .param-list {
    position: relative;
    width: 100%;
    padding: 16px;
    margin-bottom: 8px;
    &:hover {
      .btn-box {
        display: block;
      }
    }
    .btn-box {
      position: absolute;
      top: 8px;
      right: 0;
      padding-right: 8px;
      display: none;
      .padding-lf {
        padding-left: 8px;
      }
    }

    .action-list {
      position: relative;
      z-index: 2;
    }
    .btn-box-bg {
      width: 100%;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      z-index: 1;
      filter: blur(4px);
    }
  }
}
.reference-table {
  width: 100%;
  border-spacing: 0;

  th {
    text-align: left;
  }

  tr {
    height: 40px;
  }
}
</style>
