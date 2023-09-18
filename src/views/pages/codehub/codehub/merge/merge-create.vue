<template>
  <TsContain>
    <template v-slot:navigation>
      <span class="tsfont-left text-action" @click="$back('/version-overview')">{{ $getFromPage('router.codehub.versioning') }}</span>
    </template>
    <template v-slot:topLeft>
      <span>{{ $t('term.codehub.createmergerequest') }}</span>
    </template>
    <template v-slot:content>
      <TsRow class="mb-nm">
        <Col span="20">
          <div>
            <div v-if="versionData">
              <span class="mr-sm">{{ getAbbrNameAndName(versionData, 'text') }}</span>
              <Tag color="success">{{ versionData.version }}</Tag>
              <span v-if="versionData && versionData.versionTypeStrategyRelationVo" class="text-tip ml-sm">{{ $t('page.sourcebranch') }}:</span>
              <span v-if="versionData && versionData.versionTypeStrategyRelationVo" class="ml-sm srcbranch-container">
                <span :style="{ display: 'inline-block', width: '200px' }">
                  <TsFormSelect
                    ref="srcbranch"
                    v-model="srcBranch"
                    v-bind="branchConfig"
                    :dataList="srcBranchList"
                  />
                </span>
              </span>
              <span v-if="versionData && versionData.versionTypeStrategyRelationVo" class="text-tip ml-sm">{{ $t('page.targetbranch') }}:</span>
              <span v-if="versionData && versionData.versionTypeStrategyRelationVo" class="ml-sm">
                <span :style="{ display: 'inline-block', width: '200px' }">
                  <TsFormSelect
                    ref="targetBranch"
                    v-model="targetBranch"
                    v-bind="branchConfig"
                    :dataList="targetBranchList"
                  />
                </span>
              </span>
            </div>
          </div>
        </Col>
        <Col span="4">
          <div v-if="!loadingShow" class="action-group text-right">
            <div class="action-item">
              <Button @click="sysnIssue()">{{ $t('term.codehub.syncissues') }}</Button>
            </div>
            <div class="action-item">
              <Button
                v-if="issueNoList.length > 0 && versionData.canEdit"
                type="primary"
                @click="submitMr"
              >{{ $t('page.submit') }}</Button>
            </div>
          </div>
        </Col>
      </TsRow>
      <Loading v-if="loadingShow" loadingShow></Loading>
      <div v-else>
        <div 
          :is="versionData.versionTypeStrategyRelationVo.versionStrategyType" 
          v-if="versionData && versionData.versionTypeStrategyRelationVo && versionData.versionTypeStrategyRelationVo.versionStrategyType" 
          ref="issueList" 
          :versionId="versionId" 
          :type="type" 
          :versionData="versionData" 
          :srcBranch="srcBranch" 
          :targetBranch="targetBranch"
          :issueNoList="issueNoList" 
          @getIsuuelist="getIsuuelist" 
          @getDes="getDes" 
          @getMaxSearchCount="getMaxSearchCount" 
          @getIssue="getIssue"
        ></div>
      </div>
    </template>
  </TsContain>
</template>

