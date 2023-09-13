<template>
  <div>
    <TsContain>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="editAttr()">{{ $t('page.attribute') }}</div>
        </div>
      </template>
      <template v-slot:content>
        <TsTable v-bind="globalAttrData" :theadList="theadList">
          <template v-slot:isActive="{ row }">
            <span v-if="row.isActive" class="text-success">{{ $t('page.yes') }}</span>
            <span v-if="!row.isActive" class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template v-slot:isMultiple="{ row }">
            <span v-if="row.isMultiple" class="text-success">{{ $t('page.yes') }}</span>
            <span v-if="!row.isMultiple" class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template v-slot:itemList="{ row }">
            <div v-if="row.itemList && row.itemList.length > 0">
              <Tag v-for="(item, index) in row.itemList" :key="index">
                {{ item.value }}
              </Tag>
            </div>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li
                  class="tsfont-edit"
                  @click="editAttr(row)"
                >{{ $t('page.edit') }}</li>
                <li
                  class="tsfont-trash-o"
                  @click="deleteAttr(row)"
                >{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <AttrEditDialog v-if="isEditShow" :id="currentAttrId" @close="closeEditDialog"></AttrEditDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    AttrEditDialog: resolve => require(['./global-attr-edit-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isEditShow: false,
      globalAttrData: {},
      currentAttrId: null,
      theadList: [
        {
          key: 'name',
          title: '唯一标识'
        },
        { key: 'label', title: this.$t('page.name') },
        { key: 'isActive', title: this.$t('term.report.isactive') },
        { key: 'isMultiple', title: this.$t('page.ismultiple') },
        { key: 'itemList', title: this.$t('page.option') },
        { key: 'action' }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchGlobalAttr();
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
    editAttr(attr) {
      if (attr) {
        this.currentAttrId = attr.id;
      }
      this.isEditShow = true;
    },
    deleteAttr(attr) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.attribute')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.globalattr.deleteGlobalAttr(attr.id).then(res => {

          });
        }
      });
    },
    closeEditDialog(needRefresh) {
      if (needRefresh) {
        this.searchGlobalAttr();
      }
      this.isEditShow = false;
      this.currentAttrId = null;
    },
    searchGlobalAttr() {
      this.$api.cmdb.globalattr.searchGlobalAttr().then(res => {
        this.globalAttrData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
