<template>
  <div class="PriorityManagement">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addRow()">{{ $t('term.process.sertype') }}</span>
      </template>
      <template slot="topRight">
        <TsRow>
          <Col :span="6"><TsFormSelect v-bind="isActiveSelectSetting"></TsFormSelect>
          </Col>
          <Col :span="18">
            <InputSearcher
              v-model="searchParam.keyword"
              @change="getTableDataSearch(1)"
            ></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content" ref="maintable">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          @changeCurrent="getPageData"
        >
          <template slot="name" slot-scope="{ row }">
            <div :style="{ color: row.color ? row.color : '' }" class="cur" @click="editRow(row.uuid)">{{ row.name }}</div>
          </template>
          <template slot="isActive" slot-scope="{ row }">
            <div>{{ row.isActive == 1 ? $t('page.enable') : $t('page.disable') }}</div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-rotate-right icon" @click="updateUuid(row.uuid)">{{ $t('term.process.updateworknum') }}</li>
                <li :class="{disable: disabledConfig.deleting}" class="tsfont-trash-o icon" @click="deleteRow(row.uuid, row.name)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <TsDialog
      v-if="editTsDialog && editTsDialog.isShow"
      v-bind="editTsDialog"
      :isShow.sync="editTsDialog.isShow"
      :okBtnDisable="disabledConfig.saving"
      @on-ok="saveEditRow"
      @on-close="cancelEditRow"
    >
      <template v-slot>
        <div class="editForm">
          <TsForm
            ref="mainForm"
            :itemList="formSetting"
            type="type"
            labelPosition="right"
          >
            <template slot="icon">
              <a href="javascript:void(0)" @click="iconTsDialog.isShow = true">
                <i class="menuIcon" :class="[selectedIcon, { square: selectedIcon == null }]" style="color:#666;"></i>
              </a>
            </template>
            <template slot="color">
              <Poptip
                class="channeltype-color"
                trigger="hover"
                placement="bottom-start"
                popper-class="channeltype-color"
                padding="0px"
                offset="25"
                transfer
                @on-popper-show="isColorListShow = true"
                @on-popper-hide="isColorListShow = false"
              >
                <div class="color-selected">
                  <div class="color-block radius-sm" :style="{backgroundColor:selectedColor}"></div>
                  <i class="tsfont-down" :class="{'arrow-rotate':isColorListShow}"></i>
                </div>
                <div slot="content">
                  <ul class="color-block-list">
                    <li
                      v-for="color in colorList"
                      :key="color"
                      class="color-block color-block-item radius-sm"
                      :class="{'border-primary':color === selectedColor}"
                      :style="{backgroundColor:color}"
                      @click="selectedColor = color"
                    ></li>
                  </ul>
                </div>
              </Poptip>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'ChanneltypeManage',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  filters: {},
  props: [],
  data() {
    let _this = this;
    return {
      loadingShow: true,
      colorList: ['#D18CBD', '#FFBA5A', '#78D8DE', '#A78375', '#B9D582', '#898DDD', '#F3E67B', '#527CA6', '#50BFF2', '#FF6666', '#15BF81', '#90A4AE'],
      selectedColor: '#50BFF2',
      isColorListShow: false,
      tableheight: 0,
      policyList: [],
      theadList: [
        { title: this.$t('page.name'), key: 'name', minWidth: 300, resizable: true },
        { title: this.$t('page.status'), key: 'isActive', minWidth: 300, resizable: true },
        { title: this.$t('term.process.worknumper'), key: 'prefix', minWidth: 300, resizable: true },
        { title: this.$t('term.process.worknumrules'), key: 'handlerName', minWidth: 300, resizable: true },
        { title: this.$t('page.description'), key: 'description', minWidth: 300, resizable: true },
        { title: ' ', key: 'action', align: 'right', width: 10 }
      ],
      tableData: null,
      editTsDialog: {
        type: 'modal',
        title: '',
        maskClose: false,
        isShow: false,
        width: '700px'
      },
      oldformSetting: [
        {
          type: 'text',
          name: 'uuid',
          value: null,
          defaultValue: null,
          isHidden: true,
          label: this.$t('page.primarykey')
        },
        {
          type: 'text',
          name: 'name',
          value: '',
          defaultValue: '',
          maxlength: 30,
          width: '100%',
          label: this.$t('page.name'),
          validateList: [
            'required',
            { 
              name: 'searchUrl', 
              url: 'api/rest/process/channeltype/save',
              message: this.$t('message.targetisexists', {target: this.$t('term.process.sertype')}),
              params: () => ({uuid: this.oldformSetting[0].value})
            }
          ]
        },
        {
          type: 'radio',
          name: 'isActive',
          value: 1,
          defaultValue: 1,
          label: this.$t('page.status'),
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            { value: 1, text: this.$t('page.enable') },
            { value: 0, text: this.$t('page.disable') }
          ]
        },
        {
          type: 'text',
          name: 'prefix',
          value: '',
          defaultValue: '',
          maxlength: 30,
          width: '100%',
          label: this.$t('term.process.worknumper'),
          validateList: ['required']
        },
        {
          type: 'select',
          name: 'handler',
          value: '',
          defaultValue: '',
          label: this.$t('term.process.worknumrules'),
          width: '100%',
          validateList: ['required'],
          url: '/api/rest/processtask/serialnumber/policy/list',
          textName: 'name',
          valueName: 'handler',
          onChange: _this.handlerSelect
        },
        {
          name: 'color',
          type: 'slot',
          label: this.$t('page.color'),
          validateList: ['required']
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.description'),
          width: '100%',
          value: '',
          defaultValue: ''
        }
      ],
      formSetting: [],
      searchParam: {
        keyword: null,
        isActive: null,
        currentPage: 1,
        pageSize: 20,
        timestamp: null
      },
      isActiveSelectSetting: {
        name: 'isActive',
        search: true,
        value: '',
        label: this.$t('page.status'),
        valueName: 'value',
        textName: 'text',
        border: 'border',
        dataList: [
          { value: 1, text: this.$t('page.enable') },
          { value: 0, text: this.$t('page.disable') }
        ],
        onChange: function(value) {
          Object.assign(_this.searchParam, {
            isActive: value === '' ? null : value
          });

          _this.getTableDataSearch(1);
        }
      },
      disabledConfig: { //禁止按钮连续调用接口
        deleting: false,
        saving: false
      }
    };
  },
  created() {},
  mounted() {
    let _this = this;
    this.getTableDataSearch(1);
    this.settableheight();
    let isCatalogManage = this.$route.query.isCatalogManage;
    if (isCatalogManage == '1') {
      this.addRow();
    }
    window.addEventListener('resize', this.settableheight);
    this.getHandlerList();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.settableheight);
  },
  methods: {
    getTableDataSearch(currentPage, pageSize) {
      let _this = this;
      if (currentPage) {
        _this.searchParam.currentPage = currentPage;
      }
      if (pageSize) {
        _this.searchParam.pageSize = pageSize;
      } else {
        _this.searchParam.pageSize = this.pageSize;
      }
      _this.searchParam.timestamp = new Date().getTime();
      _this.$api.process.channeltype
        .search(_this.searchParam)
        .then(res => {
          if (res.Status == 'OK') {
            _this.tableData = res.Return;
            _this.tableData.theadList = _this.theadList;
            this.loadingShow = false;
          }
        });
    },
    getPageData(currentPage) {
      this.getTableDataSearch(currentPage);
    },
    addRow() {
      let _this = this;
      _this.selectedColor = '#62BCFA';
      _this.formSetting.forEach(item => {
        item.value = item.defaultValue;
      });
      this.editTsDialog.title = this.$t('dialog.title.addtarget', {target: this.$t('term.process.sertype')});
      this.editTsDialog.isShow = true;
      this.resetForm();
    },
    getRowData(uuid) {
      let _this = this;
      let params = { uuid: uuid, timestamp: new Date().getTime() };
      _this.$api.process.channeltype
        .get(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.handlerSelect(res.Return['handler']);
            _this.editTsDialog.isShow = true;
            _this.selectedColor = res.Return['color'];
            _this.formSetting.forEach(item => {
              item.value = res.Return[item.name];
              item.width = '100%';
            });
          }
        })
        .catch(error => {
          if (error.data.Message) {
            this.$Message.error(this.$t('term.process.getsertypeinfofail') + error.data.Message);
          } else {
            this.$Message.error(this.$t('message.apierror'));
          }
        });
    },
    editRow(uuid) {
      this.editTsDialog.title = this.$t('dialog.title.edittarget', {target: this.$t('term.process.sertype')});
      this.getRowData(uuid);
    },
    deleteRow(uuid, name) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          let params = { uuid: uuid };
          if (!this.disabledConfig.deleting) {
            this.disabledConfig.deleting = true;
            this.$api.process.channeltype.delete(params).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.getTableDataSearch();
                vnode.isShow = false;
              }
            }).finally(() => {
              this.disabledConfig.deleting = false;
            });
          }
        }
      });
    },
    saveEditRow() {
      var form = this.$refs.mainForm;
      if (!this.disabledConfig.saving) {
        if (form.valid()) {
          this.disabledConfig.saving = true;
          let data = form.getFormValue();
          data.color = this.selectedColor;
          this.$api.process.channeltype
            .save(data)
            .then(res => {
              this.disabledConfig.saving = false;
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.savesuccess'));
                this.editTsDialog.isShow = false;
                this.getTableDataSearch();
              }
            })
            .catch(error => {
              this.disabledConfig.saving = false;
              if (error.data.Message) {
                this.$Message.error(this.$t('term.process.savefail') + error.data.Message);
              } else {
                this.$Message.error(this.$t('message.apierror'));
              }
            });
        }
      }
    },
    cancelEditRow() {
      this.editTsDialog.isShow = false;
    },
    settableheight() {
      let tableheight = window.innerHeight - this.$refs.maintable.getBoundingClientRect().top - 80;
      this.tableheight = tableheight;
    },
    handlerSelect(data) {
      this.resetForm();
      const obj = this.policyList.find(d => d.handler === data);
      if (obj) {
        if (obj.formAttributeList && obj.formAttributeList.length) {
          obj.formAttributeList.forEach(f => {
            Object.assign(f, {
              value: f.defaultValue || null
            });
          });
        }

        this.formSetting.splice(5, 0, ...obj.formAttributeList);
      } 
    },
    getHandlerList() {
      const data = {
        needPage: false
      };
      this.$api.process.channeltype.policyList(data).then(res => {
        if (res.Status == 'OK') {
          this.policyList = res.Return;
        }
      });
    },
    updateUuid(uuid) {
      let data = {
        channelTypeUuid: uuid
      };
      this.$api.process.channeltype.updateUuid(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.getTableDataSearch();
        }
      });
    },
    resetForm() {
      this.formSetting = [];
      this.formSetting.push(...this.oldformSetting);
    }
  },
  computed: {},
  watch: {
    'editTsDialog.isShow'(val) {
      if (!val) {
        this.resetForm();
      }
    }
  }
};
</script>

