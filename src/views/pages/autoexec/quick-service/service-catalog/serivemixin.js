export default {
  props: {
  },
  data() {
    return {
      collectId: null,
      collectAction: ''
    };
  },
  mounted() { },
  beforeDestroy() { },
  methods: {
    toAddJob(item) {
      // 跳转到添加作业
      this.$router.push({
        path: '/add-job',
        query: {
          id: item.id,
          name: item.name
        }
      });
    },
    handleCollect(item, isCollectList) {
      //收藏取消收藏
      this.loadingShow = true;
      let action = item.isFavorite == 1 ? 0 : 1;
      let id = item.id;
      if (action) {
        // 收藏
        this.$api.autoexec.catalogManage.saveUserCollect({ id: id }).then(res => {
          if (res.Status == 'OK') {
            this.$set(item, 'isFavorite', action);
            this.collectId = item.id;
            this.collectAction = action;
            this.$Message.success(this.$t('message.savesuccess'));
            this.getFavoriteList();
          }
        });
      } else {
        // 取消收藏
        this.$api.autoexec.catalogManage.deleteUserCollect({ id: id }).then(res => {
          if (res.Status == 'OK') {
            this.$set(item, 'isFavorite', action);
            this.collectId = item.id;
            this.collectAction = action;
            this.$Message.success(this.$t('message.savesuccess'));
            this.getFavoriteList();
          }
        });
      }
    },
    //获取收藏服务
    getFavoriteList(currentPage = 1, parentId) {
      this.favoriteData = {};
      this.loadingShow = true;
      let catalogId = !this.$utils.isEmpty(this.selectValue) ? this.selectValue[this.selectValue.length - 1] : '';
      let params = {
        currentPage: currentPage,
        pageSize: this.pageSize,
        keyword: this.keyword
      };
      if (parentId || catalogId) {
        params.parentId = parentId || catalogId;
      }
      this.$api.autoexec.catalogManage.getFavorite(params).then(res => {
        if (res.Status == 'OK') {
          this.favoriteData = res.Return;
          this.$set(this.favoriteData, 'tbodyList', res.Return.tbodyList || []);
          this.favoriteData.tbodyList.forEach((item) => {
            if (item && item.id) {
              // 补充收藏的字段
              this.$set(item, 'isFavorite', 1);
            }
          });
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  computed: {
    //去除html字符
    removeHTMLTag() {
      return (str) => {
        str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
        str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
        str = str.replace(/ /gi, ''); //去掉
        return str;
      };
    },
    //去除转义字符
    escape2Html() {
      return (str) => {
        const arrEntities = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' };
        return str.replace(/&(lt|gt|nbsp|amp|quot);/gi, (all, t) => {
          return arrEntities[t];
        });
      };
    },
    setTitleToString() {
      return (titleList, tindex) => {
        if (tindex > 0 && titleList && titleList.length > 0) {
          return 'ts-angle-right arr-nextpath';
        } else {
          return 'arr-nextpath';
        }
      };
    }
  },
  watch: {
  }
};
