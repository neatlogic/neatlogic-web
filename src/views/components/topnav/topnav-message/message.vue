<template>
  <Scroll class="message-scroller" v-bind="scrollConfig">

    <div v-show="!msgDetail">
      <div v-if="!hasSubscription" class="no-subscription">
        <NoData text="未订阅任何消息" />
        <div class="mt-10"><a :href="HOME + '/framework.html#/subscription-setting'" target="_blank">订阅设置</a></div>
      </div>

      <div v-else-if="messageList.length === 0" class="no-message">
        <NoData text="暂无消息" />
        <div class="mt-10"><a :href="HOME + '/framework.html#/history-overview?activeTab=HistoryMessage'" target="_blank">查看历史消息</a></div>
      </div>

      <section v-for="(messages, daysAgo) in messagesOfDaysAgo" :key="daysAgo" class="message-group">
        <header v-if="messages.length > 0" class="text-title flex-between border-color days-ago">
          <span> {{ daysAgo === '0' ? '今天' : daysAgo === '1' ? '昨天' : `${daysAgo}天前` }} </span>
          <i class="tsfont-close text-action" title="批量标记为已读" @click="readMessage({daysAgo})"></i>
        </header>
        <ol class="message-list">
          <li
            v-for="message in messages"
            :id="message.id"
            :key="message.id"
            class="message border-color"
            :class="{'expand': message.expand}"
          >
            <header class="message-header">
              <Tooltip
                transfer
                transfer-class-name="message-title-tooltip"
                theme="light"
                :disabled="message.expand"
                :delay="500"
                :max-width="300"
              >
                <div slot="content" v-html="message.title"></div>
                <div class="title" :class="{'overflow': !message.expand}" v-html="message.title"></div>
              </Tooltip>
              <time class="time text-title">{{ message.fcd | formatDate }}</time>
              <i class="read text-action tsfont-close" title="标记为已读" @click="readMessage({messageId: message.id})"></i>
            </header>
            <article v-imgViewer class="text-title content" :class="{'line-2': !message.expand}">
              <div style="verticalAlign: unset" v-html="message.content"></div>
            </article>
            <footer v-if="message.isOverflow" class="text-primary toggle-expand bg-block" @click="$set(message, 'expand', !message.expand)">
              {{ message.expand ? '收起' : '查看详情' }}
            </footer>
          </li>
        </ol>
      </section>
      <Divider v-if="isAllLoaded && messageList.length > 0" size="small" :style="{'margin': '20px 0'}">已经到底了</Divider>
    </div>

    <div v-if="msgDetail" class="message-list">
      <div class="message-tag ivu-tag ivu-tag-size-default ivu-tag-default ivu-tag-closable ivu-tag-checked">
        <div class="ivu-tag-text" v-html="msgDetail.title"></div> 
        <i class="ivu-icon ivu-icon-ios-close" @click="closeMsgDetail(false)"></i>
      </div>

      <div class="message border-color expand">
        <header class="message-header">
          <div class="title" v-html="msgDetail.title"></div>
          <time class="time text-title">{{ msgDetail.fcd | formatDate }}</time>
          <i class="read text-action tsfont-close" title="标记为已读" @click="closeMsgDetail(true)"></i>
        </header>
        <article v-imgViewer class="text-title content" v-html="msgDetail.content"></article>
      </div>

    </div>

    <footer class="bottom-bar dividing-color flex-between">
      <a class="text-action" :href="HOME + '/framework.html#/history-overview?activeTab=HistoryMessage'" target="_blank">历史消息</a>
      <span class="text-action dividing-bg-color read-all" :class="{'hidden': messageList.length===0}" @click="readMessage(null)">全部标为已读</span>
      <a
        class="tsfont-setting text-action"
        title="订阅设置"
        :href="HOME + '/framework.html#/subscription-setting'"
        target="_blank"
      ></a>
    </footer>
  </Scroll>
</template>

<script>
import debounce from 'lodash/debounce';
import imgViewer from '@/resources/directives/img-viewer.js';

