<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addTemplate()">模板</span>
      </template>
      <template v-slot:topRight>
        <InputSearcher
          v-model="keyword"
          @change="changeCurrent(1)"
        ></InputSearcher>
      </template>
      <template v-slot:content>
        <div style="">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <TsTable
            v-if="!loadingShow"
            v-bind="tableConfig"
            :theadList="theadList"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize(1, ...arguments)"
          >
            <template slot="" slot-scope="{row}">
              {{ row }}
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: false,
      theadList: [
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '描述',
          key: 'des'
        },
        {
          title: '修改人',
          key: 'cdu'
        },
        {
          title: '修改时间',
          key: 'fcu'
        },
        {
          key: 'action'
        }
      ],
      tableConfig: {},
      keyword: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeCurrent(current) {},
    changePageSize() {

    },
    addTemplate() {
      this.$router.push({
        path: './eoa-template-edit'
      });
    },
    editTemplate() {

    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
