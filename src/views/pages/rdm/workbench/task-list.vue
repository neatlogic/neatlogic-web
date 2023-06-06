<template>
  <div>
    <TsContain><template v-slot:navigation><span>导航</span></template>
      <template v-slot:topLeft>上左</template>
      <template v-slot:topCenter>上中</template>
      <template v-slot:topRight>上右</template>
      <template v-slot:content>
        <div>
          <IssueList
            v-if="isReady"
            ref="issueList"
            :mode="displayMode"
            :canSearch="true"
            :isShowEmptyTable="true"
          ></IssueList>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isReady: true,
      displayMode: 'level'
    };
  },
  beforeCreate() {},
  async created() {
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
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
