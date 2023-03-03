<template>
  <div>
    <div class="padding-b">
      <span class="text-action tsfont-plus" @click="editSubscribe()">订阅</span>
    </div>
    <TsTable v-if="subscribeData" v-bind="subscribeData">
      <template slot="isDurable" slot-scope="{ row }">
        <span v-if="row.isDurable == 1">持久订阅</span>
        <span v-else>临时订阅</span>
      </template>
      <template slot="name" slot-scope="{ row }">
        <span class="text-href" @click.stop="editSubscribe(row)">{{ row.name }}</span>
      </template>
      <template slot="isActive" slot-scope="{ row }">
        <span v-if="row.isActive == 1" class="text-success">是</span>
        <span v-else class="text-grey">否</span>
      </template>
      <template slot="error" slot-scope="{ row } ">
        <Poptip
          v-if="row.error"
          transfer
          word-wrap
          trigger="hover"
          width="300"
          :content="row.error"
        >
          <span class="text-error tsfont-warning-o" style="cursor:help"></span>
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
            <li
              class="tsfont-trash-o"
              @click="deleteSubscribe(row)"
            >{{ $t('page.delete') }}</li>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    SubscribeEdit: resolve => require(['./mq-subscribe-edit.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isEditShow: false,
      currentSubscribeId: null,
      searchParam: {},
      subscribeData: {},
      theadList: [
        { key: 'name', title: '唯一标识' },
        { key: 'topicName', title: '主题' },
        { key: 'isActive', title: '是否激活' },
        { key: 'error', title: '异常'},
        { key: 'isDurable', title: '订阅方式' },
        { key: 'description', title: '说明' },
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
        title: '警告',
        content: '确定删除订阅：' + sub.name + '？',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.mq
            .deleteSubscribe(sub.id)
            .then(res => {
              this.$Message.success(this.$t('message.content.deletesuccess'));
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
        this.subscribeData.theadList = this.theadList;
      });
    },
    toggleSubscribeActive(row) {
      this.$api.framework.mq.toggleSubscribeActive(row).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.executesuccess'));
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
