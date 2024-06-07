
<template>
  <TsDialog
    v-if="isShow"
    v-bind="setting"
    :isShow="isShow"
    :bgOp="false"
    @on-close="close()"
    @on-cancel="close()"
    @on-ok="confirmAdd()"
  >
    <template v-slot>
      <div>
        <div class="clearfix">
          <div class="float-right" style="width:50%">
            <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="getScriptList(1)"></CombineSearcher>
          </div>
        </div>
        <div>
          <TsCard
            v-model="selectOperation"
            v-bind="cardConfig"
            :currentPage="currentPage"
            :pageSize="pageSize"
            :loading="loading"
            @updatePage="getScriptList"
            @getSelected="getSelected"
          >
            <template slot-scope="{ row }">
              <div :title="row.type && row.type == 'script' ? $t('term.autoexec.customtool') : $t('term.autoexec.tool')">
                <div class="risk-level" :style="{ color: row.riskVo.color, background: row.riskVo.color+'20'}">{{ row.riskVo.name }}</div>
                <div class="operation-li">
                  <div class="name-title overflow" :class="row.type && row.type == 'script' ? 'tsfont-script' : 'tsfont-tool'">
                    <span :title="row.name">{{ row.name }}</span>
                  </div>
                  <div class="text-tip tool-des overflow" :title="row.description">{{ row.description }}</div>
                </div>
              </div>
            </template>
          </TsCard>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue';
