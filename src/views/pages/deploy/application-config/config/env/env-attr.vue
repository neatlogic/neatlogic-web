<template>
  <div class="env-autoconfig-box bg-op env-autoconfig-radius">
    <ul class="pt-nm pl-nm">
      <li v-if="tableData && tableData.tbodyList.length > 0 && hasEditConfigAuth" class="tsfont-edit text-href" @click="editAutoConfig">{{ $t('page.edit') }}</li>
      <template v-else>
        <Tooltip
          max-width="400"
          placement="right"
          transfer
        >
          <span class="tsfont-edit text-disabled action-item">{{ $t('page.edit') }}</span>
          <ul slot="content">
            <li>{{ $t('term.deploy.noconfigauthtip') }}</li>
          </ul>
        </Tooltip>
      </template>
    </ul>
    <div v-if="tableData && tableData.tbodyList.length > 0" :class="tableData && tableData.tbodyList.length > 0 ? 'padding': ''">
      <TsTable
        v-bind="tableConfig"
        :theadList="envTheadList"
        @changeCurrent="changeCurrentAutoConfig"
        @changePageSize="changePageSizeAutoConfig"
      >
        <template slot="value" slot-scope="{row}">
          <span v-if="row.type==='password' && row.value">******</span>
          <span v-else-if="row.type==='password' && !row.value">{{ $t('page.settonull') }}</span>
          <span v-else>{{ row.hasOwnProperty('value') && !row.value ? $t('page.settonull') :(row.value || '-') }}</span>
        </template>
      </TsTable>
    </div>
    <ul v-else class="autocfg-box flex-center">
      <li v-show="hasEditConfigAuth" class="text-grey">
        <span>{{ $t('term.deploy.addenvattrtips') }}</span>
        <span class="tsfont-plus text-href" @click="openEnvEdit">{{ $t('page.attribute') }}</span></li>
    </ul>
    <EnvAutoconfigEdit
      v-if="isShowEnvEdit"
      :isEdit="tableData && tableData.tbodyList.length > 0"
      :params="params"
      :tableData="tableData"
      @close="closeAutoConfigEdit"
      @save="saveEnvAttr"
    ></EnvAutoconfigEdit>
  </div>
</template>
<script>
export default {
  name: '', // 配置文件适配列表
  components: {
    EnvAutoconfigEdit: () => import('./env-autoconfig-edit'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    hasEditConfigAuth: {
      // 是否有编辑配置权限
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShowEnvEdit: false,
      tableConfig: {},
      envTheadList: [
        {
          title: this.$t('page.attrname'),
          key: 'key'
        },
        {
          title: this.$t('page.type'),
          key: 'typeText'
        },
        {
          title: this.$t('page.attrvalue'),
          key: 'value'
        }
      ], tableData: {
        hideAction: false,
        tbodyList: []
      } 
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getEnvAttrList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    openEnvEdit() {
      this.isShowEnvEdit = true;
    },
    editAutoConfig() {
      this.isShowEnvEdit = true;
    },
    closeAutoConfigEdit(needRefresh) {
      this.isShowEnvEdit = false;
      if (needRefresh) {
        this.getEnvAttrList();
      }
    },
    changeCurrentAutoConfig() {

    },
    changePageSizeAutoConfig() {

    },
    getEnvAttrList() {
      this.$api.deploy.applicationConfig.getEnvAttr(this.params).then((res) => {
        if (res && res.Status == 'OK') {
          let returnData = res.Return;
          this.$set(this.tableConfig, 'tbodyList', returnData);
          this.tableData.tbodyList = [];
          returnData && returnData.forEach((v) => {
            this.tableData.tbodyList.push({
              key: v.key,
              type: v.type,
              value: v.hasOwnProperty('value') ? v.value : '',
              isEmpty: (!v.hasOwnProperty('value') || (v.value == '')) ? 1 : 0, // 没有value的属性，或者为空字符串，设为空打开
              delOperation: ''
            });
          });
        }
      });
    },
    saveEnvAttr(params) {
      this.$api.deploy.applicationConfig.saveEnvAttr(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeAutoConfigEdit(true);
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.env-autoconfig-box {
  height: calc(100vh - 50px - 50px - 32px - 16px);
  &.env-autoconfig-radius {
  border-radius: 0 10px 10px;
  }
  .autocfg-box {
    height: 148px;
  }
}
.border-bottom {
  border-bottom: 1px solid;
}
.operation-box {
  display: flex;
  justify-content: space-between;
}
</style>
