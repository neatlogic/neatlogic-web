<template>
  <div class="padding">
    <TsTable
      v-bind="tableConfig"
      :theadList="theadList"
      :hideAction="false"
      @operation="operation"
      @changeCurrent="getTableData"
      @changePageSize="getTableData(1, ...arguments)"
    >
    </TsTable>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      tableConfig: {
        rowNum: 0,
        pageSize: 20,
        currentPage: 1,
        tbodyList: [
          {name: 'textsasa', url: 'dsadsadlj', referenceCount: 100, isActive: 0, action: 'view'},
          {name: 'textsasa', url: 'dsadsadlj', referenceCount: 200, isActive: 0},
          {name: 'textsasa', url: 'dsadsadlj', referenceCount: 10, isActive: 0},
          {name: 'textsasa', url: 'dsadsadlj', referenceCount: 0, isActive: 1},
          {name: 'textsasa', url: 'dsadsadlj', referenceCount: 60, isActive: 0}
        ]
      },
      theadList: [
        {
          key: 'name',
          title: '名称',
          type: 'linktext',
          textValue: 'views'
        },
        {
          key: 'url',
          title: '地址'
        },
        {
          key: 'referenceCount',
          title: '数量'
        },
        { key: 'action', title: '', type: 'action', operations:
          [{icon: 'tsfont-edit', name: '编辑', type: 'text', action: 'edit'},
            {icon: 'tsfont-trash-o', name: '删除', type: 'text', action: 'del', readonly: true, value: 'referenceCount'},
            {icon: '', type: 'switch', action: 'switch', key: 'isActive'},
            {icon: '', type: 'switch', value: 'referenceCount', action: 'isSwitch', disabled: true, key: 'isActive'}
          ]}
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {

  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    operation(row, view) {
      console.log(row, view);
    },
    getTableData() {
      
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
