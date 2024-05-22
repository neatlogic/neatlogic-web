<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <Loading v-if="isLoading" :loadingShow="true" type="fix"></Loading>
        <div v-if="customTemplateData" class="grid">
          <div class="grid-item bg-op border-base padding-md">
            <div class="info pt-xs pb-xs pl-md pr-md bg-grey">{{ $t('page.template') }}</div>
            <div class="content mt-lg overflow">
              <TsCodemirror
                v-model="customTemplateData.template"
                height="300px"
                codeMode="htmlmixed"
              ></TsCodemirror>
            </div>
          </div>
          <div class="grid-item bg-op border-base padding-md">
            <div class="info pt-xs pb-xs pl-md pr-md bg-grey">{{ $t('page.config') }}</div>
            <div class="content mt-lg">
              <TsCodemirror
                v-model="customTemplateData.config"
                height="300px"
                codeMode="json"
              ></TsCodemirror>
            </div>
          </div>
          <div class="grid-item bg-op border-base padding-md">
            <div class="info pt-xs pb-xs pl-md pr-md bg-grey">{{ $t('page.data') }}</div>
            <div v-if="dataError" class="error padding-xs text-error">
              {{ dataError }}
            </div>
            <div class="content mt-lg">
              <TsCodemirror
                v-model="data"
                height="300px"
                codeMode="json"
                @change="
                  isTestReady = false;
                  dataError = '';
                "
              ></TsCodemirror>
            </div>
          </div>
          <div class="grid-item bg-op border-base padding-md">
            <div class="info pt-xs pb-xs pl-md pr-md bg-grey">{{ $t('page.result') }}</div>
            <div class="content mt-lg">
              <CustomTemplateViewer
                v-if="isTestReady"
                :config="customTemplateData.config"
                :template="customTemplateData.template"
                :data="testData"
              ></CustomTemplateViewer>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" ghost @click="doTest()">{{ $t('page.test') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.save') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror'),
    CustomTemplateViewer: () => import('@/resources/components/customtemplate/customtemplate-viewer.vue')
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      isTestReady: false,
      isLoading: false,
      customTemplateData: null,
      data: '',
      testData: {},
      dataError: '',
      dialogConfig: {
        title: this.$t('page.test') + this.$t('page.template'),
        type: 'slider',
        width: 'large',
        isShow: true
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getCustomTemplateById();
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
    doTest() {
      if (this.data && this.data.trim()) {
        try {
          this.testData = JSON.parse(this.data);
          this.isTestReady = true;
        } catch (e) {
          this.dataError = this.$t('term.autoexec.testdatajson');
          this.isTestReady = false;
        }
      } else {
        this.testData = {};
        this.isTestReady = true;
      }
    },
    getCustomTemplateById() {
      this.isLoading = true;
      this.$api.autoexec.customtemplate
        .getCustomTemplateById(this.id)
        .then(res => {
          this.customTemplateData = res.Return;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    save() {
      this.$api.autoexec.customtemplate.saveCustomTemplate(this.customTemplateData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 49% auto;
}
.grid-item {
  position: relative;
  .info {
    position: absolute;
    top: 0px;
    left: 0px;
  }
  .error {
    position: absolute;
    top: 0px;
    left: 50px;
  }
}
.grid-result {
  grid-column-start: 1;
  grid-column-end: 3;
}
</style>
