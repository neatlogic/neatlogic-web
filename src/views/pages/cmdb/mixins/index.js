export default {
  data() {
    return {
      menuList: []
    };
  },
  created() {},
  methods: {
    getMenuList() {
      let data = {};
      this.$api.cmdb.ci.searchCiTypeCi(data).then((res) => {
        if (res.Status === 'OK') {
          let list = [];
          res.Return.forEach((item) => {
            if (item.isMenu) {
              const obj = {};
              obj.name = item.name;
              obj.children = [];
              item.ciList.length > 0 &&
                item.ciList.forEach((citem) => {
                  if (citem.isMenu) {
                    obj.children.push(citem);
                  }
                });
              //当子数组的长度大于0时才push
              obj.children.length > 0 && list.push(obj);
            }
          });
          this.menuList = list;
        }
      });
    }
  }
};
