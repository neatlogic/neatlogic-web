<template>
  <TsDialog
    v-bind="dialogConfig"
    :isShow="true"
    :loading="isSaving"
    @on-close="close"
    @on-ok="save"
  >
    <TsTable
      :fixedHeader="true"
      :tbodyList="settingList"
      :theadList="theadList"
      :canDrag="true"
      keyName="group"
      @updateRowSort="updateSort"
    >
      <template v-slot:groupName="{ row }">
        <span>{{ row.groupName }}</span>
        <span class="text-grey ml-xs">({{ row.group }})</span>
      </template>
      <template v-slot:alias="{ row }">
        <TsFormInput
          v-model="row.alias"
          :maxlength="50"
          border="border"
        ></TsFormInput>
      </template>
    </TsTable>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    groupList: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('page.setting'),
        type: 'slider',
        maskClose: false,
        width: 'medium'
      },
      theadList: [
        { key: 'groupName', title: this.$t('page.group') },
        { key: 'alias', title: this.$t('page.alias') }
      ],
      settingList: [],
      isSaving: false
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      const configGroupList = this.config.groupList || [];
      const configMap = {};
      configGroupList.forEach(item => {
        configMap[item.group] = item;
      });
      const sortedList = this.groupList.map((item, index) => {
        const configItem = configMap[item.group] || {};
        return {
          group: item.group,
          groupName: item.groupName,
          alias: configItem.alias || '',
          sort: configItem.sort != null ? configItem.sort : index
        };
      });
      sortedList.sort((a, b) => a.sort - b.sort);
      this.settingList = sortedList;
    },
    updateSort(event, list) {
      this.settingList = list;
    },
    save() {
      this.isSaving = true;
      const groupList = this.settingList.map((item, index) => ({
        group: item.group,
        alias: item.alias || '',
        sort: index
      }));
      const data = {
        config: {
          groupList
        }
      };
      this.$api.framework.module.saveModuleManageSetting(data).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', { groupList });
        }
      }).finally(() => {
        this.isSaving = false;
      });
    },
    close() {
      this.$emit('close');
    }
  },
  watch: {
    groupList() {
      this.init();
    },
    config() {
      this.init();
    }
  }
};
</script>
