<template>
  <div class="notice-manage">
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="edit({})">{{ $t('page.sysnotice') }}</span>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="searchParams.keyword"
            @change="search()"
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="isLoading" type="fix" />
        <ul class="notice-list">
          <li v-for="notice in tableConfig.tbodyList" :key="notice.id" class="notice flex-between block-container">
            <div :style="{'width': '380px'}">
              <p class="title overflow">{{ notice.title }}</p>
              <div class="fcu">
                <span class="text-title mr-md">{{ $t('page.creator') }}</span>
                <UserCard v-bind="notice.fcuVo" hideAvatar class="usercard" />
              </div>
              <div class="recipients">
                <span class="text-title mr-md">{{ $t('page.notifyobj') }}</span>
                <UserCard
                  v-for="recipient in notice.recipientObjList.slice(0,3)"
                  :key="recipient.uuid"
                  v-bind="recipient"
                  hideAvatar
                  class="usercard recipient"
                />
                <Poptip v-if="notice.recipientObjList.length > 3" trigger="click" placement="bottom-start">
                  <i class="tsfont-option-horizontal text-action" :style="{'margin-left': '5px'}"></i>
                  <ul slot="content" class="more-usercard-list">
                    <li v-for="recipient in notice.recipientObjList.slice(3)" :key="recipient.uuid" class="usercard-item">
                      <UserCard v-bind="recipient" hideAvatar class="usercard recipient" />
                    </li>
                  </ul>
                </Poptip>
              </div>
            </div>

            <div class="flex-start" :style="{'flex': 1, 'margin': '0 50px 0 50px'}">
              <div v-if="notice.imgList && notice.imgList.length > 0" class="img-container mr-md">
                <img class="img" :src="notice.imgList[0]">
              </div>
              <div class="content line-3">{{ notice.content }}</div>
            </div>

            <div class="status" :style="{'width': '50px', 'margin': '0 60px'}">
              <span :style="{'color': notice.statusVo.color}">{{ notice.statusVo.text }}</span>
            </div>

            <div :style="{'width': '330px'}">
              <div class="time" :style="{'margin': '0 50px 0 50px'}">
                <template v-if="notice.startTime && notice.endTime">
                  <p class="text-title" :style="{'margin-bottom': '2px'}">{{ $t('page.issuedtime') }}</p>
                  <span>{{ notice.startTime | formatDate }}</span>
                  <span> ~</span>
                  <br />
                  <span>{{ notice.endTime | formatDate }}</span>
                </template>
                <template v-else-if="notice.startTime && !notice.endTime">
                  <p class="text-title" :style="{'margin-bottom': '5px'}">{{ $t('page.issuedtime') }}</p>
                  <span>{{ notice.startTime | formatDate }}</span>
                  <span> {{ $t('page.begin') }}</span>
                </template>
              </div>

              <ul class="action-list">
                <li
                  v-if="notice.status === 'issued'"
                  class="action-item text-action tsfont-forbid"
                  :title="$t('message.framework.stopusetip')"
                  @click="stop(notice)"
                >{{ $t('page.stopuse') }}</li>
                <li v-else class="action-item text-action tsfont-send" @click="issue(notice)">{{ $t('page.issued') }}</li>
                <li class="dividing dividing-bg-color"></li>
                <li class="action-item text-action tsfont-eye" @click="preview(notice)">{{ $t('page.preview') }}</li>
                <li class="dividing dividing-bg-color"></li>
                <li class="action-item text-action tsfont-edit-s" :class="{'text-disabled': notice.status === 'issued'}" @click="edit(notice)">{{ $t('page.edit') }}</li>
                <li class="dividing dividing-bg-color"></li>
                <li class="action-item text-action tsfont-trash-s" @click="remove(notice)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </li>
        </ul>

        <div v-if="tableConfig.rowNum > 0" class="page-container">
          <Page 
            :current.sync="tableConfig.currentPage"
            :page-size="tableConfig.pageSize"
            :total="tableConfig.rowNum"
            size="small"
            transfer
            show-total
            show-sizer
            @on-change="currentPage => search({ currentPage })"
            @on-page-size-change="pageSize => search({ pageSize })"
          />
        </div>

        <NoData v-else />
      </template>
    </TsContain>
    <!-- 公告编辑 -->
    <NoticeEdit :isShow.sync="isEditDialogShow" :notice.sync="noticeDetail" @on-save="search(searchParams)" />
    <!-- 公告下发 -->
    <NoticeIssue :isShow.sync="isIssueDialogShow" :notice.sync="noticeDetail" @on-issue="search(searchParams)" />
    <!-- 公告预览 -->
    <NoticePreview v-if="isPreviewDialogShow" :isShow.sync="isPreviewDialogShow" :notice.sync="noticeDetail" />
  </div>
