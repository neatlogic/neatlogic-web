<template>
  <div style="padding:5px 5px 5px 20px">
    <table class="table">
      <thead>
        <tr>
          <th v-for="(title,tindex) in titleList" :key="tindex">{{ title.title }}</th>
        </tr>
      </thead>
      <tbody v-if="tbodyList && tbodyList.length>0">
        <tr v-for="(tbody,bindex) in tbodyList" :key="bindex">
          <td v-for="(title,tindex) in titleList" :key="bindex+tindex">
            <div v-if="title.key=='message'" style="word-break:break-all;white-space: initial;">{{ tbody.message }}</div>
            <div v-else-if="title.key=='committerDate'">{{ getFinalDate(tbody.committerDate) | formatDate }}</div>
            <span v-else-if="title.key=='commitId'" class="tag-item">{{ tbody.commitId }}<i v-if="tbody.isNew" class="tag-new">new</i></span>
            <div v-else>{{ tbody[title.key] }}</div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td :colspan="titleList.length || 0" class="text-center">暂无数据</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    tbodyList: Array,
    statusList: Array
  },
  data() {
    return {
      titleList: [{
        key: 'commitId',
        title: '提交id'
      },
      {
        key: 'committer',
        title: '提交人'
      },
      {
        key: 'committerDate',
        title: '提交时间'
      },
      // {
      //   key: 'mergeStatus',
      //   title: '合并状态'
      // },
      {
        key: 'message',
        title: '提交信息'     
      }],
      rowNum: null,
      currentPage: null,
      pageSize: null
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},
  mounted() {
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
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
    },
    getFinalDate() {
      return function(date) {
        return typeof date == 'string' ? date : date.time;
      };
    }
  },
  watch: {
  }
};
</script>
<style lang='less' scoped>

</style>