export default {
  name: 'Message',
  directives: { imgViewer },
  props: {
    isDrawerShow: Boolean,
    messageCount: Number
  },
  data() {
    this.HOME = HOME;
    this.todayTimestamp = new Date().setHours(24, 0, 0, 0);
    this.shortShowTime = 5 * 1000;
    this.pullInterval = 30 * 1000;
    return {
      msgDetail: null,
      popupMsg: {},
      popupCount: 0,
      timer: null,
      messageList: [],
      pageSize: 12,
      isAllLoaded: false,
      hasSubscription: 1,
      scrollConfig: {
        height: null,
        onReachTop: () => this.pullNewMessages(),
        onReachBottom: () => this.getOldMessages(),
        distanceToEdge: [0, -100]
      }
    };
  },
  async mounted() {
    this.getScrollHeight();
    await this.initNotice();
    this.getMessageCount(); 
  },
  methods: {
    getScrollHeight() {
      this.scrollConfig.height = Number.parseInt(window.getComputedStyle(this.$el).height) - 40;
      window.addEventListener('resize', debounce(() => {
        this.scrollConfig.height = Number.parseInt(window.getComputedStyle(this.$el).height) - 40;
      }, 300));
    },

    async initNotice() {
      this.$Notice.config({top: '100'});
      this.$Notice.info({
        duration: 0,
        title: ' ',
        render: h => h('div', {class: 'popup-msg-content line-3', domProps: {innerHTML: null}})
      });
      await this.$nextTick();
      this.noticeElem = document.querySelector('.ivu-notice');
      this.contentElem = document.querySelector('.popup-msg-content');
      this.containerElem = this.contentElem.parentElement.parentElement;
      this.containerElem.classList.add('popup-msg-container', 'no-msgs');
      this.containerElem.title = '打开消息中心查看详情';
      this.containerElem.addEventListener('click', () => {
        this.msgDetail = {...this.popupMsg};
        this.$emit('update:isDrawerShow', true);
      });
      
      this.titleElem = this.containerElem.querySelector('.ivu-notice-title'); 

      const closeAllElem = document.createElement('i');
      closeAllElem.classList.add('tsfont-close', 'text-action', 'close-all');
      closeAllElem.title = '关闭全部';
      closeAllElem.addEventListener('click', event => {
        event.stopPropagation();
        this.closePopupMsg({maxMessageId: this.popupMsg.id});
      });
      this.containerElem.appendChild(closeAllElem);

      const oldCloseElem = this.containerElem.querySelector('.ivu-notice-notice-close'); 
      this.closeElem = oldCloseElem.cloneNode(true);
      this.closeElem.title = '标记为已读';
      this.closeElem.addEventListener('click', event => {
        event.stopPropagation();
        this.closePopupMsg({messageId: this.popupMsg.id});
      });
      this.containerElem.replaceChild(this.closeElem, oldCloseElem);

      this.closingElem = oldCloseElem.cloneNode(false);
      this.closingElem.title = this.$t('page.loadingtip');
      this.closingElem.innerHTML = '<i class="loading ivu-icon ivu-icon-ios-loading popup-msg-closing"></i>';
    },

    async getMessageCount() {
      clearTimeout(this.timer);
      const res = await this.$api.common.getMessageCount();
      const {unreadCount = 0, shortShowCount = 0, longShowCount = 0, message: popupMsg} = res?.Return || {};
      this.$emit('update:messageCount', unreadCount);
      this.popupCount = shortShowCount + longShowCount;
      this.popupMsg = popupMsg;
      if (!popupMsg || popupMsg.popUp === 'longshow') {
        this.timer = setTimeout(() => this.getMessageCount(), this.pullInterval);
      } else if (popupMsg.popUp === 'shortshow') {
        this.timer = setTimeout(() => this.getMessageCount(), this.shortShowTime);
      }
    },

    async pullNewMessages() {
      clearTimeout(this.timer);
      const params = {
        pageSize: this.pageSize,
        minMessageId: this.maxMessageId
      };
      const res = await this.$api.common.getMessageList(params);
      const { tbodyList = [], pageCount, hasSubscription, unreadCount } = res.Return;
      this.$emit('update:messageCount', unreadCount);
      this.hasSubscription = hasSubscription;
      this.messageList = [...tbodyList, ...this.messageList];
      if (pageCount > 1) {
        this.pullNewMessages();
      } else {
        this.timer = setTimeout(() => this.pullNewMessages(), this.pullInterval);
      }
      this.checkOverflow();
    },

    async getOldMessages() {
      const params = {
        pageSize: this.pageSize,
        maxMessageId: this.minMessageId
      };
      const res = await this.$api.common.getMessageList(params);
      const { tbodyList = [], pageCount, hasSubscription } = res.Return;
      this.hasSubscription = hasSubscription;
      this.messageList = [...this.messageList, ...tbodyList];
      if (pageCount === 1) {
        this.isAllLoaded = true;
        this.scrollConfig.onReachBottom = null;
      }
      this.checkOverflow();
    },

    async readMessage(param) {
      const res = await this.$api.common.readMessage(param);
      this.$emit('update:messageCount', res.Return.unreadCount);
      this.$store.commit('setMessageRead', {param});
      if (param === null) { // 清除所有消息
        this.messageList = [];
      } else if (param.hasOwnProperty('daysAgo')) { // 清除某一天的消息
        const msgIdListToRemove = this.messagesOfDaysAgo[param.daysAgo].map(msg => msg.id);
        this.messageList = this.messageList.filter(msg => !msgIdListToRemove.includes(msg.id));
      } else if (param.hasOwnProperty('messageIdList')) { // 清除一些消息
        this.messageList = this.messageList.filter(msg => !param.messageIdList.includes(msg.id));
      } else if (param.hasOwnProperty('messageId')) { // 清除某条消息
        this.messageList = this.messageList.filter(msg => msg.id !== param.messageId);
      }
    },

    async closeMsgDetail(setRead = false) {
      setRead && await this.readMessage({messageId: this.msgDetail.id});
      this.msgDetail = null;
      this.scrollConfig.onReachTop = () => this.pullNewMessages();
      this.scrollConfig.onReachBottom = () => this.getOldMessages();
      this.pullNewMessages();
    },

    async closePopupMsg(param) {
      this.containerElem.replaceChild(this.closingElem, this.closeElem);
      await this.$api.common.closePopupMsg(param);
      await this.getMessageCount();
      this.containerElem.replaceChild(this.closeElem, this.closingElem);
      this.$store.commit('setMessageRead', {param});
    },

    async checkOverflow() {
      await this.$nextTick();
      const elems = this.$el.querySelectorAll('.content');
      elems.forEach(elem => {
        if (elem.scrollHeight > elem.clientHeight) {
          const message = this.messageList.find(msg => msg.id == elem.parentElement.id);
          message && this.$set(message, 'isOverflow', true);
        }
      });
    }
  },
  computed: {
    messagesOfDaysAgo() {
      const messagesOfDaysAgo = {};
      const msPerDay = 1000 * 60 * 60 * 24;
      for (let message of this.messageList) {
        const daysAgo = Math.floor((this.todayTimestamp - message.fcd) / msPerDay);
        if (!messagesOfDaysAgo.hasOwnProperty(daysAgo)) {
          messagesOfDaysAgo[daysAgo] = [];
        }
        messagesOfDaysAgo[daysAgo].push(message);
      }
      return messagesOfDaysAgo;
    },
    maxMessageId() {
      if (this.messageList.length === 0) return null;
      return this.messageList[0].id;
    },
    minMessageId() {
      if (this.messageList.length === 0) return null;
      return this.messageList[this.messageList.length - 1].id;
    }
  },
  watch: {
    popupMsg(newMsg) {
      this.titleElem.innerHTML = newMsg && newMsg.title;
      this.contentElem.innerHTML = newMsg && newMsg.content;
      const classList = this.containerElem.classList;
      classList.remove('no-msgs', 'two-msgs', 'more-msgs');
      switch (this.popupCount) {
        case 0: 
          classList.add('no-msgs');
          break;
        case 1: break;
        case 2: 
          classList.add('two-msgs');
          break;
        default: 
          classList.add('more-msgs');
      }
    },
    isDrawerShow(isDrawerShow) {
      if (isDrawerShow) {
        this.noticeElem.style.transition = 'transform 0.2s';
        this.noticeElem.style.transform = 'translateX(-330px)';
        this.popupMsg = {};
        this.popupCount = 0;
        if (this.msgDetail) {
          clearTimeout(this.timer);
          this.scrollConfig.onReachTop = null;
          this.scrollConfig.onReachBottom = null;
          this.messageList = [];
        } else {
          this.isAllLoaded = false;
          this.scrollConfig.onReachBottom = () => this.getOldMessages();
          this.pullNewMessages();
        }
      } else { 
        this.noticeElem.style.transition = 'transform 0.15s';
        this.noticeElem.style.transform = null;
        this.msgDetail = null;
        this.messageList = [];
        this.getMessageCount(); 
      }
    }
  }
};
</script>

