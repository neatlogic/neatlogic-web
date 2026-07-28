<template>
  <WorkbenchCard
    :title="showTitle ? title : ''"
    :subtitle="subtitle"
    icon="tsfont-star"
    tone="warning"
    :loading="loading"
    :error="error"
    :empty="focusList.length === 0"
    @retry="loadData"
  >
    <template v-slot:action>
      <a :href="historyHref" class="text-action">全部消息</a>
    </template>
    <WorkbenchActionList :items="focusList" dense></WorkbenchActionList>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from './workbench-card.vue';
import WorkbenchActionList from '@/views/components/portal/components/display/WorkbenchActionList.vue';

export default {
  name: 'CommonTodayFocus',
  components: {
    WorkbenchCard,
    WorkbenchActionList
  },
  props: {
    title: { type: String, default: '今日关注' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      messageList: [],
      unreadCount: 0,
      requestSequence: 0,
      reloadTimer: null
    };
  },
  created() {
    this.loadData();
  },
  beforeDestroy() {
    this.requestSequence += 1;
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
      this.reloadTimer = null;
    }
  },
  methods: {
    scheduleLoadData() {
      this.requestSequence += 1;
      if (this.reloadTimer) {
        clearTimeout(this.reloadTimer);
      }
      this.reloadTimer = setTimeout(() => {
        this.reloadTimer = null;
        this.loadData();
      }, 200);
    },
    loadData() {
      const requestSequence = ++this.requestSequence;
      this.loading = true;
      this.error = '';
      this.$api.common.getMessageList({ pageSize: this.limit }).then(res => {
        if (requestSequence !== this.requestSequence) {
          return;
        }
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '今日关注加载失败');
        }
        const result = res.Return || {};
        this.messageList = Array.isArray(result.tbodyList) ? result.tbodyList : [];
        this.unreadCount = Number(result.unreadCount) || 0;
      }).catch(error => {
        if (requestSequence !== this.requestSequence) {
          return;
        }
        this.messageList = [];
        this.unreadCount = 0;
        this.error = (error && (error.Message || error.message)) || '今日关注加载失败';
      }).finally(() => {
        if (requestSequence === this.requestSequence) {
          this.loading = false;
        }
      });
    },
    getPlainText(value) {
      return String(value || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    },
    getTone(message) {
      const text = `${this.getPlainText(message.title)} ${this.getPlainText(message.content)}`;
      if (/失败|异常|超时|风险|紧急/i.test(text)) {
        return 'danger';
      }
      if (/提醒|审批|待处理|即将/i.test(text)) {
        return 'warning';
      }
      return 'info';
    },
    getTime(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '';
      }
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return isToday
        ? `${hour}:${minute}`
        : `${date.getMonth() + 1}-${date.getDate()}`;
    }
  },
  computed: {
    limit() {
      const limit = Number(this.config.limit);
      return Math.max(3, Math.min(8, Number.isFinite(limit) ? limit : 4));
    },
    subtitle() {
      return this.unreadCount > 0 ? `${this.unreadCount} 条未读消息需要关注` : '未读提醒与跨模块动态';
    },
    historyHref() {
      return `${HOME}/framework.html#/history-overview?activeTab=HistoryMessage`;
    },
    focusList() {
      return this.messageList.slice(0, this.limit).map(message => {
        const tone = this.getTone(message);
        return {
          id: message.id,
          title: this.getPlainText(message.title) || '待关注消息',
          description: this.getPlainText(message.content),
          status: this.getTime(message.fcd),
          icon: tone === 'danger' ? 'tsfont-warning-o' : 'tsfont-message-o',
          tone,
          href: this.historyHref
        };
      });
    }
  },
  watch: {
    limit() {
      this.scheduleLoadData();
    }
  }
};
</script>
