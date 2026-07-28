<template>
  <WorkbenchCard tone="primary">
    <div class="welcome-overview">
      <div class="welcome-symbol bg-primary-grey text-primary radius-lg flex-center">
        <i :class="periodIcon"></i>
      </div>
      <div class="welcome-copy overflow">
        <div v-if="showTitle" class="welcome-label text-grey overflow">{{ title }}</div>
        <div class="welcome-title overflow">{{ greeting }}，{{ userName }}</div>
        <div class="welcome-description text-grey overflow">{{ dateText }} · {{ rhythmText }}</div>
      </div>
      <div class="welcome-context">
        <span v-if="showTime" class="context-item bg-block radius-md">
          <i class="tsfont-time text-primary"></i>
          <span>{{ timeText }}</span>
        </span>
        <span v-if="showModuleCount" class="context-item bg-block radius-md">
          <i class="tsfont-modules text-info"></i>
          <span>{{ moduleCount }} 个可用模块</span>
        </span>
      </div>
      <i class="tsfont-stars welcome-decoration text-primary"></i>
    </div>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from './workbench-card.vue';

export default {
  name: 'CommonWelcomeOverview',
  components: { WorkbenchCard },
  props: {
    title: { type: String, default: '工作概况' },
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
      return userInfo.userName || userInfo.userId || '你好';
    },
    greeting() {
      if (this.hour < 6) {
        return '夜深了';
      }
      if (this.hour < 11) {
        return '上午好';
      }
      if (this.hour < 14) {
        return '中午好';
      }
      if (this.hour < 18) {
        return '下午好';
      }
      return '晚上好';
    },
    rhythmText() {
      if (this.hour < 9) {
        return '梳理计划，从重要事项开始';
      }
      if (this.hour < 18) {
        return '聚焦重要事项，保持清晰节奏';
      }
      return '回顾今日进展，安排后续事项';
    },
    periodIcon() {
      return this.hour >= 6 && this.hour < 18 ? 'tsfont-day' : 'tsfont-night';
    },
    dateText() {
      const weekList = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return `${this.now.getFullYear()}年${this.now.getMonth() + 1}月${this.now.getDate()}日 ${weekList[this.now.getDay()]}`;
    },
    timeText() {
      const hour = String(this.now.getHours()).padStart(2, '0');
      const minute = String(this.now.getMinutes()).padStart(2, '0');
      return `${hour}:${minute}`;
    },
    moduleCount() {
      return (this.$store.state.topMenu.moduleList || []).filter(module => module.isDisabled !== 1).length;
    },
    showTime() {
      return this.config.showTime !== 0 && this.config.showTime !== false;
    },
    showModuleCount() {
      return this.config.showModuleCount !== 0 && this.config.showModuleCount !== false;
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
