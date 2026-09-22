import ComponentManager from '@/resources/import/component-manager.js';
import { subscribeEventRequestFailure } from './event-capability';

// 应用设置共享事件能力及组件生命周期，具体页签布局保留在各应用模板中。
export const SettingBase = {
  defaultSettingTab: 'attr',
  props: {
    appData: { type: Object }
  },
  data() {
    return { eventSettingComponent: null, capabilitySeq: 0 };
  },
  // 父容器按应用 ID 重建设置组件，因此只在创建时初始化，不监听应用数据变化。
  created() {
    this.unsubscribeEventFailure = subscribeEventRequestFailure(this.refreshEventCapability);
    this.refreshEventCapability();
  },
  beforeDestroy() {
    this.capabilitySeq++;
    this.unsubscribeEventFailure();
  },
  methods: {
    // 商业标识、组件注册与后端能力均满足时才开放；旧响应不得覆盖新应用。
    async refreshEventCapability() {
      const seq = ++this.capabilitySeq;
      const componentConfig = ComponentManager.getComponent('rdmEventSetting') || {};
      const component = componentConfig.setting || null;
      if (!this.appData || !COMMERCIAL_MODULES.includes('rdm') || !component) {
        this.eventSettingComponent = null;
        return;
      }
      try {
        const res = await this.$api.rdm.eventCapability.getCapability();
        if (seq === this.capabilitySeq) this.eventSettingComponent = res.Return && res.Return.available === true ? component : null;
      } catch (error) {
        if (seq === this.capabilitySeq) this.eventSettingComponent = null;
      }
    }
  },
  watch: {
    // 清空组件会销毁事件配置和弹窗，回退使用明确的默认页签选项。
    eventSettingComponent(value) {
      if (!value && this.currentTab === 'event') this.currentTab = this.$options.defaultSettingTab;
    }
  }
};
