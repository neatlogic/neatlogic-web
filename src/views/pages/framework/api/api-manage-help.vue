<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div>
        <Tabs
          v-if="rowData.isMcp"
          v-model="activeTab"
          :animated="false"
          class="mb-md"
        >
          <TabPane :label="$t('term.framework.apihelp')" name="api"></TabPane>
          <TabPane :label="$t('term.framework.mcpdescription')" name="mcp"></TabPane>
        </Tabs>
        <div v-if="!rowData.isMcp || activeTab === 'api'">
          <div v-if="Object.keys(helpData).length">
            <TsFormItem :label="$t('page.interface')" :labelWidth="80">
              <strong>{{ rowData.url }}</strong>
            </TsFormItem>
            <TsFormItem
              v-if="helpData.description"
              :label="$t('page.description')"
              :labelWidth="80"
            >
              {{ helpData.description }}
            </TsFormItem>
            <TsFormItem
              v-if="helpData.input"
              :label="$t('page.inputparam')"
              :labelWidth="80"
            >
              <Table size="small" :columns="inputColumns" :data="helpData.input"></Table>
            </TsFormItem>
            <TsFormItem
              v-if="helpData.output"
              :label="$t('page.outputparam')"
              :labelWidth="80"
            >
              <Table
                size="small"
                row-key="id"
                :columns="outputColumns"
                :data="helpData.output"
              ></Table>
            </TsFormItem>
            <TsFormItem
              v-if="helpData.example && helpData.example.length"
              :label="$t('term.framework.apiexample')"
              :labelWidth="80"
            >
              <ApiExampleTabs :examples="helpData.example" :interfaceKey="rowData.token"></ApiExampleTabs>
            </TsFormItem>
          </div>
          <div v-else>{{ helpMessage }}</div>
        </div>
        <div v-if="rowData.isMcp && activeTab === 'mcp'">
          <div v-if="Object.keys(mcpHelpData).length">
            <TsFormItem :label="$t('page.interface')" :labelWidth="100">
              <strong>{{ mcpHelpData.title || rowData.name || '-' }}</strong>
            </TsFormItem>
            <TsFormItem :label="$t('term.framework.availablestatus')" :labelWidth="100">
              <span v-if="mcpHelpData.available" class="text-success">{{ $t('term.framework.available') }}</span>
              <span v-else class="text-error">{{ mcpHelpData.unavailableReason || $t('term.framework.unavailable') }}</span>
            </TsFormItem>
            <TsFormItem :label="$t('term.framework.calladdress')" :labelWidth="100">
              <span>{{ mcpHelpData.endpoint || '-' }}</span>
              <span v-if="mcpHelpData.endpoint" class="text-action tsfont-copy mcp-copy" @click="copyText(mcpHelpData.endpoint)">{{ $t('page.copy') }}</span>
            </TsFormItem>
            <TsFormItem :label="$t('term.framework.moduleaddress')" :labelWidth="100">
              <span>{{ mcpHelpData.scopedEndpoint || '-' }}</span>
              <span v-if="mcpHelpData.scopedEndpoint" class="text-action tsfont-copy mcp-copy" @click="copyText(mcpHelpData.scopedEndpoint)">{{ $t('page.copy') }}</span>
            </TsFormItem>
            <TsFormItem :label="$t('term.framework.head')" :labelWidth="100">
              <JsonViewer boxed copyable :value="mcpHelpData.requestHeaders || {}"></JsonViewer>
            </TsFormItem>
            <TsFormItem :label="$t('term.framework.toolname')" :labelWidth="100">
              <span>{{ mcpHelpData.toolName || '-' }}</span>
              <span v-if="mcpHelpData.toolName" class="text-action tsfont-copy mcp-copy" @click="copyText(mcpHelpData.toolName)">{{ $t('page.copy') }}</span>
            </TsFormItem>
            <TsFormItem :label="$t('term.framework.interfaceid')" :labelWidth="100">
              <span>{{ mcpHelpData.token || '-' }}</span>
            </TsFormItem>
            <TsFormItem :label="$t('page.module')" :labelWidth="100">
              <span>{{ mcpHelpData.moduleGroupName || mcpHelpData.moduleGroup || '-' }}</span>
            </TsFormItem>
            <TsFormItem v-if="mcpHelpData.description" :label="$t('page.description')" :labelWidth="100">
              {{ mcpHelpData.description }}
            </TsFormItem>
            <TsFormItem v-if="isDangerousTool" :label="$t('term.framework.risktip')" :labelWidth="100">
              <div class="text-warning">{{ $t('term.framework.mcpdangeroustooltip') }}</div>
            </TsFormItem>
            <TsFormItem :label="$t('term.framework.inputschema')" :labelWidth="100">
              <JsonViewer boxed copyable :value="mcpHelpData.inputSchema || {}"></JsonViewer>
            </TsFormItem>
            <TsFormItem :label="$t('term.framework.outputschema')" :labelWidth="100">
              <JsonViewer boxed copyable :value="mcpHelpData.outputSchema || {}"></JsonViewer>
            </TsFormItem>
            <TsFormItem :label="$t('term.framework.toolannotations')" :labelWidth="100">
              <JsonViewer boxed copyable :value="mcpHelpData.annotations || {}"></JsonViewer>
            </TsFormItem>
            <TsFormItem :label="$t('term.framework.metadata')" :labelWidth="100">
              <JsonViewer boxed copyable :value="mcpHelpData.meta || {}"></JsonViewer>
            </TsFormItem>
            <TsFormItem v-if="mcpHelpData.callToolExamples && mcpHelpData.callToolExamples.length" :label="$t('term.framework.toolcallexample')" :labelWidth="100">
              <ApiExampleTabs
                :examples="mcpHelpData.callToolExamples"
                :interfaceKey="rowData.token"
              ></ApiExampleTabs>
            </TsFormItem>
          </div>
          <div v-else>{{ mcpHelpMessage }}</div>
        </div>
      </div>
    </template>
  </TsDialog>
