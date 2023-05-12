<template>
  <div class="dashboard-data-filter bg-grey" style="height:100%;">
    <Advancesearch
      ref="advance"
      :sourcedata="conditionCustomSourceData"
      :isSearch="true"
      @updateProps="handleTimeRangeChange"
      @changeInputContent="changeInputContent"
    ></Advancesearch>
    <div class="time-select-container">
      <TimeSelect
        v-model="dateRange"
        class="input-border"
        border="border"
        placement="bottom-start"
        :clearable="false"
        transfer
        width="100%"
        @change="range=>handleTimeRangeChange(range)"
      ></TimeSelect>
    </div>
  </div>
</template>
<script>
import Advancesearch from '@/resources/components/SearchNew/components/advanced.vue';
import TimeSelect from '@/resources/components/TimeSelect/TimeSelect';

export default {
  name: 'DataFilter',
  components: {
    Advancesearch,
    TimeSelect
  },
  props: ['editAdd'], // 编辑或添加
  data() {
    return {
      conditionCustomSourceData: [],
      dateRange: {timeRange: '1', timeUnit: 'year' },
      timeRangeConditionGroup: null,
      searchData: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    // 获取数据源    
    this.getFormData();
    if (this.editAdd === 'edit') {
      this.handleTimeRangeChange('init');
    }
    // this.$emit('filterDataChange', 'init', 'init');
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    conditionConfigEcho(config) {
      this.dateRange = config.startTimeCondition;
      this.initConditionConfig = config;
    },
    handleTimeRangeChange(init) {
      this.timeRangeConditionGroup = {
        uuid: this.$utils.setUuid(),
        conditionGroupList: [],
        conditionList: [
          // {
          //   uuid: this.$utils.setUuid(),
          //   name: this.timeHandler.handler,
          //   type: this.timeHandler.type,
          //   valueList: [this.dateRange],
          //   expression: this.timeHandler.defaultExpression
          // }
        ]
      };
      let searchData = {
        conditionGroupList: [],
        conditionGroupRelList: []
      };
      if (this.$refs.advance) {
        searchData = this.$refs.advance.getSearchData();        
      }
      
      if (!searchData) {
        searchData = {conditionGroupList: this.timeRangeConditionGroup};
      } else {
        if (searchData.conditionGroupList.length > 1) {
          searchData.conditionGroupRelList[searchData.conditionGroupRelList.length] = {
            from: searchData.conditionGroupList[searchData.conditionGroupList.length - 1].uuid,
            to: this.timeRangeConditionGroup.uuid,
            joinType: 'and'
          };
        }
      }
      // console.log(this.$refs.advance, this.$refs.advance.getSearchData());
      this.searchData = searchData;
      this.changeInputContent({
        handler: 'advance',
        data: searchData
      }, init);
    },
    changeInputContent(data, init) {
      if (data.action === 'nosearch') {
        return;
      }
      clearTimeout(this.searchThrottle);
      this.searchThrottle = setTimeout(() => {
        let searchData = this.$refs.advance.getSearchData();
        // 检测所有条件是否符合条件        
        if (searchData) {
          searchData.conditionGroupRelList[searchData.conditionGroupRelList.length] = {
            from: searchData.conditionGroupList[searchData.conditionGroupList.length - 1].uuid,
            to: this.timeRangeConditionGroup.uuid,
            joinType: 'and'
          };
          if (this.timeRangeConditionGroup.conditionList.length > 0) {
            searchData.conditionGroupList[searchData.conditionGroupList.length] = this.timeRangeConditionGroup;
          }
          let allConditionList = searchData.conditionGroupList.reduce((a, b) => {
            return a.concat(b.conditionList);
          }, []);
          let isGo = allConditionList.length && allConditionList.every(d => d.valueList.length);
          if (!isGo) {
            console.warn(this.$t('term.dashboard.conditionfail'));
            searchData = '';
            return;
          }
        } else {
          searchData = this.timeRangeConditionGroup;
        }
        searchData.startTimeCondition = this.dateRange;
        this.$emit('filterDataChange', this.$utils.deepClone(searchData), init);
      }, 500);
    },
    echoListFn(res) {
      let selectedList = [];
      let baseValue = [];
      let conditionGroupList = [];
      if (this.initConditionConfig) {
        this.dateRange = this.initConditionConfig.startTimeCondition;
        this.initConditionConfig.conditionGroupList.forEach(j => {
          let conditionList = [];
          if (j.channelUuidList.length === 1) {
            let uuid = '';
            let formConfig = {};
            j.conditionList.forEach(v => {
              if (v.type === 'form') {
                uuid = v.name;
                formConfig = this.$utils.deepClone(v);
              }
            });
            this.$api.dashboard.dashboard.channelForm({channelUuidList: j.channelUuidList,
              conditionModel: 'custom'
            })
              .then(res => {
                if (res.Status === 'OK') {
                  let formList = res.Return;
                  formList.forEach(v => {
                    if (v.uuid === uuid) {
                      let formValueList = [];
                      if (v.type === 'formdate') {
                        formValueList = formConfig.valueList;
                      } else {
                        formValueList = formConfig.valueList[0];
                      }
                      conditionList.push({
                        conditionValue: formValueList, conditionName: v.handlerName, config: JSON.parse(v.config), expression: formConfig.expression, 
                        expressionList: v.expressionList, handler: v.handler, isShow: v.isShow || false, isHide: v.isHide || false, 
                        key: v.handlerName, uuid: uuid, name: v.type + '#' + v.handler
                      });
                    }
                  });
                }
              });
          }
                
          if (j.conditionRelList.length > 0) {
            j.conditionRelList.forEach(t => {
              if (!t.relList) {
                t.relList = [
                  {
                    text: this.$t('page.inaddition'),
                    value: 'and'
                  },
                  {
                    text: this.$t('page.or'),
                    value: 'or'
                  }
                ];
              }
            });
          }
          j.conditionList.forEach(n => {
            res.Return.forEach(v => {
              if (n.name === v.handler) {
                let valueList = n.valueList;
                if (v.handlerType === 'datetime') {
                  // 这个时间控件要单独处理
                  valueList = n.valueList[0];
                }
                let config = v.config;
                if (v.handlerType === 'userselect') {
                  config.excludeList = config.initConfig.excludeList;
                  config.groupList = config.initConfig.groupList;
                  config.includeList = config.initConfig.includeList;
                } 
                conditionList.push({
                  conditionValue: valueList, conditionName: v.handlerName, config: config, expression: v.defaultExpression, 
                  expressionList: v.expressionList, handler: v.config.type, isShow: v.isShow || false, isHide: v.isHide || false, 
                  key: v.handlerName, uuid: n.uuid, name: v.type + '#' + n.name
                });
                baseValue.push(v.handlerName);
                selectedList.push({
                  action: 'base',
                  handlerData: {
                    config: v.config,
                    data: v,
                    expressionList: v.expressionList,
                    handler: v.handler,
                    key: v.handlerName,
                    label: v.handlerName,
                    uuid: n.uuid
                  },
                  text: v.handlerName,
                  type: v.handler,
                  uuid: n.uuid,
                  value: v.handlerName
                });
              }
            });
          });
          conditionGroupList.push({uuid: j.uuid, conditionGroupList: [], conditionList: conditionList, conditionRelList: j.conditionRelList});
        });
        this.$refs.advance.conditionGroupList = conditionGroupList;
        this.$refs.advance.groupConditionList = [
          {
            selectedList: selectedList,
            baseValue: baseValue,
            isServe: [],
            serveValue: [],
            propsValue: [],
            list: {}, 
            props: [],
            options: [],
            defaultCondition: null 
          }];
      }
    },
    getFormData() {
      if (!this.conditionCustomSourceData.length) {
        this.$api.dashboard.dashboard
          .conditionGet({
            conditionModel: 'custom'
          })
          .then(res => {
            if (res.Status === 'OK') {
              const data = res.Return;
              this.conditionCustomSourceData.push(...data);
              if (this.$refs.advance) {
                this.$refs.advance.sourceDataToConditionList(this.conditionCustomSourceData);
                // 以下主要用来做数据回显
                this.echoListFn(res);
              }
            }
          });
      }
    },
    validData() {
      let searchData = this.$refs.advance.getSearchData();
      // 判断是否存在为空数据
      let is = false;
      if (searchData) {
        is = searchData.conditionGroupList.some(d => {
          return d.conditionList.some(d1 => {
            return !d1.valueList.length;
          });
        });
      }
      if (is) {
        console.warn(this.$t('term.dashboard.valuelisthasempty'));
        return {
          valid: false,
          msg: this.$t('term.dashboard.sraechconditionempty')
        };
      } else {
        return {
          valid: true,
          msg: '！'
        };
      }
    },
    getData(action) {
      // 高级搜索
      const groupList = [];
      const groupRelList = [];
      let res = {
        conditionGroupList: groupList,
        conditionGroupRelList: groupRelList
      };
      let searchData;
      if (this.$refs.advance) {
        searchData = this.$refs.advance.getSearchData();
      }
      if (!searchData) {
        if (this.timeRangeConditionGroup) {
          searchData = this.timeRangeConditionGroup;
        } else {
          searchData = {
            uuid: this.$utils.setUuid(),
            conditionGroupList: [],
            conditionList: []
          };
        }
      } 
      // else {
      // if (searchData.conditionGroupList.length > 1) {
      //   // searchData.conditionGroupRelList[searchData.conditionGroupRelList.length] = {
      //   //   from: searchData.conditionGroupList[searchData.conditionGroupList.length - 1].uuid,
      //   //   to: this.timeRangeConditionGroup.uuid,
      //   //   joinType: 'and'
      //   // };
      //   searchData.conditionGroupList[searchData.conditionGroupList.length] = this.timeRangeConditionGroup;
      // }
      // }
      if (action === 'init') {
        searchData = this.initConditionConfig || {};
      }
      searchData.startTimeCondition = this.dateRange;
      if (searchData) {
        res = searchData;
      }
      return res;
    }

  },
  filter: {},
  computed: {
    timeHandler() {
      if (this.conditionCustomSourceData.length !== 0) {
        return this.conditionCustomSourceData.find(item => {
          return item.handler === 'starttime' || item.handler === 'endtime';
        });
      } else {
        return {
          'handler': 'starttime',
          'expressionList': [
            {
              'expression': 'between',
              'expressionName': this.$t('page.belong')
            },
            {
              'expression': 'is-null',
              'expressionName': this.$t('term.expression.empty')
            }
          ],
          'handlerType': 'date',
          'defaultExpression': 'between',
          'conditionModel': 'date',
          'handlerName': this.$t('page.reportingtime'),
          'sort': 4,
          'type': 'common',
          'config': {
            'defaultValue': '',
            'valueType': 'timestamp',
            'format': 'yyyy-MM-dd HH:mm:ss',
            'type': 'datetimerange',
            'value': ''
          }
        };
      }
    }
  },
  watch: {}
};
</script>

<style lang="less">
.paddingBlock {
  padding: 12px 16px;

  .ivu-checkbox-wrapper {
    width: 150px;
  }
}

.dashboard-data-filter {
  margin: 0 -23px;
  position: relative;
  .time-select-container {
    position: absolute;
    right: 24px;
    top: 6px;
    width: 225px;
  }
}
</style>
