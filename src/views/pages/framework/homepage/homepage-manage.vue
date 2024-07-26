<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="add()">{{ $t('page.config') }}</span>
      </template>
      <template v-slot:topRight>
        <InputSearcher v-model="keyWord" @change="changeCurrent(1)"></InputSearcher>
      </template>
      <template v-slot:content>
        <TsTable
          v-bind="tableConfig"
          :theadList="theadList"
          canDrag
          keyName="id"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
          @updateRowSort="handleDragUpdate"
        >
          <template v-slot:name="{ row }">
            <span class="text-action" @click="editRow(row)">{{ row.name }}</span>
          </template>
          <!-- <template v-slot:authorityList="{ row }">
            <GroupList :dataList="row.authorityList" type="usercard"></GroupList>
          </template> -->
          <template v-slot:isActive="{ row }">
            <div>{{ row.isActive == 1 ? $t('page.enable') : $t('page.disable') }}</div>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li @click.stop>
                  <TsFormSwitch
                    v-model="row.isActive"
                    :trueValue="1"
                    :falseValue="0"
                    :showStatus="true"
                    @on-change="activeData(row)"
                  ></TsFormSwitch>
                </li>
                <li class="tsfont-edit" @click="editRow(row)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o" @click="delRow(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <EditHomepageDialog v-if="isShowEditDialog" :id="currentId" @close="closeDialog"></EditHomepageDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    // GroupList: () => import('@/resources/components/GroupList/GroupList.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    EditHomepageDialog: () => import('./edit-homepage-dialog.vue')
  },
  props: {},
  data() {
    return {
      keyWord: '',
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        // {
        //   title: this.$t('page.user'),
        //   key: 'authorityList',
        //   type: 'usercards'
        // },
        {
          title: this.$t('page.status'),
          key: 'isActive'
        },
        {
          key: 'action'
        }
      ],
      tableConfig: {
        thbodList: []
      },
      isShowEditDialog: false,
      currentId: null
    };
  },
  beforeCreate() {},
  created() {
    this.changeCurrent(1);
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
    add() {
      this.currentId = null;
      this.isShowEditDialog = true;
    },
    changeCurrent(currentPage) {
      this.currentPage = currentPage || 1;
      const params = {
        keyword: this.keyWord,
        pageSize: this.pageSize,
        currentPage: this.currentPage
      };
      this.$api.framework.homepage.getHomepageList(params).then(res => {
        if (res.Status == 'OK') {
          this.tableConfig = res.Return;
        }
      });
    },
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.search(1);
    },
    handleDragUpdate({ oldIndex, newIndex }) {
      const params = {
        uuid: this.oldList[oldIndex].id, //被拖拽的id
        sort: this.oldList[newIndex].sort //被挤走的sort
      };
      this.$api.framework.homepage.moveHomepage(params).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.changeCurrent(1);
        } else throw res;
      });
    },
    editRow(row) {
      this.currentId = row.id;
      this.isShowEditDialog = true;
    },
    delRow(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: row.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.homepage.deleteHomepage({ id: row.id }).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.changeCurrent(1);
              vnode.isShow = false;
            }
          });
        }
      });
    },
    closeDialog(data) {
      this.isShowEditDialog = false;
      if (!this.$utils.isEmpty(data)) {
        this.changeCurrent(this.currentPage);
      } 
    },
    activeData(row) {
      const params = {
        id: row.id,
        isActive: row.isActive
      };
      this.$api.framework.homepage.updateActive(params).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    }
  },
  filter: {},
  computed: {
 
  },
  watch: {}
};
</script>
<style lang="less">
</style>