<style lang="less">
@import (reference) '~@/resources/assets/css/common.less';
.message-scroller {
  height: calc(100vh - 56px - 36px);
  .message-group:first-of-type {
    .days-ago {
      padding-top: 0;
    }
  }
  .days-ago {
    padding: 10px 16px;
    border-bottom: 1px solid;
    font-size: 16px;
    .divider {
      display: inline-block;
      width: 75%;
      height: 0;
      border-bottom: 1px solid;
    }
  }
  .message-list {
    padding: 0 0 0 16px;
  }
  .message-tag {
    display: inline-flex;
    max-width: 310px;
    .ivu-tag-text {
      display: block;
      .overflow();
    }
  }
  .message {
    border-bottom: 1px solid;
    padding: 10px 16px 10px 0;
    div, span, ul, li, i, p {
      vertical-align: unset;
    }
    .message-header {
      position: relative;
      .read {
        position: absolute;
        top: 0;
        right: 0;
        display: none;
      }
      &:hover {
        .read {
          display: unset;
        }
      }
    }
    .title {
      max-width: 350px - 32px - 30px;
      max-height: 1.5em;
    }
    .time {
      display: block;
      font-size: 13px;
      margin-top: 3px;
    }
    .content {
      margin-top: 8px;
      max-height: 2 * 1.5em;
      .image {
        width: 100%;
        &::before {
          font-family: "tsfont" !important;
          content: "\e8c0";
        }
        img {
          max-width: 100%;
          display: none;
        }
      }
    }
    .toggle-expand {
      padding-top: 5px;
      cursor: pointer;
    }
    &.expand {
      .title {
        max-height: unset;
      }
      .content {
        max-height: unset;
        .image {
          &::before {
            display: none;
          }
          img {
            display: unset !important;
          }
          figcaption {
            text-align: center;
          }
        }
      }
      .toggle-expand {
        position: sticky;
        bottom: 0;
      }
    }
  }
  .no-subscription,
  .no-message {
    text-align: center;
    .mt-10 {
      margin-top: 10px;
    }
  }
  .bottom-bar {
    width: 100%;
    height: 40px;
    position: absolute;
    bottom: 0;
    right: 0;
    border-top: 1px solid;
    padding: 0 16px;
    .read-all {
      display: inline-block;
      padding: 3px 10px;
      text-align: center;
      border-radius: 2px;
      &.hidden {
        visibility: hidden;
      }
    }
  }
}
</style>