export default {
  name: 'OperationAdd',
  components: {
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    CombineSearcher
  },
  filters: {},
  props: {
    isShow: {
      type: Boolean,
      default: false,
      bgOp: true
    },
    type: {
      type: String
    },
    selectedOption: {
      type: Array
    },
    excludeList: Array
  },
  data() {
    return {
      setting: {
        maskClose: false,
        width: 'large',
        type: 'slider',
        bgOp: true,
        title: this.$t('dialog.title.addtarget', {target: this.$t('term.autoexec.tool')})
      },
      selectOperation: [], //选中的uk列表
      selectedItem: [], //选中的列表完整数据
      currentPage: 1,
      pageSize: 24,
      cardConfig: {
        span: 12,
        sm: 12,
        md: 12,
        lg: 8,
        xl: 8,
        xxl: 6,
        classKey: 'type',
        keyName: 'id',
        canSelect: true,
        cardList: []
      },
      loading: true,
      firstInit: true, //第一次初始化的时候需要加个判断不然会有个无数据的效果
      searchVal: {}, //搜索下拉插件的值
      isAutoAddFlag: false, // 用于判断，选择工具目录时，默认勾选自定义工具
      searchConfig: {
        search: true,
        placeholder: this.$t('term.autoexec.toolnamedescription'),
        searchList: [
          {
            type: 'radio',
            name: 'type',
            value: '',
            label: this.$t('page.category'),
            placeholder: this.$t('page.pleaseselect'),
            dataList: [
              {
                text: this.$t('term.autoexec.customtool'),
                value: 'script'
              },
              {
                text: this.$t('term.autoexec.tool'),
                value: 'tool'
              }
            ],
            transfer: true
          },
          {
            type: 'select',
            name: 'typeIdList',
            value: '',
            label: this.$t('term.autoexec.toolclassification'),
            placeholder: this.$t('page.pleaseselect'),
            search: true,
            multiple: true,
            dynamicUrl: '/api/rest/deploy/type/search',
            params: {isActive: 1},
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getToolClassificationList,
            transfer: true
          },
          {
            type: 'tree',
            name: 'catalogId',
            value: '',
            dataList: [],
            label: this.$t('term.autoexec.directorytool'),
            multiple: false,
            placeholder: this.$t('page.pleaseselect'),
            search: false,
            textName: 'name',
            valueName: 'id',
            transfer: true,
            width: '100%'
          },
          {
            type: 'select',
            name: 'riskIdList',
            value: '',
            label: this.$t('term.autoexec.operationlevel'),
            placeholder: this.$t('page.pleaseselect'),
            multiple: true,
            dynamicUrl: '/api/rest/autoexec/risk/list',
            transfer: true
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getScriptList();
    this.getTreeListSync();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getTreeListSync() {
      for (let i = 0; i < this.searchConfig.searchList.length; i++) {
        if (this.searchConfig.searchList[i].name == 'catalogId') {
          this.searchConfig.searchList[i].dataList = await this.$toolCatalogUtils.getTreeList();
        }
      }
    },
    close() {
      this.$emit('close');
    },
    async confirmAdd() {
      let _this = this;
      if (this.selectOperation && this.selectOperation.length) {
        //修改了，更新顺序+保留原来脚本的值
        let param = {
          defaultValue: this.selectOperation
        };
        await this.$api.autoexec.script.searchScriptToolList(param).then(res => {
          if (res && res.Status == 'OK') {
            let allList = res.Return.tbodyList || [];
            let newList = [];
            this.selectOperation.forEach(l => {
              let currentV = allList.find(a => { return a.id == l; });
              let uuid = this.$utils.setUuid();
              let defaulParam = [];
              if (currentV) {
                if (currentV.inputParamList && currentV.inputParamList.length) {
                  defaulParam = currentV.inputParamList.map(i => {
                    return {
                      type: i.isRequired ? 'constant' : !this.$utils.isEmpty(i.defaultValue) ? 'constant' : 'isempty',
                      name: i.key,
                      value: !this.$utils.isEmpty(i.defaultValue) ? i.defaultValue : ''
                    };
                  });
                }
                let item = {
                  'name': currentV.name,
                  'riskVo': currentV.riskVo,
                  'inputParamList': currentV.inputParamList || [],
                  'outputParamList': currentV.outputParamList || [],
                  'operationId': currentV.id,
                  'failPolicy': 'stop',
                  'operationType': currentV.type,
                  'description': currentV.description,
                  'config': {
                    'paramList': defaulParam
                  },
                  'uuid': uuid,
                  'argument': currentV.argument || null, //自由参数
                  'defaultProfileId': currentV.defaultProfileId || null //默认预置参数集
                };
                newList.push(item);
              }
            });
            _this.$emit('close', newList);
          }
        });
      } else {
        this.$emit('close', []);
      }
    },
    handleDisabledToolCatalog() {
      // 选择工具目录，自动勾选上自定义工具，选择工具，工具目录禁用
      if (this.searchVal) {
        if (this.searchVal.type == 'tool') {
          this.searchConfig.searchList.forEach((item) => {
            if (item.name == 'catalogId') {
              delete this.searchVal.catalogId;
              this.$set(item, 'disabled', true); // 禁用工具工具
            }
          });
        } else if (!this.searchVal.type || this.searchVal.type == 'script') {
          this.searchConfig.searchList.forEach((item) => {
            if (item.name == 'catalogId') {
              this.$set(item, 'disabled', false); // 不禁用工具目录
            }
          });
        }
      }
    },
    getScriptList(page) {
      let param = {
        execMode: this.type,
        currentPage: page || this.currentPage,
        pageSize: this.pageSize
      };
      this.handleDisabledToolCatalog();
      Object.assign(param, this.searchVal);
      if (this.searchVal) {
        // 有工具目录，默认勾选上自定义工具，删除工具目录时，自定义工具也需要删除，isAutoAddFlag标识是为了区分是是否是自动勾选上，自定义工具
        if (this.searchVal.catalogId) {
          param.type = 'script'; // 脚本
          param.catalogId = this.$toolCatalogUtils.handleCatalogIdAlltoZero(this.searchVal);
          this.$set(this.searchVal, 'type', 'script');
          this.isAutoAddFlag = true;
        } else if (!this.searchVal.catalogId && this.searchVal.type == 'script') {
          if (this.isAutoAddFlag) {
            delete this.searchVal.type;
            delete param.type;
            this.isAutoAddFlag = false;
          }
        }
      }
      if (!this.$utils.isEmpty(this.excludeList)) {
        this.$set(param, 'excludeList', this.excludeList);
      }

      this.loading = true;
      return this.$api.autoexec.script
        .searchScriptToolList(param)
        .then(res => {
          if (res && res.Status == 'OK') {
            this.$set(this.cardConfig, 'cardList', res.Return.tbodyList || []);
            this.$set(this.cardConfig, 'pageCount', res.Return.pageCount);
            this.$set(this.cardConfig, 'rowNum', res.Return.rowNum);
            this.currentPage = res.Return.currentPage || 1;
            this.pageSize = res.Return.pageSize || 24;
          }
        })
        .finally(res => {
          if (this.firstInit) {
            this.firstInit = false;
          }
          this.loading = false;
        });
    },
    getSelected(val, items) {
      this.selectedItem = items;
    }
  },
  computed: {},
  watch: {
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@warning-bg-color,@warning-color,@info-bg-color,@info-color){
  .tscard-container {
    .li-tool {
        &.li-selected {
          .tscard-body {
            border: 1px solid @info-color !important;
          }
        }
    }
    .li-script {
      .tscard-inner {
        .tscard-body {
          border: 1px solid transparent;
        }
      }
      &.li-selected {
        .tscard-inner {
          .tscard-body {
            border: 1px solid @info-color !important;
          }
        }
      }
    }
  }
}
html {
  .theme(@default-warning-bg-color,@default-warning-color,@default-info-bg-color,@default-info-color);
  &.theme-dark {
    .theme(@dark-warning-bg-color,@dark-warning-color,@dark-info-bg-color,@dark-info-color );
  }
}
</style>
<style lang="less" scoped>
/deep/.tscard-container {
  .tscard-ul {
    .tscard-li {
      .tscard-inner {
        box-shadow: none;
      }

      .tscard-body {
        border: 1px solid transparent;
        .operation-li {
          padding: 10px;
          position: relative;
          height: 64px;
          .level-icon {
            width: 8px;
            height: 8px;
            position: absolute;
            top: 0px;
            left: 0px;
            border-radius: 50%;
          }
          .name-title {
            font-size: 13px;
            word-break: break-word;
            text-align: left;
            padding-bottom: 6px;
            &:before {
              font-size: 120%;
              margin-right: 4px;
            }
          }
          .tool-des{
            padding-left: 20px;
          }
          .select-index{
            position: absolute;
            right: 2px;
            top: 50%;
            height: 30px;
            line-height: 30px;
            padding: 0 8px;
            min-width: 30px;
            margin-top: -15px;
            border: 1px solid;
            border-radius: 15px;
            text-align: center;
            font-size: 16px;
          }
        }
        .risk-level{
          position: absolute;
          right: 0;
          top: 0;
          border-top-right-radius: 8px;
          border-bottom-left-radius: 8px;
          padding: 0px 16px;
          font-size: 12px;
        }
      }
    }
  }
}

</style>

