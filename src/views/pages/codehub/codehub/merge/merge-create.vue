<template>
  <TsContain class="bg-block">
    <template slot="top">
      <div class="clearfix">
        <div class="ts-angle-left d_f cursor-pointer" @click="gotoPrev()">{{ prevPath.name }}</div>
        <div class="d_f top-title">
          <h3 class="title">MR创建</h3>
          <div v-if="versionData" class="desc">
            <Tooltip v-if="showtips(versionData)" theme="light" max-width="300">
              <div>{{ setTxt(versionData, 'text') }}</div>
              <div slot="content">
                <div>{{ setTxt(versionData, 'tips') }}</div>
              </div>
            </Tooltip>
            <span v-else>{{ setTxt(versionData, 'text') }}</span>
            <Tag class="mr-10 ml-20 status-tag" color="success">{{ versionData.name }}</Tag>
            <span v-if="versionData && versionData.versionTypeStrategyRelationVo" class="text-tip ml-20">源分支:</span>
            <span v-if="versionData && versionData.versionTypeStrategyRelationVo" class="ml-10 srcbranch-container">
              <span :style="{ display: 'inline-block', width: '200px' }">
                <TsFormSelect
                  ref="srcbranch"
                  v-model="srcBranch"
                  v-bind="branchConfig"
                  :dataList="srcBranchList"
                />
              </span>
            </span>
            <span v-if="versionData && versionData.versionTypeStrategyRelationVo" class="text-tip ml-20">目标分支:</span>
            <span v-if="versionData && versionData.versionTypeStrategyRelationVo" class="ml-10">
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
          <div v-else-if="!isOk" class="desc">暂时无法创建MR</div>
        </div>
        <div v-if="isOk" class="d_f_r">
          <Button @click="sysnIssue()">同步需求</Button>
          <Button
            v-if="issueNoList.length > 0 && versionData.canEdit"
            type="primary"
            class="ml-10"
            :disabled="submiting"
            @click="submitMr"
          >提交</Button>
        </div>
      </div>
    </template>
    <div slot="content">
      <Loading v-if="!isOk" loadingShow style="height:120px"></Loading>
      <div v-else class="padding-md">
        <div 
          :is="versionData.versionTypeStrategyRelationVo.versionStrategyType" 
          v-if="versionData && versionData.versionTypeStrategyRelationVo && versionData.versionTypeStrategyRelationVo.versionStrategyType" 
          ref="issueList" 
          :versionid="versionid" 
          :type="type" 
          :versiondata="versionData" 
          :srcBranch="srcBranch" 
          :targetBranch="targetBranch"
          :issueNoList="issueNoList" 
          @getIsuuelist="getIsuuelist" 
          @getDes="getDes" 
          @getMaxSearchCount="getMaxSearchCount" 
          @getIssue="getIssue"
        ></div>
      </div>
    </div>
  </TsContain>
</template>

