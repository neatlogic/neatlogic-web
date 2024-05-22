<template>
  <div class="RelationsManage">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addRelations">{{ $t('term.process.subtaskpolicy') }}</span>
      </template>
      <template slot="topRight">
        <div>
          <InputSearcher
            v-model="keyword"
            :placeholder="$t('form.placeholder.name')"
            @change="searchRelationList(1)"
          ></InputSearcher>
        </div>
      </template>
      <div slot="content">
        <div class="card-wrapper border-color">
          <TsTable
            v-if="tabledata"
            v-bind="tabledata"
            :theadList="theadList"
            :padding="false"
            @operation="operation"
            @changeCurrent="getPageData"
            @changePageSize="changePageSize"
          >
            <template slot="fcu" slot-scope="{ row }">
              <UserCard :uuid="row.lcu || row.fcu" :initType="row.initType"></UserCard>
            </template>
            <template slot="fcd" slot-scope="{ row }">
              {{ row.lcd || row.fcd | formatDate }}
            </template>
            <template slot="num" slot-scope="{ row }">
              <div>{{ row.num == '-1' ? $t('term.process.unlimitednum') : row.num }}</div>
            </template>
            <template slot="policy" slot-scope="{ row }">
              <div>{{ row.policy == 'any' ? $t('term.process.anypersoncompletes') : $t('term.process.allpersoncompletes') }}</div>
            </template>
            <template v-slot:action="{row}">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li>
                    <TsFromSwitch
                      v-model="row.isActive"
                      :class="{'text-grey disable': row.referenceCount > 0}"
                      showStatus
                      :disabled="row.referenceCount > 0"
                      @on-change="updateStatus(row)"
                    ></TsFromSwitch>
                  </li>
                  <li :class="{'text-grey disable': row.referenceCount > 0}" @click="remove(row)"><span>{{ $t('page.delete') }}</span></li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </div>
    </TsContain>
    <TsDialog
      type="modal"
      :isShow.sync="relationDialog"
      :title="dialogTitle"
      :loading="saving"
      @on-ok="saveRelations"
      @on-close="cancleRelations"
    >
      <template v-slot>
        <div>
          <TsForm ref="relationDialogForm" :item-list="relationDialogForm" :label-width="100">
            <template v-slot:buttonList>
              <div class="custom-button">
                <div v-for="(item, index) in customButtonList" :key="index" class="btn-list bg-op radius-md">
                  <div>
                    <TsForm
                      ref="btnForm"
                      :dataConfig="$utils.deepClone(item)"
                      :itemList="$utils.deepClone(btnFormConfig)"
                      :label-width="80"
                      @change="(val) => { changeBtnValue(val,index) }"
                    >
                      <template v-slot:name>
                        <TsFormInput
                          :ref="'nameForm' + index"
                          v-model="item.name"
                          :validateList="validateList"
                          :errorMessage="item.errorMessage"
                          @change="(val)=>{validName(val, item, index)}"
                        ></TsFormInput>
                      </template>
                    </TsForm>
                  </div>
                  <div class="text-tip-active tsfont-trash-o btn-delete" @click="deleteCustomBtn(index)"></div>
                </div>
              </div>
              <div class="text-href tsfont-plus" @click="addCustomBtn">{{ $t('page.add') }}</div>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import UserCard from '@/resources/components/UserCard/UserCard.vue';
