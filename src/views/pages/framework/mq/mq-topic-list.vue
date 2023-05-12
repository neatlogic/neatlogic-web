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
          </ul>
        </div>
      </template>
    </TsTable>
  </div>
</template>
<script>
export default {
  name: '',
  components: { 
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve), 
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve) 
  },
  props: {},
  data() {
    return {
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
