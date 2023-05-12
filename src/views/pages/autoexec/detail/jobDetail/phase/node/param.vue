<template>
  <div>
    <div>
      <Button
        v-if="!downLoading && paramList.length > 0"
        v-download="getDownurl()"
        type="primary"
        ghost
      >{{ $t('term.autoexec.paramdownload') }}</Button>
      <span v-if="downLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
        <Icon type="ios-loading" size="18" class="loading"></Icon>
        {{ $t('page.downloading') }}
      </span>
    </div>
    <div v-for="(item, index) in paramList" :key="index">
      <Divider v-if="(item.paramList && item.paramList.length > 0) || (!$utils.isEmptyObj(item.argument) && item.argument.valueList&& item.argument.valueList.length>0)" orientation="left">{{ item.name }}{{ item.letter?"_"+item.letter:"" }}</Divider>
      <div v-if="item.paramList && item.paramList.length > 0" class="pb-nm">
        <TsTable :fixedHeader="false" :theadList="paramTheadList" :tbodyList="item.paramList">
          <template v-slot:value="{ row }">
            <Poptip
              word-wrap
              width="500"
              trigger="hover"
              transfer
              :disabled="isDisabledPoptipContent(row)"
            >
              <div slot="content" style="max-height: 350px;overflow: auto;">
                <span v-if="!isJson(row.value)">{{ row.value }}</span>
                <JsonViewer
                  v-else
                  class="popTipContent"
                  copyable
                  :expand-depth="5"
                  :value="JSON.parse(row.value)"
                ></JsonViewer>
              </div>
              <span v-if="row.value && (row.type == 'filepath' || row.type == 'file')" v-download="downloadFile(row, row.value)" class="cursor">
                <span v-if="row.isDownloadFileLoding" class="action-item disable" :title="$t('page.downloadloadingtip')">
                  <Icon type="ios-loading" size="18" class="loading"></Icon>
                  {{ $t('page.downloading') }}
                </span>
                <span v-else class="text-href">{{ JSON.stringify(row.value).length > 40 ? JSON.stringify(row.value).substring(0, 40) + '...' : row.value }}</span>
              </span>
              <div v-else-if="row.value && row.type == 'userselect'">
                <span v-for="(user,uindex) in JSON.parse(row.value)" :key="uindex">
                  <UserCard v-bind="getConfig(user)"></UserCard>
                  <span v-if="JSON.parse(row.value).length-1 > uindex">、</span>
                </span>
              </div>
              <div v-else-if="row.value" style="max-width: 500px" class="overflow">
                {{ JSON.stringify(row.value).length > 40 ? JSON.stringify(row.value).substring(0, 40) + '...' : row.value }}
              </div>
            </Poptip>
          </template>
        </TsTable>
      </div>

      <div v-if="!$utils.isEmptyObj(item.argument) && item.argument.valueList&& item.argument.valueList.length>0" class="extrainfo-detail bg-op padding radius-lg">
        <div class="pb-sm"><span style="font-weight:bold">{{ $t('term.autoexec.freeparameter') }}</span><span class="pl-sm text-grey">{{ item.argument.description }}</span></div>  
        <div class="content-grid">
          <div class="item">
            <div class="content">
              <div v-for="(arg, idx) in item.argument.valueList" :key="idx" class="pb-sm">
                <span>{{ arg }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Loading v-if="isLoading && paramList.length <= 0"></Loading>
    <NoData v-else-if="!isLoading && paramList.length <= 0"></NoData>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    JsonViewer: resolve => require(['vue-json-viewer'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  directives: { download },
  filters: {},
  props: {
    id: [Number, String],
    jobPhaseId: [Number, String], //剧本id
    resourceId: [Number, String], //资源id
    sqlName: [String, String], //作业文件名
    jobId: [Number, String], // 作业id
    type: [String, String] //输入|输出 参数
  },
  data() {
    let _this = this;
    return {
      paramList: [],
      paramTheadList: [
        {
          title: this.$t('term.autoexec.parameterchinesename'),
          key: 'name'
        },
        {
          title: this.$t('term.autoexec.parameterenglishname'),
          key: 'key'
        },
        {
          title: this.$t('page.param') + this.$t('page.value'),
          key: 'value'
        },
        {
          title: this.$t('page.description'),
          key: 'description'
        }
      ],
      downurl: {
        url: '/api/binary/autoexec/job/phase/node/' + this.type + '/download',
        params: {
          jobPhaseId: _this.jobPhaseId,
          resourceId: _this.resourceId
        },
        method: 'post'
      },
      downLoading: false,
      isLoading: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getData() {
      this.isLoading = true;
      let param = {
        nodeId: this.id,
        jobId: this.jobId,
        jobPhaseId: this.jobPhaseId,
        sqlName: this.sqlName || null,
        resourceId: this.resourceId || null
      };
      if (this.type === 'output') {
        this.$api.autoexec.job.getOutputNodeParam(param).then(res => {
          this.paramList = res.Return.operationOutputParamArray || [];
          this.isLoading = false;
        });
      } else {
        this.$api.autoexec.job.getInputNodeParam(param).then(res => {
          this.paramList = res.Return.operationInputParamArray || [];
          this.isLoading = false;
        });
      }
    },
    changeDownStatus(type, event) {
      //下载进度和状态的监听
      if (type == 'start') {
        this.downLoading = true;
      } else if (type != 'progress') {
        this.downLoading = false;
      }
    },
    isJson(value) {
      let isJson = false;
      try {
        JSON.parse(value);
        isJson = true;
      } catch (e) {
        isJson = false;
      }
      return isJson;
    }
  },
  computed: {
    getDownurl() {
      let _this = this;
      return () => {
        let downConfig = this.$utils.deepClone(_this.downurl);
        downConfig.changeStatus = _this.changeDownStatus;
        return downConfig;
      };
    },
    downloadFile(row, path) {
      return (row, path) => {
        let data = {
          jobId: this.jobId,
          jobPhaseId: this.jobPhaseId,
          resourceId: this.resourceId,
          path: path
        };
        return {url: 'api/binary/autoexec/job/node/' + this.type + '/file/download', params: data, method: 'post', changeStatus: status => {
          if (status == 'start') {
            this.$set(row, 'isDownloadFileLoding', true);
          } else if (status == 'success' || status == 'error') {
            this.$set(row, 'isDownloadFileLoding', false);
          }
        }};
      };
    },
    isDisabledPoptipContent() {
      // 内容长度小于40，不显示poptip 上移提示内容
      return function(row) {
        let isDisabled = false;
        let arrValue = '';
        if (!row.value || (row.value && (typeof row.value == 'string' || typeof row.value == 'number') && row.value.length < 40)) {
          isDisabled = true;
        } else if (row.value && row.value.constructor == Array && row.value.length < 40) {
          row.value.forEach((v) => {
            if (v) {
              arrValue += Object.values(v) + Object.keys(v);
            }
          });
          if (arrValue && arrValue.length > 40) {
            isDisabled = false;
          } else {
            isDisabled = true;
          }
        } else if (row.value && row.value instanceof Object && (Object.values(row.value).join('') + Object.keys(row.value).join('')).length < 40) {
          isDisabled = true;
        } 
        return isDisabled;
      };
    },
    getConfig() {
      return item => {
        let list = item.split('#');
        let data = {
          initType: list[0],
          uuid: list[1]
        };
        return data;
      };
    }
  },
  watch: {
    id(newValue, oldValue) {
      if (newValue != oldValue) {
        this.getData();
      }
    }
  }
};
</script>
<style lang="less" scoped>
/deep/.tstable-container {
  position: inherit;
}
.popTipContent {
  max-height: 300px;
  overflow-y: auto;
}
.content-grid {
  display: grid;
  grid-gap: 10px;
  .item {
    display: grid;
    grid-gap: 10px;
    .title {
      text-align: right;
      padding: 3px;
    }
    .content {
      padding: 3px;
      word-break: break-all;
    }
  }
}
</style>
