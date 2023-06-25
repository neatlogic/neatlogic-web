<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">

        </div>
      </template>
      <template v-slot:topRight>

      </template>
      <template v-slot:content>
        <TsTable 
          v-if="!loading"
          v-bind="tableData" 
          :theadList="theadList" 
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template v-slot:key="{ row }">
            <span v-if="$AuthUtils.hasRole('TENANT_CONFIG_MODIFY')" class="text-href" @click.stop="showTenantConfigForm(row.key)">{{ row.key }}</span>
            <span v-else>{{ row.key }}</span>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <TsDialog
      type="modal"
      :isShow.sync="isShowFormDialog"
      :title="$t('page.edit')"
      @on-close="close"
      @on-ok="save"
    >
      <template v-slot>
        <TsForm 
          ref="mainForm"
          v-model="rowData"
          :itemList="formSetting"
          type="type"
          labelPosition="right"
        >
        </TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loading: false,
      currentPage: 1,
      pageSize: 20,
      theadList: [
        {
          key: 'key',
          title: this.$t('page.variable')
        },
        {
          key: 'value',
          title: this.$t('page.value')
        },
        {
          key: 'description',
          title: this.$t('page.description')
        }
      ],
      tableData: {},
      isShowFormDialog: false,
      formSetting: {
        key: {
          type: 'text',
          label: this.$t('page.variable'),
          disabled: true,
          validateList: ['required']
        },
        value: {
          type: 'text',
          label: this.$t('page.value'),
          validateList: ['required']
        },
        description: {
          type: 'textarea',
          label: this.$t('page.description'),
          disabled: true
        }
      },
      rowData: {}
    };
  },
  beforeCreate() {},
  created() {
    this.listTenantConfig();
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
    changePage(currentPage) {
      this.currentPage = currentPage;
      this.listTenantConfig();
    },
    changePageSize(pageSize) {
      this.currentPage = 1;
      this.pageSize = pageSize;
      this.listTenantConfig();
    },
    listTenantConfig() {
      this.loading = true;
      this.$api.framework.tenantconfig.listTenantConfig({currentPage: this.currentPage, pageSize: this.pageSize}).then(res => {
        if (res.Status === 'OK') {
          this.tableData = res.Return;
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    async showTenantConfigForm(key) {
      await this.$api.framework.tenantconfig.getTenantConfig({key}).then(res => {
        if (res.Status === 'OK') {
          this.rowData = res.Return;
        }
      });
      this.isShowFormDialog = true;
    },
    close() {
      this.isShowFormDialog = false;
      this.rowData = {};
    },
    save() {
      let form = this.$refs.mainForm;
      if (form.valid()) {
        let data = form.getFormValue();
        this.$api.framework.tenantconfig.saveTenantConfig(data).then(res => {
          if (res.Status === 'OK') {
            this.isShowFormDialog = false;
            this.rowData = {};
            this.listTenantConfig();
          }
        });
      }
    }
  },
  filter: {},
  computed: {

  },
  watch: {}
};
</script>
<style lang="less"></style>
