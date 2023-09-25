<template>
  <TsDialog
    v-bind="dialogConfig"
    :isShow="isShow"
    @on-ok="saveIcon"
    @on-close="close"
  >
    <div class="select-icon tsscroll-container">
      <RadioGroup v-model="selectedIcon" class="radioblock">
        <Radio v-for="(item, index) in menuicon" :key="index" :label="item.icon">
          <i :class="item.icon" style="font-size:25px" aria-hidden="true"></i>
          <div>{{ item.icon }}</div>
        </Radio>
      </RadioGroup>
    </div>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {},
  props: {
    isShow: Boolean,
    icon: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogConfig: {
        type: 'slider',
        width: 'large',
        className: 'serviceDilogMana',
        title: this.$t('term.framework.iconselect')
      },
      selectedIcon: '',
      menuicon: [
        {
          keyword: 'setting 设置 配置',
          icon: 'tsfont-setting'
        },
        {
          keyword: 'search 搜索',
          icon: 'tsfont-search'
        },
        {
          keyword: 'upload 上传',
          icon: 'tsfont-batch-upload'
        },
        {
          keyword: 'link 链接',
          icon: 'tsfont-attachment'
        },
        {
          keyword: '',
          icon: 'tsfont-bell'
        },
        {
          keyword: '',
          icon: 'tsfont-question-o'
        },
        {
          keyword: '',
          icon: 'tsfont-alert'
        },
        {
          keyword: '',
          icon: 'tsfont-chart-lines'
        },
        {
          keyword: '',
          icon: 'tsfont-m-request'
        },
        {
          keyword: '',
          icon: 'tsfont-type'
        },
        {
          keyword: '',
          icon: 'tsfont-putongjigui'
        },
        {
          keyword: '',
          icon: 'tsfont-xitongpeizhi'
        },
        {
          keyword: '',
          icon: 'tsfont-mail-o'
        },
        {
          keyword: '',
          icon: 'tsfont-tags'
        },
        {
          keyword: '',
          icon: 'tsfont-ip-list'
        },
        {
          keyword: '',
          icon: 'tsfont-batch-ops'
        },
        {
          keyword: '',
          icon: 'tsfont-m-batchdeploy'
        },
        {
          keyword: '',
          icon: 'tsfont-m-stack'
        },
        {
          keyword: '',
          icon: 'tsfont-m-signature'
        },
        {
          keyword: '',
          icon: 'tsfont-dictionary'
        },
        {
          keyword: '',
          icon: 'tsfont-report'
        },
        {
          keyword: '',
          icon: 'tsfont-cloud'
        },
        {
          keyword: '',
          icon: 'tsfont-pulse'
        },
        {
          keyword: '',
          icon: 'tsfont-m-dashboard'
        },
        {
          keyword: '',
          icon: 'tsfont-m-dashboard-job'
        },
        {
          keyword: '',
          icon: 'tsfont-auth'
        },
        {
          keyword: '',
          icon: 'tsfont-browser'
        },
        {
          keyword: '',
          icon: 'tsfont-certificate'
        },
        {
          keyword: '',
          icon: 'tsfont-callcenter'
        },
        {
          keyword: '',
          icon: 'tsfont-cientityselect'
        },
        {
          keyword: '',
          icon: 'tsfont-m-ip'
        },
        {
          keyword: '',
          icon: 'tsfont-home'
        },
        {
          keyword: '',
          icon: 'tsfont-report'
        },
        {
          keyword: '',
          icon: 'tsfont-plugin'
        },
        {
          keyword: '',
          icon: 'tsfont-m-octopus'
        },
        {
          keyword: '',
          icon: 'tsfont-m-apm'
        },
        {
          keyword: '',
          icon: 'tsfont-m-deployment'
        },
        {
          keyword: '',
          icon: 'tsfont-topo'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.selectedIcon = this.icon;
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
    close() {
      this.$emit('close');
    },
    saveIcon() {
      if (this.selectedIcon) {
        this.$emit('close', this.selectedIcon);
      } else {
        this.$Notice.error({
          title: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.icon')})
        });
      }
    },
    selecticon(item) { //选择图标
      this.selectedIcon = item.icon || '';
    }
  },
  computed: {},
  watch: {}

};

</script>
<style lang='less' scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.serviceDilogMana {
  button {
    margin-right: 10px;
  }
  .radioblock{
    /deep/ .ivu-radio-group-item{
      cursor: pointer;
      border-radius: 4px;
      padding: 5px;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 25%;
      margin: 10px 0;
      text-align: center;
      // .ivu-radio{
      //   display: none;
      // }
    }
  
  }

}

</style>
