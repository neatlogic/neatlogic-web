
<template>
  <TsContain>
    <template v-slot:navigation>
      <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
    </template>
    <template v-slot:topLeft>
      <div class="action-group">
        <span v-if="!downloadLoading" v-download="exportWord" class="tsfont-export action-item">{{ $t('term.autoexec.libraryusageinstructions') }}</span>
        <span v-if="downloadLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
          <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
          {{ $t('term.autoexec.libraryusageinstructions') }}
        </span>
      </div>
    </template>
    <template v-slot:topRight>
      <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="getPage(1)"></CombineSearcher>
    </template>
    <template v-slot:content>
      <Loading :loadingShow="showLoading" type="fix"></Loading>
      <div>
        <TsCard
          v-bind="cardData"
          :padding="false"
          :fixBtn="true"
          :boxShadow="false"
          @updatePage="getPage"
        >
          <template slot-scope="{ row }">
            <div class="cursor-pointer" @click="gotoDetail(row)">
              <div class="name-title overflow tsfont-tool pb-sm tex-action" :title="row.name">{{ row.name }}</div>
              <div class="content-detail pb-sm">
                <RiskItem v-if="row.riskVo" :text="row.riskVo.name" :color="row.riskVo.color"></RiskItem>
                <Tag>
                  <div class="overflow" :title="row.typeName">{{ row.typeName }}</div>
                </Tag>
                <Tag>
                  <div class="overflow" :title="row.execModeText">{{ row.execModeText }}</div>
                </Tag>
              </div>
              <div class="overflow text-tip tool-des" :title="row.description">{{ row.description }}</div>
            </div>
            <div v-if="getIsActive(row.operateList)" class="active-btn" @click.stop>
              <TsFormSwitch
                v-model="row.isActive"
                :true-value="1"
                :false-value="0"
                :disabled="getIsActive(row.operateList).disabled ? true : false"
                :title="getIsActive(row.operateList).disabledReason"
                @on-change="toggleAction(row)"
              ></TsFormSwitch>
            </div>
          </template>
          <template v-slot:control="{ row }">
            <template v-for="operate in row.operateList">
              <div
                v-if="operate.value != 'active'"
                :key="operate.value"
                class="action-item"
                :class="getIcon(operate.value, operate)"
                :title="operate.disabledReason"
                @click.stop="doAction(row, operate.value)"
              >{{ operate.text }}</div>
            </template>
          </template>
        </TsCard>
      </div>

      <TsDialog
        v-if="isShow"
        :isShow.sync="isShow"
        @on-close="close()"
        @on-ok="saveAction()"
      >
        <template v-slot:header>
          <div>{{ $t('term.autoexec.publishcombinetool') }}</div>
        </template>
        <template v-slot>
          <div>
            <TsForm ref="settingForm" v-model="settingConfig" :itemList="settingForm"></TsForm>
          </div>
        </template>
      </TsDialog>
    </template>
  </TsContain>
