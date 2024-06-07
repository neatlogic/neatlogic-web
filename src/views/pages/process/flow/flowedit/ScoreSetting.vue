<template>
  <div class="score-setting">
    <div class="active-status">
      <span>{{ $t('term.process.enablescoring') }}</span>
      <span><TsFormSwitch v-model="scoreConfig.isActive" @on-change="clearAuto"></TsFormSwitch></span>
    </div>
    <template v-if="scoreConfig.isActive">
      <div class="score-template">
        <span class="title">{{ $t('term.process.scoringtemplate') }}</span>
        <i class="icon text-tip-active tsfont-eye" @click="viewScoreTemplate"></i>
        <i class="icon text-tip-active tsfont-edit" @click="toScoreTemplateManagePage('edit')"></i>
        <i class="icon text-tip-active tsfont-rotate-right" :class="{'refreshing': isRefreshing}" @click="refresh"></i>
      </div>
      <TsFormSelect ref="select" v-model="scoreConfig.scoreTemplateId" v-bind="selectConfig">
        <template v-slot:first-ul>
          <li class="tsfont-plus text-href first-slot" @click="toScoreTemplateManagePage('add')">{{ $t('page.template') }}</li>
        </template>
      </TsFormSelect>
      <div class="auto-score">
        <div>
          <span>{{ $t('term.process.autoscoring') }}</span>
          <Tooltip
            theme="light"
            transfer
            max-width="300px"
            placement="bottom-start"
          >
            <i class="fz10 tsfont-info-o text-href"></i>
            <div slot="content" class="tooltip-content">{{ $t('term.process.scorefavourable') }}</div>
          </Tooltip>
        </div>
        <div>
          <TsFormSwitch v-model="scoreConfig.isAuto" @on-change="clearAuto"></TsFormSwitch>
        </div>
      </div>
      <div v-if="scoreConfig.isAuto" class="auto-time">
        <TsFormSelect v-model="scoreConfig.config.autoTimeType" v-bind="dateTypeConfig" style="marginRight:8px;"></TsFormSelect>
        <InputNumber
          v-model="scoreConfig.config.autoTime"
          :min="1"
          :formatter="value => `${value}`+$t('page.day')"
        ></InputNumber>
      </div>
    </template>

    <TsDialog
      :hasFooter="false"
      :isShow.sync="isDialogShow"
      :title="$t('term.process.scoringtemplate')"
      transfer
      className="score-template-dialog"
    >
      <div class="template-detail">
        <div class="header">
          <span class="name-header text-title">{{ $t('term.process.scoringdimension') }}</span>
          <span class="desc-header text-title">{{ $t('page.explain') }}</span>
        </div>
        <ul>
          <li v-for="item in dimensionList" :key="item.id" class="dimension-item">
            <span class="name">{{ item.name }}</span>
            <span class="desc">{{ item.description || '-' }}</span>
          </li>
        </ul>
      </div>
    </TsDialog>
  </div>
</template>

<script>

export default {
  name: 'ScoreSetting',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue')
  },
  props: {
    scoreConfig: {type: Object, required: true},
    canvasNodeList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isRefreshing: false,
      isDialogShow: false,
      dimensionList: [],
      selectConfig: {
        search: true,
        border: 'border',
        clearable: false,
        defaultValueIsFirst: true,
        url: 'api/rest/score/template/search/forselect',
        rootName: 'scoreTemplateList',
        validateList: ['required'],
        transfer: true
      },
      dateTypeConfig: {
        width: '80px',
        border: 'border',
        clearable: false,
        defaultValueIsFirst: true,
        dataList: [
          {value: 'naturalDay', text: this.$t('page.naturalday')},
          {value: 'workDay', text: this.$t('page.weekday')}
        ],

        validateList: ['required']
      }
    };
  },
  methods: {
    viewScoreTemplate() {
      this.dimensionList = [];
      this.isDialogShow = true;
      const params = {
        id: this.scoreConfig.scoreTemplateId
      };
      this.$api.process.scoreTemplate
        .get(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.dimensionList = res.Return.dimensionList;
          }
        });
    },
    toScoreTemplateManagePage(type) {
      window.open(HOME + '/process.html#/score-template-manage' + '?visiable=true&operation=' + type + '&id=' + this.scoreConfig.scoreTemplateId, '_blank');
    },
    refresh() {
      this.isRefreshing = true;
      this.$refs.select.initDataListByUrl();
      setTimeout(() => {
        this.$Message.success(this.$t('message.executesuccess'));
        this.isRefreshing = false;
      }, 1000);
    },
    clearAuto() {
      this.scoreConfig.config.autoTimeType = '';
      this.scoreConfig.config.autoTime = 1;
    }
  },
  computed: {},
  watch: {
    // canvasNodeList: {
    //   handler: function(newVal) {
    //     let nodeList = newVal.filter(d => d.type !== 'start' && d.type !== 'end' && d.type !== 'converge');
    //     let newArr = [];
    //     let textList = {};
    //     nodeList.forEach(item => {
    //       let arr = {
    //         text: item.name,
    //         value: item.uuid
    //       };
    //       textList[item.uuid] = item.name;
    //       newArr.push(arr);
    //     });
    //     this.stepSelectConfig.dataList.splice(0);
    //     this.stepSelectConfig.dataList.push(...newArr);
    //   },
    //   deep: true
    // }
  }
};
</script>

<style lang="less" scoped>
.score-setting {
  width: 100%;
  overflow-y: auto;
  height: calc(100vh - 150px);
  padding: 16px;
  .active-status,
  .auto-score {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .tip {
      font-size: 16px;
      margin-left: 4px;
      .tooltip-content {
        padding: 5px;
      }
    }
  }
  .auto-score{
    padding-top: 16px;
  }
  .score-template {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
    .title {
      flex: 1;
    }
    .icon {
      &:not(:first-child) {
        margin-left: 12px;
      }
      &.tsfont-rotate-right::before {
        margin-right: 0;
      }
      &.refreshing {
        animation: ani-demo-spin 1s linear forwards;
      }
    }
  }
  .auto-time {
    margin-top: 4px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .step-select{
    .title{
      margin-bottom: 8px;
    }
    margin-top: 20px;
  }
}

.score-template-dialog {
  .template-detail {
    margin: 0 20px;
    .header {
      padding-bottom: 8px;
      .name-header {
        display: inline-block;
        width: 140px;
      }
      .desc-haader {
        display: inline-block;
      }
    }
    .dimension-item {
      margin-bottom: 10px;
      .name {
        display: inline-block;
        width: 140px;
      }
      .desc {
        display: inline-block;
      }
    }
  }
}
</style>
