<template>
  <div class="RelationsManage">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addRelations">{{ this.$t('page.relation') }}</span>
      </template>
      <template slot="topRight">
        <InputSearcher
          v-model="keyword"
          @change="searchRelationList(1)"
        ></InputSearcher>
      </template>
      <div slot="content">
        <div class="card-wrapper border-color">
          <TsTable
            v-if="tabledata"
            v-bind="tabledata"
            :theadList="theadList"
            @changeCurrent="getPageData"
            @changePageSize="changePageSize"
          >
            <template slot="sourceVoList" slot-scope="{ row }">
              <div>
                {{ getTextList(row.sourceVoList) }}
              </div>
            </template>
            <template slot="name" slot-scope="{ row }">
              <span class="text-href" :class="row.referenceCount>0?'text-disabled':''" @click="editRelations(row)">{{ row.name }}</span>
            </template>
            <template slot="targetVoList" slot-scope="{ row }">
              <div>
                {{ getTextList(row.targetVoList) }}
              </div>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li :class="row.referenceCount>0?'disable':''" @click.stop>
                    <TsFormSwitch
                      v-model="row.isActive"
                      :showStatus="true"
                      :disabled="row.referenceCount>0 ?true:false"
                      :true-value="1"
                      :false-value="0"
                      @on-change="getActiveRelation(row)"
                    >
                    </TsFormSwitch>
                  </li>
                  <!-- <li class="tsfont-edit" :class="row.referenceCount>0?'disable':''" @click="editRelations(row)">{{ $t('page.add') }}</li> -->
                  <li class="tsfont-trash-s" :class="row.referenceCount>0?'disable':''" @click="delRelations(row)">{{ $t('page.delete') }}</li>
                  <li class="reference-count">
                    <Dropdown
                      v-if="row.referenceCount > 0"
                      ref="reference"
                      transfer
                      trigger="click"
                      placement="bottom-start"
                    >
                      <div class="text-action">
                        {{ $t('page.referencelist') }}
                        <span class="reference-number">{{ getAmount(row.referenceCount) }}</span>
                      </div>
                      <DropdownMenu v-if="row.referenceList.length > 0" slot="list">
                        <DropdownItem
                          v-for="(reference, rindex) in row.referenceList"
                          :key="rindex"
                          class="text-action"
                          @click.native="alterServe(reference.uuid)"
                        >
                          <div>{{ reference.name }}</div>
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                    <span v-else class="text-disabled">{{ $t('page.referencelist') }}</span>
                  </li>
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
          <TsForm ref="relationDialogForm" :item-list="relationDialogForm" :label-width="100"></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'RelationsManage',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      loadingShow: true,
      keyword: null,
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.sourcesertype'),
          key: 'sourceVoList'
        },
        {
          title: this.$t('page.targetsertype'),
          key: 'targetVoList'
        },
        {
          //这个是最后一行操作栏
          title: '',
          key: 'action',
          align: 'right',
          width: 10
        }
      ],
      tabledata: {},
      pageSize: 20,
      relationDialog: false,
      dialogTitle: this.$t('page.add'),
      relationId: null,
      relationDialogForm: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          width: '100%',
          maxlength: 50,
          validateList: [
            { name: 'required', message: this.$t('form.placeholder.name') },
            { name: 'name-special' },
            { name: 'searchUrl', url: 'api/rest/process/channeltype/relation/save', message: this.$t('form.validate.repeat', {target: this.$t('page.name')}) }
          ]
        },
        {
          type: 'select',
          name: 'sourceList',
          label: this.$t('page.sourcesertype'),
          width: '100%',
          transfer: true,
          multiple: true,
          dataList: [],
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.sourcesertype')}) }]
        },
        {
          type: 'select',
          name: 'targetList',
          label: this.$t('page.targetsertype'),
          width: '100%',
          transfer: true,
          multiple: true,
          dataList: [],
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.targetsertype')}) }]
        },
        {
          type: 'switch',
          name: 'isActive',
          value: 1,
          label: this.$t('page.enable'),
          width: '90%'
        }
      ],
      saving: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchRelationList(1);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchRelationList(currentPage) {
      let data = {
        keyword: this.keyword,
        pageSize: this.pageSize,
        currentPage: currentPage
      };
      this.$api.process.relation.getRelationList(data).then(res => {
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
    getActiveRelation(obj) { //关系激活、禁用
      if (obj.referenceCount > 0) return;
      if (!this.saving) {
        this.saving = true;
        let data = {
          channelTypeRelationId: obj.id
        };
        this.$api.process.relation.updateRelation(data).then(res => {
          if (res.Status == 'OK') {
            obj.isActive = res.Return;
            this.$Message.success(this.$t('message.executesuccess'));
            this.saving = false;
          }
        }).catch(error => {
          this.saving = false;
        });
      }
    },
    addRelations() {
      this.dialogTitle = this.$t('page.add');
      this.searchType();
      this.relationDialog = true;
    },
    editRelations(obj) {
      if (obj.referenceCount === 0) {
        this.dialogTitle = this.$t('page.edit');
        this.searchType();
        this.relationId = obj.id;
        this.relationDialogForm.forEach(e => {
          e.value = obj[e.name];
        });
        this.relationDialog = true;
      }
    },
    delRelations(obj) {
      if (obj.referenceCount === 0) {
        let _this = this;
        let data = {
          channelTypeRelationId: obj.id
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
            this.$api.process.relation.delRelation(data).then(res => {
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
      }
    },
    saveRelations() {
      let relationForm = this.$refs.relationDialogForm;
      if (relationForm.valid()) {
        if (!this.saving) {
          this.saving = true;
          let data = relationForm.getFormValue();
          if (this.relationId) {
            this.$set(data, 'id', this.relationId);
          }
          this.$api.process.relation.saveRelation(data).then(res => {
            this.saving = false;
            if (res.Status == 'OK') {
              this.relationDialog = false;
              this.searchRelationList(1);
            }
          }).catch(error => {
            this.saving = false;
          });
        }
      }
    },
    cancleRelations() {
      this.relationId = null;
      this.relationDialogForm.forEach(e => {
        if (e.name != 'isActive') {
          e.value = '';
        } else {
          e.value = 1;
        }
      });
    },
    searchType() { //查询关联关系类型
      let data = {
        isActive: 1,
        needAllOption: 1,
        needPage: false
      };
      this.$api.process.relation.searchRelationType(data).then(res => {
        if (res.Status == 'OK') {
          let typeList = res.Return.list;
          this.relationDialogForm[1].dataList = typeList;
          this.relationDialogForm[2].dataList = typeList;
        }
      });
    },
    alterServe: function(uuid) {
      //服务
      window.open(HOME + '/process.html#/catalog-manage?uuid=' + uuid, '_blank');
    }
  },
  computed: {
    getAmount() {
      return function(amount) {
        let showamount = amount ? (Math.floor(amount) > 99 ? '99+' : Math.floor(amount)) : '';
        return showamount;
      };
    },
    getTextList() {
      return function(list) {
        let textList = list.map(e => {
          return e.name;
        });
        let text = textList.join('、');
        return text;
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
.RelationsManage {

  .reference-count {
    cursor: default !important;
    &:hover {
      color: unset !important;
    }
  }
}
</style>