</template>
<script>
import download from '@/resources/directives/download.js';
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue';
import RiskItem from '../components/risk-item.vue';
export default {
  name: 'ToolManage',
  components: {
    CombineSearcher,
    RiskItem,
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  filters: {},
  directives: { download },
  props: {},
  data() {
    return {
      downloadLoading: false,
      showLoading: true,
      searchVal: {},
      searchParam: { pageSize: 24, currentPage: 1 },
      cardData: {},
      statusConfig: {
        'true-value': 1,
        'false-value': 0
      },
      searchConfig: {
        placeholder: this.$t('page.insert') + this.$t('page.name') + '、' + this.$t('page.description'),
        searchList: [
          {
            type: 'select',
            name: 'typeIdList',
            label: this.$t('term.autoexec.toolclassification'),
            placeholder: this.$t('page.pleaseselect'),
            search: true,
            multiple: true,
            dynamicUrl: '/api/rest/autoexec/type/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getToolClassificationList,
            transfer: true
          },
          {
            type: 'select',
            name: 'execMode',
            label: this.$t('page.executionmode'),
            placeholder: this.$t('page.pleaseselect'),
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'ScriptExecMode' },
            transfer: true
          },
          {
            type: 'select',
            name: 'riskIdList',
            label: this.$t('term.autoexec.operationlevel'),
            placeholder: this.$t('page.pleaseselect'),
            multiple: true,
            dynamicUrl: '/api/rest/autoexec/risk/list',
            transfer: true
          },
          {
            type: 'select',
            name: 'isActive',
            label: this.$t('page.status'),
            placeholder: this.$t('page.pleaseselect'),
            dataList: [
              {
                text: this.$t('page.enable'),
                value: 1
              },
              {
                text: this.$t('page.disable'),
                value: 0
              }
            ],
            transfer: true
          },
          {
            type: 'select',
            name: 'customTemplateIdList',
            label: this.$t('page.customtemplate'),
            dynamicUrl: '/api/rest/autoexec/customtemplate/search',
            params: {isActive: 1},
            rootName: 'tbodyList',
            dealDataByUrl: this.dealTemplateData,
            multiple: true,
            transfer: true
          }
        ]
      },
      actionIcons: {
        generateToCombop: 'tsfont-tool',
        copy: 'tsfont-copy',
        export: 'tsfont-export',
        delete: 'tsfont-trash-o',
        test: 'tsfont-test'
      },
      isShow: false,
      settingConfig: {
        name: '',
        typeId: '',
        description: ''
      },
      settingForm: [
        {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          validateList: ['required', 'name-special', { name: 'searchUrl', url: '/api/rest/autoexec/combop/basic/info/save', key: 'name', message: this.$t('message.targetisexists', {target: this.$t('page.name')}) }]
        },
        {
          type: 'select',
          name: 'typeId',
          value: '',
          dataList: [],
          label: this.$t('term.autoexec.toolclassification'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          validateList: ['required'],
          search: true,
          dynamicUrl: '/api/rest/autoexec/type/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getToolClassificationList,
          transfer: true
        },
        {
          type: 'textarea',
          name: 'description',
          value: '',
          label: this.$t('page.description'),
          transfer: true,
          maxlength: 500
        }
      ],
      operationId: null,
      pageSize: 24
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.$route.query.typeId) {
      let typeId = parseInt(this.$route.query.typeId);
      this.$set(this.searchVal, 'typeIdList', [typeId]);
    }
    this.searchTools();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    restoreHistory(historyData) {
      this.searchParam = historyData['searchParam'];
      this.searchVal = historyData['searchVal'];
    },
    searchTools(currentPage) {
      this.searchParam = { pageSize: this.pageSize };
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      if (this.searchVal && Object.keys(this.searchVal).length) {
        Object.assign(this.searchParam, this.searchVal);
      }
      this.$addHistoryData('searchParam', this.searchParam);
      this.$addHistoryData('searchVal', this.searchVal);
      this.$api.autoexec.tool
        .getToolList(this.searchParam)
        .then(res => {
          if (res && res.Status == 'OK' && Object.keys(res.Return).length) {
            this.cardData = res.Return;
          }
        })
        .finally(res => {
          this.showLoading = false;
        });
    },
    getPage(page) {
      if (page) {
        this.searchTools(page);
      }
    },
    doAction(row, type) {
      if (!type) {
        return;
      }
      if (type == 'generateToCombop') {
        this.publishRow(row);
      } else if (type == 'test') {
        this.testRow(row);
      }
    },
    publishRow(row) {
      if (row.disabled) {
        return;
      }
      this.operationId = row.id;
      Object.keys(this.settingConfig).forEach(key => {
        let i = row[key];
        this.settingConfig[key] = i;
      });
      this.isShow = true;
    },
    testRow(row) {
      //跳转到测试页面
      this.$router.push({
        path: '/test-detail',
        query: {
          id: row.id,
          type: 'tool',
          execMode: row.execMode
        }
      });
    },
    toggleAction(row) {
      let param = {
        id: row.id,
        isActive: row.isActive
      };
      this.$api.autoexec.tool.updateToolStatus(param).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess')); //保存成功
        }
      });
    },
    close() {
      this.isShow = false;
    },
    saveAction() {
      if (!this.$refs.settingForm.valid()) {
        return;
      }
      let data = {
        operationId: this.operationId,
        operationType: 'tool',
        ...this.settingConfig
      };
      this.$api.autoexec.script
        .generateAction(data)
        .then(res => {
          if (res.Status == 'OK' && res.Return) {
            this.$router.push({
              path: '/action-detail',
              query: {
                id: res.Return,
                versionStatus: 'passed'

              }
            });
          }
        })
        .finally(() => {
          this.isShow = false;
        });
    },
    gotoDetail(row) {
      this.$router.push({
        path: '/tool-detail',
        query: { id: row.id }
      });
    },
    dealTemplateData(list) {
      let dataList = [
        {
          text: this.$t('term.autoexec.alltemplates'),
          value: 0
        }
      ];
      if (list && list.length > 0) {
        list.forEach(item => {
          if (item.name && item.id) {
            dataList.push({
              text: item.name,
              value: item.id
            });
          }
        });
      }
      return dataList;
    }
  },
  computed: {
    getIcon() {
      return function(type, item) {
        let className = this.actionIcons[type] || 'tsfont-tool';
        if (item.disabled) {
          className += ' disable';
        }
        return className;
      };
    },
    getIsActive() {
      return function(val) {
        let obj = val.find(item => {
          return item.value == 'active';
        });
        return obj;
      };
    },
    exportWord() {
      // 导出参数说明
      return {
        url: '/api/binary/autoexec/tool/param/export',
        method: 'post',
        params: {toolId: null, isAll: 1}, // isAll: 1 表示全量
        changeStatus: status => {
          if (status == 'start') {
            this.downloadLoading = true;
          } else if (status == 'success' || status == 'error') {
            this.downloadLoading = false;
          }
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.name-title {
  padding-right: 30px;
  &:before {
    margin-right: 8px;
    font-size: 16px;
  }
}
.content-detail {
  display: flex;
  justify-content: flex-start;
  white-space: nowrap;
  align-items: center;
}
.content-detail {
  display: flex;
  justify-content: flex-start;
  white-space: nowrap;
  align-items: center;
}
.active-btn {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>
