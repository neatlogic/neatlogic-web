import { EXPRESSIONS } from './index.js';
export default {
  data() {
    return {
      EXPRESSIONS: EXPRESSIONS
    };
  },
  methods: {
    executeReaction(reaction, newFormData, oldFormData) {
      let script = '';
      if (reaction && !this.$utils.isEmpty(reaction)) {
        const conditionGroupRelList = reaction['conditionGroupRelList'];
        const conditinoGroupList = reaction['conditionGroupList'];
        if (conditinoGroupList && conditinoGroupList.length > 0) {
          for (let i = 0; i < reaction['conditionGroupList'].length; i++) {
            const conditionGroup = reaction['conditionGroupList'][i];
            if (i > 0 && conditionGroupRelList && conditionGroupRelList.length > 0) {
              if (conditionGroupRelList.length >= i) {
                const joinType = conditionGroupRelList[i - 1];
                script += joinType === 'and' ? ' && ' : ' || ';
              } else {
                //数据异常跳出
                break;
              }
            }
            script += '(';
            const conditionList = conditionGroup['conditionList'];
            const conditionRelList = conditionGroup['conditionRelList'];
            if (conditionList && conditionList.length > 0) {
              let cScript = '';
              for (let j = 0; j < conditionList.length; j++) {
                if (j > 0 && conditionRelList && conditionRelList.length > 0) {
                  if (conditionRelList.length >= j) {
                    const cJoinType = conditionRelList[j - 1];
                    cScript += cJoinType === 'and' ? ' && ' : ' || ';
                  } else {
                    //数据异常跳出
                    break;
                  }
                }
                const condition = conditionList[j];
                const uuidList = condition['formItemUuid'].split('#');
                const formItemUuid = uuidList[0];
                cScript += '(';
                cScript += 'this.EXPRESSIONS["' + condition['expression'] + '"](this.newFormData.hasOwnProperty("' + formItemUuid + '")?this.newFormData["' + formItemUuid + '"]:null, this.oldFormData.hasOwnProperty("' + formItemUuid + '")?this.oldFormData["' + formItemUuid + '"]:null, this.conditionData("' + condition['uuid'] + '"))';
                cScript += ')';
              }
              script += cScript;
            }
            script += ')';
          }
        }
      }
      if (script) {
        const context = {};
        context.newFormData = newFormData || {};
        context.oldFormData = oldFormData || {};
        context.conditionData = this.conditionData;
        context.EXPRESSIONS = this.EXPRESSIONS;
        const fuc = new Function('return ' + script).bind(context);
        return fuc();
      }
      return true;
    }
  }
};
