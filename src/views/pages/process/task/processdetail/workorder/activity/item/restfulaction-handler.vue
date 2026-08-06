<template>
  <div>
    <div>
      <span class="pr-xs">{{ newContentJson.integrationName }}</span>
      <span :class="newContentJson.succeed == true ? 'text-success' : 'text-danger'" class="pr-xs">{{ newContentJson.statusText }}</span>
      <Dropdown>
        <span class="tsfont-option-horizontal"></span>
        <DropdownMenu slot="list" :transfer="true" style="max-height: 400px;max-width: 400px;overflow:scroll;">
          <DropdownItem>
            <span class="text-grey content-detail-text">
              {{ $t('term.process.triggertime', { target: newContentJson.triggerText }) }}
            </span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <div v-if="newContentJson.error">
      <span v-if="newContentJson.error" class="text-href look-btn" @click="lookFailed(newContentJson.error)">{{ $t('page.failreason') }}</span>
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
<style lang="less" scoped>
.content-detail-text {
  display: inline-block;
  white-space: normal;
}
</style>
