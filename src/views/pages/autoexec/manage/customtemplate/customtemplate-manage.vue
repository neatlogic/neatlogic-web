<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="addCustomTemplate()">{{ $t('page.template') }}</div>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher v-model="searchParam.keyword" @change="searchCustomTemplate(1)"></InputSearcher>
          <div></div>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsTable
            :loading="isLoading"
            :theadList="theadList"
            v-bind="customTemplateData"
            @changeCurrent="searchCustomTemplate"
            @changePageSize="changePageSize"
          >
            <template v-slot:name="{ row }">
              <span class="text-href" @click="editCustomTemplate(row.id)">{{ row.name }}</span>
            </template>
            <template v-slot:isActive="{ row }">
              <span v-if="row.isActive" class="text-success">{{ $t('page.yes') }}</span>
              <span v-else class="text-grey">{{ $t('page.no') }}</span>
            </template>
            <template v-slot:referenceCount="{row}">
              <ReferenceSelect
                :id="row.id"
                :isTable="true"
                calleeType="customtemplate"
                :referenceCount="row.referenceCount"
              ></ReferenceSelect>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-test" @click="testCustomTemplate(row.id)">{{ $t('page.test') }}</li>
                  <li class="tsfont-trash-o" @click="deleteCustomTemplate(row.id)">{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
    <CustomTemplateEditDialog v-if="isEditCustomTemplateDialogShow" :id="currentCustomTemplateId" @close="closeEditCustomTemplateDialog"></CustomTemplateEditDialog>
    <CustomTemplateTestDialog
      v-if="isTestCustomTemplateDialogShow"
      :id="currentCustomTemplateId"
      @close="isTestCustomTemplateDialogShow = false"
    ></CustomTemplateTestDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve),
    CustomTemplateEditDialog: resolve => require(['./customtemplate-edit-dialog.vue'], resolve),
    CustomTemplateTestDialog: resolve => require(['./customtemplate-test-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isLoading: false,
      isEditCustomTemplateDialogShow: false,
      isTestCustomTemplateDialogShow: false,
      currentCustomTemplateId: null,
      searchParam: { keyword: '' },
      theadList: [
        {
          key: 'name',
          title: this.$t('page.name')
        },
        {
          key: 'isActive',
          title: this.$t('page.enable')
        },
        {
          key: 'referenceCount',
          title: this.$t('term.autoexec.associatedobject')
        },
        { key: 'action' }
      ],
      customTemplateData: {}
    };
  },
  beforeCreate() {},
  created() {
    this.searchCustomTemplate(1);
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
    deleteCustomTemplate(id) {
      this.$createDialog({
        type: 'modal',
        width: 'small',
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.customtemplate') }),
        'on-ok': vnode => {
          this.$api.autoexec.customtemplate.deleteCustomTemplate(id).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.searchCustomTemplate(1);
            }
          });
        }

      });
    },
    testCustomTemplate(id) {
      this.isTestCustomTemplateDialogShow = true;
      this.currentCustomTemplateId = id;
    },
    editCustomTemplate(id) {
      this.isEditCustomTemplateDialogShow = true;
      this.currentCustomTemplateId = id;
    },
    addCustomTemplate() {
      this.isEditCustomTemplateDialogShow = true;
      this.currentCustomTemplateId = null;
    },
    searchCustomTemplate(currentPage) {
      this.isLoading = true;
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.autoexec.customtemplate.searchCustomTemplate(this.searchParam).then(res => {
        this.customTemplateData = res.Return;
      }).finally(() => {
        this.isLoading = false;
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchCustomTemplate(1);
    },
    closeEditCustomTemplateDialog(needRefresh) {
      this.isEditCustomTemplateDialogShow = false;
      if (needRefresh) {
        this.searchCustomTemplate();
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
