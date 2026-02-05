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
          :style="iconStyle"
          @click="handleSelectMenuContent(item)"
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
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/mixin.js';
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
    }
  },
  data() {
    return {
      isShowDialog: false, // 是否显示裁剪弹窗
      picUrl: null, // 选中的图片url
      preview: {}, // 裁剪预览数据
      currentCommand: null, // 当前选中的命令
      menuList: [
        { type: 'ImageView', icon: 'tsfont-compare', tipContentList: ['裁剪'], command: 'imageCrop' },
        { type: 'ImageView', icon: 'tsfont-horizontal-left', tipContentList: ['左对齐'], command: 'left' },
        { type: 'ImageView', icon: 'tsfont-horizontal-center', tipContentList: ['居中'], command: 'center' },
        { type: 'ImageView', icon: 'tsfont-horizontal-right', tipContentList: ['右对齐'], command: 'right' }
      ]
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
    handleSelectMenuContent(item) {
      this.currentCommand = item.command;
      if (item.command === 'imageCrop') {
        this.picUrl = this.getSelectedImageSrc(this.editorData);
        this.isShowDialog = true;
      } else {
        this.$emit('menu-item-selected',
          {
            commandName: 'imageAlign',
            options: {
              align: item.command
            }
          }
        );
      }
    },
    realTime(data) {
      this.preview = data;
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
              this.$emit('handleSelectMenuContent',
                {
                  commandName: this.currentCommand,
                  options: {
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
