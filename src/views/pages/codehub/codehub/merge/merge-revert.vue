<template>
  <div>
    <TsContain class="bg-block">
      <template slot="top">
        <div class="clearfix">
          <div class="ts-angle-left d_f cursor-pointer" @click="gotoPrev()">返回MR</div>
          <div class="d_f top-title">
            <h3 class="title">撤销需求</h3>
            <div v-if="mrData" class="desc">
              <Tooltip v-if="showtips(mrData)" theme="light" max-width="300">
                <div>{{ setTxt(mrData, 'text') }}</div>
                <div slot="content">
                  <div>{{ setTxt(mrData, 'tips') }}</div>
                </div>
              </Tooltip>
              <span v-else>{{ setTxt(mrData, 'text') }}</span>
              <Tag class="mr-10 ml-20 status-tag" color="success">{{ mrData.versionVo.name }}</Tag>
              <span v-if="srcBranch" class="text-tip ml-20">源分支:</span>
              <span v-if="srcBranch" class="ml-10 srcbranch-container">
                {{ srcBranch }}
              </span>
              <span v-if="targetBranch" class="text-tip ml-20">目标分支:</span>
              <span v-if="targetBranch" class="ml-10">
                {{ targetBranch }}
              </span>
            </div>
          </div>
          <div class="d_f_r">
            <Button
              v-if="issueNoList.length>0"
              type="primary"
              class="ml-10"
              :disabled="submiting"
              @click="submitMr"
            >提交</Button>
          </div>
        </div>
      </template>
      <div slot="content">
        <div class="padding-md">
          <div>
            <TsTable ref="showtable" v-bind="tabledata" :tbodyList="issueList">
              <template slot="sourceUuid" slot-scope="{row}">
                {{ getsource(row.sourceUuid) }}
              </template>     
              <template slot="issueUpdateTime" slot-scope="{row}">
                {{ row.issueUpdateTime |formatDate }}
              </template>
              <template slot="handleUserId" slot-scope="{row}">
                {{ row.handleUserId || row.issueCreator }}
              </template>
              <template slot="action" slot-scope="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li class="ts-list" @click="viewIssue(row.uuid)">详情</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </div>
          <div class="input-border padding-md"><Input v-model="description" type="textarea" placeholder="MR描述" /></div>
        </div>
      </div>
    </TsContain>
  </div>
</template>

<script>
//mr撤销
export default {
  name: '',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  props: {
    mrData: {//从mr处理带过来的原mr信息
      type: Object
    },
    issueList: {//从mr处理带过来的撤销的需求列表
      type: [Array, Boolean],
      default: false
    },
    srcBranch: {
      type: String
    },
    targetBranch: {
      type: String
    }
  },
  data() {
    return {
      versionid: null, //版本id
      prevPath: {
        path: '/merge-overview',
        name: 'MR列表'
      },
      issueNoList: [],
      description: '',
      tabledata: {
        theadList: [{
          title: '需求编号',
          key: 'no'
        }, {
          title: '描述',
          key: 'name'
        }, {
          title: '负责人',
          key: 'handleUserId'
        }, {
          title: '更新时间',
          key: 'issueUpdateTime'
        }, {
          title: '来源',
          key: 'sourceUuid'
        }],
        rowKey: 'no'
      },
      syncSourceList: [], //需求来源
      submiting: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getSouce();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    gotoPrev() {
      this.$emit('resetRevert', true);
    },
    getSouce() { //获取需求列表
      this.$api.codehub.issue.getSource({type: 'issue'}).then(res => {
        if (res && res.Status == 'OK') {
          this.syncSourceList = res.Return.syncSourceList;
        }
      });
    },
    submitMr() {
      let param = {
        versionUuid: this.mrData.versionUuid,
        description: this.description,
        srcBranch: this.srcBranch,
        targetBranch: this.targetBranch,
        issueNoList: this.issueNoList,
        type: 'revert'
      };
      this.submiting = true;
      this.$api.codehub.merge.save(param).then(res => {
        this.submiting = false;
        if (res && res.Status == 'OK') {
          this.$router.push({ path: 'merge-review', query: { uuid: res.Return } });
        }
      }).catch(e => {
        this.submiting = false;
      });
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
    },
    getsource() {
      return function(uuid) {
        let txt = '';
        this.syncSourceList.forEach(sync => {
          if (sync.uuid == uuid) {
            txt = sync.source;
          }
        });
        return txt;
      };
    }
  },
  watch: {
    issueList: {
      handler: function(val) {
        if (val && val.length > 0) {
          this.issueNoList = val.map((v) => {
            return v.no;
          });
        }
      },
      deep: true,
      immediate: true
    }
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
  min-height:54px;
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

</style>
