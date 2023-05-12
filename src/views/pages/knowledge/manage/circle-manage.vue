<template>
  <div class="knowledge-circle-manage">
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="isDialogShow = true">{{ $t('term.knowledge.intellectualcircle') }}</span>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="searchParams.keyword"
            @change="search()"
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <TsTable
          class="table"
          :theadList="theadList"
          v-bind="tableConfig"
          @updateRowSort="handleRowSort"
          @changeCurrent="currentPage=>search({currentPage})" 
          @changePageSize="pageSize=>search({pageSize})"
        >
          <!-- 包括审批通过与未审批通过的知识数量 -->
          <template v-slot:approverVoList="{row}">
            <!-- {{ row.approverVoList.length }} ++ -->
            <span v-if="row.approverVoList.length > 0">
              <span v-for="(item,index) in slice(row.approverVoList, true)" :key="index" style="margin-right:10px">
                <UserCard v-bind="item" hideAvatar></UserCard>
              </span>
              <span v-if="row.approverVoList && row.approverVoList.length > 4" @click.stop>
                <Poptip
                  transfer
                  placement="bottom-start"
                  popper-class="workcenterpoper"
                  offset="-16"
                  style="position: relative;top: 3px;"
                >
                  <span class="tsfont-option-horizontal colorgray"></span>
                  <div slot="content">
                    <div v-for="(item, index) in slice(row.approverVoList, false)" :key="index" @click.stop>
                      <UserCard v-bind="item" hideAvatar></UserCard>
                    </div>
                  </div>
                </Poptip>
              </span>
            </span>
            <span v-else> </span>
          </template>
          <template v-slot:name="{row}">
            <span class="text-href" @click.stop="toEditPage('edit',{id:row.id})">{{ row.name }}</span>
          </template>
          <template v-slot:action="{row}">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-trash-s" :class="{'text-grey text-disabled':row.documentCount > 0}" @click="deleteCircle(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>

    <!-- 添加对话框 -->
    <TsDialog
      :isShow.sync="isDialogShow"
      :title="$t('dialog.title.addtarget',{target:$t('term.knowledge.intellectualcircle')})"
      @on-ok="addCircle"
    >
      <Tsform ref="form" :itemList="formItemConfig"></Tsform>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'CircleManage',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    Tsform: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  data() {
    return {
      isLoading: false,
      isDialogShow: false,
      searchParams: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        {title: this.$t('page.name'), key: 'name'},
        {title: this.$t('term.knowledge.approver'), key: 'approverVoList'},
        {title: this.$t('term.knowledge.member'), key: 'memberCount'},
        {title: this.$t('term.knowledge.documentcount'), 'tooltip': this.$t('term.knowledge.tooltip.documentcount')},
        {title: '', key: 'action'}
      ],
      tableConfig: {
        tbodyList: [], 
        rowNum: 0, 
        pageSize: 20, 
        currentPage: 1
      },
      formItemConfig: {
        name: {
          type: 'text',
          label: this.$t('page.name'),
          width: '100%',
          maxlength: 50,
          validateList: ['required', 'name-special', {
            name: 'searchUrl', url: 'api/rest/knowledge/circle/save'
          }]
        }
      }
    };
  },
  created() {
    this.search();
  },
  methods: {
    async search(params = {}) {
      this.isLoading = true;
      this.searchParams = {...this.searchParams, currentPage: 1, ...params};
      const res = await this.$api.knowledge.circle.search(this.searchParams);
      if (res.Status === 'OK') {
        const {circleList: tbodyList, rowNum, pageSize, currentPage} = res.Return;
        this.tableConfig = { tbodyList, rowNum, pageSize, currentPage };
        this.isLoading = false;
      }
    },
    addCircle() {
      if (!this.$refs.form.valid()) return;
      const formData = this.$refs.form.getFormValue();
      this.toEditPage('add', formData);
    },
    deleteCircle(row) {
      if (row.documentCount > 0) return;
      const {id, name} = row;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': async vnode => {
          if (!vnode.isShow) {
            return;
          }
          const params = { id };
          const res = await this.$api.knowledge.circle.delete(params);
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.deletesuccess'));
            this.$store.commit('leftMenu/isKnowledgeCircleUpdated', true);
            vnode.isShow = false;
            this.search();
          }
        }
      });
    },
    toEditPage(operation, data) {
      this.$router.push({
        name: 'circle-edit',
        query: { operation, ...data }
      });
    },
    handleRowSort(e) {
      const sort = e.newIndex;
      const draggedNode = this.tableConfig.tbodyList[sort];
    },
    slice(list, key) {
      if (list.length > 0) {
        if (key) {
          return list.slice(0, 4);
        } else {
          return list.slice(4, list.length);
        }
      }
    }
  }
};

</script>
