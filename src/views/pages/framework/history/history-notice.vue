<template>
  <div class="history-notice">
    <div v-if="notReadCount > 0" class="top-container flex-start pl-nm pr-nm">
      <i class="tsfont-mark-all text-action" @click="readAll">{{ $t('page.allmarkread') }}</i>
    </div>

    <Loading :loadingShow="isLoading" type="fix" />
    <ul class="notice-list" :class="{'all-read': notReadCount === 0}">
      <li 
        v-for="(notice, index) in tableConfig.tbodyList"
        :key="notice.id"
        class="notice clearfix block-container"
        @click="showNotice(index)"
      >
        <div class="title-container flex-start">
          <i :class="notice.isRead ? 'tsfont-mail-read-o text-pending' : 'tsfont-mail-unread-o text-warning'"></i>
          <p class="title overflow" :class="{'bolder': !notice.isRead}">{{ notice.title }}</p>
        </div>

        <div class="flex-start content-container">
          <div v-if="notice.imgList && notice.imgList.length > 0" class="img-container mr-md">
            <img class="img" :src="notice.imgList[0]">
          </div>
          <div class="content text-title overflow">{{ notice.content }}</div>
        </div>

        <div class="time-container" :class="{'bolder': !notice.isRead}">{{ notice.issueTime | formatDate }}</div>
      </li>
    </ul>

    <div v-if="tableConfig.rowNum > 0" class="page-container bg-grey">
      <Page 
        :current.sync="tableConfig.currentPage"
        :page-size="tableConfig.pageSize"
        :total="tableConfig.rowNum"
        size="small"
        transfer
        show-total
        show-sizer
        @on-change="currentPage => getHistoryList({ currentPage })"
        @on-page-size-change="pageSize => getHistoryList({ pageSize })"
      />
    </div>
    <NoData v-else :isVerticalCenter="true" />

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
        <img src="~assets/images/notice.png" />
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
          v-if="tableConfig.tbodyList.length > 0 && noticeIndex !== 0"
          :style="{'margin-right': '10px'}"
          @click="read(tableConfig.tbodyList[noticeIndex]), showNotice(--noticeIndex)"
        >{{ $t('page.prev') }}</Button>
        <Button
          v-if="noticeIndex+1 < tableConfig.tbodyList.length"
          type="primary"
          @click="read(tableConfig.tbodyList[noticeIndex]), showNotice(++noticeIndex)"
        >{{ $t('page.next') }}</Button>
        <Button v-else type="primary" @click="isDialogShow = false">{{ $t('page.iknow') }}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: 'HistoryNotice',
  directives: { imgViewer },
  props: {
    timeParams: Object,
    triggerSearch: Boolean,
    keyword: String
  },
  data() {
    return {
      isLoading: false,
      isDialogShow: false,
      notReadCount: 0,
      noticeDetail: {},
      noticeIndex: 0,
      searchParams: {
        currentPage: 1,
        pageSize: 20
      },
      tableConfig: {
        currentPage: 1,
        pageSize: 20,
        rowNum: 0,
        tbodyList: []
      }
    };
  },
  created() {
    this.getHistoryList();
  },
  beforeDestroy() {
    clearTimeout(this.timeoutId);
  },
  methods: {
    async getHistoryList(searchParams = {}) {
      clearTimeout(this.timeoutId);
      this.searchParams = { 
        ...this.searchParams, 
        currentPage: 1,
        ...searchParams };
      const params = { 
        ...this.searchParams,
        ...this.timeParams,
        keyword: this.keyword
      };
      this.isLoading = true;
      const res = await this.$api.framework.notice.getHistoryList(params);
      const {currentPage, pageSize, rowNum, tbodyList, notReadCount} = res.Return;
      this.tableConfig = {currentPage, pageSize, rowNum, tbodyList};
      this.notReadCount = notReadCount;
      this.isLoading = false;
      this.timeoutId = setTimeout(() => {
        this.getHistoryList({currentPage: this.searchParams.currentPage});
      }, 60 * 1000);
    },
    async showNotice(index) {
      this.noticeDetail = {};
      this.isDialogShow = true;
      this.noticeIndex = index;
      const id = this.tableConfig.tbodyList[index].id;
      const res = await this.$api.common.getNotice(id);
      this.noticeDetail = res.Return;
    },
    handleDialogVisibleChange(visible) {
      if (visible) {
        document.querySelector('.home').classList.add('blur-bg');
      } else {
        document.querySelector('.home').classList.remove('blur-bg');
        this.read(this.noticeDetail);
      }
    },
    async read(notice) {
      if (notice.isRead) return;
      const params = {idList: [notice.id]};
      this.$api.framework.notice.read(params);
      this.tableConfig.tbodyList.find(n => n.id === notice.id).isRead = 1;
      this.notReadCount -= 1;
    },
    async readAll() {
      const params = {
        keyword: this.keyword,
        ...this.timeParams
      };
      await this.$api.framework.notice.read(params);
      this.tableConfig.tbodyList.forEach(notice => {
        notice.isRead = 1;
      });
      this.notReadCount = 0;
    }
  },
  watch: {
    timeParams() {
      this.getHistoryList();
    },
    triggerSearch(triggerSearch) {
      if (triggerSearch) {
        this.getHistoryList();
        this.$emit('update:triggerSearch', false);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.history-notice {
  overflow: hidden;
  // height: calc(100vh - 56px - 56px - 2px);
  .top-container {
    height: 52px;
    position: sticky;
    top: 0;
  }
  .notice-list {
    max-height: calc(100% - 52px - 44px);
    margin: 0px 0 0 16px;
    overflow: auto;
    &.all-read {
      max-height: calc(100% - 44px);
    }
    .notice {
      padding: 10px 16px 10px 12px;
      margin: 10px 16px 0 0;
      height: 44px;
      border-radius: 2px;
      cursor: pointer;
      .title-container {
        float: left;
        width: 300px;
        .title {
          margin-left: 10px;
        }
      }
      .content-container {
        max-width: calc(100% - 300px - 70px - 100px - 140px);
        margin: 0 100px 0 70px;
        float: left;
      }
      .img-container {
        min-width: 24px;
        max-width: 24px;
        max-height: 24px;
        overflow: hidden;
      }
      .img {
        width: 100%;
      }
      .time-container {
        float: right;
        width: 140px;
      }
    }
  }
  .page-container {
    float: right;
    padding: 10px;
    position: sticky;
    bottom: 0;
  }
}
</style>
