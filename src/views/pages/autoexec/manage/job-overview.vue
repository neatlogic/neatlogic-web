
<template>
  <TsContain border="border">
    <template v-slot:navigation>
      <span class="tsfont-left text-action" @click="toPrevpath">{{ prevPath.name }}</span>
    </template>
    <template v-slot:topRight>
      <CombineSearcher v-bind="searchConfig"></CombineSearcher>
    </template>
    <template v-slot:content>
      <JobList :params="searchConfig.value"></JobList>
    </template>
  </TsContain>
</template>
<script>
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue';
import JobList from './job/job-list.vue';
export default {
  name: '',
  components: {
    CombineSearcher,
    JobList
  },
  filters: {
  },
  props: {
  },
  data() {
    let _this = this;
    return {
      prevPath: {
        router: '/job-manage',
        name: this.$t('page.back'),
        query: {
          handler: 'tool'
        }
      },
      searchConfig: {
        value: {
          combopName: _this.$route.query.combopName
        },
        search: false,
        placeholder: this.$t('term.autoexec.combinationtool') + this.$t('page.name'),
        searchList: [
          {
            type: 'text',
            name: 'combopName',
            value: _this.$route.query.combopName,
            label: _this.$t('term.autoexec.combinationtool')
          },
          {
            type: 'select',
            name: 'typeIdList',
            label: _this.$t('term.autoexec.toolclassification'),
            value: '',
            dynamicUrl: '/api/rest/autoexec/type/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getToolClassificationList,
            transfer: true
          },
          {
            type: 'select',
            name: 'statusList',
            value: '',
            label: this.$t('page.jobstatus'),
            search: true,
            dynamicUrl: '',
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true
          },
          {
            type: 'select',
            name: 'sourceList',
            value: [],
            label: this.$t('term.autoexec.jobsource'),
            multiple: true,
            url: '/api/rest/autoexec/job/source/list'
          },
          {
            type: 'userselect',
            name: 'execUserList',
            value: '',
            label: this.$t('term.autoexec.operator'),
            groupList: ['user'],
            transfer: true
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let pathConfig = sessionStorage.getItem(this.$route.path);
    this.prevPath = Object.assign(this.prevPath, pathConfig ? JSON.parse(pathConfig) : {});
    sessionStorage.removeItem(this.$route.path);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toPrevpath: function() { //返回到列表页面
      this.$router.push({
        path: this.prevPath.router,
        query: this.prevPath.query
      });
    }
  },
  computed: {},
  watch: {},
  beforeRouteEnter(to, from, next) { //获取前一个路由信息，用来返回
    if (from.path != '/') { //执行页面跳转过来的，返回为默认值
      sessionStorage.setItem(to.path, JSON.stringify({router: from.path, name: from.meta.title}));
    }
    next(true);
  }
};
</script>
