import axios from '@/resources/api/http.js';
import ViewUI from 'neatlogic-ui/iview/index.js';
export default {
  data: function() {
    return {
    };
  },
  methods: {
    dealPriority(com, isFirst) { //修改优先级
      if (com.handler != 'formpriority' || isFirst) {
        return;
      }
      let _this = this;
      let filterList = [];
      let param = { 
        matrixUuid: com.config.matrixUuid, 
        keywordColumn: com.config.mapping.text, 
        valueField: com.config.mapping.value,
        textField: com.config.mapping.text
      };
      if (com.config.filterList && com.config.filterList.length > 0) {
        filterList = com.config.filterList.filter(filt => {
          return filt.uuid && !_this.$utils.isEmpty(filt.valueList);
        });
        Object.assign(param, {
          filterList: filterList
        });
      }    
      if (_this.$utils.isEmpty(filterList)) {
        return;
      }
      axios.post('/api/rest/matrix/column/data/search/forselect', param).then(function(res) {
        let messageConfig = {
          content: '',
          duration: 8,
          top: 50
        };
        let dataList = res.Return.dataList;
        if (!dataList || dataList.length == 0) { //优先级不存在时提示
          messageConfig.content = '表单联动规则匹配的优先级不存在，请修改表单或联系管理员';
          ViewUI.Message.error(messageConfig);
        }
        let config = getParent(_this);
        if (config && config.node) { //上报页面
          let node = null;
          if (config.tag == 'taskDispatch') {
            node = config.node;
          } else if (config.tag == 'taskDeal') {
            node = config.node.$refs.RightSetting;
          }
          if (!node) {
            return;
          }
          let newList = node.priorityList.filter(item => {
            let has = dataList.find(c => {
              if (c[com.config.mapping.value].value == item.name) {
                return true;
              }
              return false;
            });
            return !!has;
          });
          if (newList.length > 1) { //匹配到多个优先级时
            messageConfig.content = '表单联动规则匹配的优先级不属于当前服务目录范围，请修改表单或联系管理员';
            ViewUI.Message.error(messageConfig);
          } else if (newList.length <= 0 && dataList.length > 0) { //优先级不在当前服务目录范围内时
            messageConfig.content = '表单联动规则匹配到多个优先级，请修改表单或联系管理员';
            ViewUI.Message.error(messageConfig);
          }
          node.setPriorityByForm(newList);
        }
      });
      let list = ['taskDispatch', 'taskDeal'];
      function getParent(node) {
        if (node && node.$parent) {
          let tag = node.$parent.$options.tagComponent;
          if (list.indexOf(tag) >= 0) {
            return {tag: tag, node: node.$parent};
          } else if (node.$parent) {
            return getParent(node.$parent);
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    }
  }
};
