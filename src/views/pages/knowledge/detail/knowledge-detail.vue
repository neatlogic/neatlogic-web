<template>
  <div class="KnowledgeDetail">
    <loading :loadingShow="knowledgeLoading" type="fix"></loading>
    <TsContain v-if="knowledgeConfing">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div>
          <span class="mr-md">{{ knowledgeConfing.title }}</span>
          <Poptip
            v-if="knowledgeConfing.isCurrentVersion == 1 && currentVersion && historicalVersionList.length > 0"
            trigger="hover"
            placement="bottom-start"
            width="400"
          >
            <span class="btn-green-op cursor-pointer">
              {{ currentVersion.versionName }}
              <span class="tsfont-down"></span>
            </span>
            <div slot="content" class="version-main">
              <div class="version-list">
                <div class="text-title">
                  {{ $t('page.curversions') }}
                </div>
                <div class="version-content m-border">
                  <p>
                    {{ currentVersion.versionName }}
                    <CommonStatus :statusName="$t('page.enable')" statusValue="current"></CommonStatus>
                  </p>
                  <div class="text-tip">
                    <span class="user overflow">
                      <UserCard v-bind="currentVersion.lcuVo" hideAvatar></UserCard>
                    </span>
                    <span class="time">{{ currentVersion.lcd | formatDate }}</span>
                  </div>
                </div>
              </div>
              <div v-if="historicalVersionList.length > 0" class="version-list">
                <div class="text-title">{{ $t('page.hisversions') }}</div>
                <div v-for="item in historicalVersionList" :key="item.id" class="version-content m-border">
                  <p>{{ item.versionName }}</p>
                  <div class="text-tip">
                    <span class="user overflow">
                      <UserCard v-bind="item.lcuVo" hideAvatar></UserCard>
                    </span>
                    <span class="time">{{ item.lcd | formatDate }}</span>
                  </div>
                  <div class="btn-list">
                    <div class="action-group">
                      <span v-if="item.isSwitchable == 1" class="action-item tsfont-arrow-right" @click="backVersion(item)">{{ $t('page.rollback') }}</span>
                      <span v-if="item.isDeletable == 1" class="action-item tsfont-trash-o" @click="delVersion(item)">{{ $t('page.delete') }}</span>
                      <span class="action-item  tsfont-compare" @click="comparisonVer(item)">{{ $t('page.compare') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Poptip>
          <span v-else-if="currentVersion && historicalVersionList.length == 0" class="btn-green-op">{{ currentVersion.versionName }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div v-if="knowledgeConfing">
          <span class="action-group">
            <span v-if="knowledgeConfing.isEditable" class="action-item tsfont-edit" @click="goEdit">{{ $t('page.edit') }}</span>
            <span v-if="isDowning" class="action-item disable" :title="$t('page.downloadloadingtip')">
              <Icon type="ios-loading" size="18" class="loading"></Icon>{{ $t('page.export') }}
            </span>
            <span v-else class="action-item">
              <Dropdown trigger="click">
                <span class="tsfont-download">{{ $t('page.export') }}</span>
                <DropdownMenu slot="list">
                  <DropdownItem v-download="getDownurl('pdf')"> {{ $t('page.export') }}pdf</DropdownItem>
                  <DropdownItem v-download="getDownurl('word')">{{ $t('page.export') }}word</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </span>
            <span
              v-if="knowledgeConfing.isMember"
              class="action-item tsfont-history"
              @click="isActivityShow = !isActivityShow"
            >{{ $t('page.activity') }}</span>
          </span>
        </div>
      </template>
      <template slot="content">
        <DocumentDetail :config="knowledgeConfing"></DocumentDetail>
      </template>
    </TsContain>
    <!-- 对比 -->
    <ComparisonDialog
      v-if="currentVersion"
      :isShow.sync="isDialogShow"
      :newVersionId="currentVersion.id"
      :oldVersionId="historicalVersionId"
      :knowledgeDocumentId="knowledgeDocumentId"
    ></ComparisonDialog>
    <!-- 活动 -->
    <ActivityDetail :isShow.sync="isActivityShow" :knowledgeDocumentId="knowledgeDocumentId"></ActivityDetail>
  </div>
</template>
<script>
import UserCard from '@/resources/components/UserCard/UserCard.vue';
import download from '@/resources/directives/download.js';
export default {
  name: 'KnowledgeDetail',
  components: {
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    ComparisonDialog: () => import('./comparison/comparison-dialog.vue'),
    ActivityDetail: () => import('@/views/pages/knowledge/common/activity-detail.vue'),
    DocumentDetail: () => import('./document-detail.vue'),
    UserCard
  },
  filters: {},
  directives: { download },
  props: [''],
  data() {
    return {
      isDowning: false,
      downurl: {
        url: 'api/binary/knowledge/document/export',
        params: {
          knowledgeDocumentId: '',
          knowledgeDocumentVersionId: '',
          type: ''
        },
        method: 'post'
      },
      knowledgeLoading: true,
      knowledgeDocumentId: null,
      knowledgeDocumentVersionId: null,
      isDialogShow: false,
      knowledgeConfing: {},
      currentVersion: null,
      historicalVersionList: [],
      historicalVersionId: null,
      isActivityShow: false,
      status: '' //文档状态
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.knowledgeDocumentId = this.$route.query.knowledgeDocumentId || null;
    this.knowledgeDocumentVersionId = this.$route.query.knowledgeDocumentVersionId || null;
    this.downurl.params.knowledgeDocumentId = this.knowledgeDocumentId;
    this.downurl.params.knowledgeDocumentVersionId = this.knowledgeDocumentVersionId;
    if (this.$route.query.status) {
      this.status = this.$route.query.status;
    }
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      this.getDocumentConfig();
    },
    getDocumentConfig() {
      //文档信息
      let data = {
        knowledgeDocumentId: this.knowledgeDocumentId,
        knowledgeDocumentVersionId: this.knowledgeDocumentVersionId
      };
      if (this.status == 'passed') { //浏览记录：passed状态表示已发布的文档，浏览数需要加一
        this.$set(data, 'isReadOnly', 1);
      }
      this.$api.knowledge.knowledge.getDocument(data).then(res => {
        if (res.Status == 'OK') {
          let config = res.Return;
          this.knowledgeConfing = config;
          this.knowledgeLoading = false;
          if (config.isMember) { //isMember：判断是否是成员（活动和历史版本的查看权限）
            this.gethistoricalVersion();
          }
        }
      });
    },
    gethistoricalVersion() {
      //历史版本
      let data = {
        knowledgeDocumentId: this.knowledgeDocumentId
      };
      this.$api.knowledge.knowledge.historicalVersion(data).then(res => {
        if (res.Status == 'OK') {
          let config = res.Return;
          this.currentVersion = config.currentVersion;
          this.historicalVersionList = config.historicalVersionList || [];
        }
      });
    },
    goEdit() {
      this.$router.push({
        path: '/knowledge-edit',
        query: {
          knowledgeDocumentId: this.knowledgeDocumentId,
          knowledgeDocumentVersionId: this.knowledgeDocumentVersionId
        }
      });
    },
    comparisonVer(item) {
      //对比版本
      this.historicalVersionId = item.id;
      this.isDialogShow = true;
    },
    delVersion(item) {
      // 删除版本
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: item.versionName}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = {
            knowledgeDocumentVersionId: item.id
          };
          this.$api.knowledge.knowledge.deleteVersion(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.gethistoricalVersion();
            }
          });
        }
      });
    },
    backVersion(item) {
      //回退版本
      this.$createDialog({
        title: this.$t('dialog.title.rollbacktarget', {target: this.$t('page.versions')}),
        content: this.$t('dialog.content.rollbackconfirm', {target: item.versionName}),
        // btnType: 'error',
        'on-ok': vnode => {
          let data = {
            knowledgeDocumentVersionId: item.id
          };
          this.knowledgeDocumentVersionId = item.id;
          this.$api.knowledge.knowledge.switchVersion(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              vnode.isShow = false;
              this.initData();
            }
          });
        }
      });
    },
    cancelBack() {
      this.backModel = false;
    },
    backOk() {
      this.backModel = false;
    },
    changeDownStatus(type, event) { //下载进度和状态的监听
      if (type == 'start') {
        this.isDowning = true;
      } else if (type != 'progress') {
        this.isDowning = false;
      }
    }
  },
  computed: {
    getDownurl() {
      let _this = this;
      return (type) => {
        let downConfig = JSON.parse(JSON.stringify(_this.downurl));
        downConfig.params.type = type;
        downConfig.params.knowledgeDocumentId = _this.knowledgeDocumentId;
        downConfig.params.knowledgeDocumentVersionId = _this.knowledgeDocumentVersionId;
        downConfig.changeStatus = _this.changeDownStatus;
        return downConfig;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.version-main {
  max-height: 320px;
  padding: 0 16px;
  .version-list{
    margin-bottom:16px;
  }
  .text-title {
    padding-bottom: 10px;
  }
}
.badge {
  width: 26px;
  margin-right: 4px;
  vertical-align: middle;
}
.version-content {
  position: relative;
  padding-bottom: 10px;
  // border: 1px solid #e8e8e8;
  padding: 8px;
  margin-bottom: 6px;
  border-radius: 6px;
  .btn-list {
    position: absolute;
    right: 8px;
    top: 8px;
    display:none;
  }
  .user {
    display: inline-block;
    width: 72px;
    margin-right: 4px;
  }
}
.version-content:hover{
  .btn-list{
    display:block;
  }
}
.version-back {
  .back-tip {
    .title {
      display: inline-block;
      vertical-align: bottom;
      margin-left: 8px;
      font-size: 16px;
    }
  }
}
.KnowledgeDetail {
  /deep/ .ivu-poptip-body {
    padding: 8px 0;
  }
}
</style>
