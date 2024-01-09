<template>
  <div>
    <TsDialog
      v-bind="tsDialoglookSitemap"
      :isShow.sync="tsDialoglookSitemap.isShow"
      :fullscreen="true"
      :hasFooter="false"
      width="medium"
      :className="stepDialogClass"
      :bgOp="true"
      height="600px"
    >
      <template v-slot:header>
        <span class="text-action" @click="openFlow()">{{ sitemapTitle }}</span>
      </template>
      <template>
        <div class="topo-box">
          <div ref="topo" class="sitemapMain"></div>
          <div class="tooltip-box">
            <div
              v-if="stepTooltip"
              class="tooltip"
              :style="{ top: tooltipStyle.top, left: tooltipStyle.left }"
              :class="stepTooltip.className"
            >
              <div class="tooltip-title">{{ stepTooltip.name }}</div>
              <ul class="tooltip-content">
                <li v-if="stepTooltip.statusVo" class="tooltip-list">
                  <span class="label">{{ $t('page.status') }}</span>
                  <span :style="{ color: stepTooltip.statusVo.color }">{{ stepTooltip.statusVo.text }}</span>
                </li>
                <li v-if="stepTooltip.startTime" class="tooltip-list">
                  <span class="label">{{ $t('page.starttime') }}</span>
                  <span>{{ stepTooltip.startTime | formatDate }}</span>
                </li>
                <li v-if="stepTooltip.endTime" class="tooltip-list">
                  <span class="label">{{ $t('page.endtime') }}</span>
                  <span>{{ stepTooltip.endTime | formatDate }}</span>
                </li>
                <li v-if="stepTooltip.majorUser" class="tooltip-list">
                  <span class="label">{{ $t('term.process.dealwithuser') }}</span>
                  <span>
                    <UserCard v-bind="stepTooltip.majorUser.userVo" hideAvatar></UserCard>
                  </span>
                </li>
                <li v-if="stepTooltip.minorUserList.length > 0" class="tooltip-list">
                  <span class="label">
                    <!-- 步骤处理人 -->
                  </span>
                  <span>{{ userList(stepTooltip.minorUserList, 'minorUser') }}</span>
                </li>
                <li v-if="!stepTooltip.majorUser && stepTooltip.workerList && stepTooltip.workerList.length > 0" class="tooltip-list">
                  <span class="label">{{ $t('term.process.pendinguser') }}</span>
                  <span>{{ userList(stepTooltip.workerList, 'worker') }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import UserCard from '@/resources/components/UserCard/UserCard.vue';
export default {
  name: '',
  components: {
    UserCard
  },
  filters: {},
  props: {
    lookSitemapModel: {
      type: Boolean,
      default: false
    },
    stepDialogClass: {
      type: String,
      default: ''
    },
    sitemapTitle: {
      type: String,
      default: ''
    },
    tooltipStyle: {
      type: Object,
      default: null
    },
    tsDialoglookSitemap: {
      type: Object,
      default: null
    },
    stepTooltip: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    userList(arr, type) {
      //处理人
      let userList = arr;
      let textList = [];
      userList.forEach(item => {
        if (type == 'minorUser') { //处理人
          let userText = item.userName;
          item.taskType && (userText += '(' + item.taskType + ')');
          textList.push(userText);
        } else if (type == 'worker') { //待处理人
          textList.push(item.name);
        }
      });
      textList = textList.join('、');
      return textList;
    },
    openFlow() {
      window.open(HOME + '/process.html#/flow-edit?uuid=' + this.tsDialoglookSitemap.flowUuid, '_blank');
    }
  },
  computed: {
  },
  watch: {}
};
</script>
<style lang='less' scoped>
.tooltip-list{
  min-height: 30px;
}
</style>
