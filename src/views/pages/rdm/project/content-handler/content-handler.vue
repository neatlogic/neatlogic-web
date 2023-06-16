<template>
  <div>
    <component
      :is="issueData.appType + 'handler'"
      v-if="handlers[issueData.appType + 'handler']"
      ref="component"
      :mode="mode"
      :autoSave="autoSave"
      :issueData="issueData"
    ></component>
    <div v-else>
      <div v-if="mode === 'edit'">
        <TsCkeditor v-if="autoSave" v-model="issueData.content"></TsCkeditor>
        <TsCkeditor v-else v-model="content"></TsCkeditor>
      </div>
      <div v-else v-html="issueData.content">
      </div>
    </div>
    <!--<div class="mt-md" style="text-align:right">
      <Button class="mr-md" type="primary" @click="saveIssue()">{{ $t('page.confirm') }}</Button>
      <Button @click="cancelEdit()">{{ $t('page.cancel') }}</Button>
    </div>-->
  </div>
</template>
<script>
import * as handlers from './index.js';

export default {
  name: '',
  components: {
    ...handlers,
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve)
  },
  props: {
    issueData: { type: Object },
    autoSave: { type: Boolean, default: true },
    mode: {type: String, default: 'read'}
  },
  data() {
    return {
      handlers: handlers,
      content: this.issueData.content
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
    saveIssue() {
      const component = this.$refs['component'];
      if (component) {
        //
      } else {
        this.issueData.content = this.content;
        this.$emit('save', this.issueData);
      }
    },
    cancelEdit() {
      this.$emit('cancel');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
