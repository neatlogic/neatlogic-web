<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        <span>{{ $t('page.template') }}</span>
        <span class="cursor tsfont-fullscreen" @click="fullScreenType = 'template'"></span>
      </label>
      <div class="ivu-form-item-content">
        <TsCodemirror
          :value="config.template"
          codeMode="htmlmixed"
          @change="
            val => {
              setConfigValue('template', val);
            }
          "
        ></TsCodemirror>
        <div class="text-grey" style="white-space:normal;line-height:1.5">{{ $t('page.help') }}：{{ $t('message.dashboard.templatehelp') }}</div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        <span>{{ $t('page.config') }}</span>
        <span class="cursor tsfont-fullscreen" @click="fullScreenType = 'config'"></span>
      </label>
      <div class="ivu-form-item-content">
        <TsCodemirror
          :value="config.config"
          codeMode="json"
          @change="
            val => {
              setConfigValue('config', val);
            }
          "
        ></TsCodemirror>
        <div class="text-grey" style="white-space:normal;line-height:1.5">
          <span>{{ $t('page.help') }}：{{ $t('message.dashboard.confighelp') }}</span>
          <span>
            <Poptip
              trigger="hover"
              word-wrap
              width="400"
              placement="right"
              :transfer="true"
              @on-popper-show="isReady = true"
            >
              <span class="text-href">{{ $t('term.report.example') }}</span>
              <div slot="content">
                <TsCodemirror
                  v-if="isReady"
                  :isReadOnly="true"
                  :value="configSample"
                  codeMode="json"
                ></TsCodemirror>
              </div>
            </Poptip>
          </span>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.sourcefile') }}</label>
      <div class="ivu-form-item-content">
        <TsUpLoad
          styleType="button"
          dataType="dashboard"
          className="smallUpload"
          type="select"
          :uniqueKey="widget.uuid"
          :multiple="true"
          :defaultList="config.fileList"
          :format="['png', 'gif', 'jpg', 'jpeg']"
          @remove="
            (fileList, fileId) => {
              setConfigValue('fileList', fileList);
            }
          "
          @getFileList="
            (fileList, fileId) => {
              setConfigValue('fileList', fileList);
            }
          "
        ></TsUpLoad>
        <div class="text-grey" style="white-space:normal;line-height:1.5">
          <span>{{ $t('page.help') }}：{{ $t('message.dashboard.imagehelp') }}</span>
        </div>
      </div>
    </div>
    <TsDialog
      v-if="!!fullScreenType"
      type="modal"
      width="medium"
      :isShow="!!fullScreenType"
      @on-close="fullScreenType = ''"
    >
      <template v-slot>
        <div>
          <TsCodemirror
            :value="config[fullScreenType]"
            :codeMode="fullScreenType === 'template' ? 'htmlmixed' : 'json'"
            @change="
              val => {
                setConfigValue(fullScreenType, val);
              }
            "
          ></TsCodemirror>
        </div>
      </template>
      <template v-slot:footer>
        <Button type="primary" @click="fullScreenType = ''">{{ $t('page.close') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve)
  },
  props: {
    widget: { type: Object },
    config: { type: Object }
  },
  data() {
    return {
      ifFullScreen: false,
      fullScreenType: '',
      isReady: false,
      configSample: `{\n\tmethods:{\n\t\tchangeName(newName){\n\t\t\tthis.name = newName;\/\/name${this.$t('term.autoexec.isdataproperties')}\n\t\t}\n\t}\n\n\tcomputed:{\n\t\tdataListSize(){\n\t\t\treturn this.dataList.length;\/\/dataList${this.$t('term.dashboard.isdefaultdata')}\n\t\t}\n\t}\n}`
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
    setConfigValue(attrName, attrValue) {
      if (attrName) {
        this.$emit('setConfig', attrName, attrValue);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
