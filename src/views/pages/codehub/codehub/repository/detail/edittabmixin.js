export default {
  props: {
    id: Number, //仓库Id
    reposData: [Object] //通过外层调用接口获取的仓库数据
  },
  data() {
    return {
      searchGrouplist: [],
      groupSeaching: false
    };
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    checkHasBranch(list) {
      let isExist = false;
      if (list && list.length > 0) {
        let branchList = list.filter(l => {
          return l.text == 'branch' && l.dataList && l.dataList.length > 0;
        });
        if (branchList.length > 0) {
          isExist = true;
        }
      }
      return isExist;
    },
    initDefaultSelected() {
      if (!this.queryName && this.searchGrouplist && this.searchGrouplist.length > 0) {
        this.searchGrouplist.forEach((v) => {
          if (v.value == 'branch' && v.dataList.length > 0) {
            this.$set(this, 'queryName', v.dataList[0].value);
            this.$set(this.selectConfig, 'dataList', [{value: v.dataList[0].value, group: 'branch'}]);
          }
        });
      }
    },
    initGroupsearch() {
      this.groupSeaching = true;
      return this.$api.codehub.repositorydetail.getSeachgroup({repositoryId: this.id}).then((res) => {
        this.groupSeaching = false;
        if (res && res.Status == 'OK') {
          this.searchGrouplist = res.Return || [];
        } else {
          this.searchGrouplist = [];
        }
      }).catch((error) => {
        this.groupSeaching = false;
        this.searchGrouplist = [];
      });       
    }
  },
  computed: {},
  watch: {}
};
