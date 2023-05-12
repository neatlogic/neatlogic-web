<template>
  <div class="node-code padding radius-lg" :style="{ '--height': offsetHeight }">
    <div style="text-align:right" class="mb-nm action-group">
      <span class="padding-xs tsfont-copy cursor-pointer" :title="$t('page.copy')" @click="onCopy"></span>
      <span
        v-if="!isDownloading"
        v-download="downloadConfig"
        class="padding-xs tsfont-download cursor-pointer"
        :title="$t('page.download')"
      ></span>
      <span v-else><Icon type="ios-loading" size="16" class="loading"></Icon></span>
      <span v-if="encodeList.length" class="action-item">
        <Dropdown trigger="click">
          <span class="tsfont-down">{{ encoding }}</span>
          <template slot="list">
            <DropdownMenu>
              <DropdownItem
                v-for="(item,index) in encodeList"
                :key="index"
                :disabled="encoding==item"
                @click.native="changeEncoding(item)"
              >{{ item }}</DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
      </span>
    </div>
    <div>
      <TsCodemirror :value="content" :is-read-only="true"></TsCodemirror>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
import NodeLog from '../logcomponents/node-log.vue';
export default {
  name: '',
  components: {
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror.vue'], resolve)
  },
  directives: { download },
  filters: {},
  extends: NodeLog,
  props: {
  },
  data() {
    return {
      content: '',
      encodeList: [], //编码列表
      encoding: 'UTF-8'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getJobEncodeList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
  },
  destroyed() {},
  methods: {
    getContent() {
      const param = {
        jobPhaseId: this.phaseData.id,
        resourceId: this.nodeData.resourceId,
        sqlName: this.nodeData.sqlFile,
        nodeId: this.nodeData.id,
        encoding: this.encoding
      };
      this.$api.autoexec.job
        .getSqlCode(param)
        .then(res => {
          if (res.Return && res.Return.lineList) {
            res.Return.lineList.forEach(c => {
              this.content += (c.content + '\n');
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    getJobEncodeList() {
      this.$api.autoexec.job.getJobEncodeList().then(res => {
        this.encodeList = res.Return || [];
      });
    },
    changeEncoding(item) {
      this.encoding = item;
      this.content = '';
      this.getContent();
    }
  },
  computed: {
    downloadConfig() {
      return {
        url: '/api/binary/autoexec/job/phase/node/sql/file/download',
        method: 'post',
        params: {
          jobPhaseId: this.phaseData.id,
          resourceId: this.nodeData.resourceId,
          nodeId: this.nodeData.id,
          sqlId: this.nodeData.id,
          sqlName: this.nodeData.sqlFile
        },
        changeStatus: status => {
          if (status == 'start') {
            this.isDownloading = true;
          } else if (status == 'success' || status == 'error') {
            this.isDownloading = false;
          }
        }
      };
    },
    offsetHeight() {
      return this.mode == 'page' ? this.isHasExtraInfo ? '310px' : '247px' : '165px';
    }
  },
  watch: {
  }
};
</script>
