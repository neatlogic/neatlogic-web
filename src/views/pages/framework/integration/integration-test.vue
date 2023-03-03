<template>
  <div>
    <Tabs name="testTabs">
      <TabPane label="请求参数" tab="testTabs" :index="1">
        <TsCodemirror height="200px" :value.sync="content"></TsCodemirror>
      </TabPane>
      <TabPane
        v-if="isRunned && transformedParam"
        label="发送参数"
        name="transformedParam"
        tab="testTabs"
        :index="2"
      >
        <TsCodemirror :is-read-only="true" :value="transformedParam"></TsCodemirror>
      </TabPane>
      <TabPane
        v-if="isRunned && rawResult"
        label="原始结果"
        name="rawResult"
        tab="testTabs"
        :index="3"
      >
        <TsCodemirror :is-read-only="true" :value="rawResult"></TsCodemirror>
      </TabPane>
      <TabPane
        v-if="isRunned && transformedResult"
        label="转换结果"
        name="transformedResult"
        tab="testTabs"
        :index="4"
      >
        <TsCodemirror :is-read-only="true" :value="transformedResult"></TsCodemirror>
      </TabPane>
      <TabPane
        v-if="isRunned && error"
        label="异常"
        name="error"
        tab="testTabs"
        :index="5"
      >
        <TsCodemirror :is-read-only="true" :value="error"></TsCodemirror>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';

export default {
  components: { TsCodemirror },
  props: { integration: { type: Object }, handlerPattern: { type: Array } },
  data() {
    return {
      paramList: [],
      rawResult: '',
      content: '',
      isRunned: false,
      error: '',
      transformedResult: '',
      transformedParam: ''
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
    test: function(callback) {
      if (this.content) {
        try {
          let param = JSON.parse(this.content);
          this.integration.paramObj = param;
          this.$api.framework.integration
            .testIntegration(this.integration)
            .then(res => {
              if (res.Status == 'OK') {
                this.rawResult = res.Return.rawResult;
                try {
                  this.rawResult = JSON.stringify(JSON.parse(this.rawResult), null, 2);
                } catch (e) {
                  console.log(e);
                }
                this.transformedResult = res.Return.transformedResult;
                try {
                  this.transformedResult = JSON.stringify(JSON.parse(this.transformedResult), null, 2);
                } catch (e) {
                  console.log(e);
                }
                this.transformedParam = res.Return.transformedParam;
                this.error = res.Return.error;
              }
              this.isRunned = true;
              callback();
            })
            .catch(error => {
              if (error && error.data && error.data.Message) {
                this.$Message.error(error.data.Message);
              } else {
                console.error(error);
                this.$Message.error('发送测试请求失败');
              }
              callback();
            });
        } catch (e) {
          console.error(e);
          this.$Message.error('参数格式不符合json格式');
          callback();
        }
      } else {
        this.$Message.error('没有请求参数');
        callback();
      }
    },
    buildJson: function(elements, type) {
      let json = {};
      elements.forEach(element => {
        if (element.children) {
          json[element.name] = this.buildJson(element.children, element.type);
        } else {
          json[element.name] = element.typeName;
        }
      });
      if (type == 'jsonArray') {
        return [json];
      } else {
        return json;
      }
    }
  },
  filter: {},
  computed: {
    computedContent: function() {
      if (this.handlerPattern) {
        return JSON.stringify(this.buildJson(this.handlerPattern), null, 2);
      } else {
        return '';
      }
    }
  },
  watch: {
    integration: {
      handler: function(val) {
        if (val.config.input) {
          this.paramList = val.config.input.paramList;
        }
      },
      deep: true
      // immediate: true
    },
    computedContent: {
      handler: function(val) {
        this.content = val;
      },
      deep: true
    }
  }
};
</script>
