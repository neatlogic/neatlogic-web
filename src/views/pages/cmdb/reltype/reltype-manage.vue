<template>
  <div>
    <TsContain> 
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addRelType()">关系类型</span>
      </template>
      <div slot="content" ref="maintable" class="content">
        <TsTable v-if="relTypeData" v-bind="relTypeData">
          <template slot="invokeCount" slot-scope="{ row }">
            <Tag>{{ row.invokeCount }}</Tag>
          </template>
          <template slot="name" slot-scope="{ row }">
            <span class="text-href" @click.stop="editRelType(row.id)">{{ row.name }}</span>
          </template>
          <template v-slot:isShowInTopo="{ row }">
            <span v-if="row.isShowInTopo" class="text-success">是</span>
            <span v-else class="text-grey">否</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li
                  class="tsfont-trash-o"
                  :class="row.invokeCount > 0?'disable':''"
                  :title="row.invokeCount > 0?'当前标签已被引用':''"
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    RelTypeEdit: resolve => require(['./reltype-edit.vue'], resolve)
  },
  props: {},
  data() {
    return {
      id: null,
      isDialogShow: false,
      relTypeData: { 
        theadList: [
          {
            title: '名称',
            key: 'name'
          },
          {
            title: '引用数',
            key: 'invokeCount'
          },
          {
            title: '在拓扑图中展示',
            key: 'isShowInTopo'
          },
          {
            title: '备注',
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
        content: '确认删除关系类型：' + relType.name + '？',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.ci
            .deleteRelTypeById(relType.id)
            .then(res => {
              this.$Message.success(this.$t('message.content.deletesuccess'));
              vnode.isShow = false;
              this.getRelTypeList();
            })
            .catch(error => {
              if (error.data.Message) {
                this.$Message.error(error.data.Message);
              } else {
                this.$Message.error('删除失败');
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
<style lang="less">
</style>
