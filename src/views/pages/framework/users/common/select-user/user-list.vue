<template>
  <div>
    <TsTable
      v-model="selectList"
      v-bind="tabledata"
      :theadList="theadList"
      keyName="uuid"
      selectedRemain
      multiple
      @changeCurrent="getPagedata"
      @changePageSize="changePageSize"
      @getSelected="getSelected"
    >
      <template slot="teamNameList" slot-scope="{ row }">
        <div>
          <Tag v-for="(t, index) in showTableList(row.teamNameList)" :key="index">{{ t }}</Tag>
          <span v-if="row.teamNameList && row.teamNameList.length > 3" @click.stop>
            <Dropdown placement="bottom-start" transfer>
              <span class="text-action tsfont-option-horizontal"></span>
              <DropdownMenu slot="list">
                <DropdownItem v-for="(item, index) in showRestText(row.teamNameList)" :key="index">{{ item }}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </span>
        </div>
      </template>
    </TsTable>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable')
  },
  props: {
    keyword: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tabledata: {},
      pageSize: 10,
      theadList: [
        {
          key: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: this.$t('page.userid'),
          key: 'userId'
        },
        {
          title: this.$t('page.username'),
          key: 'userName'
        },
        {
          title: this.$t('page.userteam'),
          key: 'teamNameList'
        },
        {
          title: this.$t('page.phone'),
          key: 'phone'
        },
        {
          title: this.$t('page.email'),
          key: 'email'
        }
      ],
      selectList: [] // 存放当前页选中项
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
    this.getTable();
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    getTable(param) {
      // this.tabledata = null;
      const _this = this;
      let data = param || {
        pageSize: this.pageSize,
        isActive: 1
      };
      data.keyword = this.keyword || '';
      this.$api.framework.user.searchUser(data).then(res => {
        if (res.Status == 'OK') {
          this.tabledata = res.Return;
        }
      });
    },
    getSelected(list, listall) {
      this.selectList = list || [];
      this.$emit('getSelect', listall);
    },
    getPagedata(current) {
      if (current) {
        this.tabledata.currentPage = current;
      }
      // if (this.keyword != '') {
      //   this.tabledata.currentPage = 1;
      // }
      let param = {
        keyword: this.keyword,
        pageSize: this.pageSize,
        currentPage: this.tabledata.currentPage ? this.tabledata.currentPage : 1,
        isActive: 1
      };
      this.getTable(param);
    },
    //改变页数
    changePageSize(size) {
      this.pageSize = size;
      let param = {
        keyword: this.keyword,
        pageSize: this.pageSize,
        currentPage: this.tabledata.currentPage ? this.tabledata.currentPage : 1,
        isActive: 1
      };
      this.getTable(param);
    },
    showTableList(val) {
      let list = [];
      if (val && val.length > 0) {
        for (var i = 0; i < val.length; i++) {
          list.push(val[i]);
          if (i >= 2) {
            break;
          }
        }
      }
      return list;
    },
    //剩余
    showRestText(list) {
      let textList = '';
      textList = list.slice(3);
      return textList;
    }
  },

  filter: {},

  computed: {},

  watch: {}
};
</script>
<style lang='less' scoped>
</style>
