<template>
  <div id="slamanage">
    <div style="height: 48px; padding: 0 24px; background: white;">
      <TsFormInput search :placeholder="$t('term.process.allservicetype')" style="width: calc(25% - 12px); margin-top: 9px; float: right;"></TsFormInput>
    </div>
    <div style="padding:16px 24px;background:#ddd;">
      <div class="numberBlock clearfix">
        <div style="background: #01BAD7;">
          <Icon
            class="itemIcon"
            type="ios-bookmark-outline"
            color="white"
            size="60"
          />
          <Icon
            class="bgItemIcon"
            type="ios-bookmark-outline"
            color="white"
            size="200"
          />
          <div class="content">
            <div class="num">14</div>
            <div class="label">{{ $t('term.process.slatags') }}</div>
          </div>
        </div>
        <div style="background: #F2A471;">
          <Icon
            class="itemIcon"
            type="ios-sunny-outline"
            color="white"
            size="60"
          />
          <Icon
            class="bgItemIcon"
            type="ios-sunny-outline"
            color="white"
            size="200"
          />
          <div class="content">
            <div class="num">35</div>
            <div class="label">{{ $t('term.process.slapolicy') }}</div>
          </div>
        </div>
        <div style="background: #009487;">
          <Icon
            class="bgItemIcon"
            type="ios-time-outline"
            color="white"
            size="200"
          />
          <div class="content updown">
            <div class="label">{{ $t('term.process.maxaging') }}</div>
            <div class="num">
              <div>42</div>
              <div>42</div>
              <div>42</div>
            </div>
          </div>
        </div>
        <div style="background: #4253AF;">
          <Icon
            class="bgItemIcon"
            type="ios-timer-outline"
            color="white"
            size="200"
          />
          <div class="content updown">
            <div class="label">{{ $t('term.process.minaging') }}</div>
            <div class="num">
              <div>42</div>
              <div>42</div>
              <div>42</div>
            </div>
          </div>
        </div>
      </div>
      <!--<Table class="slaContent" :max-height="660" :columns="columns" :data="slaList">-->
      <!--<div slot="header">-->

      <!--</div>-->
      <!--</Table>-->
      <div class="slaContent">
        <div class="header flex">
          <div class="col1">#</div>
          <div class="col2">流程名称</div>
          <div class="col3">SLA标签</div>
          <div class="col4">关联步骤</div>
          <div class="col5">策略条件</div>
          <div class="col6">优先级时效</div>
          <div class="col7"></div>
        </div>
        <div class="conItem flex">
          <div class="col1">1</div>
          <div class="col2">这是流程名称</div>
          <div class="flexColumnAll">
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
                <div class="itemSla">
                  <span>策略二</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
                <div class="itemSla">
                  <span>策略二</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="conItem flex">
          <div class="col1">1</div>
          <div class="col2">这是流程名称</div>
          <div class="flexColumnAll">
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
                <div class="itemSla">
                  <span>策略二</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
                <div class="itemSla">
                  <span>策略二</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="conItem flex">
          <div class="col1">1</div>
          <div class="col2">这是流程名称</div>
          <div class="flexColumnAll">
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
                <div class="itemSla">
                  <span>策略二</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
                <div class="itemSla">
                  <span>策略二</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="conItem flex">
          <div class="col1">1</div>
          <div class="col2">这是流程名称</div>
          <div class="flexColumnAll">
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
                <div class="itemSla">
                  <span>策略二</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
            <div class="flexItem">
              <div class="col3">服务时效</div>
              <div class="col4">所有步骤</div>
              <div class="col5">
                <div class="itemSla">
                  <span style="color: rgba(0,0,0,.3)">策略一</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
                <div class="itemSla">
                  <span>策略二</span>
                  <span>表单组件“环境”值==“测试”表</span>
                  <span>or</span>
                  <span>表单组件“环境”值==“测试”表</span>
                </div>
              </div>
              <div class="priority col6">
                <span>紧急</span>
                <span>10分钟</span>
                <span>严重</span>
                <span>10分钟</span>
                <span>一般</span>
                <span>10分钟</span>
              </div>
              <div class="col7">
                <Icon
                  class="itemIcon"
                  type="ios-settings"
                  color="black"
                  size="20"
                  style="cursor: pointer;"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: [''],
  data() {
    return {
      columns: [],
      slaList: []
    };
  },
  mounted() {},
  methods: {},
  watch: {}
};
</script>
<style lang="less">
.numberBlock {
  > div {
    width: calc(25% - 12px);
    height: 160px;
    background: #00ccff;
    margin-right: 16px;
    position: relative;
    display: flex;
    float: left;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    &:last-child {
      margin-right: 0;
    }
    .itemIcon {
      width: 30%;
    }
    .bgItemIcon {
      position: absolute;
      top: -80px;
      right: -70px;
      opacity: 0.35;
    }
    .content {
      color: white;
      flex: 1;
    }
    .num {
      font-size: 40px;
    }
    .label {
      font-size: 16px;
      opacity: 0.85;
    }
    .updown {
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
      & .num {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 -16px;
        > div {
          width: calc(100% / 3);
          line-height: 40px;
          text-align: center;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          &:last-child {
            border-right: none;
          }
        }
      }
    }
  }
}

.slaContent {
  /*max-height: calc(100% - 176px);*/
  margin-top: 24px;
  font-size: 13px;
  .flex {
    display: flex;
  }
  .flexColumnAll {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .flexItem {
    flex: 1;
    display: flex;
    &:not(:last-child) {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
  }
  .col1 {
    min-width: 36px;
  }
  .col2 {
    min-width: 160px;
  }
  .col3 {
    min-width: 100px;
  }
  .col4 {
    min-width: 110px;
  }
  .col5 {
    flex: 1;
  }
  .col6 {
    min-width: 310px;
  }
  .col7 {
    min-width: 36px;
  }
  .header {
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 16px;
    padding: 0 0 0 24px;
  }
  .conItem {
    color: rgba(0, 0, 0, 0.65);
    background-color: #ffffff;
    padding: 16px 0 16px 24px;
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }
  .itemSla {
    line-height: 26px;
    span {
      margin-right: 10px;
      &:first-child {
        color: rgba(0, 0, 0, 0.3);
      }
      &:nth-child(3) {
        color: #01bad5;
      }
    }
  }
  .priority {
    line-height: 26px;
    span {
      margin-right: 10px;
      &:nth-child(odd) {
        color: rgba(0, 0, 0, 0.45);
      }
    }
  }
}
</style>
