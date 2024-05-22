<template>
  <div class="formOverview">
    <Loading :loading-show="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span class="tsfont-plus action-item" @click="addForm">{{ $t('page.form') }}</span>
          <span class="tsfont-upload action-item" @click.self="$refs.uploadDialog.showDialog">{{ $t('page.import') }}</span>
          <UploadDialog
            ref="uploadDialog"
            :actionUrl="actionUrl"
            :formatList="formatList"
            @on-all-upload="searchForm"
          />
        </div>
      </template>
      <template slot="topRight">
        <InputSearcher v-model="keyword" @change="searchForm(1)"></InputSearcher>
      </template>
      <div slot="content" class="content">
        <TsCard
          v-if="formData.cardList"
          v-bind="formData"
          :boxShadow="false"
          :padding="false"
          :fixBtn="true"
          :sm="12"
          :lg="8"
          :xl="6"
          :xxl="4"
          @action="action"
          @updatePage="searchForm"
        >
          <template slot-scope="{ row }">
            <div class="overvivew-main" :class="row.isActive == 0 ? 'isStop' : ''">
              <div class="form-switch">
                <TsFormSwitch
                  v-model="row.isActive"
                  :true-value="1"
                  :false-value="0"
                  :disabled="row.referenceCount > 0 ? true : false"
                  @on-change="changeStatus(row)"
                ></TsFormSwitch>
              </div>
              <div class="title text-action overflow pb-sm" :title="row.name" @click="goEditForm(row.uuid, row.currentVersionUuid)">
                {{ row.name }}
              </div>
              <div class="text-title">{{ $t('page.versions') }}：{{ row.currentVersion }}</div>
            </div>
          </template>
        </TsCard>
      </div>
    </TsContain>
    <TsDialog
      type="modal"
      :is-show.sync="addModel"
      :mask-close="false"
      :has-footer="true"
    >
      <template v-slot:header>
        <div>{{ isCopy ? $t('page.copy') : $t('page.build') }}</div>
      </template>
      <TsForm ref="mainForm" :item-list="formSetting" type="type"></TsForm>
      <template v-slot:footer>
        <div v-if="!isCopy" class="footer-btn-contain">
          <Button @click="cancelAddForm">{{ $t('page.cancel') }}</Button>
          <Button type="primary" :disabled="!canSubmit" @click="okAddForm">{{ $t('page.confirm') }}</Button>
        </div>
        <div v-else class="footer-btn-contain">
          <Button @click="cancelAddForm">{{ $t('page.cancel') }}</Button>
          <Button type="primary" :disabled="!canSubmit" @click="okCopyForm(true)">{{ $t('term.framework.copyversion') }}</Button>
          <Button type="primary" :disabled="!canSubmit" @click="okCopyForm(false)">{{ $t('page.copyall') }}</Button>
        </div>
      </template>
    </TsDialog>
  </div>
</template>

