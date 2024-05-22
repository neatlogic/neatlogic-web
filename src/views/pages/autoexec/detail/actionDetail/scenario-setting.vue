<template>
  <div class="padding">
    <div v-if="canEdit" class="tsfont-plus text-href" @click="addScenario">{{ $t('page.scene') }}</div>
    <ul class="scenario-ul">
      <li v-for="(item, index) in scenarioList" :key="index" class="scenario-li border-color">
        <div class="text-tip pb-xs">
          {{ item.scenarioName }}
          <template v-if="item.scenarioId == defaultScenarioId">[{{ $t('page.defaultscenario') }}]</template>
        </div>
        <div class="overflow">{{ getScenarioText(item.combopPhaseNameList) }}</div>
        <div v-if="canEdit" class="btn-list">
          <span class="text-tip-active tsfont-edit" @click="editScenario(item, index)"></span>
          <span class="text-tip-active tsfont-trash-o pl-md" @click="deleteScenario(item,index)"></span>
        </div>
      </li>
    </ul>
    <TsDialog
      v-if="isShow"
      type="slider"
      :isShow="isShow"
      width="mini"
      :title="title"
      @on-close="close"
      @on-ok="saveScenarioData"
    >
      <div class="pl-nm">
        <TsFormItem
          :label="$t('page.scenarioname')"
          labelPosition="left"
          :labelWidth="100"
          required
        >
          <TsFormSelect
            ref="scenarioForm"
            v-model="scenarioId"
            v-bind="scenarioForm"
            transfer
          ></TsFormSelect>
        </TsFormItem>
        <TsFormItem :label="$t('term.autoexec.settodefaultscenario')" labelPosition="left" :labelWidth="100">
          <TsFormSwitch v-model="isActive"></TsFormSwitch>
        </TsFormItem>
        <div>
          <ul v-if="stepList && stepList.length>0" class="stepList">
            <template v-for="(ary, sindex) in stepList">
              <li
                v-if="ary && ary.length"
                :key="sindex"
                class="step-li border-color"
              >
                <span class="stepIndex tips border-color"> {{ sindex+1 }} </span>
                <ul>
                  <li
                    v-for="(step, iindex) in ary"
                    :key="iindex"
                    class="dividing-color radius-sm padding-sm"
                    :class="step.isSelect?'bg-selected border-primary text-primary':'bg-op'"
                    @click="selectStep(step)"
                  >
                    <div>
                      <div class="step-name overflow" :title="step.name && step.name.length > 9 ? step.name : ''">{{ step.name || '-' }}</div>
                      <div class="step-type">
                        <span class="text-grey fz10">{{ getExecModeText(step.execMode) }}</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    combopId: [Number, String],
    currentScenarioList: Array,
    sortList: Array,
    execModeList: Array,
    canEdit: {
      type: Boolean,
      default: true
    },
    defaultScenarioId: Number //默认场景
  },
  data() {
    let _this = this;
    return {
      scenarioList: [],
      stepList: [],
      isShow: false,
      scenarioForm: {
        dynamicUrl: '/api/rest/autoexec/scenario/search',
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'name',
        border: 'border',
        width: '80%',
        validateList: ['required'],
        dealDataByUrl: _this.dealDataByUrl,
        disabledHoverTitle: this.$t('term.autoexec.thisscenariohasconfigured'),
        onChangelabel: (text) => {
          _this.scenarioName = text;
        }
      },
      title: this.$t('dialog.title.addtarget', {target: this.$t('page.scene')}),
      editScenarioConfig: null, //编辑：场景数据
      scenarioId: null,
      scenarioName: '',
      combopPhaseNameList: [],
      selectIndex: -1,
      isActive: 0
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    dealDataByUrl(list) {
      let dataList = [];
      list.forEach(item => {
        let findItem = this.scenarioList.find(s => s.scenarioId == item.id);
        //选择过的场景不可再次选择
        if (findItem) {
          if (!this.scenarioId && (this.editScenarioConfig && findItem.scenarioId == this.editScenarioConfig.scenarioId)) {
            this.$set(item, '_disabled', false);
          } else {
            this.$set(item, '_disabled', true);
          }
        }
        dataList.push(item);
      });
      return dataList;
    },
    getUpdateSort() {
      return this.stepList.reduce((list, data) => {
        list.push(...data);
        return list;
      }, []);
    },
    getCombopPhaseNameList() {
      let stepList = this.getUpdateSort();
      let list = [];
      stepList.forEach(item => {
        if (item.isSelect) {
          list.push(item.name);
        }
      });
      return list;
    },
    updateSelectStepList() {
      let list = [];
      if (this.sortList.length) {
        for (let sort = 0, index = 0; index < this.sortList.length;) {
          let arr = [];
          this.sortList.filter(l => {
            if (l.groupSort == sort) {
              this.$set(l, 'isSelect', false);
              if (this.combopPhaseNameList.length > 0) {
                let selectItem = this.combopPhaseNameList.find(c => c == l.name);
                selectItem && this.$set(l, 'isSelect', true);
              }
              arr.push(l);
              index++;
              return true;
            }
          });
          sort++;
          list.push(arr);
        }
      }
      return list;
    },
    addScenario() {
      this.title = this.$t('dialog.title.addtarget', {target: this.$t('page.scene')});
      this.isActive = 0;
      this.clearScenarioData();
      this.isShow = true;
    },
    editScenario(item, index) {
      this.title = this.$t('dialog.title.edittarget', {target: this.$t('page.scene')});
      this.editScenarioConfig = item;
      this.selectIndex = index;
      this.scenarioId = item.scenarioId;
      this.scenarioName = item.scenarioName;
      this.combopPhaseNameList = item.combopPhaseNameList;
      this.stepList = this.updateSelectStepList();
      if (this.scenarioId == this.defaultScenarioId) {
        this.isActive = 1;
      } else {
        this.isActive = 0;
      }
      this.isShow = true;
    },
    close() {
      this.clearScenarioData();
      this.isShow = false;
    },
    validScenarioData() {
      let isValid = true;
      if (!this.$refs.scenarioForm.valid()) {
        isValid = false;
      }
      this.combopPhaseNameList = this.getCombopPhaseNameList();
      if (!this.combopPhaseNameList.length) {
        isValid = false;
        this.$Notice.info({
          title: this.$t('term.autoexec.pleaseselectatleastonephase')
        });
      }
      return isValid;
    },
    clearScenarioData() {
      this.editScenarioConfig = null;
      this.selectIndex = -1;
      this.scenarioId = null;
      this.scenarioName = '';
      this.combopPhaseNameList = [];
      this.stepList = this.updateSelectStepList();
    },
    async saveScenarioData() {
      if (!this.validScenarioData()) {
        return;
      }
      let data = {
        scenarioId: this.scenarioId,
        scenarioName: this.scenarioName,
        combopPhaseNameList: this.combopPhaseNameList
      };
      if (this.selectIndex > -1) {
        this.scenarioList.splice(this.selectIndex, 1, data);
      } else {
        this.scenarioList.push(data);
      }
      if (this.isActive == 1) {
        this.$emit('updateDefaultScenarioId', this.scenarioId);
      } else {
        if (this.defaultScenarioId == this.scenarioId) {
          this.$emit('updateDefaultScenarioId', null);
        }
      }
      this.isShow = false;
      // let param = {
      //   id: this.combopId,
      //   defaultScenarioId: this.isActive == 1 ? this.scenarioId : this.defaultScenarioId,
      //   scenarioList: this.scenarioList
      // };
      // await this.$api.autoexec.action.saveActionScenario(param).then(res => {
      //   if (res.Status == 'OK') {
      //     this.isShow = false;
      //   }
      // });
    },
    deleteScenario(item, index) {
      if (this.defaultScenarioId == item.scenarioId) {
        this.$emit('updateDefaultScenarioId', null);
      }
      this.scenarioList.splice(index, 1);
      // this.$createDialog({
      //   title: this.$t('dialog.title.deleteconfirm'),
      //   content: '确认删除场景：' + item.scenarioName + '?',
      //   btnType: 'error',
      //   'on-ok': vnode => {
      //     if (this.defaultScenarioId == item.scenarioId) {
      //       this.$emit('updateDefaultScenarioId', null);
      //     }
      //     this.scenarioList.splice(index, 1);
      //     vnode.isShow = false;
      //   }
      // });
    },
    selectStep(step) {
      this.$set(step, 'isSelect', !step.isSelect);
    }
  },
  filter: {},
  computed: {
    getExecModeText() {
      return function(value) {
        let currentItem = this.execModeList.find(li => {
          return li.value == value;
        });
        return currentItem ? currentItem.text : '';
      };
    },
    getScenarioText() {
      return function(value) {
        let text = '';
        let list = [];
        if (value) {
          for (let i = 0; i < this.stepList.length; i++) {
            let arr = [];
            let arrText = '';
            for (let j = 0; j < this.stepList[i].length; j++) {
              let name = this.stepList[i][j].name;
              if (value.indexOf(name) > -1) {
                arr.push(name);
              }
            }
            if (arr.length > 0) {
              arrText = arr.join('/');
              list.push(arrText);
            }
          }
          if (list.length > 0) {
            text = list.join('-');
          }
        }
        return text;
      };
    }
  },
  watch: {
    sortList: {
      handler(val, oldVal) {
        let isSame = this.$utils.isSame(val, oldVal);
        if (!isSame) {
          this.stepList = this.updateSelectStepList();
        }
      },
      deep: true,
      immediate: true
    },
    currentScenarioList: {
      handler(val) {
        this.scenarioList = val || [];
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@iconWidth: 24px;
.scenario-li {
  position: relative;
  padding: 12px 30px 12px 0;
  &:hover {
     .btn-list {
       display: block;
     }
  }
  &:not(:last-of-type) {
    border-bottom: 1px solid;
  }
  /deep/ .tsform-readonly {
    cursor: default !important;
  }
  .btn-list {
    position: absolute;
    right: 0;
    top: 12px;
    display: none;
  }
}
ul.stepList {
  word-break: keep-all;
  white-space: nowrap;
  >li{
    padding-left: 30px;
    &:not(:last-child):before {
        content: '';
        position: absolute;
        width: 0;
        top: 28px;
        left: 11px;
        border: 0 none;
        border-left: 1px solid;
        border-color: inherit;
        border-style: dashed;
        bottom: -15px;
      }
    .stepIndex {
      &::before {
        content: attr(data-index);
        display: block;
        min-width: auto;
      }
    }
    .stepIndex {
      position: absolute;
      top: 1px;
      width: @iconWidth;
      height: @iconWidth;
      left: 0;
      border-radius: 50%;
      border: 1px solid;
      text-align: center;
      line-height: calc(@iconWidth - 1px);
      font-size: 12px;
      &:before {
        margin-right: 0;
      }
    }
  }
  li {
    position: relative;
    display: block;
    min-height: 58px;
    margin-bottom:16px;
    >ul{
      >li{
          position: relative;
          margin-bottom: 6px;
          width: 200px;
          cursor: pointer;
        &:last-of-type{
          margin-bottom: 0px;
        }
        .setp-check {
          position: absolute;
          top: 50%;
          left: 210px;
          transform: translateY(-50%);
        }
      }
    }
  }
}
</style>
