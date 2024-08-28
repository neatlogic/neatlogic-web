<template>
  <div>
    <!-- <span class="left-label-text text-grey">{{ $t('term.process.triggertime', {target: newContentJson.triggerText}) }}</span> -->
    <div>
      <span style="padding-right:8px;">{{ newContentJson.integrationName }}</span>
      <span :class="newContentJson.succeed == true?'text-success':'text-danger'">{{ newContentJson.statusText }}</span>
      <Dropdown>
        <span class="tsfont-option-horizontal"></span>
        <DropdownMenu slot="list">
          <DropdownItem><span class="left-label-text text-grey">{{ $t('term.process.triggertime', {target: newContentJson.triggerText}) }}</span></DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <div v-if="newContentJson.error">
      <span v-if="newContentJson.error" class="text-href look-btn" @click="lookFailed(newContentJson.error)">{{ $t('page.failreason') }}</span>
      <!-- <span><pre>{{ newContentJson.error }}</pre></span> -->
    </div>
    
    <TsDialog
      type="modal"
      :isShow.sync="failedModal"
      :title="$t('page.failreason')"
      :hasFooter="false"
      width="large"
    >
      <template>
        <TsCodemirror
          :value.sync="failedTemlate"
          height="400px"
          :disabled="true"
          codeMode="application/json"
        ></TsCodemirror>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
export default {
  name: '',
  components: {
    TsCodemirror
  },
  filters: {},
  props: {
    config: Object,
    newContent: Object
  },
  data() {
    return {
      failedModal: false,
      failedTemlate: '',
      newContentJson: {}
    };
  },
  beforeCreate() {},
  created() {
    if (this.config) {
      this.newContentJson = JSON.parse(this.config.newContent);
    } else if (this.newContent) {
      this.newContentJson = this.newContent;
    }
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
    lookFailed(result) {
      if (result) {
        this.failedTemlate = result;
      }
      this.failedModal = true;
    }
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
</style>
