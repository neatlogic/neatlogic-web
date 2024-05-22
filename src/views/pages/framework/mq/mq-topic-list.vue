<template>
  <div>
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
            <li @click="editTopic(row)">{{ $t('page.edit') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <MqTopicEdit v-if="isShowEdit" :topic="currentTopic" @close="closeTopicEdit"></MqTopicEdit>
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
      currentTopic: null,
      topicData: {
        theadList: [
          { key: 'name', title: this.$t('page.uniquekey') },
          { key: 'label', title: this.$t('page.name') },
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
      this.currentTopic = topic;
    },
    closeTopicEdit(needRefresh) {
      this.isShowEdit = false;
      this.currentTopic = null;
      if (needRefresh) {
        this.listTopic();
      }
    },
    toggleTopicActive(topic) {
      this.$api.framework.mq.toggleTopicActive(topic).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    listTopic() {
      this.$api.framework.mq.listTopic().then(res => {
        this.$set(this.topicData, 'tbodyList', res.Return);
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