<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.PriorityManagement {
  .content {
    background: #fff;
    padding: 16px;
  }
  tr {
    cursor: default;
  }
}
</style>
<style lang="less">
.cur{
  cursor: pointer;
}
.editForm {
  .ivu-input-word-count {
    background: #fff;
  }
}
.channeltype-color {
  /deep/ .ivu-poptip-arrow {
    display: none;
  }
  /deep/ .ivu-poptip-inner {
    transform: translateY(-8px);
  }
  .color-block {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
  .color-selected {
    cursor: pointer;
    .color-block {
      display: inline-block;
      margin-right: 4px;
    }
    .tsfont-down {
      transition: transform 0.25s ease-out;
      &.arrow-rotate {
        transform: rotate(-180deg);
      }
    }
  }
  .color-block-list {
    box-sizing: border-box;
    width: 152px;
    height: 120px;
    padding: 8px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: space-between;
    .color-block-item {
      margin: 4px;
      &.tsfont-check {
        font-size: 24px;
        text-align: center;
        line-height: 24px;
        &::before {
          text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.7);
        }
      }
    }
  }
}
.menuIcon {
  font-size: 1.6em;
  display: inline-block;
  vertical-align: middle;
  margin-right: 5px;
}
.square {
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 32px;
  height: 32px;
}
</style>
