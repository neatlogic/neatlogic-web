<template>
  <div>
    <TsDialog v-bind="dialogSetting" @on-close="closeDialog">
      <template v-slot>
        <div class="pt-md pl-md pr-md">
          <TsRow class="mb-nm">
            <Col span="10"></Col>
            <Col span="14">
              <CombineSearcher v-model="searchValue" v-bind="searchConfig" @change="filterAuthByCondition"></CombineSearcher>
            </Col>
          </TsRow>
          <TsTable :theadList="theadList" :tbodyList="tbodyList">
            <template slot="authName" slot-scope="{ row }">
              <span>{{ row.authName }}</span>
              <span class="text-grey">&nbsp;&nbsp;{{ row.auth }}</span>
            </template>
            <!-- 复用SQL语句列的图标悬浮交互，transfer避免来源浮层被侧栏表格裁剪。 -->
            <template slot="sourcePathList" slot-scope="{ row }">
              <Poptip
                trigger="hover"
                :title="$t('page.source')"
                word-wrap
                width="700"
                :transfer="true"
                placement="left"
              >
                <span class="tsfont-zirenwu cursor-pointer"></span>
                <!-- 按原始节点类型显示分组、角色和权限图标，不拆分名称文本。 -->
                <div slot="content">
                  <div v-for="(source, index) in row.sourceDetailList" :key="index" :class="{'mb-xs': index < row.sourceDetailList.length - 1}">
                    <span>{{ row.sourceDetailList.length > 1 ? $t('term.framework.authsourcenumber', {index: index + 1, description: source.description}) : source.description }}</span>
                    <span v-for="(node, nodeIndex) in source.nodes" :key="nodeIndex">
                      <span v-if="nodeIndex"> → </span>
                      <span :class="{'tsfont-team-s': node.type === 'team', 'tsfont-role': node.type === 'role', 'tsfont-security': node.type === 'permission'}">{{ node.name }}</span>
                    </span>
                  </div>
                </div>
              </Poptip>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import BaseMenuMixin from './base-menu-mixin';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue')
  },
  mixins: [BaseMenuMixin],
  props: {
    userAuthList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      keyword: '',
      searchValue: {},
      selectedMenuList: [],
      searchConfig: {
        search: true,
        placeholder: this.$t('form.placeholder.pleaseinput', { target: this.$t('page.keyword') }),
        searchList: [
          {
            type: 'cascader',
            dataList: [],
            name: 'menuName',
            label: this.$t('page.menuname'),
            transfer: true,
            filterable: true,
            onChange: (val, selectedList) => {
              let authList = [];
              let tempList = [];
              selectedList.forEach((v) => {
                if (v && v.authority) {
                  tempList = v.authority.split(',');
                  if (tempList && tempList.length > 0) {
                    tempList.forEach((v) => {
                      if (v) {
                        authList.push(v.toUpperCase());
                      }
                    });
                  }
                }
              });
              this.selectedMenuList = authList;
            }
          }
        ]
      },
      dialogSetting: {
        isShow: true,
        width: 'medium',
        type: 'slide',
        hasFooter: false,
        hasContentPadding: false
      },
      theadList: [
        {
          title: this.$t('term.framework.authname'),
          key: 'authName'
        },
        {
          title: this.$t('term.framework.belongmodule'),
          key: 'groupName'
        },
        // 来源列仅保留图标入口，固定窄列避免完整路径撑高或挤占表格。
        {
          title: this.$t('page.source'),
          key: 'sourcePathList',
          width: 80
        }
      ],
      tbodyList: [],
      defaultTbodyList: [],
      groupList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async initData() {
      await this.searchgroupListData();
      // 模块字典加载后生成独立展示数据，并保留当前搜索条件。
      this.refreshAuthList();
      const dataList = this.getMenuInfoList({ groupList: this.groupList }) || [];
      this.searchConfig.searchList.forEach((v) => {
        if (v && v.name === 'menuName') {
          v.dataList = dataList;
        }
      });
    },
    getGroupName(group) {
      const findItem = this.groupList.find(v => v.value === group);
      return findItem?.text;
    },
    // 统一缺省字段为安全文本，旧接口或异常字段不会使搜索中断。
    getDisplayText(value) {
      return value == null ? '' : String(value);
    },
    // 按组与编码查找权限链名称，缺少定义时仅回退编码，不额外请求字典。
    getAuthDisplayName(auth) {
      return this.authDisplayNameMap[auth.authGroup]?.[auth.auth] || this.getDisplayText(auth.auth);
    },
    // 描述和路径节点分开保存；直接授权、旧响应及异常提示保持纯文本。
    getAuthSourceList(row) {
      const sources = row.sourcePathList;
      if (sources == null) {
        return [{description: this.$t('term.framework.authsourcenotprovided'), nodes: []}];
      }
      if (!Array.isArray(sources)) {
        return [{description: this.$t('term.framework.authsourceunknown'), nodes: []}];
      }
      if (!sources.length) {
        return [{description: this.$t('term.framework.authsourcedirect'), nodes: []}];
      }
      return sources.map(source => this.getAuthSourceDetail(source, row));
    },
    // 直接从来源字段构造带类型的节点，名称中的箭头及特殊字符仍是完整文本。
    getAuthSourceDetail(source, row) {
      const unknown = {description: this.$t('term.framework.authsourceunknown'), nodes: []};
      if (!source || typeof source !== 'object' || Array.isArray(source)) {
        return unknown;
      }
      if (source.isSuperAdmin === true) {
        return {description: this.$t('term.framework.authsourcesuperadmin'), nodes: []};
      }
      if ((source.includeAuthPathList != null && !Array.isArray(source.includeAuthPathList)) || (source.teamPathNameList != null && !Array.isArray(source.teamPathNameList))) {
        return unknown;
      }
      const path = source.includeAuthPathList || [];
      const teamPath = source.teamPathNameList || [];
      const roleName = typeof source.roleName === 'string' ? source.roleName : '';
      const teamName = teamPath[teamPath.length - 1];
      const hasTeam = !!source.teamUuid || teamPath.length > 0;
      const isIncluded = path.length > 1;
      if ((!isIncluded && !roleName.trim()) || (source.roleUuid && !roleName.trim()) || (hasTeam && (!roleName.trim() || typeof teamName !== 'string' || !teamName.trim())) || path.length === 1 || path.some(auth => !auth || typeof auth.auth !== 'string' || !auth.auth.trim() || typeof auth.authGroup !== 'string' || !auth.authGroup.trim())) {
        return unknown;
      }
      const nodes = [];
      if (hasTeam) {
        nodes.push({type: 'team', name: teamName});
      }
      if (roleName.trim()) {
        nodes.push({type: 'role', name: roleName});
      }
      // 普通角色来源补当前权限，包含来源保留从根权限到目标权限的完整顺序。
      (isIncluded ? path : [row]).forEach(auth => nodes.push({type: 'permission', name: this.getAuthDisplayName(auth)}));
      return {description: '', nodes};
    },
    // 每次从属性重新生成展示副本，来源不写回父级或Vuex，重新应用已有筛选。
    refreshAuthList() {
      this.defaultTbodyList = (Array.isArray(this.userAuthList) ? this.userAuthList : []).filter(row => row && typeof row === 'object').map(row => ({
        ...row,
        authName: this.getDisplayText(row.authName).trim() ? this.getDisplayText(row.authName) : this.getDisplayText(row.auth),
        groupName: this.getDisplayText(this.getGroupName(row.authGroup)),
        sourceDetailList: this.getAuthSourceList(row)
      }));
      this.filterAuthByCondition();
    },
    searchgroupListData() {
      return this.$api.common.getAuthGroup().then(res => {
        if (res.Status == 'OK') {
          this.groupList = res?.Return?.groupList || [];
        }
      });
    },
    filterAuthByCondition() {
      const { keyword = '', menuName = [] } = this.searchValue || {};
      // 名称、编码及模块统一忽略大小写，来源文案不参与关键词筛选。
      const lowerKeyword = this.getDisplayText(keyword).toLowerCase();
      const hasMenuFilter = Array.isArray(menuName) && menuName.length > 0 && this.selectedMenuList.length > 0;
      this.tbodyList = this.defaultTbodyList.filter(row => {
        const matchesKeyword = !lowerKeyword || [row.authName, row.auth, row.groupName].some(value => this.getDisplayText(value).toLowerCase().includes(lowerKeyword));
        const matchesMenu = !hasMenuFilter || this.selectedMenuList.includes(this.getDisplayText(row.auth).toUpperCase());
        return matchesKeyword && matchesMenu;
      });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    // 用当前权限列表建立独立名称索引，支持跨模块包含链及名称兜底。
    authDisplayNameMap() {
      const names = Object.create(null);
      (Array.isArray(this.userAuthList) ? this.userAuthList : []).forEach(row => {
        if (row && row.auth && row.authGroup) {
          const group = names[row.authGroup] || (names[row.authGroup] = Object.create(null));
          group[row.auth] = this.getDisplayText(row.authName).trim() ? this.getDisplayText(row.authName) : this.getDisplayText(row.auth);
        }
      });
      return names;
    }
  },
  watch: {
    // 侧栏打开期间权限或来源更新后立即刷新，保留关键词和菜单选择。
    userAuthList: {
      handler() {
        this.refreshAuthList();
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
