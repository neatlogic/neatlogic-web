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
        className: 'serviceDilogMana',
        title: this.$t('term.framework.iconselect')
      },
      selectedIcon: '',
      menuicon: [
        {
          keyword: 'setting 设置 配置',
          icon: 'ts-setting'
        },
        {
          keyword: 'search 搜索',
          icon: 'ts-search'
        },
        {
          keyword: 'upload 上传',
          icon: 'ts-upload'
        },
        {
          keyword: 'link 链接',
          icon: 'ts-link'
        },
        {
          keyword: '',
          icon: 'ts-notice'
        },
        {
          keyword: '',
          icon: 'ts-m-problem'
        },
        {
          keyword: '',
          icon: 'ts-alert'
        },
        {
          keyword: '',
          icon: 'ts-linechart'
        },
        {
          keyword: '',
          icon: 'ts-m-request'
        },
        {
          keyword: '',
          icon: 'ts-typelist'
        },
        {
          keyword: '',
          icon: 'ts-m-works'
        },
        {
          keyword: '',
          icon: 'ts-dev-security'
        },
        {
          keyword: '',
          icon: 'ts-email'
        },
        {
          keyword: '',
          icon: 'ts-tags'
        },
        {
          keyword: '',
          icon: 'ts-m-playbook'
        },
        {
          keyword: '',
          icon: 'ts-batch-ops'
        },
        {
          keyword: '',
          icon: 'ts-m-batchdeploy'
        },
        {
          keyword: '',
          icon: 'ts-m-stack'
        },
        {
          keyword: '',
          icon: 'ts-m-signature'
        },
        {
          keyword: '',
          icon: 'ts-dictionary'
        },
        {
          keyword: '',
          icon: 'ts-report'
        },
        {
          keyword: '',
          icon: 'ts-cloud'
        },
        {
          keyword: '',
          icon: 'ts-pulse'
        },
        {
          keyword: '',
          icon: 'ts-m-dashboard'
        },
        {
          keyword: '',
          icon: 'ts-m-dashboard-job'
        },
        {
          keyword: '',
          icon: 'ts-m-auth'
        },
        {
          keyword: '',
          icon: 'ts-m-browser'
        },
        {
          keyword: '',
          icon: 'ts-m-certificate'
        },
        {
          keyword: '',
          icon: 'ts-m-callcenter'
        },
        {
          keyword: '',
          icon: 'ts-m-cmdb'
        },
        {
          keyword: '',
          icon: 'ts-m-ip'
        },
        {
          keyword: '',
          icon: 'ts-m-home'
        },
        {
          keyword: '',
          icon: 'ts-m-monitor'
        },
        {
          keyword: '',
          icon: 'ts-m-plugin'
        },
        {
          keyword: '',
          icon: 'ts-m-octopus'
        },
        {
          keyword: '',
          icon: 'ts-m-apm'
        },
        {
          keyword: '',
          icon: 'ts-m-deployment'
        },
        {
          keyword: '',
          icon: 'ts-sitemap'
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
    selecticon: function(item) { //选择图标
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
