
<template>
  <div class="compare">
    <div v-if="config.inputParamList && config.inputParamList.length > 0" class="item-list">
      <div class="text-title mb-md">{{ $t('page.inputparam') }}</div>
      <TsTable
        :theadList="theadList"
        :tbodyList="config.inputParamList"
        :showPager="false"
        classKey="changeType"
      >
        <template v-slot:defaultValue="{row}">
          <div>
            <div v-if="row.type == 'userselect'">
              <span v-for="(user,uindex) in row.defaultValue" :key="uindex">
                <UserCard v-bind="getConfig(user)"></UserCard>
                <span v-if="row.defaultValue.length-1 > uindex">、</span>
              </span>
            </div>
            <div v-else>
              {{ setText(row) }}
            </div>
          </div>
        </template>
        <template v-slot:isRequired="{row}">
          <div>{{ row.isRequired == 1 ? $t('page.yes') : $t('page.no') }}</div>
        </template>
      </TsTable>
    </div>
    <div v-if="config.outputParamList && config.outputParamList.length > 0" class="item-list">
      <div class="text-title mb-md">{{ $t('page.outputparam') }}</div>
      <TsTable
        :theadList="theadList"
        :tbodyList="config.outputParamList"
        :showPager="false"
        classKey="changeType"
      >
        <template v-slot:defaultValue="{row}">
          <div>
            {{ setText(row) }}
          </div>
        </template>
        <template v-slot:isRequired="{row}">
          <div>{{ row.isRequired == 1 ? $t('page.yes') : $t('page.no') }}</div>
        </template>
      </TsTable>
    </div>
    <div v-if="config.argument && !$utils.isEmpty(config.argument)" class="item-list">
      <div class="text-title mb-md">{{ $t('term.autoexec.freeparameter') }}</div>
      <TsTable
        :theadList="argumentTheadList"
        :tbodyList="[config.argument]"
        :showPager="false"
        classKey="changeType"
      >
        <template v-slot:argumentCount="{row}">
          <div v-if="row.argumentCount">{{ row.argumentCount }}</div>
          <div v-else>{{ $t('page.notlimit') }}</div>
        </template>
        <template v-slot:isRequired="{row}">
          <div>{{ row.isRequired == 1 ? $t('page.yes') : $t('page.no') }}</div>
        </template>
      </TsTable>
    </div>
    <!-- <div class="item-list">
      <div class="text-title mb-md">脚本编码</div>
      <div v-html="config.encoding"></div>
    </div> -->
    <div class="item-list">
      <div class="text-title mb-md">{{ $t('term.autoexec.scriptparser') }}</div>
      <div v-html="config.parser"></div>
    </div>
    <div class="item-list">
      <div class="text-title mb-md">{{ $t('term.autoexec.dependenttool') }}</div>
      <template v-if="!$utils.isEmpty(config.useLibName)">
        <div v-for="(item,index) in config.useLibName" :key="index">
          <span v-html="item"></span>
        </div>
      </template>
    </div>
    <div class="item-list">
      <div class="text-title mb-md">{{ $t('term.autoexec.scriptcontent') }}</div>
      <div v-if="!$utils.isEmpty(config.lineList) && !config.packageFile" class="line-box bg-code radius-sm">
        <div v-for="(item,index) in config.lineList" :key="index">
          <div :class="'bg-'+item.changeType" class="item-content" v-html="item.content"></div>
        </div>
      </div>
      <div v-else-if="!$utils.isEmpty(config.packageFile)">
        <!-- 上传文件 -->
        <span class="tsfont-attachment"></span>
        <span class="overflow pr-xs pl-xs">
          <span v-html="config.packageFile.name"></span>
        </span>
        <i
          v-download="downloadFile(config.packageFile)"
          class="tsfont-download text-action"
          :title="$t('page.download')"
        ></i>
      </div>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  directives: { download },
  filters: {},
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      theadList: [
        { title: this.$t('page.englishname'), key: 'key' },
        { title: this.$t('page.chinesename'), key: 'name' },
        { title: this.$t('page.type'), key: 'typeText' },
        { title: this.$t('page.defaultvalue'), key: 'defaultValue' },
        { title: this.$t('page.description'), key: 'description' },
        { title: this.$t('page.isrequired'), key: 'isRequired' }
      ],
      argumentTheadList: [
        { title: this.$t('page.name'), key: 'name' },
        { title: this.$t('page.defaultvalue'), key: 'defaultValue' },
        { title: this.$t('page.quantitylimit'), key: 'argumentCount' },
        { title: this.$t('page.description'), key: 'description' },
        { title: this.$t('page.isrequired'), key: 'isRequired' }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  computed: {
    setText() {
      return function(row) {
        let text = '';
        if (row.type == 'node') {
          if (row.defaultValue && row.defaultValue.length > 0) {
            let nodeList = row.defaultValue.map(i => {
              return i.port && i.name ? i.ip + ':' + i.port + '/' + i.name : i.port && !i.name ? i.ip + ':' + i.port : i.ip;
            });
            text = nodeList.join('，');
          } else {
            text = '';
          }
        } else if (row.type == 'file') {
          if (row.defaultValue && row.defaultValue.fileList && row.defaultValue.fileList.length > 0) {
            let fileList = row.defaultValue.fileList.map(i => {
              return i.name;
            });
            text = fileList.join('，');
          } else {
            text = '';
          }
        } else {
          text = row.defaultValue;
        }
        return text;
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
    },
    downloadFile() {
      return (item) => {
        let params = {
          id: item.id
        };
        return {
          url: '/api/binary/file/download',
          params: params
        };
      };
    }
  },
  watch: {}
};
</script>
<style  lang="less" scoped>
@import '~@/resources/assets/css/compare.less';
.item-list {
  padding-bottom: 16px;
}
.line-box {
  padding: 16px 0;
  .item-content {
    padding: 0 16px;
    min-height: 16px;
  }
}
</style>
