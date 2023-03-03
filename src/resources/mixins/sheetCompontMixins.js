export default {
  data: function() {
    let _this = this;
    return {
      defaultSelfJson: {
        params: null,
        dynamicUrl: '',
        url: '',
        defaultUrl: '/api/rest/matrix/column/data/search/forselect/new',
        dealDataByUrl: _this.dealDataByUrl || null,
        rootName: 'tbodyList',
        showName: null
      }
    };
  },
  methods: {
    dealDataFilter(nodeList, config) {
      //当默认值的引用类型是自定义  处理默认值的数据结构
      let _this = this;
      let columlist = [];
      config = config || null;
      if (config.mapping.value && config.mapping.text && nodeList) {
        nodeList.forEach(co => {
          if (co[config.mapping.text]) {
            if (config.mapping.value != config.mapping.text) {
              columlist.push({
                text: co[config.mapping.text].text,
                value: co[config.mapping.value].value + '&=&' + co[config.mapping.text].text,
                html: co[config.mapping.text].text + "<small class='text-grey'>(" + co[config.mapping.value].text + ')</small>'
              });
            } else {
              columlist.push({
                text: co[config.mapping.text].text,
                value: co[config.mapping.value].value + '&=&' + co[config.mapping.text].text,
                html: co[config.mapping.text].text
              });
            }
          }
        });
      }
      return columlist;
    }
  }
};
