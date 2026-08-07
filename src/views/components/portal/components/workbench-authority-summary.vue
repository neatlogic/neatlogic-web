<template>
  <div class="workbench-authority-summary">
    <template v-if="summaryList.length">
      <span
        v-for="(item, index) in visibleList"
        :key="getItemKey(item, index)"
        class="authority-item"
      >
        <UserCard v-bind="convertData(item)"></UserCard>
      </span>
      <Poptip
        v-if="remainingCount > 0"
        transfer
        trigger="hover"
        placement="bottom-start"
      >
        <span
          :title="$tc('term.workbench.remainingapplicableusers', remainingCount, { count: remainingCount })"
          class="authority-more tsfont-option-horizontal text-tip-active"
        ></span>
        <div slot="content" class="authority-popover">
          <div
            v-for="(item, index) in summaryList"
            :key="getItemKey(item, index)"
            class="authority-popover__item"
          >
            <UserCard v-bind="convertData(item)"></UserCard>
          </div>
        </div>
      </Poptip>
    </template>
    <span v-else class="text-grey">-</span>
  </div>
</template>

<script>
export default {
  name: 'WorkbenchAuthoritySummary',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  props: {
    dataList: {
      type: Array,
      default: () => []
    },
    displayLimit: {
      type: Number,
      default: 2
    }
  },
  methods: {
    convertData(data) {
      if (typeof data === 'string' && data.includes('#')) {
        const [initType, uuid] = data.split('#');
        return { initType, uuid };
      }
      return data || {};
    },
    isAllUser(data) {
      const authority = this.convertData(data);
      return authority.initType === 'common' && authority.uuid === 'alluser';
    },
    getItemKey(item, index) {
      const authority = this.convertData(item);
      return `${authority.initType || authority.type || 'authority'}-${authority.uuid || authority.id || index}`;
    }
  },
  computed: {
    summaryList() {
      const list = Array.isArray(this.dataList) ? this.dataList : [];
      const allUser = list.find(this.isAllUser);
      return allUser ? [allUser] : list;
    },
    visibleList() {
      return this.summaryList.slice(0, Math.max(1, this.displayLimit));
    },
    remainingCount() {
      return Math.max(0, this.summaryList.length - this.visibleList.length);
    }
  }
};
</script>

<style lang="less" scoped>
.workbench-authority-summary {
  min-width: 0;
  max-width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.authority-item {
  flex: 0 1 96px;
  min-width: 0;
  max-width: 96px;
  overflow: hidden;

  ::v-deep .usercard-container {
    max-width: 100%;
  }
}

.authority-more {
  flex: 0 0 auto;
  min-width: 24px;
  height: 22px;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  cursor: pointer;
  font-size: 14px;
}

.authority-popover {
  max-height: 280px;
  min-width: 180px;
  overflow: auto;
}

.authority-popover__item {
  padding: 5px 2px;
}
</style>
