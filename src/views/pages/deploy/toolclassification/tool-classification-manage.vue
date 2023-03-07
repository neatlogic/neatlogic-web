<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <span v-if="$AuthUtils.hasRole('AUTOEXEC_MODIFY')" class="tsfont-plus text-action" @click="toTypeManage">工具分类</span>
      </template>
      <template v-slot:topRight>
        <InputSearcher
          v-model="keyword"
          placeholder="名称、描述"
          @change="() => searchToolClassification()"
        ></InputSearcher>
      </template>
      <template v-slot:content>
        <TsTable
          v-bind="tableConfig"
          :theadList="theadList"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template slot="isActive" slot-scope="{row}">
            <div v-if="row.isActive == 1" class="text-success">已启用</div>
            <div v-else class="text-grey">已禁用</div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-if="row && row.name && !defaultWhitelist.includes(row.name)">
                  <TsFormSwitch
                    v-model="row.isActive"
                    :showStatus="true"
                    trueText="禁用"
                    falseText="启用"
                    @on-change="(isActive) => changeSwitch(row.id, isActive)"
                  ></TsFormSwitch>
                </li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      keyword: '',
      tableConfig: {
        tbodyList: [],
        currentPage: 1,
        pageSize: 20,
        rowNum: null
      },
      defaultWhitelist: [], // 默认白名单列表
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: '描述',
          key: 'description'
        },
        {
          title: '状态',
          key: 'isActive'
        },
        {
          key: 'action'
        }
      ]
    };
  },
  beforeCreate() {},
  async created() {
    await this.getWhiteList();
    this.searchToolClassification();
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
    async getWhiteList() {
      // 获取白名单列表
      this.defaultWhitelist = [];
      let data = {
        enumClass: 'neatlogic.framework.deploy.constvalue.DeployWhiteType'
      };
      await this.$api.common.getSelectLit(data).then((res) => {
        if (res.Status == 'OK') {
          if (res.Return && !this.$utils.isEmpty(res.Return)) {
            res.Return.forEach((v) => {
              if (v && v.value) {
                this.defaultWhitelist.push(v.value);
              }
            });
          }
        }
      });
    },
    searchToolClassification() {
      this.loadingShow = true;
      let params = {
        keyword: this.keyword,
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize
      };
      this.$api.deploy.toolclassification.searchToolClassification(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.tableConfig = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changeSwitch(id, isActive) {
      if (id) {
        this.$api.deploy.toolclassification.updateToolClassificationStatus({id: id, isActive: isActive}).then((res) => {
          if (res && res.Status == 'OK') {
            this.$Message.success(isActive ? '启用成功' : '禁用成功');
          }
        });
      }
    },
    changeCurrent(currentPage) {
      this.tableConfig.currentPage = currentPage;
      this.searchToolClassification();
    },
    changePageSize(pageSize) {
      this.tableConfig.currentPage = 1;
      this.tableConfig.pageSize = pageSize;
      this.searchToolClassification();
    },
    toTypeManage() {
      window.open(HOME + '/autoexec.html#/type-manage?type=add', '_blank');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
