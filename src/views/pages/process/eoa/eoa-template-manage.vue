<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addTemplate()">{{ $t('page.template') }}</span>
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
            @changePageSize="changePageSize"
          >
            <template v-slot:name="{ row }">
              <div class="text-href" @click="editTemplate(row)">{{ row.name }}</div>
            </template>
            <template v-slot:referenceCount="{row}">
              <ReferenceSelect
                :id="row.id"
                calleeType="eoaTemplate"
                :isTable="true"
                :referenceCount="row.referenceCount"
              ></ReferenceSelect>
            </template> 
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li
                    class="tsfont-trash-o"
                    :class="row.referenceCount > 0?'disable':''"
                    :title="row.referenceCount > 0 ? $t('page.citetarget', {target:$t('page.template')}) : ''"
                    @click="deleteItem(row)"
                  >{{ $t('page.delete') }}</li>
                </ul>
              </div>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve)
    
  },
  props: {},
  data() {
    return {
      loadingShow: false,
      searchData: {},
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.description'),
          key: 'description',
          type: 'html'
        },
        { 
          title: this.$t('term.process.relprocess'), 
          key: 'referenceCount'
        },
        {
          title: this.$t('page.fcu'),
          key: 'fcu',
          type: 'user',
          uuid: 'uuid'
        },
        {
          title: this.$t('page.fcd'),
          key: 'fcd',
          type: 'time'
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
  created() {
    this.searchEoaTemplate();
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
    searchEoaTemplate() {
      let data = {
        keyword: this.keyword,
        currentPage: this.searchData.currentPage,
        pageSize: this.searchData.pageSize
      };
      this.loadingShow = true;
      this.$api.process.eoa.searchEoaTemplate(data).then(res => {
        if (res.Status === 'OK') {
          this.tableConfig = res.Return;
        }
      })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    changeCurrent(currentPage) {
      this.searchData.currentPage = currentPage;
      this.searchEoaTemplate(); 
    },
    changePageSize(pageSize) {
      this.searchData.pageSize = pageSize;
      this.searchData.currentPage = 1;
      this.searchEoaTemplate(); 
    },
    addTemplate() {
      this.$router.push({
        path: './eoa-template-edit'
      });
    },
    editTemplate(row) {
      this.$router.push({
        path: './eoa-template-edit',
        query: {
          id: row.id
        }
      });
    },
    deleteItem(row) {
      if (row.referenceCount > 0) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = { id: row.id };
          this.$api.process.eoa.deleteEoaTemplate(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchEoaTemplate();
            }
          });
          vnode.isShow = false;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
