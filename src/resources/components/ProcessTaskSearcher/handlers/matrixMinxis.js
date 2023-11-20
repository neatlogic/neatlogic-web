export default {
  props: {
    isValueObject: {
      // 返回的值是否是对象
      type: Boolean,
      default: false
    }
  },
  methods: {
    dealDataByUrl(nodeList) {
      //处理返回的数据结构为tsFormSelect需要的数据结构
      let columlist = [];
      if (this.config.mapping.value && this.config.mapping.text && nodeList) {
        nodeList.forEach(co => {
          if (co[this.config.mapping.text]) {
            if (this.config.mapping.value != this.config.mapping.text) {
              columlist.push({
                text: co[this.config.mapping.text].text,
                value: co[this.config.mapping.value].value,
                html: co[this.config.mapping.text].text + "<small class='text-grey'>(" + co[this.config.mapping.value].text + ')</small>'
              });
            } else {
              columlist.push({
                text: co[this.config.mapping.text].text,
                value: co[this.config.mapping.value].value,
                html: co[this.config.mapping.text].text
              });
            }
          }
        });
      }
      return columlist;
    }
  }
};
