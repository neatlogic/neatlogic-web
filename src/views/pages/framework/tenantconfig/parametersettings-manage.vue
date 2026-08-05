<template>
  <div>
    <TsContain :siderWidth="240" enableCollapse>
      <template v-slot:topRight>
        <div>
          <Row span="24" :gutter="16">
            <Col span="12"></Col>
            <Col span="12">
              <InputSearcher v-model="keyword" @change="searchTenantConfig"></InputSearcher>
            </Col>
          </Row>
        </div>
      </template>
      <template v-slot:sider>
        <div class="tenantconfig-module-index">
          <div
            v-for="moduleGroup in moduleGroupList"
            :key="moduleGroup.moduleGroup"
            class="module-index-item text-action"
            :class="{ 'is-active': selectedModuleGroup === moduleGroup.moduleGroup }"
            @click="changeModuleGroup(moduleGroup.moduleGroup)"
          >
            <div class="module-index-name overflow" :title="moduleGroup.moduleGroupName || moduleGroup.moduleGroup">
              {{ moduleGroup.moduleGroupName || moduleGroup.moduleGroup }}
            </div>
            <div class="module-index-meta text-grey overflow" :title="moduleGroup.moduleGroup">
              {{ moduleGroup.moduleGroup }} · {{ moduleGroup.configCount || 0 }} {{ $t('page.strip') }}
            </div>
          </div>
          <NoData v-if="!moduleLoading && moduleGroupList.length === 0"></NoData>
        </div>
      </template>
      <template v-slot:content>
        <TsTable
          v-bind="tableData"
          :theadList="theadList"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template v-slot:key="{ row }">
            <span class="text-href" @click.stop="showTenantConfigForm(row.key)">{{ row.key }}</span>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <TsDialog
      v-if="isShowFormDialog"
      type="modal"
      :isShow="true"
      :title="$t('dialog.title.edittarget', { target: $t('page.param') })"
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
        ></TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    NoData: () => import('@/resources/components/nodata/NoData.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {},
  data() {
    return {
      loading: false,
      moduleLoading: false,
      keyword: null,
      currentPage: 1,
      pageSize: 20,
      moduleGroupList: [],
      selectedModuleGroup: null,
      theadList: [
        {
          key: 'key',
          title: this.$t('page.variable')
        },
        {
          key: 'value',
          title: this.$t('page.value'),
          maxLength: 200
        },
        {
          key: 'description',
          title: this.$t('page.description'),
          maxLength: 200
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
          label: this.$t('page.value')
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
    this.refreshTenantConfig();
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
    searchTenantConfig() {
      this.currentPage = 1;
      this.refreshTenantConfig();
    },
    refreshTenantConfig() {
      this.listTenantConfigModuleGroup().then(() => {
        this.listTenantConfig();
      });
    },
    listTenantConfig() {
      this.loading = true;
      const params = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        keyword: this.keyword
      };
      if (this.selectedModuleGroup) {
        params.moduleGroup = this.selectedModuleGroup;
      }
      this.$api.framework.tenantconfig
        .listTenantConfig(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.tableData = res.Return;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    listTenantConfigModuleGroup() {
      this.moduleLoading = true;
      return this.$api.framework.tenantconfig
        .listTenantConfig({ keyword: this.keyword, isGroupByModule: 1 })
        .then(res => {
          if (res.Status === 'OK') {
            this.moduleGroupList = (res.Return && res.Return.tbodyList) || [];
            if (this.selectedModuleGroup && !this.moduleGroupList.find(moduleGroup => moduleGroup.moduleGroup === this.selectedModuleGroup)) {
              this.selectedModuleGroup = null;
            }
          }
        })
        .finally(() => {
          this.moduleLoading = false;
        });
    },
    changeModuleGroup(moduleGroup) {
      this.selectedModuleGroup = this.selectedModuleGroup === moduleGroup ? null : moduleGroup;
      this.currentPage = 1;
      this.listTenantConfig();
    },
    async showTenantConfigForm(key) {
      await this.$api.framework.tenantconfig.getTenantConfig({ key }).then(res => {
        if (res.Status === 'OK') {
          this.rowData = res.Return;
          this.updateValueFormType(this.rowData.type);
        }
      });
      this.isShowFormDialog = true;
    },
    updateValueFormType(type) {
      const valueConfig = this.formSetting.value;
      if (!valueConfig) {
        return;
      }
      this.$set(valueConfig, 'type', type === 'password' ? 'password' : 'text');
    },
    close() {
      this.isShowFormDialog = false;
      this.rowData = {};
      this.updateValueFormType();
    },
    save() {
      let form = this.$refs.mainForm;
      if (form.valid()) {
        let data = form.getFormValue();
        this.$api.framework.tenantconfig.saveTenantConfig(data).then(res => {
          if (res.Status === 'OK') {
            this.isShowFormDialog = false;
            this.rowData = {};
            this.refreshTenantConfig();
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.tenantconfig-module-index {
  height: 100%;
  padding: 8px 0;

  .module-index-item {
    padding: 8px 12px;
    line-height: 18px;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    &.is-active {
      border-left: 3px solid var(--primary-color);
      background: rgba(0, 0, 0, 0.04);
      padding-left: 9px;

      .module-index-name {
        color: var(--primary-color);
      }
    }
  }

  .module-index-name {
    font-weight: 500;
  }

  .module-index-meta {
    margin-top: 2px;
    font-size: 12px;
  }
}
</style>
