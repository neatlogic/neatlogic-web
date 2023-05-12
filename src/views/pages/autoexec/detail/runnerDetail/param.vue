<template>
  <div class="param-div" :class="{'param-padding-12': isTimeJobPage}">
    <div v-if="!showLoading && list && list.length>0">
      <div v-for="(data ,index) in list" :key="index" class="list">
        <TsFormItem
          :required="data.isRequired?true : false"
          :label="data.name || data.key"
          :des="data.description"
          class="param-item"
          :class="isFullWidth ? 'no-padding-bottom' : ''"
          :labelWidth="100"
          labelPosition="left"
        >
          <Item
            :is="handlerType(data.type)"
            ref="item"
            v-model="valueConfig[data.key]"
            :class="isFullWidth ? 'full-item' : 'item'"
            :isRequired="data.isRequired"
            :defaultValue="data.defaultValue"
            :config="itemConfig[data.key]"
            :phaseList="getPhaseList(phaseList)"
            :disabled="disabled || (data.hasOwnProperty('editable')? !data.editable : false)"
          ></Item>
        </TsFormItem>
      </div>
    </div>
    <div v-else-if="!showLoading" class="text-tip lh-2" :class="isFullWidth ? 'no-data-empty-top' : ''">{{ $t('page.notarget', {target: $t('page.param')}) }}</div>
    <Loading v-else-if="showLoading"></Loading>
  </div>
</template>
<script>
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import Item from '@/views/pages/autoexec/components/param/view/index.js';
export default {
  name: '',
  components: {
    TsFormItem,
    ...Item
  },
  filters: {},
  props: {
    id: {type: [Number, String]},
    paramList: Array,
    param: {
      // 定时作业详情页面回显参数
      type: Object,
      default: function() {
        return {};
      }
    },
    isShowTitle: {
      // 是否显示输入参数文案，默认显示
      type: Boolean,
      default: true
    },
    isFullWidth: {
      // 宽度是否100%
      type: Boolean,
      default: false
    },
    phaseList: { //流水线阶段
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showLoading: true,
      list: [],
      valueConfig: {}, //所有值对应的集合
      itemConfig: {}, //所以组件对应的渲染config集合
      isTimeJobPage: false // 是否是定时作业页面
    };
  },
  beforeCreate() {},
  created() {
    this.getIsTimeJobByRouteName();
  },
  beforeMount() {},
  mounted() {
    this.getParamList(); 
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getIsTimeJobByRouteName() {
      // 根据路由名称，获取是否是定时作业页面
      let pathArr = ['/time-job-add', '/time-job-detail'];
      this.isTimeJobPage = pathArr.includes(this.$route.path);
    },
    getParamList() {
      // if (this.id) {
      //   let data = { combopId: this.id };
      //   let _this = this;
      //   this.$api.autoexec.action.getParamList(data).then(res => {
      //     if (res.Status == 'OK') {
      //       if (res.Return && res.Return.length > 0) {
      //         _this.list = res.Return || [];
      //         _this.initConfig();
      //       }
      //     }
      //   }).finally(() => {
      //     this.showLoading = false;
      //   });
      // } else {
      //   this.showLoading = false;
      //   this.list = this.paramList;
      //   this.initConfig();
      // }
      this.showLoading = false;
      this.list = this.paramList;
      this.initConfig();
    },
    valid() {
      let isValid = true;
      this.$refs.item && this.$refs.item.forEach(item => {
        if (item.valid) {
          isValid = item.valid() ? isValid : false;
        }
      });
      return isValid;
    },
    getValue() {
      return this.valueConfig;
    },
    initConfig() { //先进行初始化，避免每次render调用方法导致子组件从新渲染
      let lendthList = ['json', 'radio', 'checkbox', 'node', 'file'];
      this.itemConfig = {};
      this.valueConfig = {};
      this.list instanceof Array && this.list.forEach(data => {
        let config = Object.assign({}, data.config ? data.config : data);  
        config.desc = data.description;
        if (config.validateList && !config.validateList.includes('required')) {
          data.isRequired && config.validateList.push('required');
        } else if (this.$utils.isEmpty(config.validateList)) {
          config.validateList = data.isRequired ? ['required'] : [];
        }
        if (data.type == 'file') {
          config.showNumber = 6;
        }
        if (data.type == 'node') {
          config.showNumber = 6;
        }
        config.type = data.type;
        this.$set(this.itemConfig, data.key, config);
        // 对象为空显示默认值，否则显示回显值
        this.$set(this.valueConfig, data.key, this.$utils.isEmptyObj(this.param) ? data.defaultValue : this.param[data.key]);
      });
    }
  },
  computed: {
    handlerType() {
      let _this = this;
      return (value) => {
        let type = value + 'Handler';
        type = Item[type] ? type : 'defaultInput';
        return type;
      };
    },
    getPhaseList() {
      return (phaseList) => {
        let list = [];
        if (phaseList && phaseList.length > 0) {
          list = phaseList.map(item => {
            return {
              text: item.name,
              value: item.name
            };
          });
        }
        return list;
      };
    }
   
  },
  watch: {
    paramList: {
      handler() {
        this.getParamList();
      },
      deep: true
    },
    id: {
      handler() {
        this.getParamList();
        this.getIsTimeJobByRouteName(); // 根据路由名称，获取是否是定时作业页面
      }
    }
  }

};
</script>
<style lang='less' scoped>
.param-div{
  .list {
    &:not(:last-child) {
        /deep/.param-item{
        padding-bottom: 10px;
      }
    }
  }
  /deep/.param-item{
    .ivu-tooltip-rel{
      margin-left:3px;
    }
    .ivu-tooltip{
      vertical-align: bottom;
    }
  }
  .no-padding-bottom {
    padding-bottom: 0 !important;
  }
  .empty-tip{
    margin: 0px 16px 16px;
    display: block;
  }
  .no-data-empty-top {
    padding-bottom: 16px !important;
  }
  &.param-padding-12 {
    // 定时作业编辑样式
    // padding-left: 12px;
    .param-title {
      padding: 0 0 16px 0 !important;
    }
  }
}

</style>
