<template>
  <div class="PriorityManagement">
    <Loading :loading-show="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addRow()">{{ $t('page.priority') }}</span>
      </template>
      <template slot="topRight">
        <TsRow>
          <Col :span="6"><TsFormSelect v-bind="isActiveSelectSetting"></TsFormSelect></Col>
          <Col :span="18">
            <InputSearcher v-model="searchParam.keyword" @change="getTableDataSearch(1)"></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content" ref="maintable">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          canDrag
          keyName="uuid"
          @operation="operation"
          @changeCurrent="getPageData"
          @changePageSize="changePageSize"
          @updateRowSort="handleDragUpdate"
        >
          <template slot="name" slot-scope="{ row }">
            <div :style="{ color: row.color ? row.color : '' }" class="cur" @click="editRow(row.uuid)">{{ row.name }}</div>
          </template>
          <template slot="isActive" slot-scope="{ row }">
            <div>{{ row.isActive == 1 ? $t('page.enable') : $t('page.disable') }}</div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <TsDialog
      v-if="editTsDialog && editTsDialog.isShow"
      v-bind="editTsDialog"
      :is-show.sync="editTsDialog.isShow"
      :okBtnDisable="saving"
      @on-close="cancelEditRow"
      @on-ok="saveEditRow"
    >
      <template v-slot>
        <div class="editForm">
          <TsForm
            ref="mainForm"
            :item-list="formSetting"
            type="type"
            label-postion="right"
          >
            <template slot="color">
              <Poptip
                class="priority-color"
                trigger="hover"
                placement="bottom-start"
                popper-class="priority-color"
                padding="0px"
                offset="25"
                transfer
                @on-popper-show="isColorListShow = true"
                @on-popper-hide="isColorListShow = false"
              >
                <div class="color-selected">
                  <div class="color-block" :style="{ backgroundColor: selectedColor }"></div>
                  <i class="tsfont-down" :class="{ 'arrow-rotate': isColorListShow }"></i>
                </div>
                <div slot="content">
                  <ul class="color-block-list">
                    <li
                      v-for="item in colorList"
                      :key="item"
                      class="color-block color-block-item"
                      :class="{ 'tsfont-check': item === selectedColor }"
                      :style="{ backgroundColor: item }"
                      @click="changeColor(item)"
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
import TsTable from '@/resources/components/TsTable/TsTable.vue';
import TsForm from '@/resources/plugins/TsForm/TsForm';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsTable,
    TsForm,
    TsFormSelect,
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  filters: {},
  props: [],
  data() {
    return {
      loadingShow: true,
      tableheight: 0,
      pageSize: 20,
      theadList: [
        { title: this.$t('page.name'), key: 'name', minWidth: 300, resizable: true },
        { title: this.$t('page.status'), key: 'isActive', minWidth: 300, resizable: true },
        { title: this.$t('page.description'), key: 'desc', minWidth: 300, resizable: true },
        { key: 'action', title: '', type: 'action', operations: [{ icon: 'tsfont-trash-o', name: this.$t('page.delete'), action: 'del', type: 'text', style: '' }] }
      ],
      tableData: null,
      editTsDialog: {
        type: 'modal',
        title: '',
        maskClose: false,
        isShow: false,
        width: '700px'
      },
      formSetting: [
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
          validateList: ['required', { name: 'searchUrl', url: 'api/rest/process/priority/save', params: () => ({ uuid: this.formSetting[0].value }) }]
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
          name: 'color',
          type: 'slot',
          label: this.$t('page.color'),
          validateList: ['required']
        },
        {
          type: 'textarea',
          name: 'desc',
          label: this.$t('page.description'),
          width: '100%',
          value: '',
          defaultValue: ''
        }
      ],
      searchParam: {
        keyword: null,
        isActive: null,
        currentPage: 1,
        pageSize: 22,
        timestamp: null
      },
      isActiveSelectSetting: {
        name: 'isActive',
        search: true,
        value: null,
        label: this.$t('page.status'),
        valueName: 'value',
        textName: 'text',
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.status')}),
        border: 'border',
        dataList: [
          { value: 1, text: this.$t('page.enable') },
          { value: 0, text: this.$t('page.disable') }
        ],
        onChange: (value) => {
          Object.assign(this.searchParam, {
            isActive: value === '' ? null : value
          });
          this.getTableDataSearch(1);
        }
      },
      colorList: ['#D18CBD', '#FFBA5A', '#78D8DE', '#A78375', '#B9D582', '#898DDD', '#F3E67B', '#527CA6', '#50BFF2', '#FF6666', '#15BF81', '#90A4AE'],
      selectedColor: '#50BFF2',
      isColorListShow: false,
      saving: false,
      deleting: false,
      oldList: []
    };
  },
  created() {},
  mounted() {
    this.getTableDataSearch(1);
    this.settableheight();
    let isCatalogManage = this.$route.query.isCatalogManage;
    if (isCatalogManage == '1') {
      this.addRow();
    }
    window.addEventListener('resize', this.settableheight);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.settableheight);
  },
  methods: {
    getTableDataSearch(currentPage, pageSize) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      if (pageSize) {
        this.searchParam.pageSize = pageSize;
      } else {
        this.searchParam.pageSize = this.pageSize;
      }
      this.searchParam.timestamp = new Date().getTime();
      this.$api.process.priority
        .search(this.searchParam)
        .then(res => {
          if (res.Status == 'OK') {
            this.tableData = res.Return;
            this.tableData.theadList = this.theadList;
            this.loadingShow = false;
            this.oldList = res.Return.tbodyList;
          }
        });
    },
    operation(view, row) {
      if (view == 'del') {
        this.deleteRow(row.uuid, row.name);
      }
    },
    // 改变页数
    changePageSize(size) {
      this.pageSize = size;
      this.getTableDataSearch();
    },
    getPageData(currentPage) {
      this.getTableDataSearch(currentPage);
    },
    addRow() {
      this.formSetting.forEach(item => {
        item.value = item.defaultValue;
      });
      this.editTsDialog.title = this.$t('page.add');
      this.editTsDialog.isShow = true;
    },
    getRowData(uuid) {
      let params = { uuid: uuid, timestamp: new Date().getTime() };
      this.$api.process.priority
        .get(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.selectedColor = res.Return['color'];
            this.formSetting.forEach(item => {
              item.value = res.Return[item.name];
            });
            this.editTsDialog.isShow = true;
          }
        });
    },
    editRow(uuid) {
      this.editTsDialog.title = this.$t('page.edit');
      this.getRowData(uuid);
    },
    deleteRow(uuid, name) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          if (!this.deleting) {
            let params = { uuid: uuid };
            this.deleting = true;
            this.$api.process.priority
              .delete(params)
              .then(res => {
                this.deleting = false;
                if (res.Status == 'OK') {
                  this.$Message.success(this.$t('message.deletesuccess'));
                  this.getTableDataSearch(1);
                  vnode.isShow = false;
                }
              });
          }
        }
      }, this);
    },
    saveEditRow() {
      var form = this.$refs.mainForm;
      if (form.valid()) {
        if (!this.saving) {
          let data = form.getFormValue();
          data.color = this.selectedColor;
          this.saving = true;
          this.$api.process.priority
            .save(data)
            .then(res => {
              this.saving = false;
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.savesuccess'));
                this.editTsDialog.isShow = false;
                this.getTableDataSearch();
              }
            })
            .catch(error => {
              this.saving = false;
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
    changeColor(color) {
      this.selectedColor = color;
    },
    handleDragUpdate({ oldIndex, newIndex }) {
      const params = {
        uuid: this.oldList[oldIndex].uuid, //被拖拽的优先级的uuid
        sort: this.oldList[newIndex].sort //被挤走的优先级的sort
      };
      this.$api.process.priority
        .move(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
          } else throw res;
        });
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less">
.PriorityManagement {
  tr {
    cursor: default;
  }
}
.cur {
  cursor: pointer;
}
.editForm {
  .ivu-input-word-count {
    background: #fff;
  }
}
.priority-color {
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
