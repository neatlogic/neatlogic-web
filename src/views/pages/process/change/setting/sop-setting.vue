<template>
  <div class="SopSetting">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="input-border">
      <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="getSopTemplateList()"></CombineSearcher>
    </div>
    <div class="add-template border-color text-action" @click="addTemplate">
      <i class="tsfont-plus"></i>
    </div>
    <div v-if="changeSopList && changeSopList.length>0" class="soptemplate-box">
      <draggable
        v-model="changeSopList"
        :options="dragOptions"
        @start="start"
        @end="end"
      >
        <transition-group>
          <div
            v-for="(item,index) in changeSopList"
            :key="'1'+index"
            class="soptemplate-list"
            :class="item.isActive === 0?'undraggable border-color':'bg-block'"
            :title="item.isActive === 0? $t('term.process.tempnotreferenced'):''"
            @dragstart="dropstart($event, item)"
          >
            <div class="overflow">{{ item.name }}</div>
            <div class="btn-box" :class="{'block': item.isShow}">
              <div class="btn-box-bg bg-block"></div>
              <div class="action-list">
                <span v-if="item.changeTemplateList.length > 0 " class="padding-lf">
                  <Dropdown
                    trigger="click"
                    transfer
                    placement="bottom-end"
                    @on-visible-change="showTemplateList(arguments, item)"
                  >
                    <span class="tsfont-formstaticlist text-tip-active " :title="$t('page.referencelist')"></span>
                    <DropdownMenu slot="list" class="dropdown">
                      <DropdownItem v-for="(c,cindex) in item.changeTemplateList" :key="cindex" @click.native="toChangeEdit(c)">
                        <div class="text-action">{{ c.name }}</div>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </span>
                <span class="tsfont-copy text-tip-active padding-lf" :title="$t('page.copy')" @click="editTemplate(item, true)"></span>
                <span class="tsfont-edit text-tip-active padding-lf" :title="$t('page.edit')" @click="editTemplate(item)"></span>
                <span
                  class="tsfont-trash-s padding-lf"
                  :title="item.changeTemplateList.length > 0?$t('term.process.tempdelete'):$t('page.delete')"
                  :class="item.changeTemplateList.length > 0?'text-disabled':'text-tip-active'"
                  @click="delTemplate(item)"
                ></span>
              </div>
            </div>
          </div>
        </transition-group>
      </draggable>
    </div>
    <div v-else>
      <no-data></no-data>
    </div>
    <TsDialog
      :isShow.sync="templateDialog"
      :title="dialogTitle"
      type="slider"
      width="large"
      @on-close="cancelDialog"
      @on-ok="saveTemplate"
    >
      <template v-if="templateDialog">
        <SoptemplateEdit ref="sopTemplate" :config="config"></SoptemplateEdit>
      </template>
    </TsDialog>
    <TsDialog
      type="modal"
      :isShow.sync="copySopDialog"
      :title="dialogTitle"
      @on-ok="okCopy"
    >
      <template>
        <TsForm
          ref="copyForm"
          :itemList="copyForm"
          type="type"
          :labelWidth="80"
        ></TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import TransferDom from '@/resources/directives/transfer-dom';
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue';
export default {
  name: 'SopSetting',
  components: {
    draggable,
    CombineSearcher,
    SoptemplateEdit: resolve => require(['./soptemplate-edit.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  directives: { TransferDom },
  inject: {
    $dragBox: {
      type: Object,
      default: null
    }
  },
  filters: {},
  props: {},
  data() {
    return {
      saving: false,
      loadingShow: false,
      keyword: '',
      changeSopList: [],
      dialogTitle: this.$t('dialog.title.addtarget', {target: this.$t('term.process.soptemp')}),
      templateDialog: false,
      config: {},
      isTransferDom: true,
      copyId: null, //sopid
      copySopDialog: false,
      copyForm: [
        {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          width: '90%',
          validateList: ['required', {
            name: 'searchUrl', url: 'api/rest/change/sop/copy'
          }]
        }
      ],
      searchConfig: {
        searchList: [
          {
            type: 'userselect',
            name: 'authority',
            value: '',
            label: this.$t('page.group'),
            transfer: true,
            groupList: ['team'],
            multiple: false
          },
          {
            type: 'select',
            name: 'type',
            value: '',
            label: this.$t('page.type'),
            search: true,
            dynamicUrl: '/api/rest/change/sop/type/list',
            rootName: 'changeSopTypeList',
            transfer: true
          },
          {
            type: 'radio',
            name: 'isActive',
            value: '',
            label: this.$t('page.status'),
            itemWidth: '100%',
            dataList: [
              {
                text: this.$t('page.enable'),
                value: 1
              },
              {
                text: this.$t('page.disable'),
                value: 0
              }
            ]
          }
        ]
      },
      searchVal: {} //搜索下拉插件的值
    };
  },
  beforeCreate() {},
  created() {
    // console.log(this.$dragBox);
    this.getSopTemplateList();
  },
  beforeMount() {},
  mounted() {
    if (this.$route.query.changeSopId) {
      // 从变量引用列表跳转过来
      let changeSopId = this.$route.query.changeSopId;
      this.getSopConfig(changeSopId);
      this.templateDialog = true;
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getSopTemplateList() {
      this.loadingShow = true;
      let data = {
        needPage: false,
        ...this.searchVal
      };
      this.$api.process.change.getChangeSopList(data).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return;
          this.changeSopList = obj.changeSopList;
          this.loadingShow = false;
        }
      });
    },
    getSopConfig(id) {
      let data = {
        changeSopId: id
      };
      return this.$api.process.change.getChangeSop(data).then(res => {
        if (res.Status == 'OK') {
          this.config = res.Return;
        }
      });
    },
    addTemplate() {
      this.config = {};
      this.dialogTitle = this.$t('dialog.title.addtarget', {target: this.$t('term.process.soptemp')});
      this.templateDialog = true;
    },
    async editTemplate(config, type) {
      if (type) {
        this.dialogTitle = this.$t('dialog.title.copytarget', {target: this.$t('term.process.soptemp')});
        this.copyId = config.id;
        this.copyForm[0].value = config.name + '_copy';
        this.copySopDialog = true;
      } else {
        this.dialogTitle = this.$t('dialog.title.edittarget', {target: this.$t('term.process.soptemp')});
        await this.getSopConfig(config.id);
        this.templateDialog = true;
      }
    },
    delTemplate(obj) {
      if (obj.changeTemplateList.length == 0) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: obj.name}),
          btnType: 'error',
          'on-ok': vnode => {
            if (!this.deleting) {
              this.deleting = true;
              let data = {
                changeSopId: obj.id
              };
              this.$api.process.change.delChangeSop(data).then(res => {
                this.deleting = false;
                if (res.Status == 'OK') {
                  this.changeSopList.splice(
                    this.changeSopList.findIndex(e => e.id === obj.id),
                    1
                  );
                  vnode.isShow = false;
                  this.$Message.success(this.$t('message.deletesuccess'));
                }
              }).catch(error => {
                this.deleting = false;
              });
            }
          }
        });
      }
    },
    saveTemplate() {
      let valid = this.$refs.sopTemplate.validSopData();
      if (valid) {
        let data = this.$refs.sopTemplate.sopData();
        if (this.config) {
          if (this.$dragBox) {
            this.$dragBox.updataSop(data);
          }
        }
        if (!this.saving) {
          this.saving = true;
          this.$api.process.change.saveChangeSop(data).then(res => {
            this.saving = false;
            if (res.Status == 'OK') {
              this.getSopTemplateList();
              this.templateDialog = false;
              this.$Message.success(this.$t('message.savesuccess'));
              this.$set(this.config, 'id', res.Return);
            }
          }).catch(error => {
            this.saving = false;
          });
        }
      }
    },
    okCopy() {
      let copyForm = this.$refs.copyForm;
      if (copyForm.valid()) {
        let name = this.copyForm[0].value;
        let data = {
          name: name,
          changeSopId: this.copyId
        };
        this.$api.process.change.copyChangeSop(data).then(res => {
          if (res.Status == 'OK') {
            this.getSopTemplateList();
            this.copySopDialog = false;
            this.$Message.success(this.$t('message.executesuccess'));
            this.copyId = null;
            this.copyForm[0].value = null;
          }
        });
      }
    },
    cancelDialog() {
      this.config = {};
    },
    dropstart(e, obj) {
      event.dataTransfer.setData('item', JSON.stringify(obj));
    },
    start() {
      if (this.$dragBox) {
        this.$dragBox.showStep(false);
      }
    },
    end() {
      if (this.$dragBox) {
        this.$dragBox.showStep(true);
      }
    },
    toChangeEdit(obj) {
      this.$router.push({
        path: '/change-edit',
        query: {
          id: obj.id
        }
      });
    },
    showTemplateList(arr, item) {
      this.$set(item, 'isShow', arr[0]);
    }
  },
  computed: {
    dragOptions() {
      return {
        sort: false,
        filter: '.undraggable',
        group: {
          name: 'stepTemplate',
          pull: 'clone',
          put: false
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
/deep/.ivu-select-dropdown{
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  left: -150px!important;
}
/deep/.ivu-dropdown-item{
  padding: 8px 30px!important;
}
.SopSetting {
  padding: 0 16px;
  .search-btn {
    line-height: 29px;
    border: 1px solid;
    text-align: center;
    border-left: 0;
  }
  .add-template {
    border: 1px dashed;
    height: 32px;
    line-height: 32px;
    cursor: pointer;
    text-align: center;
    margin: 16px 0;
  }
  .soptemplate-box {
    height: calc(100vh - 230px);
    overflow: auto;
  }
  .soptemplate-list {
    position: relative;
    width: 100%;
    padding: 16px;
    margin-bottom: 8px;
    border: 1px solid transparent;
    border-radius: 6px;
    &:hover {
      .btn-box {
        display: block;
      }
    }
    .btn-box {
      position: absolute;
      top: 8px;
      right: 0;
      display: none;
      padding-right: 8px;
      .padding-lf {
        padding-left: 8px;
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
}
.block {
  display: block !important;
}
</style>
