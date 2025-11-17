<template>
  <div class="document-tag-box">
    <div>
      <span class="text-grey tsfont-addtag icon-right">文档标签：</span>
      <span v-for="(item, index) in selectTagList" :key="index" class="icon-padding">
        <Tag :name="item.value" closable @on-close="closeTag(index)">{{ item.text }}</Tag>
      </span>
    </div>
    <div>
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
    list: { type: Array, default: () => [] }
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
      this.editTag = true;
      this.$nextTick(() => {
        this.$refs.selectInput?.$refs?.input?.focus();
      });
    },
    closeTag(index) {
      this.selectTagList.splice(index, 1);
      this.$emit('inputBlur', this.selectTagList);
    },
    createTag(val) {
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
    },
    inputBlur() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.editTag = false;
          this.tagKeyword = '';
          this.$emit('inputBlur', this.selectTagList);
        });
      }, 200);
    }
  },
  computed: {},
  watch: {
    list: {
      handler(val) {
        if (val && val.length > 0) {
          let list = [];
          val.forEach(i => {
            let obj = {
              text: i,
              value: i
            };
            list.push(obj);
          });
          this.selectTagList = list;
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
