<template>
  <div class="menu_link">
    <ul>
      <li class="link">
        <a class="tsfont-plus text-primary" @click="openPortfolioToolsDialog">
          <span class="text-primary">{{ $t('page.new') }}</span>
        </a>
      </li>
    </ul>
    <PortfolioToolsDialog v-if="isShowPortfolioToolsDialog" @close="closePortfolioToolsDialog"></PortfolioToolsDialog>
  </div>
</template>

<script>
export default {
  name: 'AutoexecMenu',
  components: {
    PortfolioToolsDialog: () => import('../manage/tool/portfolio-tools-dialog') // 创建作业(选择组合工具入口）
  },
  data() {
    return {
      isShowPortfolioToolsDialog: false
    };
  },
  beforecreated() {},
  created() {},
  beforeMount() {},
  mounted() {},
  methods: {
    openPortfolioToolsDialog() {
      this.isShowPortfolioToolsDialog = true;
    },
    closePortfolioToolsDialog() {
      this.isShowPortfolioToolsDialog = false;
    }
  }
};
</script>
