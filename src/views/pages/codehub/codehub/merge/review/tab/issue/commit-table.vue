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
          <div v-else-if="title.key=='mergeStatus'" v-html="showText(tbody['mergeStatus']) "></div>
          <div v-else-if="title.key=='committerDate'">{{ tbody.committerDate | formatDate }}</div>
          <span v-else-if="title.key=='commitId'" class="tag-item">{{ tbody.commitId }}<i v-if="tbody.isNew" class="tag-new">new</i></span>
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
    statusList: Array,
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
  computed: {
    showText() {
      return function(val) {
        let str = ``;
        if (val && this.statusList && this.statusList.length > 0) {
          this.statusList.forEach((s) => {
            if (s.value == val) {
              str = `<div class="text-${s.color}">${s.text}</div>`;
            }
          });
        }
        return str;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.commit-table-box {
  width: 100%;
  padding-left: 40px;
}
</style>
