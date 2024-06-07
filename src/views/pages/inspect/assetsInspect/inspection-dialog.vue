<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div v-if="comboData">
          <div v-if="comboData.isHasBindCombop">
            <div v-if="ciEntityData">
              <div class="mb-nm">
                <span v-html="$t('term.inspect.assetinspectconfirm', {target: ciEntityData.name})"></span>
              </div>
              <div v-if="getInsoectionToolName(comboData)">
                {{ $t('term.inspect.inspecttoolis') }}
                <a href="javascript:void(0)" @click="toDetail">{{ getInsoectionToolName(comboData) }}</a>
              </div>
            </div>
            <div v-else-if="ciData">
              <div>
                {{ $t('term.inspect.inspectcondition') }}：
              </div>
              <div class="mb-sm mt-sm">
                <Tag v-for="(item, index) in searchConditionList" :key="index" class="mb-xs">
                  {{ item }}
                </Tag>
              </div>
              <div v-if="getInsoectionToolName(comboData)">
                {{ $t('term.inspect.inspecttoolis') }}
                <a href="javascript:void(0)" @click="toDetail">{{ getInsoectionToolName(comboData) }}</a>
              </div>
            </div>
          </div>
          <div v-else>
            <div v-if="ciEntityData">
              <div class="mb-nm" v-html="$t('term.inspect.noconfigtool', {target: ciEntityData.name})">
              </div>
              <div><a href="javascript:void(0)" @click="toCreate">{{ $t('term.inspect.clicktoconfig') }}</a></div>
            </div>
            <div v-else-if="ciData">
              <div class="mb-nm">
                <div>{{ $t('term.inspect.inspectcondition') }}：</div>
                <div class="mb-sm mt-sm">
                  <Tag v-for="(item, index) in searchConditionList" :key="index" class="mb-xs">
                    {{ item }}
                  </Tag>
                </div>
                <div>
                  <span class="text-warning">{{ $t('term.inspect.resourcetypenotsetinspecttooltiptarget', {target: getInsoectionToolName(comboData) ? `${getInsoectionToolName(comboData)}(${getInsoectionToolName(comboData)})` : ''}) }}</span>
                  <a href="javascript:void(0)" @click="openInspectionToolSettingDialog">{{ $t('term.inspect.clicktoconfig') }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button v-if="comboData && comboData.isHasBindCombop" type="primary" @click="confirm()">{{ $t('page.execute') }}</Button>
      </template>
    </TsDialog>
    <InspectToolSetting v-if="isShowInspectToolSetting" @close="closeInspectToolSettingDialog"></InspectToolSetting>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InspectToolSetting: () => import('@/views/pages/inspect/definition/components/inspect-tool-setting')
  },
  filters: {},
  props: {
    ciData: { type: Object },
    ciEntityData: { type: Object },
    searchData: {
      // 搜索值
      type: Object,
      default: () => ({})
    },
    searchResultList: {
      // 搜索结果列表
      type: Array,
      default: () => { []; }
    }
  },
  data() {
    return {
      isShowInspectToolSetting: false,
      searchConditionList: [],
      dialogConfig: {
        type: 'modal',
        title: this.ciEntityData ? this.$t('term.inspect.inspectexec') : this.$t('term.inspect.batchinspect'),
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      comboData: null
    };
  },
  beforeCreate() {},
  created() {
    this.searchConditionList = [];
    if (this.ciData && this.ciData.label) {
      this.searchConditionList.unshift(`${this.$t('page.type')}：${this.ciData.label}`);
      this.searchConditionList.push(...this.searchResultList);
    }
    this.getCombo();
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
    getCombo() {
      const param = {};
      if (this.ciEntityData) {
        param.resourceId = this.ciEntityData.id;
      } else if (this.ciData) {
        param.ciId = this.ciData.id;
      }
      this.$api.inspect.assetsInspect.getCombop(param).then(res => {
        this.comboData = res.Return;
      });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    toDetail() {
      window.open(HOME + '/autoexec.html#/action-detail?id=' + this.comboData.combop.id + '&versionStatus=passed', '_blank');
    },
    toCreate() {
      window.open(HOME + '/inspect.html#/definition-manage?isDefinitionShow=true', '_blank');
    },
    openInspectionToolSettingDialog() {
      this.isShowInspectToolSetting = true;
    },
    closeInspectToolSettingDialog(needRefresh) {
      this.isShowInspectToolSetting = false;
      if (needRefresh) {
        this.getCombo();
      }
    },
    confirm() {
      if (this.ciEntityData) {
        this.$api.inspect.assetsInspect.createResourceEntityInspectJob({resourceId: this.ciEntityData.id}).then(res => {
          if (res.Return) {
            this.$Message.success(this.$t('message.savesuccess')); //保存成功
            this.close(true);
          }
        });
      } else if (this.ciData) {
        const param = {
          ciId: this.ciData.id,
          filter: {...this.searchData}
        };
        this.$api.inspect.assetsInspect.createResourceTypeInspectJob({ciId: this.ciData.id}).then(res => {
          if (res.Return) {
            this.$Message.success(this.$t('message.savesuccess')); //保存成功
            this.close(true);
          }
        });
      }
      // const param = {
      //   roundCount: 64,
      //   combopId: this.comboData.combop.id,
      //   source: 'inspect',
      //   param: {},
      //   name: (this.ciEntityData && this.ciEntityData.name) || (this.ciData && this.ciData.label + '(' + this.ciData.name + ')'),
      //   executeConfig: { executeNodeConfig: null },
      //   invokeId: (this.ciEntityData && this.ciEntityData.id) || (this.ciData && this.ciData.id)
      // };
      // if (this.ciEntityData) {
      //   param.executeConfig.executeNodeConfig = {
      //     selectNodeList: [
      //       {
      //         id: this.ciEntityData.id,
      //         ip: this.ciEntityData.ip,
      //         name: this.ciEntityData.name,
      //         port: this.ciEntityData.port
      //       }
      //     ]
      //   };
      // } else if (this.ciData) {
      //   param.executeConfig.executeNodeConfig = {
      //     filter: {
      //       typeIdList: [this.ciData.id],
      //       ...this.searchData
      //     }
      //   };
      // }
      // console.log('inspect.assetsInspect.executeAction');
      // param.invokeId = this.$api.inspect.assetsInspect.executeAction(param).then(res => {
      //   if (res.Return) {
      //     this.$Message.success(this.$t('message.savesuccess')); //保存成功
      //     this.close(true);
      //   }
      // });
    }
  },
  computed: {
    getInsoectionToolName() {
      return (comboData) => {
        if (comboData.combop && comboData.combop.name) {
          return comboData.combop.name;
        } else {
          return '';
        }
      };
    }
  },
  watch: {}
};
</script>
<style scoped lang="less"></style>