<style lang="less">
.popup-msg-content {
  line-height: 1.5;
  .image {
    width: 100%;
    img {
      max-width: 100%;
    }
  }
}
.popup-msg-container {
  position: relative;
  overflow: visible;
  margin-bottom: 60px;
  cursor: pointer;
  .close-all {
    position: absolute;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%);
    display: none;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 18px;
    &::before {
      margin-right: 0 !important;
    }
  }
  &.no-msgs {
    display: none;
  }
  &.two-msgs, &.more-msgs {
    margin-bottom: 68px;
    .close-all {
      display: flex;
      bottom: -58px;
    }
    &::before {
      content: '';
      position: absolute;
      z-index: -1;
      bottom: -8px;
      right: 0;
      display: block;
      width: 100%;
      height: 12px;
      border-radius: 0 0 4px 4px;
    }
  }
  &.more-msgs {
    margin-bottom: 76px;
    .close-all {
      display: flex;
      bottom: -66px;
    }
    &::after {
      content: '';
      position: absolute;
      z-index: -2;
      bottom: -16px;
      right: 0;
      display: block;
      width: 100%;
      height: 12px;
      border-radius: 0 0 4px 4px;
    }
  }
}
.popup-msg-closing {
  font-size: 15px !important;
}

.theme-default {
  .message-scroller {
    .message {
      .title {
        color: #000!important;
      }
    }
  }
}
</style>
