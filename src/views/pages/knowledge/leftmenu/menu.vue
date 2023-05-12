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
          <a class="overflow tsfont-dictionary">
            <span>{{ menu.text }}</span>
            <span v-if="menu.count" class="navlist-amount" :class="menu.value == 'waitingforreview' ? 'ivu-btn-error text-white' : ''">{{ menu.count }}</span>
          </a>
        </li>
      </ul>
    </template>
  </div>
  <Loading v-else loadingShow></Loading>
</template>

<script>
import LeftMenu from '@/views/components/leftmenu/leftmenu';

export default {
  name: 'KnowledgeMenu',
  extends: LeftMenu,
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
  .navlist-text {
    cursor: pointer;
    position: relative;
    display: inline-block;
    max-width: 100%;
    line-height: 36px;
    height: 36px;
    text-align: left;
    width: 100%;
    &:before {
      margin-right: 10px;
      margin-left: 2px;
    }
  }
  .link a{
    position: relative;
     .navlist-amount {
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
