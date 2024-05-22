<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="editTemplate()">{{ $t('dialog.title.addtarget', { target: $t('page.template') }) }}</span>
      </template>
      <template v-slot:content>
        <TsTable :tbodyList="tbodyList" :theadList="theadList">
          <template v-slot:isActive="{ row }">
            <span v-if="row.isActive" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit" @click="editTemplate(row)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o" @click="deleteTemplate(row)">{{ $t('page.delete') }}</li>
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
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {},
  data() {
    return {
      tbodyList: [],
      theadList: [
        {
          key: 'name',
          title: this.$t('page.name')
        },
        {
          key: 'isActive',
          title: this.$t('term.report.isactive')
        },
        {
          key: 'action'
        }
      ],
      searchParam: {}
    };
  },
  beforeCreate() {},
  created() {
    this.searchTemplate();
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
    deleteTemplate(template) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.template') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.rdm.projecttemplate.deleteProjectTemplate(template.id).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.searchTemplate();
            }
          });
        }
      });
    },
    editTemplate(template) {
      if (template) {
        this.$router.push({ path: '/template-edit/' + template.id });
      } else {
        this.$router.push({ path: '/template-edit' });
      }
    },
    searchTemplate(currentPage) {
      this.searchParam.currentPage = currentPage;
      this.$api.rdm.projecttemplate.searchProjectTemplate(this.searchParam).then(res => {
        this.tbodyList = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
