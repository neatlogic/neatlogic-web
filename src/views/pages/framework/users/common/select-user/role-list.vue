<template>
  <div class="role-list">
    <div class="temconten">
      <TsFormInput
        v-model="keyword"
        class="int"
        search
        :placeholder="$t('page.keyword')"
        clearable
        @on-enter="getPagedata(1)"
        @on-clear="getPagedata(1)"
      ></TsFormInput>
    </div>
    <TsTable
      v-if="tabledata"
      v-bind="tabledata"
      keyName="uuid"
      selectedRemain
      multiple
      @getSelected="getSelect"
      @changeCurrent="getPagedata"
      @changePageSize="changePageSize"
    >
    </TsTable>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsTable: () => import('@/resources/components/TsTable/TsTable')
  },
  props: [],
  data() {
    return {
      tabledata: null,
      keyword: '',
      pageSize: 10,
      select: [],
      theadList: [
        {
          key: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: this.$t('term.framework.rolename'),
          key: 'name'
        },
        {
          title: this.$t('term.framework.roledesc'),
          key: 'description'
        },
        {
          title: this.$t('term.framework.usercount'),
          key: 'userCount'
        }
      ],
      selectList: []
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
    getPagedata(current) {
      let _this = this;
      this.loadingShow = true;
      if (current) {
        _this.tabledata.currentPage = current;
      }
      let param = {
        keyword: _this.keyword,
        pageSize: _this.pageSize,
        currentPage: _this.tabledata.currentPage ? _this.tabledata.currentPage : 1
      };
      this.getTable(param);
    },
    getTable(param) {
      let _this = this;
      let data = param || {
        pageSize: this.pageSize
      };
      _this.$api.framework.role.roleList(data).then(res => {
        if (res.Status == 'OK') {
          _this.tabledata = res.Return;
          _this.tabledata.theadList = _this.theadList;
          _this.selectList.forEach(item => {
            _this.tabledata.tbodyList.map(citem => (item.uuid === citem.uuid ? _this.$set(citem, 'isSelected', true) : ''));
          });
        }
      });
    },
    //
    getPageSize: function(val) {
      this.pageSize = val;
      let param = {
        keyword: this.keyword,
        pageSize: this.pageSize,
        currentPage: this.tabledata.currentPage ? this.tabledata.currentPage : 1
      };
      this.getTable(param);
    },
    getSelect(list, listall) {
      this.selectList = listall || [];
      this.$emit('getSelect', listall);
    },
    //改变页数
    changePageSize(size) {
      this.pageSize = size;
      let param = {
        keyword: this.keyword,
        pageSize: this.pageSize,
        currentPage: this.tabledata.currentPage ? this.tabledata.currentPage : 1
      };
      this.getTable(param);
    },
    selectedItem(item) {
      this.selectList.push(item);
      this.$emit('getSelect', this.selectList);
    },
    cancelSelected(item) {
      this.selectList.splice(this.selectList.findIndex(d => d.uuid === item.uuid), 1);
      this.$emit('getSelect', this.selectList);
    }
  },

  filter: {},

  computed: {},

  watch: {}
};
</script>
<style lang='less' scoped>
.temconten{
  position: relative;
  margin-bottom: 8px;
  height: 40px;
  .int{
    position:absolute;
    right:0;
    width:40%;
  }
}
</style>
