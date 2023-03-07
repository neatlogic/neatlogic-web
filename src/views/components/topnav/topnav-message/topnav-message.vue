<template>
  <div class="topnav-message">
    <div class="bell-container">
      <i class="tsfont-bell message-bell" @click="isDrawerShow = !isDrawerShow"></i>
      <sup v-if="messageCount || noticeCount" class="badge text-danger"></sup>
    </div>
    <Drawer
      v-model="isDrawerShow"
      v-click-outside:false="handleClickOutside"
      transfer
      width="350"
      :closable="false"
      :mask="false"
      className="message-drawer"
    >
      <Tabs ref="tabs" v-model="activeTab">
        <TabPane name="message" :label="h=>renderLabel(h, '通知', messageCount)">
          <Message :messageCount.sync="messageCount" :isDrawerShow.sync="isDrawerShow" />
        </TabPane>
        <TabPane name="notice" :label="h=>renderLabel(h, '系统公告', noticeCount)">
          <Notice :noticeCount.sync="noticeCount" />
        </TabPane>
      </Tabs>
    </Drawer>
  </div>
</template>

<script>
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
export default {
  name: 'TopnavMessage',
  directives: { ClickOutside },
  components: {
    Message: resolve => require(['./message'], resolve),
    Notice: resolve => require(['./notice'], resolve)
  },
  data() {
    return {
      isDrawerShow: false,
      activeTab: 'message',
      messageCount: 0,
      noticeCount: 0
    };
  },
  methods: {
    handleClickOutside(event) {
      if (this.isDrawerShow === false) return;
      const path = event.path || (event.composedPath && event.composedPath()) || [];
      const pathClassList = path.reduce((pathClassList, elem) => {
        elem.classList && pathClassList.push(...elem.classList);
        return pathClassList;
      }, []);
      // 若事件冒泡所经元素的类名包含以下列表其中之一，那么消息中心抽屉不关闭
      const preventCloseClassList = [
        'carosel-img',
        'message-bell', 
        'message-title-tooltip',
        'notice-popup-dialog',
        'ivu-notice'
      ];
      for (let className of preventCloseClassList) {
        if (pathClassList.includes(className)) {
          return;
        }
      }
      this.isDrawerShow = false;
    },
    renderLabel(h, label, count = 0) {
      return h('div', [
        h('span', {class: 'label'}, label),
        count ? h('span', {class: 'count bg-danger'}, count) : null
      ]);
    }
  },
  watch: {
    isDrawerShow(visible) {
      if (visible) {
        if (this.messageCount && !this.noticeCount) {
          this.activeTab = 'message';
        } else if (!this.messageCount && this.noticeCount) {
          this.activeTab = 'notice';
        }
      }
    },
    messageCount() {
      this.$refs.tabs.updateBar();
    },
    noticeCount() {
      this.$refs.tabs.updateBar();
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~assets/css/variable.less';
.topnav-message {
  .bell-container {
    position: relative;
    cursor: pointer;
  }
  .badge {
    position: absolute;
    right: 4px;
    top: 1px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
}
</style>

<style lang="less">
@import (reference) '~assets/css/variable.less';
.message-drawer {
  .label {
    vertical-align: unset;
  }
  .count {
    display: inline-block;
    padding: 6px;
    height: 18px;
    line-height: 6px;
    text-align: center;
    border-radius: 9px;
    margin-left: 5px;
    color: #fff;
  }
  .ivu-drawer {
    height: calc(100vh - @top-height);
    margin-top: @top-height;
    &.move-right-enter-active {
      animation-duration: 0.2s;
    }
    &.move-right-leave-active {
      animation-duration: 0.15s;
    }
    &-body {
      padding: 0;
    }
  }
  .ivu-tabs-bar {
    margin-bottom: 0;
  }
  .ivu-tabs-nav-scroll {
    display: flex;
    justify-content: center;
  }
}
</style>
