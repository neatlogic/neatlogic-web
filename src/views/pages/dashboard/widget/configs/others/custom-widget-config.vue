<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        <span>模板</span>
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
        <div class="text-grey" style="white-space:normal;line-height:1.5">
          帮助：模板需要符合vue模板语法规范，必须指定一个根标签，一般是div，支持所有iView组件。数据源结果以数组的形式返回，根属性为：dataList，访问数据时请直接迭代dataList获取需要的数据。
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        <span>配置</span>
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
          <span>帮助：配置是一段javascript代码，需要定义包含methods、computed等属性的对象。</span>
          <span>
            <Poptip
              trigger="hover"
              word-wrap
              width="400"
              placement="right"
              :transfer="true"
              @on-popper-show="isReady = true"
            >
              <span class="text-href">范例</span>
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
      <label class="ivu-form-item-label overflow">资源文件</label>
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
        <div v-pre class="text-grey" style="white-space:normal;line-height:1.5">
          帮助：只支持上传图片，引用图片路径范例：&lt;img src=&quot;&#123;file:filename.png&#125;&quot;&sol;&gt;
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
        <Button type="primary" @click="fullScreenType = ''">关闭</Button>
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
      configSample: '{\n\t' + 'methods:{\n\t\tchangeName(newName){\n\t\t\tthis.name = newName;\/\/name是数据中的属性\n\t\t}\n\t}\n' + '\n\tcomputed:{\n\t\tdataListSize(){\n\t\t\treturn this.dataList.length;\/\/dataList是默认数据\n\t\t}\n\t}\n' + '}'
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