</template>
<script>
export default {
  name: 'NoticeManage',
  components: {
    NoticeEdit: resolve => require(['./notice-edit.vue'], resolve),
    NoticeIssue: resolve => require(['./notice-issue.vue'], resolve),
    NoticePreview: resolve => require(['./notice-preview.vue'], resolve),
    UserCard: resolve => require(['components/UserCard/UserCard.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  data() {
    return {
      isLoading: false,
      isEditDialogShow: false,
      isIssueDialogShow: false,
      isPreviewDialogShow: false,
      noticeDetail: {},
      searchParams: {
        keyword: null,
        currentPage: 1,
        pageSize: 20
      },
      tableConfig: {
        tbodyList: [], 
        rowNum: 0, 
        currentPage: 1,
        pageSize: 20 
      }
    };
  },
  created() {
    this.search();
  },
  methods: {
    async search(params = {}) {
      this.searchParams = { ...this.searchParams, currentPage: 1, ...params };
      this.isLoading = true;
      const res = await this.$api.framework.notice.search(this.searchParams);
      this.isLoading = false;
      this.tableConfig = res.Return;
    },
    async stop(notice) {
      await this.$api.framework.notice.stop(notice.id);
      this.$Message.success(this.$t('message.refreshsuccess'));
      this.search(this.searchParams);
    },
    async remove(notice) {
      const {id, title} = notice;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: title}),
        btnType: 'error',
        'on-ok': async vnode => {
          await this.$api.framework.notice.remove(id);
          this.$Message.success(this.$t('message.deletesuccess'));
          vnode.isShow = false;
          this.search();
        }
      });
    },
    preview(notice) {
      this.noticeDetail = notice;
      this.isPreviewDialogShow = true;
    },
    issue(notice) {
      this.noticeDetail = notice;
      this.isIssueDialogShow = true;
    },
    edit(notice = {}) {
      if (notice.status === 'issued') return;
      this.noticeDetail = notice;
      this.isEditDialogShow = true;
    }
  }
};
</script>

<style lang="less" scoped>
.notice-manage {
  .notice {
    padding: 10px 16px;
    height: 82px;
    border-radius: 10px;
    margin-bottom: 16px;
    .usercard {
      vertical-align: bottom;
    }
    .more-usercard-list .usercard-item {
      margin: 5px 0;
    }
    .recipient:not(:last-of-type)::after {
      content: '、';
    }
    .img-container {
      min-width: 62px;
      max-width: 62px;
      max-height: 62px;
      overflow: hidden;
    }
    .img {
      width: 100%;
    }
    .content {
      word-break: break-all;
    }
    .action-list {
      display: none;
      .dividing {
        width: 1px;
        height: 14px;
        margin: 0 13px;
      }
      .tsfont-forbid::before {
        font-size: 10px;
        position: relative;
        top: -1px;
      }
    }
    &:hover {
      .time {
        display: none;
      }
      .action-list {
        display: flex;
      }
    }
  }
  .page-container {
    float: right;
    padding: 10px;
  }
}

</style>
