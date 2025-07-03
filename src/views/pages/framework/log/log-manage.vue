<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <div v-if="level != null" class="action-item">
            <span class="mr-xs text-grey">{{ $t('page.loglevel') }}</span>
            <span>
              <b>{{ level }}</b>
            </span>
          </div>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <Row class="action-group" span="24" :gutter="16">
            <Col span="8">
              <TsFormSelect
                v-model="serverSelectSetting.value"
                v-bind="serverSelectSetting"
                @change="handleChangeServerId"
              ></TsFormSelect>
            </Col>
            <Col span="12">
              <TsFormSelect
                v-model="fileNameSelectSetting.value"
                v-bind="fileNameSelectSetting"
                @change="handleChangeFileName"
              ></TsFormSelect>
            </Col>
            <Col span="2">
              <div v-if="searchParam.fileName != null" class="action-item tsfont-refresh" @click="refreshLog()">{{ $t('page.refresh') }}</div>
            </Col>
            <Col span="2">
              <div v-if="searchParam.fileSize != null" class="action-item tsfont-download" @click="exportLog()">{{ $t('page.export') }}</div>
            </Col>
          </Row>
        </div>
      </template>
      <div slot="content">
        <div ref="textContainer" style="overflow: auto; white-space: pre-wrap">
          <div 
            v-for="(line, index) in logLines"
            :key="index"
            :class="getLineClass(line)"
          >
            {{ line }}
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue')
  },
  mixins: [download],
  props: {},
  data() {
    return {
      searchParam: {
        serverId: null,
        fileName: null,
        fileSize: null
      },
      serverSelectSetting: {
        defaultValueIsFirst: false,
        dataList: [],
        transfer: true,
        placeholder: this.$t('page.server'),
        value: ''
      },
      fileNameSelectSetting: {
        defaultValueIsFirst: false,
        dataList: [],
        transfer: true,
        placeholder: this.$t('page.filename'),
        value: ''
      },
      logLines: [],
      level: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getServerList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestory() {},
  destroyed() {},
  methods: {
    getServerList() {
      let _this = this;
      let param = {
        status: 'startup'
      };
      this.$api.framework.server.getServerList(param).then(res => {
        if (res.Status === 'OK') {
          let tbodyList = res.Return.tbodyList;
          tbodyList.forEach(item => {
            _this.serverSelectSetting.dataList.push({
              value: item.serverId,
              text: item.serverId + ' (' + item.host + ')'
            });
          });
          _this.serverSelectSetting.value = res.Return.currentServerId;
          this.handleChangeServerId(res.Return.currentServerId);
        }
      });
    },
    handleChangeServerId(serverId) {
      this.searchParam.fileName = null;
      this.searchParam.fileSize = null;
      this.logLines = [];
      if (serverId != null) {
        this.searchParam.serverId = serverId;
      } else {
        this.searchParam.serverId = null;
        this.level = null;
      }
      this.getLogFileNameList();
    },
    getLogFileNameList() {
      let _this = this;
      _this.fileNameSelectSetting.value = null;
      _this.fileNameSelectSetting.dataList = [];
      if (this.searchParam && this.searchParam.serverId != null) {
        this.$api.framework.log.getLogFileNameList(this.searchParam).then(res => {
          _this.level = res.Return.level;
          let tbodyList = res.Return.tbodyList;
          tbodyList.forEach(item => {
            _this.fileNameSelectSetting.dataList.push({
              value: item.fileName,
              text: item.fileName + ' (' + item.fileSize + ')'
            });
          });
        });
      }
    },
    handleChangeFileName(fileName) {
      if (fileName != null) {
        this.searchParam.fileName = fileName;
        this.getLogContent(false);
      } else {
        this.searchParam.fileName = null;
        this.searchParam.fileSize = null;
        this.logLines = [];
      }
    },
    getLogContent(isRefresh) {
      if (this.searchParam && this.searchParam.serverId != null && this.searchParam.fileName != null) {
        this.$api.framework.log.getLogContent(this.searchParam).then(res => {
          if (res.Return.isRefresh == 1) {
            let logData = res.Return.content;
            this.logLines = logData.split('\n');
            this.searchParam.fileSize = res.Return.fileSize;
            if (isRefresh) {
              this.$Message.success(this.$t('message.refreshsuccess'));
            }
          } else {
            if (isRefresh) {
              this.$Message.success(this.$t('message.nothingchange'));
            }
          }
        });
      }
    },
    getLineClass(line) {
      if (line.includes('\tat neatlogic')) {
        return 'text-error';
      }
    },
    refreshLog() {
      this.getLogContent(true);
    },
    exportLog() {
      let param = {
        url: 'api/binary/log/file/export',
        params: this.searchParam
      };
      this.download(param);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>

</style>
