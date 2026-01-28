<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsFormItem :label="$t('term.framework.pkgversion')" labelPosition="left" required>
            <TsFormInput
              ref="version"
              v-model="version"
              :validateList="versionValidateList"
              border="border"
              maxlength="50"
              width="50%"
            ></TsFormInput>
          </TsFormItem>
          <Alert v-if="errList.length" type="warning" show-icon>
            <div>{{ $t('page.reason') }}</div>
            <template slot="desc">
              <div v-for="(item, index) in errList" :key="index" class="text-danger mt-sm">{{ item.text }}</div>
            </template>
          </Alert>
          <TsTable
            :theadList="theadList"
            :tbodyList="tbodyList"
            keyName="id"
          >
            <template v-slot:envScenario="{ row }">
              <div style="while-space:normal">
                <Tag v-for="(envscenario, index) in row.envScenarioList" :key="index">{{ envscenario.envName }}（{{ envscenario.scenarioName }}）</Tag>
              </div>
            </template>
            <template v-slot:version="{ row }">
              <TsFormSelect
                :value="row.versionId"
                v-bind="getVersionSelectConfig(row)"
                :readonly="true"
              ></TsFormSelect>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    appSystemModuleVersionList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tbodyList: [],
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium',
        title: '批量修改版本号'
      },
      versionValidateList: ['key-special', 'required'],
      version: '',
      theadList: [
        { key: 'appSystemAbbrName', title: this.$t('page.apply') },
        { key: 'appModuleAbbrName', title: this.$t('page.module') },
        { key: 'envScenario', title: this.$t('term.deploy.envscene') },
        { key: 'version', title: this.$t('page.versions')}
      ],
      jobTemplateVersionMap: {},
      errList: []
    };
  },
  beforeCreate() {},
  created() {
    this.initTbodyList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initTbodyList() {
      this.tbodyList = this.$utils.deepClone(this.appSystemModuleVersionList);
    },
    async okDialog() {
      if (!this.$refs.version.valid()) {
        return;
      }
      await this.changeVersion();
      if (this.$utils.isEmpty(this.jobTemplateVersionMap) || this.errList.length) {
        return;
      }
      this.$emit('close', this.jobTemplateVersionMap);
    },
    closeDialog() {
      this.$emit('close');
    },
    getVersionSelectConfig(jobTemplate) {
      return {
        dynamicUrl: '/api/rest/deploy/version/search',
        params: {
          appSystemIdList: [jobTemplate.appSystemId],
          appModuleIdList: [jobTemplate.appModuleId]
        },
        rootName: 'tbodyList',
        transfer: true,
        search: true,
        dealDataByUrl: this.dealDataFilter,
        firstSelect: false,
        firstText: this.$t('page.versions'),
        firstLi: true
      };
    },
    dealDataFilter(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];
      nodeList.forEach(v => {
        let text = v.version;
        if (v.isFreeze) {
          text += this.$t('term.deploy.sealededition');
        } else {
          text;
        }
        columlist.push({
          text: text,
          value: v.id,
          _disabled: v.isFreeze
        });
      });
      columlist.sort((d1, d2) => {
        return d1._disabled - d2._disabled;
      });
      return columlist;
    },
    changeVersion() {
      this.jobTemplateVersionMap = {};
      this.errList = [];
      if (this.version) {
        const valueList = this.tbodyList.map(item => {
          return item.id;
        });
        let data = {
          jobTemplateIdList: valueList,
          version: this.version
        };
        return this.$api.deploy.pipeline.getJobTemplateVersionList(data).then(res => {
          if (res.Status === 'OK') {
            this.jobTemplateVersionMap = res.Return || {};
            this.tbodyList.forEach(item => {
              if (this.jobTemplateVersionMap[item.id]) {
                item.versionId = this.jobTemplateVersionMap[item.id];
              } else {
                this.errList.push({
                  text: item.appSystemAbbrName + '/' + item.appModuleAbbrName + '不存在该版本号'
                });
              }
            });
          }
        });
      }
    }
  },
  filter: {},
  computed: {
   
  },
  watch: {}
};
</script>
<style lang="less">
</style>
