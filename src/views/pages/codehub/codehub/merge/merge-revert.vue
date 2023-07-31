<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span class="ts-angle-left text-action" @click="gotoPrev()">{{ $getFromPage($t('term.codehub.backmergerequest')) }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ $t('term.codehub.revokerequirement') }}</span>
        <div v-if="mrData" style="display: flex;">
          <span>{{ setAbbrNameAndName(mrData) }}</span>
          <Tag class="mr-sm ml-sm status-tag" color="success">{{ mrData.versionVo.name }}</Tag>
          <span v-if="srcBranch" class="text-tip ml-sm">{{ $t('page.sourcebranch') }}:</span>
          <span v-if="srcBranch" class="ml-sm srcbranch-container">
            {{ srcBranch }}
          </span>
          <span v-if="targetBranch" class="text-tip ml-sm">{{ $t('page.targetbranch') }}:</span>
          <span v-if="targetBranch" class="ml-sm">
            {{ targetBranch }}
          </span>
        </div>
      </template>
      <template v-slot:topRight>
        <Button
          v-if="issueNoList.length>0"
          type="primary"
          class="ml-sm"
          @click="submitMr"
        >{{ $t('page.submit') }}</Button>
      </template>
      <div slot="content">
        <div class="padding-md">
          <div>
            <TsTable ref="showtable" v-bind="tabledata" :tbodyList="issueList">
              <template slot="sourceId" slot-scope="{row}">
                {{ getSourceName(row.sourceId) }}
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
                    <li class="ts-list" @click="viewIssue(row.id)">{{ $t('page.detail') }}</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </div>
          <div class="mt-sm">
            <TsFormInput
              v-model="description"
              type="textarea"
              border="border"
              maxlength="1024"
              :placeholder="$t('term.codehub.mergerequestdesc')"
            ></TsFormInput>
          </div>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
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
      issueNoList: [],
      description: '',
      tabledata: {
        theadList: [{
          title: this.$t('term.codehub.issuesnumber'),
          key: 'no'
        }, {
          title: this.$t('page.description'),
          key: 'name'
        }, {
          title: this.$t('page.responsibleperson'),
          key: 'handleUserId'
        }, {
          title: this.$t('page.updatetime'),
          key: 'issueUpdateTime'
        }, {
          title: this.$t('page.source'),
          key: 'sourceId'
        }],
        rowKey: 'no'
      },
      syncSourceList: [] //需求来源
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getSyncSourceList();
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
    getSyncSourceList() { //获取需求列表
      this.$api.codehub.issue.getSource({type: 'issue'}).then(res => {
        if (res && res.Status == 'OK') {
          this.syncSourceList = res.Return.syncSourceList;
        }
      });
    },
    submitMr() {
      let param = {
        versionId: this.mrData.versionId,
        description: this.description,
        srcBranch: this.srcBranch,
        targetBranch: this.targetBranch,
        issueNoList: this.issueNoList,
        type: 'revert'
      };
      this.$api.codehub.merge.save(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$router.push({ path: 'merge-review', query: { id: res.Return } });
        }
      });
    }
  },
  filter: {},
  computed: {
    getSourceName() {
      // 根据来源id获取来源名称
      return function(sourceId) {
        const sourceItem = this.syncSourceList.find(item => item.id === sourceId);
        const sourceName = sourceItem ? sourceItem.source : '';
        return sourceName;
      };
    },
    setAbbrNameAndName() {
      // 获取应用模块【简称和名称】
      return function(config) {
        let text = '';
        let appSystemVo = config ? config.appSystemVo : '';
        let appModuleVo = config ? config.appModuleVo : '';
        if (appSystemVo) {
          if (appModuleVo) {
            text = `${this.$utils.getAbbrNameAndName(appSystemVo)}/${this.$utils.getAbbrNameAndName(appModuleVo)}`;
          } else {
            text = this.$utils.getAbbrNameAndName(appSystemVo);
          }
        } else if (appModuleVo) {
          text = this.$utils.getAbbrNameAndName(appModuleVo);
        }
        return text;
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
.status-tag {
  transform: scale(0.9);
}
</style>