<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    UploadDialog: () => import('@/resources/components/UploadDialog/UploadDialog.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  directives: { download },
  props: [''],
  data() {
    let _this = this;
    return {
      actionUrl: BASEURLPREFIX + '/api/binary/form/import',
      keyword: null, //关键字
      isTitleText: false,
      formData: {}, //表单列表数据
      formatList: ['form'],
      currentPage: 1,
      pageSize: 24,
      clickFlag: true,
      formUuid: null,
      formName: '',
      // formRowNum:0,
      delModel: false, //删除模态框
      loadingShow: true,
      isCopy: false, //是否复制表单
      copySetting: {
        currentVersionUuid: ''
      },
      addModel: false,
      uuid: null, //form跳转携带uuid
      formSetting: [
        {
          type: 'text',
          name: 'name',
          value: '', //默认值
          maxlength: 30,
          width: '100%',
          label: this.$t('page.formname'),
          validateList: [
            'required',
            'name-special',
            {
              name: 'searchUrl',
              url: 'api/rest/form/save',
              key: 'name',
              params: (value, rule) => {
                if (this.isCopy) {
                  rule.url = 'api/rest/form/copy';
                  return {};
                } else {
                  rule.url = 'api/rest/form/save';
                  return { uuid: this.formUuid };
                }
              },
              validSearchUrl: (isValid, msg) => {
                _this.banSubmit(isValid);
              }
            }
          ]
        }
      ],
      canSubmit: true //是否可以提交
    };
  },
  mounted() {},
  created() {
    this.searchForm();
  },
  methods: {
    restoreHistory(historyData) {
      this.keyword = historyData['keyword'];
      this.currentPage = historyData['currentPage'] || 1;
    },
    banSubmit: function(isValid) {
      //this.canSubmit = isValid;
    },
    searchForm: function(currentPage) {
      //初始化表单列表
      this.currentPage = Math.floor(currentPage) || this.currentPage;
      let data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        keyword: this.keyword
      };
      this.$addHistoryData('keyword', this.keyword);
      this.$addHistoryData('currentPage', this.currentPage);
      this.$api.framework.form
        .searchFormOverview(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.loadingShow = false;
            let formData = res.Return;
            Object.keys(formData).forEach(item => {
              if (item != 'tbodyList') {
                this.$set(this.formData, item, formData[item]);
              } else {
                this.$set(this.formData, 'cardList', formData[item]);
              }
            });
            this.currentPage = res.Return.currentPage;

            this.formData.cardList.map(v => {
              if (v.referenceCount > 0) {
                v.disable = true;
              } else {
                v.disable = false;
              }

              v.btnList = [
                { name: this.$t('page.reference'), value: 'ReferenceSelect', icon: '', type: 'ReferenceSelect', calleeType: 'form' },
                { name: this.$t('page.delete'), value: 'del', type: 'del', icon: 'tsfont-trash-o', disable: true, text: this.$t('message.framework.notdelformtip'), key: 'referenceCount' },
                {
                  name: this.$t('term.framework.multi'),
                  value: 'dropdown',
                  icon: '',
                  type: 'dropdown',
                  menuArr: [
                    { name: this.$t('page.copy'), value: 'copy', type: 'text' },
                    { name: this.$t('page.export'), value: 'export', type: 'download' }
                  ]
                }
              ];
            });
          }
        });
    },
    changeStatus: function(row) {
      //启用
      this.updateForm(row);
    },
    action(row, value) {
      if (value == 'del') {
        this.delform(row);
      } else if (value == 'copy') {
        this.copyForm(row);
      } else if (value == 'export') {
        this.btnExports(row.uuid);
      }
    },
    btnExports(uuid) {
      //导出流程
      let data = {};
      let url = '/api/binary/form/export?uuid=' + uuid;
      this.$utils.download(this, url, data, 'get');
    },
    updateForm: function(row) {
      //表单更新
      let data = {
        uuid: row.uuid,
        name: row.name,
        isActive: row.isActive
      };
      this.$api.framework.form
        .updateData(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        });
    },
    delform(row) {
      if (row.referenceCount > 0) {
        return;
      }
      this.formName = row.name;
      this.formUuid = row.uuid;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.formName}),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          let data = {
            uuid: this.formUuid
          };
          this.$api.framework.form.delFormItem(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchForm(1);
            }
          });
        }
      });
    },
    addForm: function() {
      this.addModel = true;
      this.formSetting[0].value = null;
      this.uuid = null;
      this.isCopy = false;
      this.canSubmit = true;
    },
    copyForm: function(row) {
      this.formSetting[0].value = row.name + '_copy';
      this.copySetting.currentVersionUuid = row.currentVersionUuid;
      this.uuid = row.uuid;
      this.isCopy = true;
      this.addModel = true;
    },
    okAddForm: function() {
      let uuid = this.uuid;
      let Form = this.$refs.mainForm;
      if (Form.valid()) {
        let data = Form.getFormValue();
        if (data.name.length > 30) {
          this.$Message.error(this.$t('message.namelong'));
          return false;
        }
        this.uuid ? (data.isActive = 0) : (data.isActive = 1);
        data.formConfig = {};
        this.$router.push({
          path: '/form-edit',
          query: {
            uuid: this.$utils.setUuid(),
            isnew: true,
            name: data.name
          }
        });
      }
    },
    okCopyForm: function(isActive) {
      let Form = this.$refs.mainForm;
      let _this = this;
      if (Form.valid()) {
        let data = Form.getFormValue();
        data.uuid = this.uuid;
        isActive && (data.currentVersionUuid = _this.copySetting.currentVersionUuid);
        this.$api.framework.form.copyForm(data).then(res => {
          _this.addModel = false;
          if (res.Status == 'OK') {
            _this.formData.cardList.unshift({
              ...res.Return
            });
            this.$Message.success(this.$t('message.copysuccess'));
            this.searchForm(1);
          }
        });
      }
    },
    cancelAddForm: function() {
      this.addModel = false;
    },
    btnExport: function(uuid, name) {
      //导出
      this.$utils.downloadUrl('/api/binary/form/export?uuid=' + uuid);
    },
    goEditForm: function(uuid, currentVersionUuid) {
      let _this = this;
      this.$router.push({
        path: '/form-edit',
        query: {
          uuid: uuid,
          currentVersionUuid: currentVersionUuid
        }
      });
    }
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { uuid: param }
        };
      };
    }
  },
  watch: {}
};
</script>

<style lang="less" scoped>
.formOverview {
  .tscard-container {
    .tscard-body {
      .overvivew-main {
        position: relative;
        width: 100%;
        .form-switch {
          position: absolute;
          right: 8px;
          top: 0px;
          display: none;
          z-index: 10;
        }
      }
    }
  }
}
</style>
