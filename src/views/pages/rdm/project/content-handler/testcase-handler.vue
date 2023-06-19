<template>
  <div>
    <div v-if="mode === 'edit'">
      <TsFormItem label="前置条件" labelPosition="top" :labelStrong="true">
        <TsCkeditor v-model="condition"></TsCkeditor>
      </TsFormItem>
      <TsFormItem label="用例步骤" labelPosition="top" :labelStrong="true">
        <TsCkeditor v-model="step"></TsCkeditor>
      </TsFormItem>
      <TsFormItem label="预期结果" labelPosition="top" :labelStrong="true">
        <TsCkeditor v-model="result"></TsCkeditor>
      </TsFormItem>
    </div>
    <div v-else>
      <h4 class="text-grey">前置条件</h4>
      <div class="pt-sm pb-sm" v-html="condition"></div>
      <h4 class="text-grey">用例步骤</h4>
      <div class="pt-sm pb-sm" v-html="step"></div>
      <h4 class="text-grey">预期结果</h4>
      <div class="pt-sm pb-sm" v-html="result"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve)
  },
  props: {
    issueData: { type: Object },
    autoSave: { type: Boolean, default: true },
    mode: { type: String, default: 'read' }
  },
  data() {
    return {
      condition: '',
      step: '',
      result: ''
    };
  },
  beforeCreate() {},
  created() {
    this.getContent();
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
    getContent() {
      if (this.issueData && this.issueData.content) {
        try {
          const contentObj = JSON.parse(this.issueData.content);
          this.condition = contentObj.condition;
          this.step = contentObj.step;
          this.result = contentObj.result;
        } catch (e) {
        //
        }
      }
    },
    setContent() {
      let contentObj = {};
      contentObj.condition = this.condition;
      contentObj.step = this.step;
      contentObj.result = this.result;
      this.$set(this.issueData, 'content', JSON.stringify(contentObj));
    },
    //给外部调用，用于更新值
    save() {
      this.setContent();
    }
  },
  filter: {},
  computed: {},
  watch: {
    content: {
      handler: function(val) {
        if (this.autoSave) {
          this.setContent();
        }
      }
    },
    step: {
      handler: function(val) {
        if (this.autoSave) {
          this.setContent();
        }
      }
    },
    result: {
      handler: function(val) {
        if (this.autoSave) {
          this.setContent();
        }
      }
    }
  }
};
</script>
<style lang="less"></style>
