<template>
  <div class="pl-nm">
    <div class="pb-nm">
      <div class="bg-op padding radius-lg">
        <div class="pb-nm">{{ $t('term.process.reportuser') }}</div>
        <div class="information-list">
          <div class="infor-left text-title overflow">
            <UserCard
              v-if="!$utils.isEmpty(userDetail)"
              v-bind="userDetail"
              :iconSize="40"
              hideName
            ></UserCard>
            <TsAvatar v-else v-bind="userDetail" size="40"></TsAvatar>
          </div>
          <div class="infor-right">
            <UserSelect
              ref="owner"
              v-model="dispatch.owner"
              :groupList="groupList"
              :multiple="false"
              border="none"
              :validateList="validateList"
              :clearable="false"
              transfer
              style="display: inline-block;"
              @on-change="userChange"
              @click.native.stop
            ></UserSelect>
          </div>
        </div>
        <div class="information-list">
          <div class="infor-left text-title overflow">{{ $t('term.process.usernumber') }}</div>
          <div class="infor-right">{{ userDetail.userId ||'-' }}</div>
        </div>
        <div class="information-list">
          <div class="infor-left text-title overflow">{{ $t('page.phone') }}</div>
          <div class="infor-right">{{ userDetail.phone || '-' }}</div>
        </div>
        <div class="information-list">
          <div class="infor-left text-title overflow">{{ $t('page.email') }}</div>
          <div class="infor-right">{{ userDetail.email || '-' }}</div>
        </div>
      </div>
    </div>
    <div class="bg-op padding radius-lg">
      <div class="pb-nm">{{ $t('page.basesetting') }}</div>
      <div class="information-list">
        <div class="infor-left text-title overflow">{{ $t('term.process.reportcatalog') }}</div>
        <div class="infor-right">{{ draftData.channelPath ||'-' }}</div>
      </div>
      <div v-if="isNeedPriority" class="information-list">
        <div class="infor-left text-title require-label overflow">{{ $t('page.priority') }}</div>
        <div class="infor-right">
          <TsFormSelect
            ref="priorityUuid"
            v-model="dispatch.priorityUuid"
            :dataList="priorityList"
            valueName="uuid"
            textName="name"
            :validateList="validateList"
            :clearable="false"
            transfer
            @on-change="changePriorityUuid"
          ></TsFormSelect>
        </div>
      </div>
      <div class="information-list">
        <div class="infor-left text-title overflow">{{ $t('page.tag') }}</div>
        <div class="infor-right">
          <WorkLabel ref="workLabel" :list="tagList" :showLogo="false"></WorkLabel>
        </div>
      </div>
      <div class="information-list">
        <div class="infor-left text-title overflow">{{ $t('term.process.focususer') }}</div>
        <div class="infor-right">
          <UserSelect
            v-model="dispatch.focusUserUuidList"
            :groupList="['user']"
            transfer
          ></UserSelect>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsAvatar: resolve => require(['@/resources/components/TsAvatar/TsAvatar'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    WorkLabel: resolve => require(['@/views/pages/process/task/processdetail/workorder/label/label.vue'], resolve)
  },
  props: {
    draftData: Object,
    priorityList: {
      type: Array,
      default: () => []
    },
    defaultPriorityConfig: Object
  },
  data() {
    return {
      dispatch: {
        owner: '',
        priorityUuid: '',
        focusUserUuidList: []
      },
      userDetail: {},
      groupList: ['user'],
      tagList: [],
      isNeedPriority: true,
      validateList: ['required']
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async init() {
      if (!this.$utils.isEmpty(this.draftData)) {
        if (!this.$utils.isEmpty(this.draftData.ownerVo)) {
          this.userDetail = this.draftData.ownerVo;
        } else if (this.draftData.owner) {
          await this.userChange(this.draftData.owner);
        } else {
          this.userDetail = this.$AuthUtils.getCurrentUser();
        }
        this.dispatch.owner = 'user#' + this.userDetail.uuid;
        if (this.draftData.tagList) {
          this.tagList = this.draftData.tagList;
        }
        if (this.draftData.focusUserUuidList) {
          this.dispatch.focusUserUuidList = this.draftData.focusUserUuidList;
        }
        if (this.draftData.hasOwnProperty('isNeedPriority')) {
          this.isNeedPriority = !!this.draftData.isNeedPriority;
        }
        if (this.isNeedPriority) {
          this.dispatch.priorityUuid = this.draftData.priorityUuid; 
        }
      }
    },
    //修改用户
    userChange(val) {
      this.userDetail = {};
      let userId = null;
      if (val) {
        if (val.includes('#')) {
          userId = val.split('#')[1];
        } else {
          userId = val;
        }
        let data = {
          userUuid: userId
        };
        return this.$api.framework.user.getUserCopy(data).then(res => {
          if (res.Status == 'OK') {
            this.userDetail = res.Return;
          }
        });
      }
    },
    changePriorityUuid(val) {
      this.dispatch.priorityUuid = val;
    },
    getBaseData() {
      let data = {
        ...this.dispatch,
        tagList: this.$refs.workLabel ? this.$refs.workLabel.getTagList() || [] : []
      };
      return data;
    },
    validData() {
      let validList = [];
      if (!this.$refs.owner.valid()) {
        validList.push({
          focus: '#base',
          icon: 'tsfont-close-o',
          msg: this.$t('message.content.process.required', {target: this.$t('term.process.reportuser')}),
          type: 'error'
        });
      }
      if (this.isNeedPriority && !this.$refs.priorityUuid.valid()) {
        validList.push({
          focus: '#base',
          icon: 'tsfont-close-o',
          msg: this.$t('message.content.process.required', {target: this.$t('page.priority')}),
          type: 'error'
        });
      }
      return validList;
    }
  },
  filter: {},
  computed: {},
  watch: {
    defaultPriorityConfig: {
      handler(val) {
        if (val && val.uuid) {
          this.dispatch.priorityUuid = val.uuid;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.information-list {
  display: flex;
  align-items: center;
  padding-bottom: 16px;
  .infor-left {
    font-size: 12px;
    width: 60px;
    text-align: right;
    flex-shrink: 0;
  }
  .infor-right {
    flex-grow:1;
    flex-shrink: 1;
    padding-left: 16px;
    word-break:break-all;
  }
}
</style>
