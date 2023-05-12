
<template>
  <div class="type-manage">
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addType">{{ $t('term.autoexec.toolclassification') }}</span>
      </template>
      <template v-slot:topRight>
        <InputSearcher
          v-model="keyword"
          :placeholder="$t('page.namedescription')"
          @change="getTableData(1)"
        ></InputSearcher>
      </template>
      <template v-slot:content>
        <div slot="content" ref="maintable">
          <TsTable
            v-if="!showLoading"
            v-bind="tableData"
            @changeCurrent="getTableData"
            @changePageSize="getTableData(1,...arguments)"
          >
            <template slot="referenceCountForScript" slot-scope="{ row }">
              <div v-if="row.referenceCountForScript > 0" class="text-href" @click="gotoManage(row, '/script-manage')">{{ row.referenceCountForScript }}</div>
              <div v-else>{{ row.referenceCountForScript || 0 }}</div>
            </template>
            <template slot="referenceCountForTool" slot-scope="{ row }">
              <div v-if="row.referenceCountForTool > 0" class="text-href" @click="gotoManage(row, '/tool-manage')">{{ row.referenceCountForTool }}</div>
              <div v-else>{{ row.referenceCountForTool || 0 }}</div>
            </template>
            <template slot="referenceCountForCombop" slot-scope="{ row }">
              <div v-if="row.referenceCountForCombop > 0" class="text-href" @click="gotoManage(row, '/action-manage')">{{ row.referenceCountForCombop }}</div>
              <div v-else>{{ row.referenceCountForCombop || 0 }}</div>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="icon tsfont-edit" @click.stop="edit(row)"> {{ $t('page.edit') }}</li>
                  <li
                    class="icon tsfont-trash-o"
                    :title="row.type==='factory'? $t('term.autoexec.factoryclassnodelete') : (row.referenceCountForScript>0 ||row.referenceCountForTool>0|| row.referenceCountForCombop > 0?$t('term.autoexec.usedtooldesc'):'')"
                    :class="{disable:row.referenceCountForScript>0 ||row.referenceCountForTool>0 || row.referenceCountForCombop > 0}"
                    @click.stop="deleteRow(row)"
                  >{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
          <Loading :loadingShow="showLoading" type="fix"></Loading>
        </div>
      </template>
    </TsContain>
    <TsDialog
      type="modal"
      :isShow.sync="isShow"
      :title="title"
      @on-ok="okType"
      @on-close="close"
    >
      <template v-slot>
        <div class="type-main input-border">
          <Loading :loadingShow="typeFormShowLoading" type="fix"></Loading>
          <TsForm
            ref="typeForm"
            v-model="typeFormConfig"
            :item-list="typeForm"
            type="type"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  filters: {
  },
  props: {
  },
  data() {
    let _this = this;
    return {
      keyword: '',
      showLoading: true,
      typeFormShowLoading: false,
      tableData: {
        theadList: [
          { title: _this.$t('page.name'), key: 'name'},
          { title: _this.$t('term.autoexec.customtoollibrary'), key: 'referenceCountForScript'},
          { title: _this.$t('term.autoexec.toollibrary'), key: 'referenceCountForTool'},
          { title: _this.$t('term.autoexec.combinationtool'), key: 'referenceCountForCombop'},
          { title: _this.$t('page.description'), key: 'description'},
          { title: ' ', key: 'action', align: 'right', width: 10 }
        ],
        currentPage: 1,
        pageSize: 20,
        pageCount: 1
      },
      isShow: false,
      title: _this.$t('page.build'),
      typeForm: {
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          width: '100%',
          label: _this.$t('page.name'),
          validateList: [
            'required', 
            'name-special', 
            { name: 'searchUrl',
              url: 'api/rest/autoexec/type/save', 
              key: 'name',
              params: {
                id: _this.typeId || ''
              },
              message: _this.$t('message.targetisexists', {target: _this.$t('page.name')})
            }
          ]
        },
        description: {
          type: 'textarea',
          name: 'description',
          value: '',
          width: '100%',
          maxlength: 500,
          label: _this.$t('page.description')
        },
        authList: {
          label: _this.$t('page.auth'),
          type: 'userselect',
          validateList: [{ name: 'required', message: this.$t('page.authuserroleteam')}], 
          multiple: true,
          transfer: true,
          groupList: ['user', 'team', 'role', 'common'],
          desc: _this.$t('term.autoexec.hasauthinfo')
        },
        reviewAuthList: {
          label: _this.$t('term.autoexec.auditauthorization'),
          type: 'userselect',
          validateList: [{ name: 'required', message: this.$t('page.authuserroleteam') }], 
          multiple: true,
          transfer: true,
          groupList: ['user', 'team', 'role', 'common'],
          desc: _this.$t('term.autoexec.hasauthtip')
        }
      },
      typeFormConfig: {
        name: '',
        description: '',
        authList: [],
        reviewAuthList: []
      },
      typeId: null
    };
  },
  beforeCreate() {},
  created() {
    this.getTableData();
    let query = this.$route.query;
    if (query && query.type && query.type == 'add') {
      // 从发布工具分类跳过来
      this.addType();
    }
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
    getTableData(currentPage, pageSize) {
      let data = {
        keyword: this.keyword,
        currentPage: currentPage || this.tableData.currentPage,
        pageSize: pageSize || this.tableData.pageSize
      };
      this.showLoading = true;
      this.$api.autoexec.action.getActionType(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = Object.assign(this.tableData, res.Return);
        }
      }).finally(() => {
        this.showLoading = false;
      });
    },
    addType() {
      this.title = this.$t('dialog.title.addtarget', {target: this.$t('page.classify')});
      this.typeId = null;
      Object.keys(this.typeFormConfig).forEach(key => {
        if (key == 'authList' || key == 'reviewAuthList') {
          this.typeFormConfig[key] = ['common#alluser'];
        } else {
          this.typeFormConfig[key] = '';
        }
      });
      this.typeForm.name.validateList[2].params.id = '';
      this.isShow = true;
    },
    edit(row) {
      this.isShow = true;
      this.typeFormShowLoading = true;
      this.title = this.$t('dialog.title.edittarget', {target: this.$t('page.classify')});
      this.typeId = row.id;
      this.$api.autoexec.action.getType({id: row.id}).then(res => {
        if (res.Status == 'OK') {
          let data = res.Return;
          this.typeFormConfig.name = data.name;
          this.typeFormConfig.description = data.description;
          this.typeFormConfig.authList = data.authList;
          this.typeFormConfig.reviewAuthList = data.reviewAuthList;
        }
      }).finally(() => {
        this.typeFormShowLoading = false;
      });
      this.typeForm.name.validateList[2].params.id = row.id;
    },
    okType() {
      if (!this.$refs.typeForm.valid()) {
        return;
      }
      let data = this.$utils.deepClone(this.typeFormConfig);
      if (this.typeId) {
        this.$set(data, 'id', this.typeId);
      }
      this.$api.autoexec.action.saveType(data).then(res => {
        if (res.Status == 'OK') {
          this.isShow = false;
          this.$Message.success(this.$t('message.savesuccess'));
          this.getTableData(1);
        }
      });
    },
    close() {
      this.isShow = false;
    },
    deleteRow(row) {
      if (row.referenceCountForScript > 0 || row.referenceCountForTool > 0 || row.referenceCountForCombop > 0) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.action.deleteType({id: row.id}).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.getTableData();
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    gotoManage(row, path) {
      this.$router.push({
        path: path,
        query: {typeId: row.id}
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
