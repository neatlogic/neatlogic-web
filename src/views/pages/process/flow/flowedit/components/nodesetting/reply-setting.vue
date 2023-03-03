<template>
  <div>
    <TsRow>
      <Col span="18">
        <TsFormSelect
          ref="reply"
          v-model="replyConfig.commentTemplateId"
          v-bind="replySelectConfig"
          @first="gotoAddReply"
        ></TsFormSelect>
      </Col>
      <Col span="6">
        <span class="tsfont-rotate-right reply-icon text-tip-active" title="刷新" @click="refreshReply(replyConfig.commentTemplateId) "></span>
        <span
          v-if="replyConfig.commentTemplateId"
          class="tsfont-edit reply-icon text-tip-active"
          title="编辑"
          @click="editreply(replyConfig.commentTemplateId)"
        ></span>
      </Col>
    </TsRow>
  </div>
</template>

<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  props: ['commentTemplateId'],
  data() {
    return {
      replyList: [],
      replyConfig: {
        commentTemplateId: null
      },
      replySelectConfig: {
        transfer: true,
        firstText: '回复模板',
        firstLi: true,
        dynamicUrl: 'api/rest/process/comment/system/template/search/forselect',
        rootName: 'tbodyList',
        border: 'border'
      }
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {},

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    refreshReply() {
      this.$refs.reply.initDataListByUrl();
      this.$Message.success(this.$t('message.content.executesuccess'));
    },
    editreply(val) {
      window.open(HOME + '/process.html#/reply-manage?id=' + val, '_blank');
    },
    gotoAddReply() {
      window.open(HOME + '/process.html#/reply-manage', '_blank');
    },
    getData() {
      return this.replyConfig.commentTemplateId || undefined;
    }
  },

  filter: {},

  computed: {},

  watch: {
    commentTemplateId: {
      handler(val) {
        this.replyConfig.commentTemplateId = val || null;
      },
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.reply-icon {
  padding-left: 10px;
  padding-top: 6px;
  cursor: pointer;
}
</style>
