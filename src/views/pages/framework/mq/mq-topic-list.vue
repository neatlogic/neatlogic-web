<template>
  <div>
    <div class="mb-md">
      <span class="cursor tsfont-plus" @click="editTopic()">{{ $t('page.theme') }}</span>
    </div>
    <TsTable
      v-if="topicData"
      v-bind="topicData"
      :showPager="false"
      :showSizer="false"
    >
      <template slot="isActive" slot-scope="{ row }">
        <span v-if="row.isActive == 1" class="text-success">{{ $t('page.yes') }}</span>
        <span v-else class="text-grey">{{ $t('page.no') }}</span>
      </template>
      <template v-slot:handlerName="{ row }">
        <span>{{ row.handlerName }}</span>
        <Tooltip
          v-if="row.isEmbed && !row.isEnable"
          placement="top"
          :transfer="true"
          content="消息队列组件不可用"
        >
          <span v-if="!row.isEnable" class="text-error tsfont-warning-o"></span>
        </Tooltip>
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
                @on-change="toggleTopicActive(row)"
              ></TsFormSwitch>
            </li>
            <li v-if="row.hasConfig" @click="editTopic(row)">{{ $t('page.edit') }}</li>
            <li v-if="!row.isEmbed" @click="deleteTopic(row)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <MqTopicEdit v-if="isShowEdit" :name="currentTopicName" @close="closeTopicEdit"></MqTopicEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    MqTopicEdit: () => import('@/views/pages/framework/mq/mq-topic-edit.vue')
  },
  props: {},
  data() {
    return {
      isShowEdit: false,
      currentTopicName: null,
      topicData: {
        theadList: [
          { key: 'name', title: this.$t('page.uniquekey') },
          { key: 'label', title: this.$t('page.name') },
          { key: 'handlerName', title: this.$t('term.framework.mqhandler') },
          { key: 'isActive', title: this.$t('page.enable') },
          { key: 'description', title: this.$t('page.explain') },
          { key: 'action', title: '' }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.listTopic();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editTopic(topic) {
      this.isShowEdit = true;
      if (topic) {
        this.currentTopicName = topic.name;
      } else {
        this.currentTopicName = null;
      }
    },
    closeTopicEdit(needRefresh) {
      this.isShowEdit = false;
      this.currentTopicName = null;
      if (needRefresh) {
        this.listTopic();
      }
    },
    toggleTopicActive(topic) {
      this.$api.framework.mq.toggleTopicActive(topic).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.listTopic();
        }
      });
    },
    listTopic() {
      this.$api.framework.mq.listTopic().then(res => {
        this.$set(this.topicData, 'tbodyList', res.Return);
      });
    },
    deleteTopic(topic) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.theme')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.mq.deleteTopic(topic.name).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.listTopic();
              vnode.isShow = false;
            }
          });
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
