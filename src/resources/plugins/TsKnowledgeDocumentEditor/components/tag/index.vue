<template>
  <div class="document-tag-box">
    <div>
      <span class="text-grey tsfont-addtag icon-right">文档标签：</span>
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
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  filters: {},
  props: {
    list: { type: Array, default: () => [] },
    readonly: { type: Boolean, default: false }
  },
  data() {
    return {
      selectTagList: [], //选中标签列表
      tagList: [], //标签列表
      tagKeyword: null,
      editTag: false,
      keyword: '',
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
      this.$emit('change', this.getTagList());
      this.$emit('inputBlur', this.selectTagList);
    },
    createTag(val) {
      if (this.readonly) {
        return;
      }
      if (val) {
        let newVal = val.trim();
        if (newVal != '') {
          let findTag = this.selectTagList.find(item => item.value === newVal);
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
      this.$emit('change', this.getTagList());
    },
    inputBlur() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.editTag = false;
          this.tagKeyword = '';
          this.$emit('change', this.getTagList());
          this.$emit('inputBlur', this.selectTagList);
        });
      }, 200);
    },
    getTagList() {
      return this.selectTagList.map(item => item.value).filter(item => item);
    }
  },
  computed: {},
  watch: {
    list: {
      handler(val) {
        if (val && val.length > 0) {
          let list = [];
          val.forEach(i => {
            const value = typeof i === 'object' ? (i.value || i.text || i.name) : i;
            let obj = {
              text: value,
              value: value
            };
            list.push(obj);
          });
          this.selectTagList = list;
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
    &:before{
      margin-right: 0px;
    }
  }
}
</style>
