<template>
  <div>
    <div v-if="rows.length" class="pb-nm">
      <TsTable :fixedHeader="false" :theadList="paramTheadList" :tbodyList="rows">
        <template v-slot:value="{ row }">
          <span v-if="fileDownload && row.value && (row.type === 'filepath' || row.type === 'file')" class="cursor">
            <span v-if="row.source.isDownloadFileLoding" class="action-item disable" :title="$t('page.downloadloadingtip')">
              <Icon type="ios-loading" size="18" class="loading"></Icon>
              {{ $t('page.downloading') }}
            </span>
            <span v-if="row.value && Array.isArray(row.value)">
              <span v-for="(file, findex) in row.value" :key="findex">
                <span v-if="!row.source.isDownloadFileLoding" v-download="fileDownload(row.source, file)" class="text-href">{{ file }}</span>
                <br />
              </span>
            </span>
            <span v-else>
              <span v-if="!row.source.isDownloadFileLoding" v-download="fileDownload(row.source, row.value)" class="text-href">{{ row.value }}</span>
            </span>
          </span>
          <div v-else-if="row.type === 'userselect' && row._userList.length">
            <span v-for="(user,uindex) in row._userList" :key="uindex">
              <UserCard v-bind="getConfig(user)"></UserCard>
              <span v-if="row._userList.length - 1 > uindex">、</span>
            </span>
          </div>
          <div v-else-if="row.value != null" style="max-width: 500px" class="overflow">
            <Poptip
              word-wrap
              width="500"
              trigger="hover"
              transfer
              :disabled="!row._isJsonValue && row.text.length <= 40"
            >
              <div slot="content" style="max-height: 350px;overflow: auto;">
                <span v-if="!row._isJsonValue" :class="row.type === 'textarea'?'pre':''">{{ row.value }}</span>
                <JsonViewer
                  v-else
                  class="popTipContent"
                  copyable
                  :expand-depth="5"
                  :value="row._jsonValue"
                ></JsonViewer>
              </div>
              <span :class="row.type === 'textarea'?'pre':''">{{ row.text.length > 40 ? row.text.slice(0, 40) + '...' : row.text }}</span>
            </Poptip>
          </div>
          <span v-else class="text-tip">null</span>
        </template>
      </TsTable>
    </div>

    <div v-if="argument && argument.valueList && argument.valueList.length" class="extrainfo-detail bg-op padding radius-lg">
      <div class="pb-sm"><span style="font-weight:bold">{{ $t('term.autoexec.freeparameter') }}</span><span class="pl-sm text-grey">{{ argument.description }}</span></div>
      <div class="content-grid">
        <div class="item">
          <div class="content">
            <div v-for="(arg, idx) in argument.valueList" :key="idx" class="pb-sm">
              <span>{{ arg }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    JsonViewer: () => import('vue-json-viewer'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  directives: { download },
  props: {
    paramList: {type: Array, default: () => []},
    argument: Object,
    fileDownload: Function
  },
  data() {
    return {
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
      ]
    };
  },
  computed: {
    // 预览使用派生行，文件下载状态仍由原作业行维护。
    rows() {
      return (this.paramList || []).map(source => {
        const value = source.value;
        let parsed = value;
        if (typeof value === 'string' && /^\s*(?:\[|\{)/.test(value)) {
          try {
            parsed = JSON.parse(value);
          } catch {
            // 普通文本也可能以括号开头，此时直接展示原文。
          }
        }
        const users = Array.isArray(parsed) ? parsed.filter(user => typeof user === 'string' && user.includes('#')) : [];
        return {...source, source, text: typeof value === 'string' ? value : JSON.stringify(value) || '',
          _isJsonValue: parsed !== null && typeof parsed === 'object', _jsonValue: parsed, _userList: users};
      });
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
  }
};
</script>
<style lang="less" scoped>
::v-deep .tstable-container {
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
