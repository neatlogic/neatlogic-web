<template>
  <TsContain>
    <template v-slot:navigation>
      <span class="ts-angle-left text-action" @click="$back('/version-overview')">{{ $getFromPage('router.codehub.versioning') }}</span>
    </template>
    <template v-slot:topLeft>
      <span>{{ $t('term.codehub.createmergerequest') }}</span>
    </template>
    <template v-slot:content>
      <TsRow class="mb-nm">
        <Col span="20">
          <div>
            <div v-if="versionData">
              <Tooltip
                v-if="showtips(versionData)"
                class="mr-sm"
                theme="light"
                max-width="300"
              >
                <div>{{ setTxt(versionData, 'text') }}</div>
                <div slot="content">
                  <div>{{ setTxt(versionData, 'tips') }}</div>
                </div>
              </Tooltip>
              <span v-else class="mr-sm">{{ setTxt(versionData, 'text') }}</span>
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
            <div v-else-if="!isOk">{{ $t('term.codehub.temporarilyunavailablecreatemr') }}</div>
          </div>
        </Col>
        <Col span="4">
          <div v-if="isOk" class="action-group text-right">
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
      <Loading v-if="!isOk" loadingShow></Loading>
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
  props: [''],
  data() {
    return {
      type: null, //合并类型
      versionId: null, //版本id
      versionData: null, //版本的所有数据
      srcBranch: '', //选中的源分支
      targetBranch: '', //选中的目标分支
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
      isOk: false, //该mr创建是否可行，如果versionData获取失败则不可以操作
      hasIssue: false, //是否有需求，如果详情里需求长度为0则证明没有可以创建mr的条件
      cancelAxios: null //取消接口调用用
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.versionid) {
      this.versionId = parseInt(this.$route.query.versionid);
      this.getVersion(this.versionId);
    }
    if (this.$route.query.type) {
      this.type = this.$route.query.type;
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
      //取消正在搜索的请求
      let cancel = this.cancelAxios;
      cancel && cancel.cancel();
      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      let param = { id: versionId, expandBranch: true };
      this.isOk = false;
      this.$api.codehub.version.getDetail(param, { cancelToken: this.cancelAxios.token }).then(res => {
        if (res && res.Status == 'OK') {
          this.isOk = true;
          this.versionData = res.Return;
          if (this.versionData.srcBranchList) {
            this.srcBranchList = this.versionData.srcBranchList || [];
          }
          if (this.versionData.targetBranchList) {
            this.targetBranchList = this.versionData.targetBranchList || [];
          }
          //默认选中源分支
          if (this.versionData.srcBranchList && this.versionData.srcBranchList.length) {
            if (this.$route.query.srcBranch) {
              this.srcBranch = this.$route.query.srcBranch;
              this.srcBranchList = [{text: this.srcBranch, value: this.srcBranch}];
            } else {
              let selectedSrc = this.versionData.srcBranchList.find(s => { return s.isSelected; });
              if (selectedSrc) {
                this.srcBranch = selectedSrc.value;
              }
            }
          }
          //默认选中目标分支
          if (this.versionData.targetBranchList && this.versionData.targetBranchList.length) {
            if (this.$route.query.targetBranch) {
              this.targetBranch = this.$route.query.targetBranch;
              this.targetBranchList = [{text: this.targetBranch, value: this.targetBranch}];
            } else {
              let selectedTarget = this.versionData.targetBranchList.find(s => { return s.isSelected; });
              if (selectedTarget) {
                this.targetBranch = selectedTarget.value;
              }
            }
          }
          if (this.$route.query.description) {
            this.description = this.$route.query.description;
          }
          this.type = this.versionData.versionTypeStrategyRelationVo.versionStrategyType;
        } else {
          this.versionData = null;
        }
      }).catch(e => {
        this.isOk = false;
      });
    },
    submitMr() {
      this.$nextTick(() => {
        if (this.issueNoList && this.issueNoList.length > 0) {
          let param = {
            versionId: this.versionId,
            description: this.description,
            srcBranch: this.srcBranch,
            targetBranch: this.targetBranch,
            type: 'standard'
          };
          if (this.$route.query.mrType) {
            param['type'] = this.$route.query.mrType;
          }
          if (this.type == 'issue') {
            let issueList = this.issueNoList.filter(issue => {
              return issue;
            });
            if (parseInt(this.maxSearchCount) < 1) {
              this.$Message.error(this.$t('term.codehub.issueslogmaxcount'));
              return;
            }
            Object.assign(param, {
              issueNoList: issueList,
              searchCommitCount: parseInt(this.maxSearchCount)
            });
          }
          if (this.$refs.srcbranch) {
            if (this.$refs.srcbranch.valid()) {
              this.$api.codehub.merge.save(param).then(res => {
                if (res && res.Status == 'OK') {
                  this.$router.push({ path: 'merge-review', query: { id: res.Return } });
                }
              });
            } else {
              this.$Message.error(this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.sourcebranch')}));
            }
          } else {
            this.$api.codehub.merge.save(param).then(res => {
              if (res && res.Status == 'OK') {
                this.$router.push({ path: 'merge-review', query: { id: res.Return } });
              }
            });
          }
        } else {
          this.$Message.error(this.$t('term.codehub.pleaseselectatleastonerequirement'));
        }
      });
    },
    sysnIssue(val) {
      this.$refs.issueList && this.$refs.issueList.getList();
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
    showtips() {
      return function(config) {
        let isshow = false;
        if ((config.appSystemVo && config.appSystemVo.abbrName) || (config.appModuleVo && config.appModuleVo.name)) {
          isshow = true;
        }
        return isshow;
      };
    },
    setTxt() {
      return function(config, type) {
        let text = '';
        let prev = config.appSystemVo || '';
        let next = config.appModuleVo || '';
        if (type == 'text') {
          text = (prev ? prev.name : '') + (next ? '/' + next.name : '');
        } else if (type == 'tips') {
          text = (prev && prev.name ? prev.name : '') + (next && next.name ? '/' + next.name : '');
        }
        return text;
      };
    }
  },
  watch: {},
  beforeRouteEnter(to, from, next) {
    if (from.fullPath && !(from.fullPath == '/' || from.path == '/merge-review' || from.path == '/merge-create')) {
      let prevsetting = {
        path: from.fullPath,
        name: from.meta.title
      };
      sessionStorage.setItem('mergecreatePrev', JSON.stringify(prevsetting));
    }
    next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  }
};
</script>
<style lang="less" scoped>
.srcbranch-container {
  /deep/ .form-error-tip {
    display: none;
  }
}
</style>
