<template>
  <Scroll class="notice-scroller" v-bind="scrollConfig">
    <div v-if="noticeList.length === 0" class="text-center">
      <NoData text="暂无公告" />
      <div class="mt-10"><a :href="HOME + '/framework.html#/history-overview?activeTab=HistoryNotice'" target="_blank">查看历史公告</a></div>
    </div>

    <section v-for="(notice, index) in noticeList" :key="notice.id" class="notice-wrapper">
      <div class="notice flex-between" @click="showUnreadNotices(index)">
        <div class="left">
          <div class="title-container flex-start">
            <i class="ts-bell-s"></i>
            <span class="text-title overflow title" :class="{'with-img': notice.imgList.length > 0}">{{ notice.title }}</span>
          </div>
          <div class="content line-2 ml-22">{{ notice.content }}</div>
          <div class="time text-title ml-22">{{ notice.issueTime | formatDate }}</div>
        </div>
        <div v-if="notice.imgList.length > 0" class="right">
          <img :src="notice.imgList[0]" class="img">
        </div>
      </div>
      <div class="dividing dividing-bg-color"></div>
    </section>

    <div class="bottom-bar dividing-color flex-between">
      <a class="text-action" :href="HOME + '/framework.html#/history-overview?activeTab=HistoryNotice'" target="_blank">历史公告</a>
      <span class="text-action dividing-bg-color read-all" :class="{'hidden': noticeList.length===0}" @click="readAll">全部标为已读</span>
      <a
        :href="HOME + '/framework.html#/notice-manage'"
        target="_blank"
        title="系统公告管理" 
        :style="{'visibility': hasAuth ? 'visible' : 'hidden'}"
        class="tsfont-setting text-action"
      ></a>
    </div>

    <!-- 系统公告弹窗 -->
    <Modal 
      v-model="isDialogShow"
      className="notice-popup-dialog"
      width="632px"
      :maskClosable="false"
      @on-visible-change="handleDialogVisibleChange"
    >
      <div slot="close" class="tsfont-close text-action"></div>
      <div slot="header" class="header flex-center">
        <div><img src="~assets/images/notice.png" class="notice-img" /></div>
        
        <div class="text-center">{{ noticeDetail.title }}</div>
      </div>
      <div
        slot="default"
        v-imgViewer
        class="content"
        v-html="noticeDetail.content"
      ></div>
      <div slot="footer" class="flex-center">
        <Button
          v-if="popupIdList.length > 0 && popupIndex !== 0"
          :style="{'margin-right': '10px'}"
          @click="getNotice(popupIdList[--popupIndex])"
        >上一条</Button>
        <Button
          v-if="popupIndex+1 < popupIdList.length"
          type="primary"
          @click="read(popupIdList[popupIndex]), getNotice(popupIdList[++popupIndex])"
        >下一条</Button>
        <Button v-else type="primary" @click="isDialogShow = false">我知道了</Button>
      </div>
    </Modal>

  </Scroll>
</template>