<script>
import tabs from './create';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
export default {
  name: '',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    TsFormSelect,
    ...tabs
  },
  props: [''],
  data() {
    return {
      uuid: null,
      isEdit: false, //是否编辑
      type: null, //合并类型
      versionid: null, //版本id
      versionData: null, //版本的所有数据
      srcBranch: '', //选中的源分支
      targetBranch: '', //选中的目标分支
      syncSourceList: [], //已废弃，之前需要初始化先获取需求列表
      prevPath: {
        path: '/merge-overview',
        name: 'MR列表'
      },
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
      submiting: false, //是否提交中
      cancelAxios: null //取消接口调用用
    };
  },

  beforeCreate() {},

  created() {
    if (sessionStorage.getItem('mergecreatePrev')) {
      let prevsetting = JSON.parse(sessionStorage.getItem('mergecreatePrev'));
      if (prevsetting.router != '/') {
        this.prevPath = prevsetting;
      }
    }
    if (this.$route.query.versionid) {
      this.versionid = this.$route.query.versionid;
      this.getVersion(this.versionid);
    }
    if (this.$route.query.type) {
      this.type = this.$route.query.type;
    }
  },

  beforeMount() {},

  mounted() {
    //this.getSouce();
  },

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
    close() {
      this.isEdit = false;
      this.editUuid = null;
    },
    gotoPrev() {
      this.$router.push({
        path: this.prevPath.path
      });
    },
    getVersion(val) {
      //取消正在搜索的请求
      let cancel = this.cancelAxios;
      cancel && cancel.cancel();
      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      let param = { uuid: val, expandBranch: true };
      let _this = this;
      _this.isOk = false;
      _this.$api.codehub.version.getDetail(param, { cancelToken: _this.cancelAxios.token }).then(res => {
        if (res && res.Status == 'OK') {
          _this.isOk = true;
          _this.versionData = res.Return;
          if (_this.versionData.srcBranchList) {
            _this.srcBranchList = _this.versionData.srcBranchList || [];
          }
          if (_this.versionData.targetBranchList) {
            _this.targetBranchList = _this.versionData.targetBranchList || [];
          }
          //默认选中源分支
          if (_this.versionData.srcBranchList && _this.versionData.srcBranchList.length) {
            if (_this.$route.query.srcBranch) {
              _this.srcBranch = _this.$route.query.srcBranch;
              _this.srcBranchList = [{text: _this.srcBranch, value: _this.srcBranch}];
            } else {
              let selectedSrc = _this.versionData.srcBranchList.find(s => { return s.isSelected; });
              if (selectedSrc) {
                _this.srcBranch = selectedSrc.value;
              }
            }
          }
          //默认选中目标分支
          if (_this.versionData.targetBranchList && _this.versionData.targetBranchList.length) {
            if (_this.$route.query.targetBranch) {
              _this.targetBranch = _this.$route.query.targetBranch;
              _this.targetBranchList = [{text: _this.targetBranch, value: _this.targetBranch}];
            } else {
              let selectedTarget = _this.versionData.targetBranchList.find(s => { return s.isSelected; });
              if (selectedTarget) {
                _this.targetBranch = selectedTarget.value;
              }
            }
          }
          if (_this.$route.query.description) {
            _this.description = _this.$route.query.description;
          }
          _this.type = _this.versionData.versionTypeStrategyRelationVo.versionStrategyType;
          // if (_this.versionData.versionTypeStrategyRelationVo.usePattern) {
          //   _this.srcBranch = _this.srcBranchList[0].value;
          // } else {
          //_this.srcBranch = _this.versionData.versionTypeStrategyRelationVo.srcBranch;
          //}
          // if (_this.versionData.versionTypeStrategyRelationVo) {
          //   let revo = _this.versionData.versionTypeStrategyRelationVo;
          //   revo.srcBranch && (_this.srcBranch = revo.srcBranch);
          //   revo.targetBranch && (_this.targetBranch = revo.targetBranch);
          // }
          //;
        } else {
          _this.versionData = null;
        }
      }).catch(e => {
        _this.isOk = false;
      });
    },
    submitMr() {
      //20201105_zqp_新增检索日志保存字段和对应逻辑
      let _this = this;
      _this.$nextTick(() => {
        if (this.issueNoList && this.issueNoList.length > 0) {
          let param = {
            versionUuid: this.versionid,
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
              this.$Message.error('检索提交日志条数不能小于1');
              return;
            }
            Object.assign(param, {
              issueNoList: issueList,
              searchCommitCount: parseInt(this.maxSearchCount)
            });
          }
          if (this.$refs.srcbranch) {
            if (this.$refs.srcbranch.valid()) {
              this.submiting = true;
              this.$api.codehub.merge.save(param).then(res => {
                this.submiting = false;
                if (res && res.Status == 'OK') {
                  _this.$router.push({ path: 'merge-review', query: { uuid: res.Return } });
                }
              }).catch(e => {
                this.submiting = false;
              });
            } else {
              this.$Message.error('请选择源分支');
            }
          } else {
            this.submiting = true;
            this.$api.codehub.merge.save(param).then(res => {
              this.submiting = false;
              if (res && res.Status == 'OK') {
                _this.$router.push({ path: 'merge-review', query: { uuid: res.Return } });
              }
            }).catch(e => {
              this.submiting = false;
            });
          }
        } else {
          this.$Message.error('请至少选择一个需求');
        }
      });
    },
    sysnIssue(val) {
      this.$refs.issueList && this.$refs.issueList.getList();
    },
    getSouce() {
      //获取需求列表
      this.$api.codehub.issue.getSource({ type: 'issue' }).then(res => {
        if (res && res.Status == 'OK') {
          this.syncSourceList = res.Return.syncSourceList;
        }
      });
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
        if ((config.systemVo && config.systemVo.description) || (config.subSystemVo && config.subSystemVo.description)) {
          isshow = true;
        }
        return isshow;
      };
    },
    setTxt() {
      return function(config, type) {
        let text = '';
        let prev = config.systemVo || '';
        let next = config.subSystemVo || '';
        if (type == 'text') {
          text = (prev ? prev.name : '') + (next ? '/' + next.name : '');
        } else if (type == 'tips') {
          text = (prev && prev.description ? prev.description : '') + (next && next.description ? '/' + next.description : '');
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
    //sessionStorage.removeItem('mergecreatePrev');
    next();
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.action-item {
  width: 24px;
}
.status-tag {
  transform: scale(0.9);
}
.top-title {
  min-height: 54px;
  .title {
    line-height: 26px;
  }
  .desc {
    line-height: 20px;
  }
  padding-left: 20px;
  margin-left: 20px;
  border-left: 1px solid @default-border;
}
/deep/ .TsFormSelect .select-top {
  line-height: 24px;
  min-height: 24px;
}
.srcbranch-container {
  /deep/ .form-error-tip {
    display: none;
  }
}
</style>
