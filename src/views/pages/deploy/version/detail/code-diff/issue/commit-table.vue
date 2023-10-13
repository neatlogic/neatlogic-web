<template>
  <table class="commit-table-box">
    <thead>
      <tr>
        <th v-for="(title,tindex) in titleList" :key="tindex">{{ title.title }}</th>
      </tr>
    </thead>
    <tbody v-if="commitList && commitList.length>0">
      <tr
        v-for="(tbody,bindex) in commitList"
        :key="bindex"
        class="cursor-pointer"
        @click.stop="toDiffDetail(tbody)"
      >
        <td v-for="(title,tindex) in titleList" :key="bindex+tindex">
          <div v-if="title.key=='message'" style="word-break:break-all;white-space: initial;">{{ tbody.message }}</div>
          <div v-else-if="title.key=='committerDate'">{{ tbody.committerDate | formatDate }}</div>
          <span v-else-if="title.key=='commitId'" class="tag-item">
            {{ tbody.commitId }}
            <span v-if="tbody.isNew" class="tag-new">new</span>
          </span>
          <div v-else>{{ tbody[title.key] }}</div>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr>
        <td :colspan="titleList.length || 0" class="text-center">{{ $t('page.nodata') }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    commitList: Array
  },
  data() {
    return {
      titleList: [{
        key: 'commitId',
        title: this.$t('term.deploy.commitid')
      },
      {
        key: 'committer',
        title: this.$t('page.presenter')
      },
      {
        key: 'committerDate',
        title: this.$t('page.committime')
      },
      {
        key: 'message',
        title: this.$t('page.submitinformation')    
      }]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toDiffDetail(item) {
      // 跳转到变更详情
      this.$emit('toDiffDetail', item.commitId);
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.commit-table-box {
  width: 100%;
  padding-left: 40px;
}
</style>
