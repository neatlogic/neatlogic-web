<template>
  <div>
    <TsDialog :isShow.sync="showDialog" v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div slot="content">
          <Loading :loadingShow="isLoading" type="fix"></Loading>
          <div v-if="auditList.length > 0">
            <div v-for="(item, index) in auditList" :key="index" class="activity-list">
              <div class="user-img">
                <UserCard v-bind="item.fcuVo" :iconSize="24" hideName></UserCard>
              </div>
              <div class="content dividing-color">
                <div class="overflow top">
                  <UserCard class="user-name text-href" v-bind="item.fcuVo" hideAvatar></UserCard>
                  <span>{{ item.title }}</span>
                </div>
                <div v-if="item.content" class="text-overflow" :title="item.content">
                  {{ item.content }}
                </div>
                <div class="text-tip time">
                  {{ item.fcd | formatDate }}
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <NoData></NoData>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'ActivityDetail',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  filters: {},
  props: {
    isShow: { type: Boolean, default: false },
    knowledgeDocumentId: { type: [String, Number], default: null }
  },
  data() {
    let _this = this;
    return {
      showDialog: false,
      dialogConfig: {
        type: 'slider',
        title: _this.$t('page.activity'),
        maskClose: true,
        isShow: true,
        width: '300px',
        hasFooter: false
      },
      auditList: [], //活动列表
      isLoading: true
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getAuditList() {
      this.isLoading = true;
      let data = {
        knowledgeDocumentId: this.knowledgeDocumentId,
        needPage: false
      };
      this.$api.knowledge.knowledge.auditList(data).then(res => {
        if (res.Status == 'OK') {
          this.auditList = res.Return.list;
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    close() {
      this.showDialog = false;
      this.$emit('update:isShow', false);
    }
  },
  computed: {},
  watch: {
    isShow(val) {
      this.showDialog = val;
      if (val && this.knowledgeDocumentId) {
        this.getAuditList();
      } else {
        this.isLoading = false;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.activity-list {
  position: relative;
  padding-left: 32px;
  .content {
    border-bottom: 1px solid;
    padding-bottom: 8px;
    margin-bottom: 8px;
    .top{
      display: flex;
      align-items: center;
    }
    .time{
      font-size: 12px;
      padding-top: 4px;
    }
  }
  .user-img {
    position: absolute;
    left: 0;
    top: 0;
  }
  .user-name {
    vertical-align: bottom;
  }
  .text-overflow {
    display: -webkit-box;
    text-overflow: -o-ellipsis-lastline;
    overflow: hidden;
    text-overflow: ellipsis;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    padding-top: 4px;
  }
}
</style>