<script>
import tabs from './create';
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    ...tabs
  },
  props: {},
  data() {
    return {
      type: null, // 合并类型
      versionId: null, // 版本id
      versionData: null, //版本的所有数据
      srcBranch: '', // 选中的源分支
      targetBranch: '', // 选中的目标分支
      branchConfig: {
        transfer: true,
        validateList: ['required'],
        clearable: false,
        search: true
      },
      srcBranchList: [],
      targetBranchList: [],
      issueNoList: [],
      description: '',
      maxSearchCount: 300, //检索日志条数
      loadingShow: true,
      hasIssue: false, //是否有需求，如果详情里需求长度为0则证明没有可以创建mr的条件
      cancelAxios: null //取消接口调用用
    };
  },
  beforeCreate() {},
  created() {
  // 存储参数
    this.versionId = parseInt(this.$route.query.versionid) || null;
    this.type = this.$route.query.type || null;

    // 获取版本信息
    if (this.versionId) {
      this.getVersion(this.versionId);
    } else {
      this.loadingShow = false;
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    //取消正在搜索的请求
    let cancel = this.cancelAxios;
    cancel && cancel.cancel();
  },
  destroyed() {},
  methods: {
    getVersion(versionId) {
      this.cancelAxios && this.cancelAxios.cancel();
      this.cancelAxios = this.$https.CancelToken.source();
      let param = { id: versionId, expandBranch: true };
      this.loadingShow = true;
  
      this.$api.codehub.version.getDetail(param, { cancelToken: this.cancelAxios.token })
        .then(res => {
          if (res && res.Status == 'OK') {
            this.versionData = res.Return || null;
            this.srcBranchList = this.versionData?.srcBranchList || [];
            this.targetBranchList = this.versionData?.targetBranchList || [];
        
            // 默认选中源分支
            if (this.versionData.srcBranchList?.length) {
              this.srcBranch = this.$route.query.srcBranch ?? this.versionData.srcBranchList.find(s => s.isSelected)?.value; // ?? 表示空值合并操作符，this.$route.query.srcBranch为空，就取后面的值
              if (this.srcBranch) {
                this.srcBranchList = [{ text: this.srcBranch, value: this.srcBranch }];
              }
            }
        
            // 默认选中目标分支
            if (this.versionData.targetBranchList?.length) {
              this.targetBranch = this.$route.query.targetBranch ?? this.versionData.targetBranchList.find(s => s.isSelected)?.value;
              if (this.targetBranch) {
                this.targetBranchList = [{ text: this.targetBranch, value: this.targetBranch }];
              }
            }
        
            // 默认描述
            this.description = this.$route.query.description ?? '';
        
            this.type = this.versionData?.versionTypeStrategyRelationVo?.versionStrategyType;
          } else {
            this.versionData = null;
          }
        })
        .finally(e => {
          this.loadingShow = false;
        });
    },
    submitMr() {
      this.$nextTick(() => {
        if (!(this.issueNoList && this.issueNoList.length > 0)) {
          this.$Message.error(this.$t('term.codehub.pleaseselectatleastonerequirement'));
          return;
        }

        const param = {
          versionId: this.versionId,
          description: this.description,
          srcBranch: this.srcBranch,
          targetBranch: this.targetBranch,
          type: 'standard'
        };

        if (this.$route.query.mrType) {
          param['type'] = this.$route.query.mrType;
        }

        if (this.type === 'issue') {
          const issueList = this.issueNoList.filter(issue => issue);
          if (parseInt(this.maxSearchCount) < 1) {
            this.$Message.error(this.$t('term.codehub.issueslogmaxcount'));
            return;
          }
          Object.assign(param, {
            issueNoList: issueList,
            searchCommitCount: parseInt(this.maxSearchCount)
          });
        }

        if (this.$refs.srcbranch && !this.$refs.srcbranch.valid()) {
          this.$Message.error(this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.sourcebranch')}));
          return false;
        }
        this.$api.codehub.merge.save(param).then(res => {
          if (res?.Status === 'OK') {
            this.$router.push({ path: 'merge-review', query: { id: res.Return } });
          }
        });
      });
    },
    sysnIssue(val) {
      this.$refs.issueList?.getList();
    },
    getDes(val) {
      this.description = val;
    },
    getMaxSearchCount(val) {
      this.maxSearchCount = val;
    },
    getIsuuelist(val) {
      this.issueNoList = val || [];
    },
    getIssue(status) {
      this.hasIssue = status;
    }
  },
  filter: {},
  computed: {
    getAbbrNameAndName() {
      return (config, type) => {
        const prev = config.appSystemVo || {};
        const next = config.appModuleVo || {};

        if (type !== 'text') {
          return '';
        }

        const prevText = prev.abbrName ? `${prev.abbrName}(${prev.name || ''})` : prev.name || '';
        const nextText = next.abbrName ? `${next.abbrName}(${next.name || ''})` : next.name || '';

        return prevText + (nextText ? `/${nextText}` : '');
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.srcbranch-container {
  /deep/ .form-error-tip {
    display: none;
  }
}
</style>
