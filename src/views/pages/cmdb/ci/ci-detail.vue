<template>
  <div>
    <TsContain border="border" :enableCollapse="true">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topRight>
        <div v-if="ciData.authData && ciData.authData['cimanage']" class="dashboard-action action-group" style="text-align:right">
          <span class="action-item tsfont-edit" @click="editCi()">{{ $t('page.basicinfo') }}</span>
          <span v-if="!ciData.isVirtual" class="action-item tsfont-plus" @click="addAttr()">{{ $t('page.attribute') }}</span>
          <span v-if="!ciData.isVirtual" class="action-item tsfont-plus" @click="addRel()">{{ $t('page.relation') }}</span>
          <span class="action-item">
            <Dropdown>
              <span class="tsfont-option-horizontal">
                {{ $t('page.moresetting') }}
              </span>
              <DropdownMenu slot="list">
                <DropdownItem v-if="!ciData.isVirtual" class="tsfont-download" @click.native="exportModel()">{{ $t('term.cmdb.exportci') }}</DropdownItem>
                <DropdownItem v-if="!ciData.isVirtual" class="tsfont-eye" @click.native="viewSetting()">{{ $t('page.display') }}/{{ $t('page.edit') }}{{ $t('page.setting') }}</DropdownItem>
                <DropdownItem v-if="ciData.isVirtual" class="tsfont-eye" @click.native="viewSetting()">{{ $t('page.display') }}{{ $t('page.setting') }}</DropdownItem>
                <DropdownItem v-if="!ciData.isVirtual" class="tsfont-unlock" @click.native="editAuth()">{{ $t('page.auth') }}</DropdownItem>
                <!--<DropdownItem v-if="!ciData.isVirtual && ciData.hasCollection" class="tsfont-accessendpoint" @click.native="editSync()">自动采集</DropdownItem>-->
                <DropdownItem v-if="!ciData.isVirtual" class="tsfont-check-o" @click.native="editlegal()">{{ $t('term.cmdb.legalcheck') }}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </span>
          <span class="action-item ts-catalogue" @click="toCiEntityList()">{{ $t('term.cmdb.viewcientity') }}</span>
          <span class="ci-del-btn action-item">
            <Button type="error" @click="deleteCi()">{{ $t('page.delete') }}</Button>
          </span>
        </div>
      </template>
      <template v-slot:sider>
        <div>
          <ciTypeList ref="ciTypeList" :ciId="ciId" @click="switchCi"></ciTypeList>
        </div>
      </template>
      <div slot="content" class="ci-content border-color">
        <div class="right-block" style="position:relative">
          <Loading v-if="isLoading" :loading-show="isLoading" type="fix"></Loading>
          <div class="ci-info">
            <div class="ci-icon" :class="getIconClass()">
              <i :class="ciData.icon" class="ci-icon"></i>
            </div>
            <div class="ci-detail">
              <div>
                <span class="ci-label">{{ ciData.label }}</span>
                <span class="ci-name text-grey">({{ ciData.name }})</span>
              </div>
              <div class="fz10 text-grey">{{ ciData.id }}</div>
              <div class="text-grey fz10">
                <span v-if="ciData.isVirtual">{{ $t('term.cmdb.virtualci') }}</span>
                <span v-if="ciData.isAbstract">{{ $t('term.cmdb.abstractci') }}</span>
                <span v-if="ciData.parentCiId">
                  {{ $t('term.cmdb.extendto') }}
                  <a href="javascript:void(0)" @click="toParentCi(ciData.parentCiId)">{{ ciData.parentCiLabel }}</a>
                </span>
              </div>
              <div v-if="ciData.description" class="ci-description text-grey overflow fz10" :title="ciData.description">{{ ciData.description }}</div>
            </div>
          </div>
          <div class="mt-nm">
            <Tabs class="block-tabs">
              <TabPane :label="$t('page.attribute')" class="padding">
                <CiDetailAttrList
                  :ciData="ciData"
                  :attrData="attrData"
                  @toParentCi="toParentCi"
                  @edit="editAttr"
                  @delete="deleteAttr"
                ></CiDetailAttrList>
                <Divider v-if="!ciData.isVirtual && attrList && attrList.length > 0" />
                <TsForm
                  v-if="!ciData.isVirtual && attrList && attrList.length > 0"
                  ref="formCi"
                  style="margin-top:10px"
                  :item-list="attrFormConfig"
                  labelPosition="top"
                ></TsForm>
              </TabPane>
              <TabPane v-if="!ciData.isVirtual" :label="$t('page.relation')">
                <CiDetailRelList
                  class="bg-op"
                  :ciData="ciData"
                  :relData="relData"
                  @edit="editRel"
                  @delete="deleteRel"
                ></CiDetailRelList>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </TsContain>
    <CiEdit v-if="isCiShow" :id="ciData.id" @close="closeCiDialog"></CiEdit>
    <AttrEdit
      v-if="isAttrShow"
      :id="currentAttrId"
      :ciId="ciData.id"
      @close="closeAttrDialog"
    ></AttrEdit>
    <RelEdit
      v-if="isRelShow"
      :id="currentRelId"
      :ciData="ciData"
      @close="closeRelDialog"
    ></RelEdit>
    <AuthEdit v-if="isAuthShow" :ciId="ciData.id" @close="closeAuthDialog"></AuthEdit>
    <ViewEdit
      v-if="isViewShow"
      :ciId="ciData.id"
      :isVirtual="ciData.isVirtual"
      @close="closeViewDialog"
    ></ViewEdit>
    <!--<SyncEdit v-if="isEditSyncShow" :ciId="ciData.id" @close="closeSyncDialog"></SyncEdit>-->
    <LegalValidEdit v-if="isLegalShow" :ciId="ciData.id" @close="closeLegalDialog"></LegalValidEdit>
  </div>
