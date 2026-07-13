<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot>
      <Tabs v-model="currentTab">
        <TabPane
          v-for="(rel, index) in relList"
          :key="index"
          :label="rel.direction === 'from' ? rel.toLabel : rel.fromLabel"
          :name="rel.relId.toString()"
        >
          <CiEntityItem
            v-if="rel.relId.toString() === currentTab"
            :isEmiting="isEmiting"
            :ciId="rel.direction === 'from' ? rel.toCiId : rel.fromCiId"
            :relId="rel.relId"
            :selectedIdList="ciEntityIdList"
            :relCiEntityId="rel.ciEntityId"
            :direction="rel.direction === 'from' ? 'to' : 'from'"
            @append="
              cientity => {
                appendCiEntity(cientity, rel);
              }
            "
            @remove="
              cientity => {
                removeCiEntity(cientity, rel);
              }
            "
          ></CiEntityItem>
        </TabPane>
      </Tabs>
    </template>
    <template v-slot:footer>
      <Button type="default" @click="close()">{{ $t('page.close') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    CiEntityItem: () => import('@/views/pages/cmdb/cientity/cientity-tree-item.vue')
  },
  props: {
    isEmiting: { type: Boolean, default: false }, //是否正在处理外部异步事件
    relList: { type: Array }, //关系列表
    ciEntityIdList: { type: Array } //选中的配置项id
  },
  data() {
    return {
      currentTab: this.relList[0].relId.toString(),
      dialogConfig: {
        title: this.$t('term.cmdb.cientitylist'),
        type: 'slide',
        isShow: true,
        width: 'medium',
        maskClose: true
      }
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    appendCiEntity(cientity, rel) {
      if (!this.isEmiting) {
        this.$emit('append', cientity, rel);
      }
    },
    removeCiEntity(cientity, rel) {
      if (!this.isEmiting) {
        this.$emit('remove', cientity, rel);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
