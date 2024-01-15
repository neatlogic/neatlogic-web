<template>
  <div>
    <div><span class="text-href tsfont-plus" @click="showGroupDialog">{{ $t('page.combinedcondition') }}</span></div>
    <div v-if="isLoaded">
      <div v-for="(conditionGroup, index) in workcenterConditionDataLocal.conditionGroupList" :key="conditionGroup.uuid">
        <div class="bg-grey padding radius-md">
          <div v-for="(conditionData, cindex) in conditionGroup.conditionList" :key="conditionData.uuid">
            <div class="condition-grid">
              <div>{{ getConditionConfigByConditionData(conditionGroup, conditionData).handlerName }}：</div>
              <div>
                <TsFormSelect
                  ref="expressionList"
                  :dataList="getConditionConfigByConditionData(conditionGroup, conditionData).expressionList"
                  transfer
                  valueName="expression"
                  textName="expressionName"
                  border="border"
                  :value="conditionData.expression"
                  :validateList="[{name:'required',message:' '}]"
                  @on-change="
                    val => {
                      change(conditionData, 'expression', val);
                    }
                  "
                ></TsFormSelect>
              </div>
              <div>
                <!--custom模式和simple不一样，change方法可以直接操作数据，因此忽略掉conditionConfig数据-->
                <SearchInputer
                  v-if="conditionData.expression != 'is-not-null' && conditionData.expression != 'is-null'"
                  ref="searchInputer"
                  mode="custom"
                  :condition="getConditionConfigByConditionData(conditionGroup, conditionData)"
                  :conditionData="conditionData"
                  :isCustomValue="true"
                  :isCustomPanel="true"
                  @change="
                    (conditionConfig, val, textStr) => {
                      change(conditionData, 'valueList', val);
                      change(conditionData, 'text', textStr);
                    }
                  "
                ></SearchInputer>
              </div>
              <div>
                <span class="tsfont-edit-s mr-md text-action" @click="editConditionGroup(conditionGroup)"></span>
                <span class="tsfont-trash-o text-action" @click="deleteCondition(conditionGroup, conditionData)"></span>
              </div>
            </div>
            <div v-if="conditionGroup.conditionRelList.length > 0 && cindex < conditionGroup.conditionList.length - 1">
              <Dropdown
                trigger="click"
                placement="bottom-start"
                @on-click=" val => {
                  changeJoinType(conditionGroup.conditionRelList[cindex], val);
                }"
              >
                <a href="javascript:void(0)">
                  <span v-if="conditionGroup.conditionRelList[cindex].joinType=='and'">{{ $t('page.and') }}</span>
                  <span v-else-if="conditionGroup.conditionRelList[cindex].joinType=='or'">{{ $t('page.or') }}</span>
                  <Icon type="ios-arrow-down"></Icon>
                </a>
                <DropdownMenu slot="list">
                  <DropdownItem name="and">{{ $t('page.and') }}</DropdownItem>
                  <DropdownItem name="or">{{ $t('page.or') }}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
        <div v-if="workcenterConditionDataLocal.conditionGroupRelList.length > 0 && index < workcenterConditionDataLocal.conditionGroupList.length - 1" style="text-align:center">
          <Dropdown
            trigger="click"
            placement="bottom-start"
            @on-click=" val => {
              changeJoinType(workcenterConditionDataLocal.conditionGroupRelList[index], val);
            }"
          >
            <a href="javascript:void(0)">
              <span v-if="workcenterConditionDataLocal.conditionGroupRelList[index].joinType=='and'">{{ $t('page.and') }}</span>
              <span v-else-if="workcenterConditionDataLocal.conditionGroupRelList[index].joinType=='or'">{{ $t('page.or') }}</span>
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="and">{{ $t('page.and') }}</DropdownItem>
              <DropdownItem name="or">{{ $t('page.or') }}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
    <ConditionGroupDialog
      v-if="isDialogShow"
      :conditionList="conditionList"
      :selectedConditionList="currentConditionList"
      :selectedChannelUuidList="currentChannelUuidList"
      :conditionGroupUuid="currentConditionGroupUuid"
      @close="closeGroupDialog"
      @save="addConditionGroup"
    ></ConditionGroupDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ConditionGroupDialog: resolve => require(['./conditiongroup-dialog.vue'], resolve),
    SearchInputer: resolve => require(['./search-inputer.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    workcenterConditionData: { type: Object },
    conditionList: { type: Array }
  },
  data() {
    return {
      isLoaded: false, //标记数据是否加载完毕，确保表单可以正常回显
      mode: 'custom',
      joinTypeList: [
        { value: 'and', text: this.$t('page.and') },
        { value: 'or', text: this.$t('page.or') }
      ],
      currentConditionGroupUuid: '', //保存当前编辑分组的uuid，提供给编辑条件分组窗口使用
      currentConditionList: [], //保存当前编辑分组的属性原始数据，提供给编辑条件分组窗口使用
      currentChannelUuidList: [], //保存当前编辑分组的服务Uuid列表，提供给编辑条件分组窗口使用
      isDialogShow: false,
      /**
       * 工单中心的数据保存一份在本地，当点击搜索时再对外提供
       * 注意：传递到searchInputer的数据会使用workcenterConditionDataLocal，这样子控件可以直接修改数据而不会影响真正的搜索数据
       */
      workcenterConditionDataLocal: { conditionGroupRelList: [], conditionGroupList: [] }, //用于保存的最终数据
      conditionMap: {} //选中的条件数据，如果是表单属性，key是channelUui+表单label
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      //把固定条件数据放进conditionMap，等待提取
      if (this.conditionList && this.conditionList.length > 0) {
        this.conditionList.forEach(condition => {
          this.conditionMap[condition.handler] = condition;
        });
      }
      //把如果工单中心使用了表单条件，也需要预先提取到conditionMap，等待提取
      const channelUuidList = [];
      this.workcenterConditionData.conditionGroupList.forEach(conditionGroup => {
        if (conditionGroup.channelUuidList && conditionGroup.channelUuidList.length > 0) {
          conditionGroup.channelUuidList.forEach(uuid => {
            channelUuidList.push(uuid);
          });
        }
      });
      if (channelUuidList.length > 0) {
        this.$api.process.process.channelForm({ channelUuidList: channelUuidList, conditionModel: 'custom' }).then(res => {
          //把数据转换成和工单中心条件的格式一致
          if (res.Return && res.Return.length > 0) {
            res.Return.forEach(d => {
              const newD = {};
              newD['handler'] = d.label; //属性中文名
              newD['handlerName'] = d.label; //属性中文名
              newD['handlerType'] = d.handlerType; //ex:select
              newD['formHandler'] = d.handler; //ex:formselect
              newD['type'] = 'form';
              newD['expressionList'] = d.expressionList;
              try {
                newD['config'] = JSON.parse(d.config);
              } catch (e) {
                console.error(e);
              }
              this.conditionMap[d.channelUuid + '#' + newD.handler] = newD;
            });
          }
          this.isLoaded = true;
        });
      } else {
        this.isLoaded = true;
      }
    },
    editConditionGroup(conditionGroupData) {
      //把数据转换回原始状态再传入dialog
      this.currentConditionGroupUuid = conditionGroupData.uuid;
      const currentConditionList = [];
      const channelUuidList = conditionGroupData['channelUuidList'];
      conditionGroupData.conditionList.forEach(condition => {
        if (condition.type == 'common') {
          if (this.conditionMap[condition.name]) {
            currentConditionList.push(this.conditionMap[condition.name]);
          }
        } else if (condition.type == 'form' && channelUuidList.length > 0) {
          this.currentChannelUuidList = channelUuidList;
          if (this.conditionMap[channelUuidList[0] + '#' + condition.name]) {
            currentConditionList.push(this.conditionMap[channelUuidList[0] + '#' + condition.name]);
          }
        }
      });
      this.currentConditionList = currentConditionList;
      this.isDialogShow = true;
    },
    deleteCondition(conditionGroupData, conditionData) {
      const index = conditionGroupData.conditionList.findIndex(d => d == conditionData);
      if (index > -1) {
        conditionGroupData.conditionList.splice(index, 1);
        if (conditionGroupData.conditionRelList.length > 0 && index < conditionGroupData.conditionRelList.length) {
          conditionGroupData.conditionRelList.splice(index, 1);
        }
        if (conditionGroupData.conditionList.length == 0) {
          const gindex = this.workcenterConditionDataLocal.conditionGroupList.findIndex(d => d == conditionGroupData);
          if (gindex > -1) {
            this.workcenterConditionDataLocal.conditionGroupList.splice(gindex, 1);
            if (this.workcenterConditionDataLocal.conditionGroupRelList.length > 0 && gindex < this.workcenterConditionDataLocal.conditionGroupRelList.length) {
              this.workcenterConditionDataLocal.conditionGroupRelList.splice(gindex, 1);
            }
          }
        }
        this.$forceUpdate();
      }
    },
    getConditionConfigByConditionData(conditionGroup, condition) {
      if (condition.type == 'common') {
        return this.conditionMap[condition.name] || {};
      } else if (condition.type == 'form' && conditionGroup.channelUuidList.length > 0) {
        return this.conditionMap[conditionGroup.channelUuidList[0] + '#' + condition.name] || {};
      }
      return {};
    },
    change(condition, type, val) {
      //后端要求valueList必须是数组
      if (type == 'valueList') {
        if (val && !(val instanceof Array)) {
          val = [val];
        }
      }
      this.$set(condition, type, val);
      this.$forceUpdate(); // 强制更新视图，切换表达式：为空或者不为空，表达式值没有更新，导致后面的文本框没有隐藏
    },
    changeJoinType(obj, val) {
      this.$set(obj, 'joinType', val);
      this.$forceUpdate();//此句不加下拉框不更新
    },
    getData() {
      this.workcenterConditionDataLocal.handlerType = 'custom';
      return this.workcenterConditionDataLocal;
    },
    valid() {
      const searchInputerList = this.$refs['searchInputer'];
      const expressionList = this.$refs['expressionList'];
      let isValid = true;
      if (searchInputerList && searchInputerList.length > 0) {
        searchInputerList.forEach(element => {
          if (!element.valid()) {
            isValid = false;
          }
        });
      }
      if (expressionList && expressionList.length > 0) {
        expressionList.forEach(element => {
          if (!element.valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    },
    showGroupDialog() {
      this.isDialogShow = true;
    },
    closeGroupDialog() {
      this.currentConditionGroupUuid = '';
      this.currentConditionList = [];
      this.currentChannelUuidList = [];
      this.isDialogShow = false;
    },
    addConditionGroup(conditionGroupUuid, channelUuidList, attributeList) {
      if (attributeList && attributeList.length > 0) {
        let newConditionGroup = null;
        if (conditionGroupUuid) {
          newConditionGroup = this.workcenterConditionDataLocal.conditionGroupList.find(d => d.uuid == conditionGroupUuid);
        } 
        if (!newConditionGroup) {
          newConditionGroup = {};
          newConditionGroup['uuid'] = this.$utils.setUuid();
          this.workcenterConditionDataLocal.conditionGroupList.push(newConditionGroup);
          if (this.workcenterConditionDataLocal.conditionGroupList.length > 1) {
            const conditionGroupRelObj = {};
            conditionGroupRelObj['joinType'] = 'or';
            this.workcenterConditionDataLocal.conditionGroupRelList.push(conditionGroupRelObj);
          }
        }
        const oldConditionList = newConditionGroup.conditionList;
        newConditionGroup['channelUuidList'] = channelUuidList;
        const conditionList = [];
        attributeList.forEach(condition => {
          let newCondition = null;
          if (oldConditionList) {
            newCondition = oldConditionList.find(oldcondition => {
              return oldcondition.type == condition.type && oldcondition.name == condition.handler;
            });
          }
          if (!newCondition) {
            newCondition = {};
            newCondition['uuid'] = this.$utils.setUuid();
            newCondition['valueList'] = [];
            newCondition['name'] = condition.handler;
            newCondition['label'] = condition.handlerName;
            newCondition['type'] = condition.type;
            newCondition['text'] = '';
            newCondition['expression'] = 'include';
            //表单条件才有这个属性
            newCondition['handler'] = condition.formHandler;
          }
          conditionList.push(newCondition);
          //补充使用了表单属性进conditionMap
          if (condition.type == 'form' && channelUuidList.length > 0) {
            this.conditionMap[channelUuidList[0] + '#' + condition.handler] = condition;
          }
        });
        newConditionGroup['conditionList'] = conditionList;
        //补充conditionRelList信息，默认都是使用or串联
        const conditionRelList = [];
        if (conditionList.length > 1) {
          for (let i = 1; i < conditionList.length; i++) {
            const conditionRelObj = {};
            conditionRelObj['joinType'] = 'or';
            conditionRelList.push(conditionRelObj);
          }
        }
        newConditionGroup['conditionRelList'] = conditionRelList;
      }
      this.closeGroupDialog();
    }
  },
  filter: {},
  computed: {},
  watch: {
    workcenterConditionData: {
      handler: function(val) {
        this.workcenterConditionDataLocal = this.$utils.deepClone(val);
        //如果搜索模式和当前模式不一致，先清空数据
        if (this.workcenterConditionDataLocal.handlerType != this.mode) {
          this.workcenterConditionDataLocal.handlerType = this.mode;
          this.workcenterConditionDataLocal.conditionGroupList = [];
          this.workcenterConditionDataLocal.conditionGroupRelList = [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.condition-grid {
  display: grid;
  width: 100%;
  grid-gap: 12px;
  grid-template-columns: 120px 150px auto 50px;
}
</style>
<style lang="less">
.transparent {
  background-color: transparent !important;
}
</style>