</template>
<script>
import ciTypeList from '../components/ci/ci-type-list.vue';
import menuMinix from '../mixins/index';
import TsForm from '@/resources/plugins/TsForm/TsForm';
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    CiDetailRelList: resolve => require(['./ci-detail-rellist.vue'], resolve),
    CiDetailAttrList: resolve => require(['./ci-detail-attrlist.vue'], resolve),
    CiEdit: resolve => require(['./ci-edit.vue'], resolve),
    AttrEdit: resolve => require(['./attr-edit.vue'], resolve),
    RelEdit: resolve => require(['./rel-edit.vue'], resolve),
    AuthEdit: resolve => require(['./auth-edit.vue'], resolve),
    ViewEdit: resolve => require(['./view-edit.vue'], resolve),
    //SyncEdit: resolve => require(['./syncpolicy-edit.vue'], resolve),
    LegalValidEdit: resolve => require(['./legalvalid-edit.vue'], resolve),
    TsForm,
    // HelloWorld,
    ciTypeList
  },
  mixins: [menuMinix, download],
  props: {},
  data() {
    return {
      attrList: [],
      isSiderHide: false,
      isCiShow: false, //模型编辑窗口是否显示
      isViewShow: false, //显示设置窗口是否显示
      isEditSyncShow: false, //显示自动发现设置窗口
      isLegalShow: false, //合规检查设置窗口
      leftHeight: 0,
      currentAttrId: null, //当前编辑的属性id
      currentRelId: null, //当前编辑的关系id
      isAttrShow: false, //编辑属性窗口是否显示
      isRelShow: false, //编辑关系窗口是否显示,
      isAuthShow: false, //授权编辑窗口是否显示
      ciId: parseInt(this.$route.params['id']),
      attrFormConfig: {
        nameAttrId: {
          name: 'nameAttrId',
          type: 'radio',
          label: this.$t('term.cmdb.nameattribute'),
          tooltip: this.$t('form.help.nameattribute'),
          descType: 'error',
          dataList: [],
          onChange: val => {
            console.log(val);
            this.updateCiNameAttrId(val);
          }
        },
        uniqueRule: {
          type: 'checkbox',
          label: this.$t('term.cmdb.uniquerule'),
          tooltip: this.$t('form.help.uniquerule'),
          dataList: [],
          onChange: val => {
            this.updateCiUniqueRule(val);
          }
        }
      },
      basicAttrList: [],
      ciTypeList: [],
      ciData: {},
      attrData: {},
      attrRuleList: [],
      relData: { theadList: [] },
      isLoading: true,
      leftWidth: 200,
      sessionName: 'civiewbox'
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
    getIconClass() {
      if (this.ciData) {
        if (this.ciData.isVirtual) {
          return 'text-grey';
        } else {
          if (!this.ciData.isAbstract) {
            return 'text-primary';
          } else {
            return 'text-default';
          }
        }
      }
    },
    searchCiTypeCi() {
      if (this.$refs['ciTypeList'] && this.$refs['ciTypeList'].searchCiTypeCi) {
        this.$refs['ciTypeList'].searchCiTypeCi();
      }
    },
    async init() {
      await this.getCiById();
      await this.getAttrByCiId();
      await this.getRelByCiId();

      this.getLeftHeight();
    },
    updateCiUniqueRule: function(attrIdList) {
      this.$api.cmdb.ci.saveCiUniqueRule(this.ciId, attrIdList).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    },
    updateCiNameAttrId: function(attrId) {
      this.$api.cmdb.ci.updateCiNameAttrId(this.ciId, attrId).then(res => {
        if (res.Status == 'OK') {
          this.$set(this.ciData, 'nameAttrId', attrId);
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    },
    toCiEntityList: function() {
      this.$router.push({ path: '/ci-view/' + this.ciId });
    },
    editlegal() {
      this.isLegalShow = true;
    },
    editAuth: function() {
      this.isAuthShow = true;
    },
    editSync: function() {
      this.isEditSyncShow = true;
    },
    editCi: function() {
      this.isCiShow = true;
    },
    getLeftHeight: function() {
      window.setTimeout(() => {
        if (this.$refs.lefter) {
          this.leftHeight = this.$refs.lefter.offsetHeight;
        }
      }, 500);
    },
    async getCiById() {
      await this.$api.cmdb.ci.getCiById(this.ciId, true).then(res => {
        this.ciData = Object.assign({}, res.Return);
        this.attrFormConfig.uniqueRule.value = this.ciData.uniqueAttrIdList;
        this.attrFormConfig.nameAttrId.value = this.ciData.nameAttrId;
      });
      await this.$api.cmdb.sync.checkCiHasSyncCollection(this.ciId).then(res => {
        this.$set(this.ciData, 'hasCollection', res.Return > 0);
      });
      this.isLoading = false;
    },
    deleteCi: function() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteciconfirm'),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.cmdb.ci.deleteCiById(this.ciId).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.$router.push({ path: '/ci-manage' });
              this.getMenuList();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    async getAttrByCiId() {
      await this.$api.cmdb.ci.getAttrByCiId(this.ciId).then(res => {
        this.$set(this.attrData, 'tbodyList', res.Return);
        this.attrList = res.Return;
        const attrList = res.Return;
        this.attrFormConfig.uniqueRule.dataList = [];
        this.attrFormConfig.nameAttrId.dataList = [];
        if (attrList && attrList.length > 0) {
          attrList.forEach(attr => {
            this.attrFormConfig.uniqueRule.dataList.push({ value: attr.id, text: attr.label });
            this.attrFormConfig.nameAttrId.dataList.push({ value: attr.id, text: attr.label });
          });
          if (this.$refs['formCi']) {
            this.$refs['formCi'].$forceUpdate();
          }
        }
      });
    },
    async getRelByCiId() {
      await this.$api.cmdb.ci.getRelByCiId(this.ciId).then(res => {
        const relMap = new Map();
        this.$set(
          this.relData,
          'cardList',
          res.Return.filter(d => !relMap.has(d.id) && relMap.set(d.id, 1))
        );
        this.$set(this.relData, 'pageCount', 1);
      });
    },
    toParentCi(ciId) {
      const ci = { id: ciId };
      this.switchCi(null, ci);
    },
    switchCi: function(ciType, ci) {
      this.isLoading = true;
      this.ciId = ci.id;
      this.init();
    },
    addAttr: function() {
      this.currentAttrId = null;
      this.isAttrShow = true;
    },
    editAttr: function(attr) {
      this.currentAttrId = attr.id;
      this.isAttrShow = true;
    },
    deleteAttr: function(attr) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteattributeconfirm', { target: attr.label + '（' + attr.name + '）' }),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.cmdb.ci.deleteAttrById(attr.id).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
            this.getAttrByCiId();
            vnode.isShow = false;
          });
        }
      });
    },
    addRel: function() {
      this.currentRelId = null;
      this.isRelShow = true;
    },
    editRel: function(rel) {
      this.currentRelId = rel.id;
      this.isRelShow = true;
    },
    deleteRel: function(rel) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleterelationconfirm', { target: rel.fromCiLabel + '——' + rel.toCiLabel }),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.cmdb.ci.deleteRelById(rel.id).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
            this.getRelByCiId();
            vnode.isShow = false;
          });
        }
      });
    },
    exportModel() {
      this.download({ url: '/api/binary/cmdb/ci/export', params: { ciId: this.ciData.id } });
    },
    viewSetting: function() {
      this.isViewShow = true;
    },
    closeCiDialog: function(action) {
      this.isCiShow = false;
      if (action == 'refresh') {
        this.getCiById();
        this.getAttrByCiId();
        this.getRelByCiId();
      }
    },
    closeAttrDialog: function(needRefresh) {
      this.isAttrShow = false;
      if (needRefresh) {
        this.getAttrByCiId();
      }
    },
    closeRelDialog: function(needRefresh) {
      this.isRelShow = false;
      if (needRefresh) {
        this.getRelByCiId();
      }
    },
    closeAuthDialog: function() {
      this.isAuthShow = false;
    },
    closeViewDialog: function(needRefresh) {
      this.isViewShow = false;
      if (needRefresh) {
        this.getAttrByCiId();
      }
    },
    closeSyncDialog() {
      this.isEditSyncShow = false;
    },
    closeLegalDialog() {
      this.isLegalShow = false;
    },
    isTslayout() {
      this.isSiderHide = !this.isSiderHide;
    }
  },
  filter: {},
  computed: {},
  watch: {
    ciData: {
      handler: function(val) {
        if (val && val.nameAttrId && this.attrList && this.attrList.find(a => a.id == val.nameAttrId)) {
          this.$set(this.attrFormConfig.nameAttrId, 'desc', '');
        } else {
          this.$set(this.attrFormConfig.nameAttrId, 'desc', this.$t('form.help.pleaseselectnameattribute'));
        }
      },
      deep: true
    },
    attrList: {
      handler: function(val) {
        if (this.ciData && this.ciData.nameAttrId && this.attrList.find(a => a.id == this.ciData.nameAttrId)) {
          this.$set(this.attrFormConfig.nameAttrId, 'desc', '');
        } else {
          this.$set(this.attrFormConfig.nameAttrId, 'desc', this.$t('form.help.pleaseselectnameattribute'));
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
@import '../public/common.less';
/deep/.ivu-tabs-bar {
  margin-bottom: 0px !important;
}
/deep/.ivu-checkbox {
  vertical-align: text-bottom;
}
/deep/.ivu-checkbox-wrapper,
/deep/.ivu-radio-wrapper {
  margin-right: 16px;
}
.ci-left {
  padding: 12px 16px 12px 0px !important;
}
.right-block {
  padding: 0px !important;
}
/deep/.action-item {
  padding: 0 16px 0 0px !important;
}
.ci-del-btn {
  /deep/ &.action-item {
    padding: 0 !important;
  }
}

.ci-info {
  display: grid;
  grid-template-columns: 60px auto;
  grid-gap: 0px;
  .ci-icon {
    align-self: center;
    justify-self: center;
    font-size: 25px;
  }
}
</style>
