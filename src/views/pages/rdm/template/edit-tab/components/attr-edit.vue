<template>
  <div>
    <div>
      <a class="tsfont-plus" @click="addAttr">{{ $t('term.rdm.customattribute') }}</a>
    </div>
    <TsTable
      v-if="attrList && attrList.length > 0"
      :fixedHeader="false"
      :canDrag="true"
      keyName="id"
      :theadList="theadList"
      :tbodyList="attrList"
      @updateRowSort="updateAttrList"
    >
      <template v-slot:isActive="{ row, index }">
        <TsFormSwitch
          :value="row.isActive || 0"
          :trueValue="1"
          :falseValue="0"
          @on-change="
            val => {
              changeAttrActive(index, row, val);
            }
          "
        ></TsFormSwitch>
      </template>
      <template v-slot:isRequired="{ row, index }">
        <TsFormSwitch
          :value="row.isRequired || 0"
          :trueValue="1"
          :falseValue="0"
          @on-change="
            val => {
              changeIsRequired(index, row, val);
            }
          "
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
    <CustomAttrEdit v-if="isAttrShow" :attrData="currentAttrData" @close="closeAttr"></CustomAttrEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    CustomAttrEdit: resolve => require(['@/views/pages/rdm/template/edit-tab/components/customattr-edit-dialog.vue'], resolve)
  },
  props: {
    attrList: { type: Array }
  },
  data() {
    return {
      isAttrShow: false,
      currentAttrData: {},
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
    this.getPrivateAttrList();
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
    getPrivateAttrList() {
      this.$api.rdm.attr.getPrivateAttrList().then(res => {
        const privateAttrList = res.Return;
        privateAttrList.forEach(attr => {
          if (!this.attrList.find(d => d.type === attr.type)) {
            this.attrList.push({ ...attr, isPrivate: 1 });
          }
        });
      });
    },
    changeAttrActive(index, attr, isActive) {
      this.$set(attr, 'isActive', isActive);
      //这是为了触发外部对象发生变化
      this.attrList.splice(index, 1, attr);
    },
    changeIsRequired(index, attr, isRequired) {
      this.$set(attr, 'isRequired', isRequired);
      //这是为了触发外部对象发生变化
      this.attrList.splice(index, 1, attr);
    },
    addAttr() {
      this.currentAttrId = null;
      this.isAttrShow = true;
      this.currentAttrData = {};
    },
    deleteAttr(attr) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.attribute') }),
        btnType: 'error',
        'on-ok': vnode => {
          const index = this.attrList.findIndex(d => d.uuid === attr.uuid);
          if (index > -1) {
            this.attrList.splice(index, 1);
          }
          vnode.isShow = false;
        }
      });
    },
    editAttr(attr) {
      this.isAttrShow = true;
      this.currentAttrData = attr;
    },
    closeAttr(attrData) {
      this.isAttrShow = false;
      if (attrData) {
        const index = this.attrList.findIndex(d => d.uuid === attrData.uuid);
        if (index < 0) {
          this.attrList.push(attrData);
        } else {
          this.$set(this.attrList, index, attrData);
        }
      }
    },
    updateAttrList(event, val) {
      this.attrList.sort((x, y) => val.findIndex(d => d.uuid === x.uuid) - val.findIndex(d => d.uuid === y.uuid));
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
