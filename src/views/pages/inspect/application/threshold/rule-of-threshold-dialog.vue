<template>
  <div>
    <TsDialog
      title="阈值规则"
      type="modal"
      width="small"
      :isShow="true"
      :hasFooter="false"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Loading
            :loadingShow="loadingShow"
            type="fix"
          ></Loading>
          <ul v-if="!$utils.isEmptyObj(resourceList)">
            <li class="current-rule-threshold-wrap">
              <div>当前资产阈值规则：</div>
              <ul>
                <template v-for="(item,index) in resourceList">
                  <li
                    :key="index"
                    class="text-href mb-sm"
                    @click="toRuleThresholdPage(item)"
                  >
                    {{ item.text }}
                  </li>
                </template>
              </ul>
            </li>
          </ul>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 选择组合工具弹窗入口
  components: {},
  props: {
    resourceId: {
      type: Number
    }
  },
  data() {
    return {
      loadingShow: true,
      resourceList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getDataList();
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
    closeDialog() {
      this.$emit('close');
    },
    getDataList() {
      this.loadingShow = true;
      this.resourceList = [];
      this.$api.inspect.definition.getThresholdSource({resourceId: this.resourceId}).then(res => {
        if (res && res.Status == 'OK') {
          let appSystemVoList = res.Return ? res.Return.appSystemVoList : [];
          let resourceVo = res.Return ? res.Return.resourceVo : {}; 
          let collectionName = res.Return ? res.Return.collectionName : ''; 
          if (!this.$utils.isEmpty(appSystemVoList) && !this.$utils.isEmptyObj(resourceVo)) {
            appSystemVoList && appSystemVoList.forEach((v) => {
              this.resourceList.push({
                appSystemId: v.id,
                text: `${resourceVo.typeLabel}->${v.abbrName ? (v.name ? v.abbrName + '(' + v.name + ')' : v.abbrName) : ''}阈值规则`,
                typeName: resourceVo.typeName,
                typeLabel: resourceVo.typeLabel,
                collectionName: collectionName
              });
            });
          }
          if (!this.$utils.isEmptyObj(resourceVo)) {
            this.resourceList.unshift({
              flag: 'global', // 全局阈值
              text: `${resourceVo.typeLabel}->全局阈值规则`,
              typeName: resourceVo.typeName,
              typeLabel: resourceVo.typeLabel,
              collectionName: collectionName
            });
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    toRuleThresholdPage(row) {
      if (row && !this.$utils.isEmptyObj(row)) {
        if (row.flag == 'global') {
          this.$router.push({
            path: '/definition-detail',
            query: {name: row.collectionName}
          });
        } else {
          this.$router.push({
            path: '/rule-of-threshold-detail',
            query: { name: row.collectionName, appSystemId: row.appSystemId}
          });
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.current-rule-threshold-wrap {
  display: flex;
}
</style>
