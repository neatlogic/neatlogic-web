<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addRelType()">{{ $t('page.relationtype') }}</span>
      </template>
      <div slot="content" ref="maintable" class="content">
        <TsTable v-if="relTypeData" v-bind="relTypeData">
          <template slot="invokeCount" slot-scope="{ row }">
            <Badge :count="row.invokeCount" type="primary"></Badge>
          </template>
          <template slot="name" slot-scope="{ row }">
            {{ row.name }}
          </template>
          <template v-slot:isShowInTopo="{ row }">
            <span v-if="row.isShowInTopo" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit" @click="editRelType(row.id)">{{ $t('page.edit') }}</li>
                <li
                  class="tsfont-trash-o"
                  :class="row.invokeCount > 0 ? 'disable' : ''"
                  :title="row.invokeCount > 0 ? $t('term.cmdb.taginvoked') : ''"
                  @click="deleteRelType(row)"
                >{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <RelTypeEdit v-if="isDialogShow" :id="id" @close="closeDialog"></RelTypeEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    RelTypeEdit: () => import('./reltype-edit.vue')
  },
  props: {},
  data() {
    return {
      id: null,
      isDialogShow: false,
      relTypeData: {
        theadList: [
          {
            title: this.$t('page.name'),
            key: 'name'
          },
          {
            title: this.$t('page.invokecount'),
            key: 'invokeCount'
          },
          {
            title: this.$t('term.cmdb.showintopo'),
            key: 'isShowInTopo'
          },
          {
            title: this.$t('page.memo'),
            key: 'description'
          },
          {
            title: '',
            key: 'action',
            align: 'right'
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getRelTypeList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addRelType() {
      this.id = null;
      this.isDialogShow = true;
    },
    editRelType(id) {
      this.id = id;
      this.isDialogShow = true;
    },
    deleteRelType(relType) {
      if (relType.invokeCount > 0) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.relationtype')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.ci
            .deleteRelTypeById(relType.id)
            .then(res => {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.getRelTypeList();
            })
            .catch(error => {
              if (error.data.Message) {
                this.$Message.error(error.data.Message);
              } else {
                this.$Message.error(this.$t('message.deletefailed'));
              }
            });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    getRelTypeList() {
      this.$api.cmdb.ci.getRelTypeList().then(res => {
        this.$set(this.relTypeData, 'tbodyList', res.Return);
      });
    },
    closeDialog(needFresh) {
      this.isDialogShow = false;
      if (needFresh) {
        this.getRelTypeList();
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
