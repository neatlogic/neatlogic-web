<template>
  <WorkbenchCard tone="primary">
    <div class="welcome-overview">
      <div class="welcome-symbol bg-primary-grey text-primary radius-lg flex-center">
        <i :class="periodIcon"></i>
      </div>
      <div class="welcome-copy overflow">
        <div v-if="showTitle" class="welcome-label text-grey overflow">{{ title }}</div>
        <div v-if="description" class="welcome-description text-grey overflow">{{ description }}</div>
        <div class="welcome-title overflow">{{ greeting }}{{ greetingSeparator }}{{ userName }}</div>
        <div class="welcome-description text-grey overflow">{{ dateText }} · {{ rhythmText }}</div>
      </div>
      <div class="welcome-context">
        <span v-if="showTime" class="context-item">
          <i class="tsfont-time text-primary"></i>
          <span>{{ timeText }}</span>
        </span>
      </div>
      <i class="tsfont-stars welcome-decoration text-primary"></i>
    </div>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';
import { $t } from '@/resources/init.js';

export default {
  name: 'FrameworkWelcomeOverview',
  components: { WorkbenchCard },
  props: {
    title: { type: String, default: () => $t('term.workbench.welcomeoverview') },
    description: { type: String, default: '' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      now: new Date(),
      clockTimer: null
    };
  },
  mounted() {
    this.clockTimer = setInterval(() => {
      this.now = new Date();
    }, 60 * 1000);
  },
  beforeDestroy() {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
  },
  computed: {
    hour() {
      return this.now.getHours();
    },
    userName() {
      const userInfo = this.$store.state.userInfo || {};
      return userInfo.userName || userInfo.userId || this.$t('term.workbench.hello');
    },
    greeting() {
      if (this.hour < 6) {
        return this.$t('term.workbench.latenightgreeting');
      }
      if (this.hour < 11) {
        return this.$t('term.workbench.morninggreeting');
      }
      if (this.hour < 14) {
        return this.$t('term.workbench.noongreeting');
      }
      if (this.hour < 18) {
        return this.$t('term.workbench.afternoongreeting');
      }
      return this.$t('term.workbench.eveninggreeting');
    },
    rhythmText() {
      if (this.hour < 9) {
        return this.$t('term.workbench.morningprompt');
      }
      if (this.hour < 18) {
        return this.$t('term.workbench.dayprompt');
      }
      return this.$t('term.workbench.eveningprompt');
    },
    periodIcon() {
      return this.hour >= 6 && this.hour < 18 ? 'tsfont-day' : 'tsfont-night';
    },
    dateText() {
      const locale = this.$i18n.locale === 'en' ? 'en-US' : 'zh-CN';
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }).format(this.now);
    },
    greetingSeparator() {
      return this.$i18n.locale === 'en' ? ', ' : '，';
    },
    timeText() {
      const hour = String(this.now.getHours()).padStart(2, '0');
      const minute = String(this.now.getMinutes()).padStart(2, '0');
      return `${hour}:${minute}`;
    },
    showTime() {
      return this.config.showTime !== 0 && this.config.showTime !== false;
    }
  }
};
</script>

<style lang="less" scoped>
.welcome-overview {
  position: relative;
  height: 100%;
  min-height: 76px;
  display: grid;
  grid-template-columns: 52px minmax(180px, 1fr) auto;
  gap: 14px;
  align-items: center;
  overflow: hidden;
}
.welcome-symbol {
  width: 52px;
  height: 52px;
  font-size: 25px;
}
.welcome-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}
.welcome-label {
  font-size: 11px;
  line-height: 16px;
}
.welcome-title {
  margin-top: 2px;
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
}
.welcome-description {
  margin-top: 4px;
  font-size: 12px;
}
.welcome-context {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  height: 100%;
  align-items: end;
}
.context-item {
  min-height: 34px;
  padding: 0 11px;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  box-sizing: border-box;
  font-size: 12px;
  white-space: nowrap;
}
.welcome-decoration {
  position: absolute;
  right: 8px;
  top: -9px;
  font-size: 56px;
  opacity: 0.06;
  pointer-events: none;
}
@media screen and (max-width: 1200px) {
  .welcome-overview {
    grid-template-columns: 44px minmax(0, 1fr) auto;
    gap: 10px;
  }
  .welcome-symbol {
    width: 44px;
    height: 44px;
    font-size: 21px;
  }
  .welcome-title {
    font-size: 17px;
  }
  .welcome-description {
    display: none;
  }
  .context-item {
    padding: 0 8px;
  }
}
</style>
