<template>
  <div class="taskdetail-auto">
    <Loading :loading-show="loadingShow" type="fix"></Loading>
    <div v-if="isStepUser == 1">
      <div class="content-box-mb">
        <TsRow>
          <Col span="12">
            <div class="auto-data">
              <span class="text-grey lable">{{ $t('page.starttime') }}</span>
              <span v-if="initAudit.startTime">
                {{ initAudit.startTime | formatDate }}
              </span>
              <span v-else>-</span>
            </div>
          </Col>
          <Col span="12">
            <div class="auto-data">
              <span class="text-grey lable">{{ $t('page.endtime') }}</span>
              <span v-if="initAudit.endTime">
                {{ initAudit.endTime | formatDate }}
              </span>
              <span v-else>-</span>
            </div>
          </Col>
          <Col v-if="initAudit.typeName" span="12">
            <div class="auto-data">
              <span class="text-grey lable">{{ $t('term.process.callbackstrategy') }}</span>
              <span>{{ initAudit.typeName }}</span>
            </div>
          </Col>
          <Col v-if="initAudit.interval" span="12">
            <div class="auto-data">
              <span class="text-grey lable">{{ $t('term.process.pollinginterval') }}</span>
              <span>{{ initAudit.interval }}{{ $t('page.minute') }}</span>
            </div>
          </Col>
          <Col v-if="initAudit.integrationName" span="12">
            <div class="auto-data">
              <span class="text-grey lable">{{ $t('term.process.externalcall') }}</span>
              <span>{{ initAudit.integrationName }}</span>
            </div>
          </Col>
          <Col v-if="initAudit.failPolicyName" span="12">
            <div class="auto-data">
              <span class="text-grey lable">{{ $t('page.failurestrategy') }}</span>
              <span>{{ initAudit.failPolicyName }}</span>
            </div>
          </Col>
          <Col v-if="initAudit.successConfig" span="12">
            <div class="auto-data">
              <span class="text-grey lable">{{ $t('page.successjudgment') }}</span>
              <span v-if="initAudit.successConfig.default">{{ initAudit.successConfig.default }}</span>
              <span v-else>{{ initAudit.successConfig.name }} {{ initAudit.successConfig.expressionName || '-' }} {{ initAudit.successConfig.value || '-' }}</span>
            </div>
          </Col>
          <Col v-if="initAudit.failConfig" span="12">
            <div class="auto-data">
              <span class="text-grey lable">{{ $t('page.failurejudgment') }}</span>
              <span v-if="initAudit.failConfig.default">{{ initAudit.failConfig.default }}</span>
              <span v-else>{{ initAudit.failConfig.name }} {{ initAudit.failConfig.expressionName || '-' }} {{ initAudit.failConfig.value || '-' }}</span>
            </div>
          </Col>
          <Col v-if="initAudit.nextFireTime" span="12">
            <div class="auto-data">
              <span class="text-grey pr-nm">{{ $t('page.nextactivationtime') }}</span>
              <span>{{ initAudit.nextFireTime | formatDate }}</span>
            </div>
          </Col>
        </TsRow>
      </div>
    </div>
    <div v-if="initAudit.result">
      <div>
        <span v-if="initAudit.result.json" class="text-href look-btn" @click="lookTemlate(initAudit.result)">查看原始结果</span>
        <span v-if="isShowFailed" class="text-href look-btn" @click="lookFailed(initAudit.failedReason)">查看失败原因</span>
      </div>
      <div v-if="initAudit.result.template" class="pt-xs">
        <div v-html="initAudit.result.template"></div>
      </div>
    </div>
    <TsDialog
      type="modal"
      :isShow.sync="resultModal"
      :title="$t('page.originalresults')"
      :hasFooter="false"
      width="large"
    >
      <template>
        <TsCodemirror
          :value.sync="resultTemlate"
          height="400px"
          :disabled="true"
          codeMode="application/json"
        ></TsCodemirror>
      </template>
    </TsDialog>
    <TsDialog
      type="modal"
      :isShow.sync="failedModal"
      :title="$t('page.failreason')"
      :hasFooter="false"
      width="large"
    >
      <template>
        <TsCodemirror
          :value.sync="failedTemlate"
          height="400px"
          :disabled="true"
          codeMode="application/json"
        ></TsCodemirror>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
export default {
  name: '',
  components: {
    TsCodemirror
  },
  props: {
    isStepUser: {
      type: Number,
      default: 1
    },
    defaultStepData: {
      type: Object,
      default: () => {}
    },
    isShowFailed: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loadingShow: true,
      initAudit: {
        startTime: null,
        endTime: null,
        integrationUuid: null,
        integrationName: null,
        failPolicyName: null,
        successConfig: null,
        failConfig: null,
        typeName: null,
        interval: null,
        status: null,
        result: null,
        nextFireTime: null,
        failedReason: null
      },
      resultModal: false,
      resultTemlate: '',
      failedModal: false,
      failedTemlate: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getInitData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getInitData() {
      if (JSON.stringify(this.defaultStepData) != '{}') {
        Object.keys(this.initAudit).forEach(key => {
          this.initAudit[key] = this.defaultStepData[key] || this.initAudit[key];
        });
      }
      this.loadingShow = false;
    },
    lookTemlate(result) {
      this.resultTemlate = result.json;
      this.resultModal = true;
    },
    lookFailed(result) {
      if (result) {
        this.failedTemlate = result;
      }
      this.failedModal = true;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
.taskdetail-auto {
  .auto-data {
    display: flex;
    width: 100%;
    line-height: 26px;
    .lable {
      display: inline-block;
      margin-right: 16px;
      flex-shrink: 0;
    }
  }
  .content-box-mb {
    margin-bottom: 8px;
  }
  .look-btn {
    padding-right: 24px;
  }
}
</style>
