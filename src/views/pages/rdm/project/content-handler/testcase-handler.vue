<template>
  <div>
    <div v-if="mode === 'edit'">
      <TsFormItem :label="$t('term.rdm.testcondition')" labelPosition="top" :labelStrong="true">
        <TsCkeditor
          v-model="condition"
          :params="finalCkeditorParams"
        ></TsCkeditor>
      </TsFormItem>
      <TsFormItem :label="$t('term.rdm.teststep')" labelPosition="top" :labelStrong="true">
        <TsCkeditor
          v-model="step"
          :params="finalCkeditorParams"
        ></TsCkeditor>
      </TsFormItem>
      <TsFormItem :label="$t('term.rdm.testresult')" labelPosition="top" :labelStrong="true">
        <TsCkeditor
          v-model="result"
          :params="finalCkeditorParams"
        ></TsCkeditor>
      </TsFormItem>
    </div>
    <div v-else>
      <h4 class="text-grey">{{ $t('term.rdm.testcondition') }}</h4>
      <div class="pt-sm pb-sm" v-html="condition"></div>
      <h4 class="text-grey">{{ $t('term.rdm.teststep') }}</h4>
      <div class="pt-sm pb-sm" v-html="step"></div>
      <h4 class="text-grey">{{ $t('term.rdm.testresult') }}</h4>
      <div class="pt-sm pb-sm" v-html="result"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsCkeditor: () => import('@/resources/plugins/TsCkeditor/TsCkeditor.vue')
  },
  props: {
    issueData: { type: Object },
    projectId: { type: Number },
    ckeditorParams: { type: Object },
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
  computed: {
    finalProjectId() {
      return this.projectId || (this.issueData && this.issueData.projectId);
    },
    finalCkeditorParams() {
      if (this.ckeditorParams) {
        return this.ckeditorParams;
      }
      const mentionConfig = {};
      if (this.finalProjectId) {
        mentionConfig.extendCondition = { projectId: this.finalProjectId };
      }
      return {
        uploadVideoConfig: { type: 'rdm' },
        mentionConfig
      };
    }
  },
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
