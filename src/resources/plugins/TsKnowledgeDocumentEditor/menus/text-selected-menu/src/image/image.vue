<template>
  <div>
    <span v-for="item in menuList" :key="item.command" class="mr-xs">
      <Tooltip 
        placement="top"
        :transfer="true"
        theme="light"
        max-width="300"
      >
        <span
          :class="item.icon"
          style="font-size: 18px;"
          @click="executeEditorCommand(item)"
        ></span>
        <div slot="content">
          <div>
            <div>{{ item.tipContentList.join(',') }}</div>
          </div>
        </div>
      </Tooltip>
    </span>
    <TsDialog
      className="avatar-dialog"
      :isShow.sync="isShowDialog"
      title="裁剪图片"
      @close="closeDialog"
    >
      <div slot="default" class="modal-body">
        <div class="cropper-container">
          <VueCropper
            ref="cropper"
            :img="picUrl"
            :autoCrop="true"
            centerBox
            @real-time="realTime"
          ></VueCropper>
        </div>
      </div>
      
      <div slot="footer" class="modal-footer">
        <Button @click="closeDialog">取消</Button>
        <Button type="primary" class="save-button" @click="save">{{ $t('page.save') }}</Button>
      </div>
    </TsDialog>
  </div>

</template>
<script>
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/text-selected-menu/src/mixin.js';
import { NodeSelection } from 'prosemirror-state';
import { VueCropper } from 'vue-cropper'; 
export default {
  name: '',
  components: {
    VueCropper
  },
  mixins: [mixin],
  props: {
    command: {
      type: String,
      default: 'image'
    },
    menuList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isShowDialog: false, // 是否显示裁剪弹窗
      picUrl: null, // 选中的图片url
      preview: {}, // 裁剪预览数据
      currentCommand: null // 当前选中的命令
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
    executeEditorCommand(item) {
      this.currentCommand = item.command;
      if (item.command === 'imageCrop') {
        this.picUrl = this.getSelectedImageSrc(this.editorData);
        this.isShowDialog = true;
      } else {
        this.$emit('executeEditorCommand',
          {
            commandName: 'imageAlign',
            value: {
              align: item.command
            }
          }
        );
      }
    },
    realTime(data) {
      this.preview = data;
      console.log(this.preview);
    },
    getSelectedImageSrc(editor) {
      const { state } = editor;
      const { selection } = state;
  
      if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
        return selection.node.attrs.src;
      }
      return null;
    },
    save() {
      this.$refs.cropper.getCropBlob(picFile => {
        const formData = new FormData();
        formData.append('file', picFile);
        formData.append('param', 'file');
        formData.append('type', 'knowledge');
        formData.append('responseType', 'blob');
        this.$api.knowledge.knowledge.uploadFile(formData)
          .then(res => {
            if (res.Return) {
              this.$emit('executeEditorCommand',
                {
                  commandName: this.currentCommand,
                  value: {
                    src: res.Return.url
                  }
                }
              );
            }
          })
          .finally(() => {
            this.isShowDialog = false;
          });
      });
    },
    closeDialog() {
      this.isShowDialog = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.cropper-container {
  width: 100%;
  height: 300px;
}
</style>
