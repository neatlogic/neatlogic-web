<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-ok="okDialog"
    @on-close="closeDialog"
    @on-cancel="closeDialog"
  >
    <template v-slot>
      <div class="document-tag-box">
        <div>
          <span class="text-grey tsfont-addtag icon-right">{{ $t('term.knowledge.documenttag') }}{{ $t('page.colon') }}</span>
          <span v-for="(item, index) in selectTagList" :key="index" class="icon-padding">
            <Tag :name="item.value" :closable="!readonly" @on-close="closeTag(index)">{{ item.text }}</Tag>
          </span>
        </div>
        <div v-if="!readonly">
          <TsFormSelect
            v-if="editTag"
            ref="selectInput"
            v-model="tagKeyword"
            style="display: inline-block;width: auto;"
            v-bind="selectConfig"
            @inputBlur="inputBlur"
            @on-change="createTag"
            @on-create="createTag"
          ></TsFormSelect>
          <span v-else class="border-primary text-href tsfont-plus add-tag" @click.stop="addTag"></span>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: 'DocumentTagDialog',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.knowledge.documenttag'),
        width: 'medium',
        isShow: true,
        okText: this.$t('page.save'),
        hasFooter: !this.readonly
      },
      selectTagList: [],
      tagKeyword: null,
      editTag: false,
      selectConfig: {
        placeholder: this.$t('dialog.title.addtarget', {target: this.$t('page.tag')}),
        border: 'border',
        search: true,
        allowCreate: true,
        transfer: true,
        size: 'small',
        dynamicUrl: '/api/rest/knowledge/tag/list',
        rootName: 'list'
      }
    };
  },
  methods: {
    addTag() {
      if (this.readonly) {
        return;
      }
      this.editTag = true;
      this.$nextTick(() => {
        this.$refs.selectInput?.$refs?.input?.focus();
      });
    },
    closeTag(index) {
      if (this.readonly) {
        return;
      }
      this.selectTagList.splice(index, 1);
    },
    createTag(val) {
      if (this.readonly) {
        return;
      }
      if (val) {
        const newVal = val.trim();
        if (newVal) {
          const findTag = this.selectTagList.find(item => item.value === newVal);
          if (!findTag) {
            this.selectTagList.push({
              value: newVal,
              text: newVal
            });
          }
        }
      }
      this.editTag = false;
      this.tagKeyword = '';
    },
    inputBlur() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.editTag = false;
          this.tagKeyword = '';
        });
      }, 200);
    },
    getTagList() {
      return this.selectTagList.map(item => item.value).filter(item => item);
    },
    okDialog() {
      this.$emit('close', {
        tagList: this.getTagList()
      });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  watch: {
    list: {
      handler(val) {
        if (val && val.length > 0) {
          this.selectTagList = val.map(item => {
            const value = typeof item === 'object' ? (item.value || item.text || item.name) : item;
            return {
              text: value,
              value: value
            };
          });
        } else {
          this.selectTagList = [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.document-tag-box {
  display: flex;
  align-items: center;
  .icon-padding {
    padding-right: 8px;
  }
  .add-tag {
    border: 1px solid;
    border-radius: 2px;
    &:before {
      margin-right: 0;
    }
  }
}
</style>
