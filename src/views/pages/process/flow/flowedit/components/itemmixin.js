export default {
  methods: {
    gotoNodeSetting(isActive, nodetype, actiontype) {
      if (!isActive) {
        window.open(HOME + '/process.html#/node-manage?nodeType=' + nodetype + '&actionType=' + actiontype, '_blank');
      }
    }
  }
};
