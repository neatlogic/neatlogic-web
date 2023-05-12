<template>
  <div>
    <TsDialog
      type="modal"
      :isShow.sync="templateMadol"
      :title="$t('dialog.title.edittarget',{target: $t('page.template')})"
      width="large"
      @on-close="close"
      @on-ok="saveTemplate"
    >
      <template>
        <div class="modelSetting">
          <div v-if="outList.length > 0" class="param-box dividing-color">
            <div
              v-for="(item, index) in outList"
              :key="index"
              class="param-list bg-block"
              @click="changeText(item)"
            >
              <div v-if="item.typeName" class="type-name text-tip bg-grey">{{ item.typeName }}</div>
              <div class="title">
                <div class="text-name overflow text-title" :title="item.name">{{ item.name }}</div>
              </div>
              <div v-if="item.description" class="content text-title" :title="item.description">{{ item.description }}</div>
            </div>
          </div>
          <div :class="outList.length > 0?'param-padding':''">
            <Alert>
              <div>
                <Poptip
                  trigger="hover"
                  placement="right"
                  width="650"
                  :transfer="true"
                  :title="'Freemarker'+ $t('page.help')"
                >
                  <a href="javascript:void(0)"><i class="tsfont-info-o text-href" style="padding-right:8px;vertical-align: baseline;"></i>{{ $t('term.process.programarhelp') }}</a>
                  <div slot="content">
                    <FreemarkerHelp></FreemarkerHelp>
                  </div>
                </Poptip>
              </div>
            </Alert>
            <TsCodemirror
              ref="codeText"
              v-model="templateText"
              :code="code"
              :blurText="blurText"
              height="300px"
              @onBlur="onBlur"
              @onFocus="onFocus('codeText')"
              @repeatClick="repeatClick"
            ></TsCodemirror>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import FreemarkerHelp from './freemarker-help.vue';
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
export default {
  name: '',
  components: {
    TsCodemirror,
    FreemarkerHelp
  },
  props: {
    isShow: { type: Boolean, default: false },
    content: { type: String, default: '' },
    outList: { type: Array, default: () => [] }
  },
  data() {
    return {
      templateMadol: false,
      templateText: '',
      code: '',
      blurText: ''
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
    close(val) {
      this.templateText = '';
      this.$emit('close', val);
    },
    saveTemplate() {
      let content = this.$refs.codeText.saveData();
      this.templateMadol = false;
      this.$emit('getTemplate', content);
    },
    onBlur() {
      setTimeout(() => {
        this.blurText = '';
      }, 200);
    },
    onFocus(val) {
      setTimeout(() => {
        this.blurText = val;
      }, 250);
    },
    //重复点击
    repeatClick(val) {
      setTimeout(() => {
        this.blurText = val;
      }, 300);
    },
    changeText(item) {
      if (this.blurText) {
        this.code = item.freemarkerTemplate;
        this.$refs.codeText.changeCode();
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    isShow: {
      handler(val) {
        this.templateMadol = val;
      }
    },
    content: {
      handler(val) {
        this.templateText = val || '';
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less'>
.modelSetting {
  position: relative;
  .param-padding {
    padding-left: 250px;
  }
  .param-box {
    position: absolute;
    left: 0;
    top: 0;
    width: 240px;
    padding-right: 16px;
    border-right: 1px solid;
    overflow: auto;
    height: 356px;
    .param-list {
      position: relative;
      padding: 8px 16px;
      margin-bottom: 8px;
      cursor: pointer;
      .title {
        padding-bottom: 8px;
      }
      .content {
        font-size: 12px;
        white-space: normal;
        word-break: break-all;
        overflow: hidden;
        text-overflow: -o-ellipsis-lastline;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .type-name {
        position: absolute;
        top: 8px;
        right: 0;
        padding: 0 4px;
      }
      .text-name {
        max-width: 150px;
        display: inline-block;
      }
    }
  }
}
</style>
