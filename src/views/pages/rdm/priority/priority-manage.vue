<template>
  <div>
    <TsContain>
      <template v-slot:navigation><span>导航</span></template>
      <template v-slot:topLeft>上左</template>
      <template v-slot:topCenter>上中</template>
      <template v-slot:topRight>上右</template>
      <template v-slot:sider>侧边栏</template>
      <template v-slot:content>
        <TsTable
          :tbodyList="priorityList"
          :theadList="theadList"
        >
          <template slot="" slot-scope="{ row }">
            {{ row }}
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit" @click="editPrioroty(row)">编辑</li>
                <li class="tsfont-trash-o" @click="delPriority(row)">删除</li>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      theadList: [
        {
          key: 'name',
          title: this.$t('page.name')
        },
        { key: 'color', title: this.$t('page.color') }
      ],
      priorityList: [],
      isPriorityEditShow: false
    };
  },
  beforeCreate() {},
  created() {
    this.getPriorityList();
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
    getPriorityList() {
      this.$api.rdm.priority.getPriorityList().then(res => {
        this.priorityList = res.Return;
      });
    },
    editPrioroty(row) {
      this.isPriorityEditShow = true;
    },
    delPriority(row) {
      
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