</template>

<script>
export default {
  name: 'ApiHelp',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    ApiExampleTabs: () => import('./api-example-tabs.vue'),
    JsonViewer: () => import('vue-json-viewer')
  },
  props: {
    rowData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.framework.apihelp'),
        type: 'slider',
        isShow: true,
        maskClose: true,
        width: 'large',
        hasFooter: false
      },
      activeTab: 'api',
      helpData: {},
      helpMessage: '',
      mcpHelpData: {},
      mcpHelpMessage: '',
      inputColumns: Object.freeze([
        { title: this.$t('page.name'), key: 'name' },
        { title: this.$t('page.description'), key: 'description' },
        { title: this.$t('page.type'), key: 'type' },
        { title: this.$t('page.rule'), key: 'rule' },
        {
          title: this.$t('page.isrequired'),
          key: 'isRequired',
          width: 100,
          render: (h, params) => {
            if (params.row.isRequired) {
              return h('div', { class: 'text-success' }, this.$t('page.yes'));
            } else {
              return h('div', { class: 'text-grey' }, this.$t('page.no'));
            }
          }
        },
        { title: this.$t('page.maxlength'), key: 'maxLength' },
        { title: this.$t('page.explain'), key: 'help' }
      ]),
      outputColumns: Object.freeze([
        { title: this.$t('page.name'), key: 'name', tree: true },
        { title: this.$t('page.description'), key: 'description' },
        { title: this.$t('page.type'), key: 'type' },
        { title: this.$t('page.explain'), key: 'help' }
      ])
    };
  },
  created() {
    // eslint-disable-next-line generator-star-spacing
    this.counter = (function* () {
      let i = 1;
      while (true) yield i++;
    })();
    this.getHelpData(this.rowData);
    if (this.rowData.isMcp) {
      this.getMcpHelp();
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    getHelpData({ helpUrl }) {
      this.helpMessage = this.$t('page.loadingtip');
      //help接口返回无return层和status层
      return this.$api.framework.apiManage
        .help(helpUrl)
        .then(res => {
          this.helpData = this.addId(res);
          if (!Object.values(this.helpData).length) {
            this.helpMessage = this.$t('message.framework.notapihelp', { target: this.rowData.token });
          }
        })
        .catch(error => {
          this.$Notice.error({ title: this.$t('message.framework.apihelperror'), desc: error });
          this.helpMessage = this.$t('message.framework.apihelperror');
        });
    },
    getMcpHelp() {
      this.mcpHelpMessage = this.$t('page.loadingtip');
      return this.$api.framework.apiManage
        .getMcpHelp({ token: this.rowData.token })
        .then(res => {
          if (res.Status === 'OK') {
            this.mcpHelpData = res.Return || {};
          }
          if (!Object.keys(this.mcpHelpData).length) {
            this.mcpHelpMessage = this.$t('term.framework.mcphelploadfailed');
          }
        })
        .catch(error => {
          this.mcpHelpMessage = error && error.data ? error.data.Message : this.$t('term.framework.mcphelploadfailed');
        });
    },
    copyText(text) {
      this.$utils.copyText('', text);
    },
    addId(res) {
      // https://www.iviewui.com/components/table#SXSJ
      // table组件使用树形数据时，必须指定 row-key，比如 id
      // id必须唯一，不能重复，不然控制台会提示key重复的报错，而且鼠标悬浮高亮行会出错
      // 这里用生成器counter给有children的output表格数据添加唯一的id
      if (!res.output) return res;
      res.output.forEach(item => {
        item.id = this.counter.next().value;
        if (item.children) {
          item.children.forEach(child => {
            child.id = this.counter.next().value;
          });
        }
      });
      return res;
    }
  },
  computed: {
    isDangerousTool() {
      return this.mcpHelpData.annotations && this.mcpHelpData.annotations.readOnlyHint !== true;
    }
  }
};
</script>

<style lang="less" scoped>
.mcp-copy {
  margin-left: 8px;
}
</style>