export default {
  name: '',
  components: {
    UserCard,
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    TsFromSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  filters: {},
  props: {},
  data() {
    let _this = this;
    return {
      loadingShow: true,
      keyword: null,
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name',
          type: 'linktext',
          textValue: 'view'
        },
        {
          title: this.$t('term.process.dealwithusernum'),
          key: 'num'
        },
        {
          title: this.$t('term.process.completepolicy'),
          key: 'policy'
        },
        {
          title: this.$t('term.process.relprocess'),
          key: 'referenceCount',
          type: 'text'
        },
        {
          title: this.$t('page.fcu'),
          key: 'fcu'
        },
        {
          title: this.$t('page.fcd'),
          key: 'fcd'
        },
        {title: '', key: 'action'}
        // {
        //   key: 'action', title: '', type: 'action', operations: [{icon: 'tsfont-trash-s', name: '删除', action: 'del', type: 'text', style: ''}]
        // }
      ],
      tabledata: {},
      pageSize: 20,
      relationDialog: false,
      dialogTitle: this.$t('dialog.title.addtarget', {'target': this.$t('term.process.subtaskpolicy')}),
      strategId: null,
      relationDialogForm: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          width: '100%',
          maxlength: 50,
          validateList: [
            { name: 'required', message: this.$t('form.validate.required', {target: this.$t('page.name')}) },
            { name: 'name-special' },
            { name: 'searchUrl', url: 'api/rest/task/save', message: this.$t('form.validate.repeat', {target: this.$t('term.process.subtaskpolicy')}), key: 'name',
              params: {
                id: _this.strategId || ''
              } }
          ]
        },
        {
          type: 'select',
          name: 'num',
          label: this.$t('term.process.dealwithusernum'),
          desc: this.$t('term.process.dealwithusernumdesc'),
          width: '100%',
          transfer: true,
          multiple: false,
          dataList: [
            {text: this.$t('term.process.unlimitednum'), value: '-1'},
            {text: '1', value: '1'},
            {text: '2', value: '2'},
            {text: '3', value: '3'},
            {text: '4', value: '4'},
            {text: '5', value: '5'},
            {text: '6', value: '6'},
            {text: '7', value: '7'},
            {text: '8', value: '8'},
            {text: '9', value: '9'},
            {text: '10', value: '10'}
          ],
          validateList: ['required']
        },
        {
          type: 'select',
          name: 'policy',
          label: this.$t('term.process.completepolicy'),
          width: '100%',
          transfer: true,
          multiple: false,
          dataList: [],
          validateList: ['required']
        },
        {
          type: 'switch',
          name: 'isActive',
          label: this.$t('page.enable'),
          width: '90%',
          transfer: true,
          multiple: false,
          value: 0,
          dataList: []
        },
        {
          name: 'buttonList',
          type: 'slot',
          label: this.$t('term.process.custombtn')
        }

      ],
      saving: false,
      customButtonList: [],
      btnFormConfig: [
        {
          type: 'slot',
          name: 'name',
          label: this.$t('term.process.btntext')
        },
        {
          type: 'text',
          name: 'defaultContent',
          label: this.$t('page.defaultcontent')
        }
      ],
      validateList: ['required']
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async init() {
      await this.searchRelationList(1);
      await this.policyList();
      if (this.$route.query.atrixFormDialogShow) {
        //跳转到这个页面时，需要进行新增
        this.addRelations();
        this.loadingShow = false;
      }
    },
    async policyList() {
      let data = 'neatlogic.framework.process.constvalue.task.TaskConfigPolicy';
      await this.$api.process.strategy.listEnumGet(data).then(res => {
        if (res.Status == 'OK') {
          this.relationDialogForm[2].dataList = res.Return;
        }
      });
    },
    async searchRelationList(currentPage) {
      let data = {
        keyword: this.keyword,
        pageSize: this.pageSize,
        needPage: true,
        currentPage: currentPage
      };
      await this.$api.process.strategy.searchStrategy(data).then(res => {
        if (res.Status == 'OK') {
          this.tabledata = res.Return;
          this.loadingShow = false;
        }
      });
    },
    getPageData(currentPage) {
      this.searchRelationList(currentPage);
    },
    changePageSize(size) {
      this.pageSize = size;
      this.searchRelationList();
    },
    operation(view, row) {
      if (view === 'del') {
        this.delRelations(row);
      } else {
        this.editRelations(view);
      }
    },
    addRelations() {
      this.dialogTitle = this.$t('dialog.title.addtarget', {'target': this.$t('term.process.subtaskpolicy')});
      this.strategId = null;
      this.relationDialogForm[0].validateList[2].params.id = '';
      this.relationDialog = true;
      this.customButtonList = [];
    },
    editRelations(obj) {
      this.dialogTitle = this.$t('dialog.title.edittarget', {'target': this.$t('term.process.subtaskpolicy')});
      this.strategId = obj.id;
      this.relationDialogForm.forEach(e => {
        e.value = obj[e.name];
      });
      this.relationDialogForm[0].validateList[2].params.id = obj.id;
      this.customButtonList = obj.config ? (obj.config.customButtonList || []) : [];
      this.relationDialog = true;
    },
    remove(row) {
      if (row.referenceCount) {
        if (row.referenceCount == 0) {
          this.delRelations(row);
        }
      } else {
        this.delRelations(row);
      }
    },
    updateStatus(row) {
      if (row.referenceCount) {
        if (row.referenceCount == 0) {
          this.seveData(row);
        }
      } else {
        this.seveData(row);
      }
    },
    delRelations(obj) {
      let _this = this;
      let data = {
        id: obj.id
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: obj.name}),
        btnType: 'error',
        'on-ok': vnode => {
          if (vnode.okBtnDisable) {
            return;
          }
          vnode.okBtnDisable = true;
          this.$api.process.strategy.deleteStrategy(data).then(res => {
            if (res.Status == 'OK') {
              _this.searchRelationList(1);
            }
          });
          vnode.isShow = false;
          vnode.okBtnDisable = false;
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
          vnode.okBtnDisable = false;
        }
      });
    },
    seveData(data) {
      this.$api.process.strategy.saveStrategy(data).then(res => {
        this.saving = false;
        if (res.Status == 'OK') {
          this.relationDialog = false;
          this.searchRelationList(1);
          this.$Message.success(this.$t('message.savesuccess'));
        }
      }).catch(error => {
        this.saving = false;
      });
    },
    validRelations() { //校验子任务策略保存信息
      let isValid = true;
      let relationForm = this.$refs.relationDialogForm;
      let btnFormList = this.$refs.btnForm;
      if (!relationForm.valid()) {
        isValid = false;
      }
      if (btnFormList) {
        Object.keys(btnFormList).forEach(key => {
          if (!btnFormList[key].valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    },
    saveRelations() {
      if (!this.validRelations()) {
        return;
      }
      if (!this.saving) {
        this.saving = true;
        let data = this.$refs.relationDialogForm.getFormValue();
        delete data.buttonList;
        if (this.strategId) {
          data.id = this.strategId;
        }
        if (this.customButtonList.length > 0) {
          this.$set(data, 'config', {});
          let customButtonList = this.customButtonList.map(item => {
            return {
              name: item.name,
              defaultContent: item.defaultContent
            };
          });
          this.$set(data.config, 'customButtonList', customButtonList);
        }
        this.seveData(data);
      }
    },
    cancleRelations() {
      this.relationId = null;
      this.relationDialogForm.forEach(e => {
        if (e.name != 'isActive') {
          e.value = '';
        } else {
          e.value = 0;
        }
      });
    },
    changeBtnValue(value, index) {
      this.customButtonList.splice(index, 1, value);
    },
    addCustomBtn() {
      this.customButtonList.push({
        name: '',
        defaultContent: ''
      });
    },
    deleteCustomBtn(index) {
      this.customButtonList.splice(index, 1);
    },
    validName(val, item, index) { //校验按钮名称重复
      let isVaild = true;
      this.customButtonList.forEach((c, cindex) => {
        if (val && index != cindex && (c.name == val)) {
          isVaild = false;
        }
      });
      if (!isVaild) {
        this.$set(item, 'errorMessage', this.$t('form.validate.repeat'));
      } else {
        this.$set(item, 'errorMessage', '');
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
.btn-list {
  position: relative;
  padding: 24px 24px 2px 16px;
  &:not(:last-child) {
    margin-bottom: 10px;
  }
  &:hover{
    .btn-delete {
      display: block;
    }
  }
  .btn-delete {
    position: absolute;
    top: 0;
    right: 4px;
    display: none;
  }
}
</style>
