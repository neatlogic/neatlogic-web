<template>
  <div>
    <div><a class="tsfont-plus" @click="addAttr">{{ $t('term.rdm.customattribute') }}</a></div>
    <TsTable
      v-if="attrList && attrList.length > 0"
      :fixedHeader="false"
      :canDrag="true"
      keyName="id"
      :theadList="theadList"
      :tbodyList="attrList"
      @updateRowSort="updateAttrList"
    >
      <template v-slot:isActive="{ row }">
        <TsFormSwitch
          v-model="row.isActive"
          :trueValue="1"
          :falseValue="0"
          @on-change="val=>{
            changeAttrActive(row);
          }"
        ></TsFormSwitch>
      </template>
      <template v-slot:isRequired="{ row }">
        <TsFormSwitch
          v-model="row.isRequired"
          :trueValue="1"
          :falseValue="0"
          :trueText="$t('page.yes')"
          :falseText="$t('page.no')"
          @on-change="val=>{
            changeAttrIsRequired(row);
          }"
        ></TsFormSwitch>
      </template>
      <template v-slot:isPrivate="{ row }">
        <span v-if="row.isPrivate" class="text-success">{{ $t('page.yes') }}</span>
        <span v-if="!row.isPrivate" class="text-grey">{{ $t('page.no') }}</span>
      </template>
      <template v-slot:action="{ row }">
        <div v-if="!row.isPrivate" class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="tsfont-edit" @click="editAttr(row)">{{ $t('page.edit') }}</li>
            <li class="tsfont-trash-o" @click="deleteAttr(row)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <!--<div style="text-align:right" class="mt-md">
      <Button type="primary" @click="save">保存</Button>
    </div>-->
    <CustomAttrEdit
      v-if="isAttrShow"
      :appId="appId"
      :attrId="currentAttrId"
      @close="closeAttr"
    ></CustomAttrEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    CustomAttrEdit: resolve => require(['@/views/pages/rdm/project/edittab/components/customattr-edit-dialog.vue'], resolve)
  },
  props: {
    projectId: { type: Number },
    appId: {type: Number}
  },
  data() {
    return {
      isAttrShow: false,
      currentAttrId: null,
      attrList: [], //对象属性列表，此处会返回所有属性，包括未激活属性
      theadList: [
        {
          key: 'isActive',
          title: this.$t('page.enable')
        },
        { key: 'name', title: this.$t('page.uniquekey') },
        { key: 'label', title: this.$t('page.name') },
        { key: 'typeText', title: this.$t('page.type') },
        { key: 'isPrivate', title: this.$t('term.rdm.systemattribute') },
        { key: 'isRequired', title: this.$t('page.require'), tooltip: this.$t('term.rdm.isrequiredwhencreate') },
        { key: 'description', title: this.$t('page.description') },
        { key: 'action' }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchAppAttr();
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
    changeAttrIsRequired(attr) {
      this.$api.rdm.project.updateAttrIsRequired(attr.id, attr.isRequired).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.updatesuccess'));
        }
      });
    },
    changeAttrActive(attr) {
      this.$api.rdm.project.updateAttrIsActive(attr.id, attr.isActive).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.updatesuccess'));
        }
      });
    },
    addAttr() {
      this.currentAttrId = null;
      this.isAttrShow = true;
    },
    deleteAttr(attr) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('term.rdm.deletepropertydesc'),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.rdm.project.deleteAttrById(attr.id).then(res => {
            if (res.Status === 'OK') {
              const index = this.attrList.findIndex(d => d.id === attr.id);
              if (index > -1) {
                this.attrList.splice(index, 1);
              }
              vnode.isShow = false;
              this.$Message.success(this.$t('message.deletesuccess'));
            }
          });
        }
      });
    },
    editAttr(attr) {
      this.isAttrShow = true;
      this.currentAttrId = attr.id;
    },
    closeAttr(attrId) {
      this.isAttrShow = false;
      if (attrId) {
        this.getNewAttrById(attrId);
      }
    },
    updateAttrList(event, val) {
      this.attrList = val;
      const idList = [];
      this.attrList.forEach(element => {
        idList.push(element.id);
      });
      this.$api.rdm.project.updateAttrSort({idList: idList, appId: this.appId});
    },
    getNewAttrById(id) {
      this.$api.rdm.project.getAttrById(id).then(res => {
        const attrData = res.Return;
        const index = this.attrList.findIndex(d => d.id === attrData.id);
        if (index > -1) {
          this.$set(this.attrList, index, attrData);
        } else {
          this.attrList.push(attrData);
        }
      });
    },
    searchAppAttr() {
      this.$api.rdm.app.searchAppAttr({ appId: this.appId }).then(res => {
        this.attrList = res.Return;
      });
    }
  },
  filter: {},
  computed: {
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
