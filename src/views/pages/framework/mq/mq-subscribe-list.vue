<template>
  <div>
    <div class="mb-md">
      <span class="cursor tsfont-plus" @click="editSubscribe()">{{ $t('term.framework.subscribe') }}</span>
    </div>
    <TsTable v-if="subscribeData" v-bind="subscribeData" :theadList="theadList">
      <template v-slot:handlerName="{ row }">
        <span>{{ row.handlerName }}</span>
        <span>
          <Tooltip
            v-if="!row.isEnable"
            placement="top"
            :transfer="true"
            :content="$t('term.framework.mqhandlerunavailable')"
          ><span v-if="!row.isEnable" class="text-error tsfont-warning-o"></span></Tooltip>
        </span>
      </template>
      <template slot="name" slot-scope="{ row }">
        {{ row.name }}
      </template>
      <template slot="isActive" slot-scope="{ row }">
        <span v-if="row.isActive == 1" class="text-success">{{ $t('page.yes') }}</span>
        <span v-else class="text-grey">{{ $t('page.no') }}</span>
      </template>
      <template v-slot:type="{ row }">
        <span v-if="row.isEmbed">{{ $t('term.framework.systemsubscribe') }}</span>
        <span v-else>{{ $t('term.framework.customsubscribe') }}</span>
      </template>
      <template slot="error" slot-scope="{ row }">
        <Poptip
          v-if="row.error"
          transfer
          word-wrap
          trigger="hover"
          width="300"
          :content="row.error"
        >
          <span class="text-error tsfont-warning-o" style="cursor: help"></span>
        </Poptip>
      </template>
      <template slot="action" slot-scope="{ row }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li @click.stop>
              <TsFormSwitch
                v-model="row.isActive"
                :true-value="1"
                :false-value="0"
                showStatus
                @on-change="toggleSubscribeActive(row)"
              ></TsFormSwitch>
            </li>
            <li class="tsfont-heart-s" @click.stop="healthCheck(row)">{{ $t('term.framework.statuscheck') }}</li>
            <li v-if="!row.isEmbed" class="tsfont-edit" @click.stop="editSubscribe(row)">{{ $t('page.edit') }}</li>
            <li v-if="!row.isEmbed" class="tsfont-trash-o" @click="deleteSubscribe(row)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <SubscribeEdit v-if="isEditShow" :id="currentSubscribeId" @close="close"></SubscribeEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    SubscribeEdit: () => import('./mq-subscribe-edit.vue')
  },
  props: {},
  data() {
    return {
      isEditShow: false,
      currentSubscribeId: null,
      searchParam: {},
      subscribeData: {},
      theadList: [
        {
          key: 'name',
          title: this.$t('page.uniquekey')
        },
        { key: 'topicLabel', title: this.$t('page.theme') },
        { key: 'type', title: this.$t('page.type') },
        { key: 'handlerName', title: this.$t('term.framework.mqhandler') },
        { key: 'isActive', title: this.$t('page.enable') },
        { key: 'error', title: this.$t('page.exception') },
        /*{ key: 'isDurable', title: this.$t('term.framework.isdurable') },*/
        { key: 'description', title: this.$t('page.explain') },
        { key: 'action' }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchSubscribe();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    healthCheck(row) {
      this.$api.framework.mq.healthCheck(row.id).then(res => {
        const healthcheckResultList = res.Return;
        if (healthcheckResultList && healthcheckResultList.length > 0) {
          healthcheckResultList.forEach(item => {
            if (item.level === 'normal') {
              this.$Notice.success({ title: item.message });
            } else if (item.level === 'warning') {
              this.$Notice.warning({ title: item.message });
            } else if (item.level === 'error') {
              this.$Notice.error({ title: item.message });
            }
          });
        }
      });
    },
    editSubscribe(row) {
      if (row) {
        this.currentSubscribeId = row.id;
      } else {
        this.currentSubscribeId = null;
      }
      this.isEditShow = true;
    },
    deleteSubscribe(sub) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: sub.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.mq.deleteSubscribe(sub.id).then(res => {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.searchSubscribe();
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    close(needRefresh) {
      this.isEditShow = false;
      if (needRefresh) {
        this.searchSubscribe();
      }
    },
    searchSubscribe(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.framework.mq.searchSubscribe(this.searchParam).then(res => {
        this.subscribeData = res.Return;
      });
    },
    toggleSubscribeActive(row) {
      this.$api.framework.mq.toggleSubscribeActive(row).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.searchSubscribe();
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
