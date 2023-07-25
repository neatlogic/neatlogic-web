<template>
  <TsDialog v-bind="dialogConfig" :isShow="isEdit" @on-close="close">
    <div class="edit-split">
      <Split v-model="split" min="160">
        <div slot="left" class="edit-pane">
          <TsCodemirror ref="cm" v-model="scripts"></TsCodemirror>
        </div>
        <div slot="right" class="edit-pane">
          <h4>{{ $t('page.help') }}</h4>
          <Collapse v-model="showitem" simple>
            <Panel v-for="(help,hindex) in helplist" :key="hindex" :name="help.value">
              {{ help.title }}
              <div
                :is="help.value"
                slot="content"
                class="help-tips"
                :controllerList="controllerList"
              >{{ help.value }}</div>
            </Panel>
          </Collapse>
          <div></div>
        </div>
      </Split>
    </div>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="saveEdit">{{ $t('page.confirm') }}</Button>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
import config from './help/config.vue';
import method from './help/method.vue';
import components from './help/components.vue';
export default {
  name: '',
  components: {
    TsCodemirror,
    config,
    method,
    components
  },
  filters: {},
  props: {
    isEdit: Boolean,
    scriptsConfig: String,
    controllerList: Array
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('dialog.title.edittarget', {'target': this.$t('page.customscript')}),
        height: '500px',
        width: '1000px',
        fullscreen: true
      },
      scripts: '',
      split: 0.6,
      helplist: [
        {value: 'config', title: this.$t('page.scripthelp')},
        {value: 'method', title: this.$t('page.apimethod')},
        {value: 'components', title: this.$t('page.componentinfo')}
      ],
      showitem: ['config', 'method', 'components']
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.scripts = this.scriptsConfig || '';
    this.$nextTick(() => {
      this.$refs.cm && this.$refs.cm.refresh();
    });
  },
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
    saveEdit() {
      try {
        new Function('return ' + this.scripts)();
        this.$emit('updateScript', this.scripts);
        this.$emit('close');
      } catch (error) {
        this.$Notice.error({
          title: this.$t('page.scripterror'),
          desc: error
        });
      }
    }
  },
  computed: {},
  watch: {}
};

</script>
<style lang='less' scoped>
.edit-split{
  height: 100%;
}
.edit-pane{
  padding: 16px;
  height: 100%;
  overflow: auto;
  h4{
    line-height: 2;
    margin-bottom: 10px;
  }
}
/deep/ .help-tips{
  font-size: 10px;
  padding: 4px 4px 4px 20px;
  .table-container{
    overflow: auto;
    padding: 4px;
  }
  .table{
    width: 100%;
    font-size: 10px;
    border-spacing: 0;
    word-break: keep-all;
    th,td{
      height: auto;
      padding: 4px;
    }
  }
}
</style>
