/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="padding">
    <div class="Message-list">
      <h4>Message 全局提示 (返回信息由前端写)</h4>
      <Button @click="info('Message')">显示普通提示</Button>
      <Button @click="success('Message')">显示成功提示</Button>
      <Button @click="warning('Message')">显示警告提示</Button>
      <Button @click="error('Message')">显示错误提示</Button>
      <Button @click="background('Message')">显示带背景普通提示</Button>
    </div>
    <div class="Message-list">
      <h4>Notice 通知提醒</h4>
      <Button @click="open(false)">普通提示</Button>
      <Button @click="open(true)">普通提示(只有标题)</Button>
      <p>标题和详情 (返回信息为后端返回)</p>
      <Button @click="infoNotice(false)">显示普通提示</Button>
      <Button @click="successNotice(false)">显示成功提示</Button>
      <Button @click="warningNotice(false)">显示警告提示</Button>
      <Button @click="errorNotice(false)">显示错误提示</Button>
      <p>只有标题</p>
      <Button @click="infoNotice(true)">显示普通提示</Button>
      <Button @click="successNotice(true)">显示成功提示</Button>
      <Button @click="warningNotice(true)">显示警告提示</Button>
      <Button @click="errorNotice(true)">显示错误提示</Button>
      <p>自定义</p>
      <Button @click="renderFunc">自定义</Button>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {
  },
  props: {
  },
  data() {
    return {
      typeList: {
        info: '显示普通提示',
        success: '显示成功提示',
        warning: '显示警告提示',
        error: '显示错误提示'
      }
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
    info(type) {
      this.$Message.info('显示普通提示');
    },
    success() {
      this.$Message.success('显示成功提示');
    },
    warning() {
      this.$Message.warning('显示警告提示');
    },
    error() {
      this.$Message.error('显示错误提示');
    },
    background() {
      this.$Message.info({
        content: '带背景提示',
        background: true, //背景,非必填
        duration: 3 //自动关闭的延时，非必填
      });
    },
    open(nodesc) {
      this.$Notice.open({
        title: '这是标题', //标题
        desc: nodesc ? '' : '这是详情', //详情
        duration: 3 //自动关闭的延时，非必填
      });
    },
    infoNotice(nodesc) {
      this.$Notice.info({
        title: '这是标题',
        desc: nodesc ? '' : '这是详情'
      });
    },
    successNotice(nodesc) {
      this.$Notice.success({
        title: '这是标题',
        desc: nodesc ? '' : '这是详情'
      });
    },
    warningNotice(nodesc) {
      this.$Notice.warning({
        title: '这是标题',
        desc: nodesc ? '' : '这是详情'
      });
    },
    errorNotice(nodesc) {
      this.$Notice.error({
        title: '这是标题',
        desc: nodesc ? '' : '这是详情'
      });
    },
    renderFunc() {
      this.$Notice.success({
        title: '这是标题',
        desc: '这是详情',
        render: h => {
          return h('span', [
            '自定义 ',
            h('a', 'render'),
            ' function'
          ]);
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.Message-list{
  padding-bottom: 16px;
  h4{
    padding-bottom: 10px;
  }
  p {
    padding: 10px 0;
  }
}
</style>
