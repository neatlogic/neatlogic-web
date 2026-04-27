<template>
  <div v-if="knowledgeTypeMenu" class="knowledge-menu menu_link">
    <template v-if="knowledgeTypeMenu.length > 0">
      <div class="title text-grey">{{ $t('router.knowledge.knowledgetypemanage') }}</div>
      <ul>
        <li
          v-for="menu in knowledgeTypeMenu"
          :key="menu.value"
          class="link"
          :class="{ active: $isMenuActive('/knowledge-overview-' + menu.value) }"
          @click="goTo('/knowledge-overview-' + menu.value)"
        >
          <a class="overflow tsfont-dictionary menu-box">
            <span>{{ menu.text }}</span>
            <span
              v-if="menu.count"
              class="menu-amount"
              :class="menu.value == 'waitingforreview' ? 'bg-error text-white' : ''"
            >{{ menu.count }}</span>
          </a>
        </li>
      </ul>
    </template>
  </div>
  <Loading v-else loadingShow></Loading>
</template>

<script>
import LeftMenuMixin from '@/views/components/leftmenu/leftmenu-mixin';
export default {
  name: 'KnowledgeMenu',
  mixins: [LeftMenuMixin],
  data() {
    return {
      timer: null
    };
  },
  created() {
    this.getKnowledgeTypeMenu();
    this.timer = setInterval(() => {
      this.getKnowledgeTypeMenu();
    }, 1000 * 60);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    getKnowledgeTypeMenu() {
      return this.$store.dispatch('leftMenu/getKnowledgeTypeMenu');
    }
  },
  computed: {
    knowledgeTypeMenu() {
      return this.$store.state.leftMenu.knowledgeTypeMenu;
    }
  }
};
</script>
<style lang="less" scoped>
.knowledge-menu {
  .menu-box {
    position: relative;
    .menu-amount {
      position: absolute;
      top: 50%;
      right: 8px;
      font-size: 12px;
      display: inline-block;
      padding: 0px 4px;
      height: 16px;
      line-height: 16px;
      border-radius: 8px;
      margin-top: -8px;
      min-width: 22px;
      text-align: center;
    }
  }
}
</style>
