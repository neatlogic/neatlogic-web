export default {
  methods: {
    initStepList(stepList) {
      let list = [];
      if (stepList && stepList.length) {
        stepList.forEach(s => {
          if (!s.uuid) {
            let uuid = this.$utils.setUuid();
            this.$set(s, 'uuid', uuid);
          }
          if (s.config && s.config.phaseOperationList && s.config.phaseOperationList.length) { 
            this.initPhaseOperationList(s.config.phaseOperationList);
          }
        });
        list = stepList;
      }
      return list;
    },
    initPhaseOperationList(phaseOperationList) {
      phaseOperationList.forEach(p => {
        if (p.operationName == 'native/IF-Block') {
          if (p.config) {
            if (p.config.ifList && p.config.ifList.length) {
              this.initPhaseOperationList(p.config.ifList);
            }
            if (p.config.elseList && p.config.elseList.length) {
              this.initPhaseOperationList(p.config.elseList);
            }
          }
        } else {
          if (p.config) {
            let paramMappingList = this.$utils.isEmpty(p.config.paramMappingList) ? [] : p.config.paramMappingList;
            let newParamMappingList = [];
            if (p.operation && !this.$utils.isEmpty(p.operation.inputParamList)) {
              p.operation.inputParamList.forEach(i => {
                let findItem = paramMappingList.find(item => item.key == i.key);
                if (findItem) {
                  newParamMappingList.push(findItem);
                } else {
                  newParamMappingList.push({
                    key: i.key,
                    mappingMode: 'constant',
                    value: i.defaultValue
                  });
                }
              });
            }
            this.$set(p.config, 'paramMappingList', newParamMappingList);
          }
        }
      });
    }
  }
};
