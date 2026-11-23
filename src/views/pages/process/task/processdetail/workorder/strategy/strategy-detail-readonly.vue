
<template>
  <div class="subtask-detail">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div v-if="processTaskStepTaskList && processTaskStepTaskList.length" class="item-main">
      <div v-for="(item) in processTaskStepTaskList" :key="item.id" class="item-list border-color">
        <TsRow class="mb-xs">
          <Col span="8">
            <span class="text-title">{{ $t('term.process.policy') }}</span>
            <span class="text-default">{{ item.taskConfigPolicyName }}</span>
          </Col>
          <Col span="12" class="time">
            <span class="text-title">{{ $t('page.starttime') }}</span>
            <span class="text-default">{{ item.createTime | formatDate }}</span>
          </Col>
        </TsRow>
        <TsRow>
          <Col span="24">
            <div class="content-main">
              <span class="text-title">{{ $t('page.description') }}</span>
              <span class="text-default" v-html="item.content"></span>
            </div>
          </Col>
        </TsRow>
        <div class="mt-md">
          <TsTable
            :tbodyList="item.tbodyList"
            :theadList="getReplyColumns(item.tbodyList)"
            :height="'280'"
            keyName="id"
          >
            <template slot="userUuid" slot-scope="{ row }">
              <div class="task-user" :class="{'text-disabled':row.isDelete == 1}">
                <UserCard
                  :uuid="row.userUuid"
                  :initType="row.userVo.initType"
                ></UserCard>
                <template v-if="row.originalUserUuid">
                  {{ $t('term.process.proxyuserprefix') }}<UserCard :uuid="row.originalUserUuid" hideAvatar></UserCard>{{ $t('term.process.proxyusersuffix') }}
                </template>
              </div>
            </template>
            <template slot="endTime" slot-scope="{ row }">
              <span :class="{'text-disabled':row.isDelete == 1}">{{ row.endTime | formatDate }}</span>
            </template>
            <template slot="content" slot-scope="{ row }">
              <!-- 只组合展示内容，保持接口返回的原始回复与操作名称。 -->
              <div v-if="row.displayContent" :class="{'text-disabled':row.isDelete == 1}">
                <Tooltip max-width="500" transfer>
                  <span v-if="row.displayText.length >30">
                    {{ row.displayText.substr(0, Number(30)) }}...
                  </span>
                  <!-- 仅含图片的有效回复仍需提供可悬浮入口。 -->
                  <span v-else>{{ row.displayText || $t('page.viewdetails') }}</span>
                  <div slot="content">
                    <div v-html="row.displayContent"></div>
                  </div>
                </Tooltip>
              </div>
              <span v-else :class="{'text-disabled':row.isDelete == 1}">-</span>
            </template>
            <!-- 拼接模式不重复显示操作名称；没有已回复记录时仍保留操作列占位。 -->
            <template slot="button" slot-scope="{ row }">
              <span :class="{'text-disabled':row.isDelete == 1}" v-text="row.replyDisplayMode !== 'combined' && row.button && row.button.trim() ? row.button : '-'"></span>
            </template>
          </TsTable>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {normalizeReplyDisplayMode, getReplyDisplayHtml, getReplyDisplayText, shouldShowReplyActionColumn} from '../subtask-reply-display.js';
export default {
  name: 'StrategyDetailReadonly',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    UserCard: () => import('@/resources/components/UserCard/UserCard')
  },
  filters: {
  },
  props: {
    processTaskId: [String, Number], //工单id
    processTaskStepId: [String, Number], //工单步骤id
    config: Object //策略数据
  },
  data() {
    return {
      loadingShow: true,
      stepConfig: null,
      processTaskStepTaskList: [],
      theadList: [
        {
          title: this.$t('term.process.dealwithuser'),
          key: 'userUuid',
          type: 'user',
          uuid: 'userUuid'
        },
        {
          title: this.$t('page.replytime'),
          key: 'endTime',
          type: 'time'
        }, {
          title: this.$t('page.reply'),
          key: 'content',
          type: 'html',
          maxLength: '50'
        }, {
          // 与可编辑表格保持一致，操作列位于回复与附件之间，字段仍为 button。
          title: this.$t('page.action'),
          key: 'button'
        }, {
          title: this.$t('page.accessory'),
          key: 'fileList',
          type: 'file'
        }
      ]
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
    initData(val) {
      this.stepConfig = this.$utils.deepClone(val);
      this.processTaskStepTaskList = this.stepConfig.processTaskStepTaskList || [];
      this.processTaskStepTaskList.forEach(item => {
        this.$set(item, 'tbodyList', this.getTbodyList(item));
      });
      this.loadingShow = false;
    },
    getTbodyList(item) {
      if (item.stepTaskUserVoList) {
        let newArr = [];
        // 每次详情刷新都读取策略当前配置，不使用回复行上旧的显示方式快照。
        const replyDisplayMode = normalizeReplyDisplayMode(this.stepConfig && this.stepConfig.config && this.stepConfig.config.replyDisplayMode);
        item.stepTaskUserVoList.forEach((r, i) => {
          newArr.push(
            {
              id: r.id,
              userUuid: r.userUuid,
              userVo: r.userVo,
              originalUserUuid: r.originalUserUuid || null,
              endTime: r.endTime,
              status: r.status,
              content: r.content,
              // 只生成当前策略的展示副本，不改写原始回复和操作名称。
              button: r.button,
              replyDisplayMode: replyDisplayMode,
              displayContent: getReplyDisplayHtml(r.content, r.button, replyDisplayMode),
              displayText: getReplyDisplayText(r.content, r.button, replyDisplayMode),
              isDelete: r.isDelete,
              isDisabled: !!r.isDisabled || false,
              fileList: r.fileList
            }
          );
        });
        return newArr;
      } else {
        return [];
      }
    },
    getReplyColumns(rows) {
      // 按回复状态排除待回复行，即使代办附件操作已更新 endTime 也不参与判断。
      return shouldShowReplyActionColumn(rows) ? this.theadList : this.theadList.filter(column => column.key !== 'button');
    }
  },
  computed: {},
  watch: {
    config: {
      handler(val) {
        val && this.initData(val);
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.subtask-detail {
  .item-main {
    margin-top: 8px;
    .item-list{
      &:not(:last-child) {
        padding-bottom: 16px;
        margin-bottom: 16px;
        border-bottom: 1px solid;
      }
      .text-title {
        margin-right: 10px;
      }
      .content-main {
        display: flex;
      }
    }
  }
  .task-user{
    display: flex;
    align-items: center;
  }
}
</style>
