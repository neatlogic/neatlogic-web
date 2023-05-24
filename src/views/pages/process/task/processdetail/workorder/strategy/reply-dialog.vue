<template>
  <div>
    <TsDialog
      :title="$t('page.reply')"
      type="modal"
      :isShow="true"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <div class="inline-block mt-md">
            <TsUpLoad
              ref="fileList"
              className="smallUpload"
              styleType="text"
              dataType="itsm"
              rowSpan="24"
              :multiple="true"
              :defaultList="fileList && fileList.length > 0 ? fileList : []"
              @getFileList="(list, id) => { getFileList(id) }"
              @remove="(list, id) => { removeCommentFile(id) }"
            ></TsUpLoad>
          </div>
          <div class="mt-md">
            <TsCkeditor
              ref="taskStepContent"
              v-model="content"
              @change="commentContent"
            ></TsCkeditor>
            <transition name="fade">
              <slot name="validMessage">
                <span v-if="validMesage != ''" class="form-error-tip" :title="validMesage">
                  {{ validMesage }}
                </span>
              </slot>
            </transition>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div class="footer-btn-contain">
          <template v-if="customButtonList && customButtonList.length > 0">
            <Button
              v-for="btn in customButtonList"
              :key="btn.name"
              class="mr-xs"
              type="primary"
              ghost
              @click="comment(btn)"
            >{{ btn.name }}</Button>
          </template>
          <Button
            v-else
            type="primary"
            :disabled="isDisableCommet"
            :title="isDisableCommet ? $t('term.process.replycanclicktip') : null"
            @click="comment()"
          >{{ $t('page.reply') }}</Button>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve)
  },
  props: {
    config: Object,
    customButtonList: Array
  },
  data() {
    return {
      fileList: [],
      content: '',
      isDisableCommet: false,
      validMesage: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.config) {
        this.content = this.config.CkeditorContent || '';
        this.fileList = this.config.fileList || '';
      }
    },
    getFileList(fileId) {
      let data = {
        id: this.config.id,
        fileId: fileId
      };
      this.$api.process.process.saveTaskFile(data).then((res) => {
        if (res.Status == 'OK') {
          this.$emit('getListTask');
        }
      });
    },
    removeCommentFile(fileId) {
      let data = {
        id: this.config.id,
        fileId: fileId
      };
      this.$api.process.process.deleteTaskFile(data).then((res) => {
        if (res.Status == 'OK') {
          this.$emit('getListTask');
        }
      });
    },
    commentContent() {
      this.validMesage = '';
    },
    comment(btn) {
      let data = {
        id: this.config.id,
        content: this.content
      };
      if (btn) {
        this.$set(data, 'button', btn.name);
        if (!data.content) {
          this.$set(data, 'content', btn.defaultContent);
          this.content = btn.defaultContent;
        }
      }
      if (!this.content) {
        this.validMesage = this.$t('form.placeholder.pleaseinput', {target: this.$t('page.content')});
        return;
      }
      this.$api.process.process.completeTask(data).then(res => {
        this.$Message.success(this.$t('message.executesuccess'));
        this.$emit('close', true);
      });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
