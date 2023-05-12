<template>
  <div>
    <Poptip
      v-if="content"
      v-model="visible"
      placement="top"
      trigger="hover"
      width="400"
      :transfer="true"
    >
      <a
        ref="111"
        href="javascript:void(0)"
        type="primary"
        style="width:100%"
        size="small"
      >{{ $t('term.framework.transfertest') }}</a>
      <div slot="content">
        <Tabs v-model="testActivedTab" name="inputTestTabs">
          <TabPane :label="$t('page.inputparam')" name="param" tab="inputTestTabs">
            <TsCodemirror ref="contentCm" height="150px" :value.sync="contentTest"></TsCodemirror>
          </TabPane>
          <TabPane
            v-if="resultTest"
            :label="$t('term.framework.transferresult')"
            name="result"
            tab="inputTestTabs"
          >
            <div style="white-space:normal">{{ resultTest }}</div>
          </TabPane>
          <TabPane
            v-if="printTest"
            :label="$t('term.framework.output')"
            name="print"
            tab="inputTestTabs"
          >
            <div style="white-space:normal">{{ printTest }}</div>
          </TabPane>
          <TabPane
            v-if="errorTest"
            :label="$t('page.exception')"
            name="error"
            tab="inputTestTabs"
          >
            <div style="white-space:normal">{{ errorTest }}</div>
          </TabPane>
        </Tabs>
        <div style="text-align:right">
          <Button
            type="primary"
            style="margin-top:5px"
            :loading="loading"
            size="small"
            ghost
            @click="test"
          >
            <span v-if="!loading">{{ $t('page.test') }}</span>
            <span v-else>{{ $t('page.running') }}...</span>
          </Button>
        </div>
      </div>
    </Poptip>
  </div>
</template>
<script>
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
export default {
  name: '',
  components: {
    TsCodemirror
  },
  props: {content: {type: String}},
  data() {
    return { 
      loading: false,
      contentTest: '',
      visible: false,
      errorTest: '',
      resultTest: '',
      printTest: '',
      testActivedTab: 'param'
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
    close: function() {
      this.visible = false;
    }, 
    test: function() {
      if (this.contentTest) {
        this.$api.framework.integration
          .testTransform({ content: this.contentTest, template: this.content })
          .then(res => {
            if (res.Status == 'OK') {
              this.resultTest = res.Return['result'];
              this.printTest = res.Return['output'];
              this.errorTest = res.Return['error'];
              this.testActivedTab = 'param';
            }
          })
          .catch(error => {
            this.errorTest = error.Message;
            this.resultTest = '';
            this.printTest = '';
            this.testActivedTab = 'param';
          });
      }
    }},
  filter: {},
  computed: {},
  watch: {
    visible(val) {
      let _this = this;
      if (val) {
        _this.$nextTick(() => {
          _this.$refs.contentCm && _this.$refs.contentCm.refresh();
        });
      }
    }
  }
};
</script>
<style lang="less">
</style>
