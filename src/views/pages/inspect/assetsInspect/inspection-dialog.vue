<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div v-if="comboData">
          <div v-if="comboData.isHasBindCombop">
            <div v-if="ciEntityData">
              <div class="mb-nm">
                确认对资源
                <b>{{ ciEntityData.name }}</b>
                执行巡检？
              </div>
              <div>
                巡检工具为：
                <a href="javascript:void(0)" @click="toDetail">{{ comboData.combop.name }}</a>
              </div>
            </div>
            <div v-else-if="ciData">
              <div>
                对满足以下条件的所有资产批量巡检：
              </div>
              <div class="mb-sm mt-sm">
                <Tag v-for="(item, index) in searchConditionList" :key="index" class="mb-xs">
                  {{ item }}
                </Tag>
              </div>
              <div>
                巡检工具为：
                <a href="javascript:void(0)" @click="toDetail">{{ comboData.combop.name }}</a>
              </div>
            </div>
          </div>
          <div v-else>
            <div v-if="ciEntityData">
              <div class="mb-nm">
                资源
                <b>{{ ciEntityData.name }}</b>
                未配置巡检工具，无法进行巡检。
              </div>
              <div><a href="javascript:void(0)" @click="toCreate">点击配置</a></div>
            </div>
            <div v-else-if="ciData">
              <div class="mb-nm">
                <div>对满足以下条件的所有资产批量巡检：</div>
                <div class="mb-sm mt-sm">
                  <Tag v-for="(item, index) in searchConditionList" :key="index" class="mb-xs">
                    {{ item }}
                  </Tag>
                </div>
                <div>
                  <span class="text-warning">资源类型 {{ ciData.label }}({{ ciData.name }}) 未配置巡检工具，无法进行巡检。</span>
                  <a href="javascript:void(0)" @click="openInspectionToolSettingDialog">点击配置</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('button.cancel') }}</Button>
        <Button v-if="comboData && comboData.isHasBindCombop" type="primary" @click="confirm()">执行</Button>
      </template>
    </TsDialog>
    <InspectToolSetting v-if="isShowInspectToolSetting" @close="closeInspectToolSettingDialog"></InspectToolSetting>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InspectToolSetting: resolve => require(['@/views/pages/inspect/definition/components/inspect-tool-setting'], resolve)
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
        title: this.ciEntityData ? '执行巡检' : '批量巡检',
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
      this.searchConditionList.unshift(`类型：${this.ciData.label}`);
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
      window.open(HOME + '/autoexec.html#/action-detail?id=' + this.comboData.combop.id, '_blank');
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
      const param = {
        roundCount: 64,
        combopId: this.comboData.combop.id,
        source: 'inspect',
        param: {},
        name: (this.ciEntityData && this.ciEntityData.name) || (this.ciData && this.ciData.label + '(' + this.ciData.name + ')'),
        executeConfig: { executeNodeConfig: null },
        invokeId: (this.ciEntityData && this.ciEntityData.id) || (this.ciData && this.ciData.id)
      };
      if (this.ciEntityData) {
        param.executeConfig.executeNodeConfig = {
          selectNodeList: [
            {
              id: this.ciEntityData.id,
              ip: this.ciEntityData.ip,
              name: this.ciEntityData.name,
              port: this.ciEntityData.port
            }
          ]
        };
      } else if (this.ciData) {
        param.executeConfig.executeNodeConfig = {
          filter: {
            typeIdList: [this.ciData.id],
            ...this.searchData
          }
        };
      }
      param.invokeId = this.$api.inspect.assetsInspect.executeAction(param).then(res => {
        if (res.Return) {
          this.$Message.success(this.$t('message.content.savesuccess')); //保存成功
          this.close(true);
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style scoped lang="less"></style>
