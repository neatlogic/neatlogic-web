<template>
  <div class="pl-nm">
    <div class="bg-op padding radius-lg mb-nm">
      <div class="pb-nm" style="cursor: pointer;" @click="showRelateKnowledge = !showRelateKnowledge">
        <i :class="showRelateKnowledge ? 'tsfont-down' : 'tsfont-right'"></i>
        {{ $t('term.process.relateknowledge') }}
      </div>
      <div v-show="showRelateKnowledge">
        <NoData v-show="!knowledgeList.length" :text="$t('term.knowledge.norelateknowledge')"></NoData>
        <template v-for="(knowledge, index) in knowledgeList">
          <a
            :key="index"
            class="text-href line-2 pb-xs"
            href="javascript:void(0);"
            @click="goToKnowledge(knowledge)"
            v-html="createContent(index,knowledge.title)"
          ></a>
        </template>
      </div>
    </div>
    <div class="pb-nm">
      <div class="bg-op padding radius-lg">
        <div class="pb-nm" style="cursor: pointer;" @click="showInformant = !showInformant">
          <i :class="showInformant ? 'tsfont-down' : 'tsfont-right'"></i>
          {{ $t('page.informant') }}
        </div>
        <div v-show="showInformant">
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
          <div v-if="isNeedRegion" class="information-list">
            <div class="infor-left text-title overflow">{{ $t('term.process.region') }}</div>
            <div class="infor-right">
              <TsFormSelect
                ref="region"
                v-model="dispatch.regionId"
                v-bind="getRegionSetting"
              ></TsFormSelect>
            </div>
          </div>
        </div>
        <!-- <div class="information-list">
          <div class="infor-left text-title overflow">{{ $t('page.phone') }}</div>
          <div class="infor-right">{{ userDetail.phone || '-' }}</div>
        </div>
        <div class="information-list">
          <div class="infor-left text-title overflow">{{ $t('page.email') }}</div>
          <div class="infor-right">{{ userDetail.email || '-' }}</div>
        </div> -->
      </div>
    </div>
    <div class="bg-op padding radius-lg">
      <div class="pb-nm" style="cursor: pointer;" @click="showBasic = !showBasic">
        <i :class="showBasic ? 'tsfont-down' : 'tsfont-right'"></i>
        {{ $t('page.basicinfo') }}
      </div>
      <div v-show="showBasic">
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
      isNeedRegion: false,
      validateList: ['required'],
      knowledgeList: [],
      showRelateKnowledge: true,
      showBasic: true,
      showInformant: true,
      regionSelectConfig: {
        dynamicUrl: '/api/rest/region/search',
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'name',
        search: true,
        transfer: true,
        border: 'border',
        width: '100%',
        firstSelect: true,
        validateList: ['required']
      }
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
        if (this.draftData.processDispatcherList.some(o => o.endsWith('RegionDispatcher'))) {
          this.isNeedRegion = true;
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
        return this.$api.framework.user.getUser(data).then(res => {
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
          msg: this.$t('message.process.required', {target: this.$t('page.informant')}),
          type: 'error'
        });
      }
      if (this.isNeedPriority && !this.$refs.priorityUuid.valid()) {
        validList.push({
          focus: '#base',
          icon: 'tsfont-close-o',
          msg: this.$t('message.process.required', {target: this.$t('page.priority')}),
          type: 'error'
        });
      }
      if (this.isNeedRegion && !this.$refs.region.valid()) {
        validList.push({
          focus: '#base',
          icon: 'tsfont-close-o',
          msg: this.$t('message.process.required', {target: this.$t('term.process.region')}),
          type: 'error'
        });
      }
      return validList;
    },
    knowledgeSearch(keyword) {
      if (!keyword || !keyword.trim()) {
        this.knowledgeList = [];
        return;
      }
      const searchParam = {
        currentPage: 1,
        keyword: keyword,
        knowledgeDocumentTypeUuid: null,
        knowledgeType: 'all',
        pageSize: 5,
        statusList: ['passed'],
        type: 'document'
      };
      this.$api.process.processtask.searchrelateknowledge(searchParam).then(res => {
        if (res.Status == 'OK') {
          this.knowledgeList = res.Return.dataList;
        }
      });
    },
    createContent(index, title) {
      index += 1;
      return index + '. ' + title;
    },
    goToKnowledge(knowledge) {
      let {knowledgeDocumentId, knowledgeDocumentTypeUuid, knowledgeDocumentVersionId, status} = knowledge;
      const url = 
      `${HOME}/knowledge.html#/knowledge-detail?` + 
      `knowledgeDocumentId=${knowledgeDocumentId}&` +
      `knowledgeDocumentTypeUuid=${knowledgeDocumentTypeUuid}&` +
      `knowledgeDocumentVersionId=${knowledgeDocumentVersionId}&` +
      `status=${status}`;
      window.open(url, '_blank');
    }
  },
  filter: {},
  computed: {
    getRegionSetting() {
      this.$set(this.regionSelectConfig, 'params', {owner: this.dispatch.owner});
      return this.regionSelectConfig;
    }
  },
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