<script>
import debounce from 'lodash/debounce';
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: 'Notice',
  directives: { imgViewer },
  props: {
    noticeCount: Number
  },
  data() {
    this.HOME = HOME;
    return {
      isDialogShow: false,
      pullTimer: null,
      noticeList: [],
      popupIdList: [],
      popupIndex: 0,
      pageSize: 20,
      noticeDetail: {},
      scrollConfig: {
        height: null,
        // onReachTop: () => this.pullNew(),
        onReachBottom: () => this.getOld(),
        distanceToEdge: [0, -100]
      }
    };
  },
  mounted() {
    this.pullNew();
    this.pullTimer = setTimeout(() => this.pullNew(), 60 * 1000);
    this.scrollConfig.height = Number.parseInt(window.getComputedStyle(this.$el).height) - 40;
    window.addEventListener('resize', debounce(() => {
      this.scrollConfig.height = Number.parseInt(window.getComputedStyle(this.$el).height) - 40;
    }, 300));
  },
  methods: {
    async pullNew() {
      clearTimeout(this.pullTimer);
      const params = {
        currentPage: 1,
        pageSize: (this.pageSize < this.noticeList.length) ? this.noticeList.length : this.pageSize
      };
      const res = await this.$api.common.pullNotice(params);
      const { tbodyList = [], popUpNoticeIdList = [], rowNum } = res.Return;
      this.$emit('update:noticeCount', rowNum);
      this.noticeList = tbodyList;
      this.popupIdList = popUpNoticeIdList;
      this.popupIndex = 0;
      this.pullTimer = setTimeout(() => this.pullNew(), 60 * 1000);
      if (this.popupIdList.length > 0) {
        this.getNotice(this.popupIdList[this.popupIndex]);
      }
    },
    async getOld() {
      const params = {
        direction: 'before',
        pageSize: this.pageSize,
        issueTime: this.oldestIssueTime
      };
      const res = await this.$api.common.pullNotice(params);
      const { tbodyList = [], popUpNoticeIdList = [] } = res.Return;
      this.noticeList = [...this.noticeList, ...tbodyList];
      this.popupIdList = popUpNoticeIdList;
    },
    async readAll() {
      if (this.noticeList.length === 0) return;
      const params = {idList: this.noticeList.map(a => a.id)};
      await this.$api.common.readNotice(params);
      this.popupIdList = [];
      this.noticeList = [];
      this.$emit('update:noticeCount', 0);
    },
    async read(id) {
      const params = {idList: [id]};
      await this.$api.common.readNotice(params);
      this.noticeList = this.noticeList.filter(a => a.id !== id);
      this.$emit('update:noticeCount', this.noticeCount ? this.noticeCount - 1 : 0);
    },
    async getNotice(id) {
      this.isDialogShow = true;
      const res = await this.$api.common.getNotice(id);
      this.noticeDetail = res.Return;
    },
    showUnreadNotices(index) {
      this.isDialogShow = true;
      this.popupIdList = this.noticeList.map(a => a.id);
      this.popupIndex = index;
      this.getNotice(this.popupIdList[index]);
    },
    handleDialogVisibleChange(visible) {
      if (visible) {
        document.querySelector('.home').classList.add('blur-bg');
      } else {
        document.querySelector('.home').classList.remove('blur-bg');
        this.read(this.noticeDetail.id);
      }
    }
  },
  computed: {
    oldestIssueTime() {
      if (this.noticeList.length === 0) return null;
      return this.noticeList[this.noticeList.length - 1].issueTime;
    },
    hasAuth() {
      return this.$store.getters.userAuthList.includes('SYSTEM_NOTICE_MODIFY');
    }
  }
};
</script>

<style lang="less">
.notice-scroller {
  height: calc(100vh - 56px - 36px);
  .ivu-scroll-container {
    padding: 0 0 0 16px;
  }
  .notice-wrapper {
    .notice {
      cursor: pointer;
      margin-top: 10px;
    }
    .title {
      max-width: 300px;
      &.with-img {
        max-width: 220px;
      }
    }
    .ts-bell-s {
      margin: 0 6px 0 2px;
    }
    .content {
      margin: 4px 0;
    }
    .ml-22 {
      margin-left: 22px;
    }
    .mt-10 {
      margin-top: 10px;
    }
    .right {
      max-height: 68px;
      min-width: 48px;
      width: 48px;
      overflow: hidden;
      margin: 0 16px;
    }
    .img {
      width: 100%;
    }
    .dividing{
      width: 100%;
      height: 1px;
      margin: 10px 0 0 0;
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
.notice-popup-dialog {
  .header {
    flex-direction: column;
    margin-bottom: 10px;
  }
  .content {
    img {
      width: 100%;
    }
    figcaption {
      text-align: center;
      margin-bottom: 15px;
    }
  }
  .ivu-modal {
    &-header, &-footer {
      border: none;
    }
    &-body {
      max-height: 70vh;
      overflow: auto;
    }
    &-header, &-footer, &-body {
      background-color: transparent !important;
    }
  }
  .notice-img{
    animation: rocking 2s ;
  }
}
</style>
