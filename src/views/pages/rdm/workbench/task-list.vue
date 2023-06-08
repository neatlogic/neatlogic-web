<template>
  <div>
    <TsContain>
      <template v-slot:navigation><span>导航</span></template>
      <template v-slot:topLeft>上左</template>
      <template v-slot:topCenter>上中</template>
      <template v-slot:topRight>上右</template>
      <template v-slot:content>
        <div>
          <IssueList
            v-if="isReady"
            ref="issueList"
            :isMine="1"
            :isEnd="0"
            :mode="displayMode"
            :displayAttrList="displayAttrList"
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
      isReady: false,
      displayMode: 'level',
      needAttr: ['priority', 'startdate', 'enddate'],
      attrList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getPrivateAttrList();
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
    getPrivateAttrList() {
      this.$api.rdm.attr.getPrivateAttrList().then(res => {
        this.attrList = res.Return;
        this.isReady = true;
      });
    }
  },
  filter: {},
  computed: {
    displayAttrList() {
      if (this.attrList && this.attrList.length > 0) {
        return this.attrList.filter(attr => this.needAttr.includes(attr.type));
      }
      return [];
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
