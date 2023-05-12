<template>
  <div class="tagList">
    <span v-if="showLogo" class="tsfont-label icon-padding"></span>
    <span v-for="(item, index) in selectTagList" :key="index">
      <Tag :name="item.value" :closable="canUpdate" @on-close="closeTag(index)">{{ item.text }}</Tag>
    </span>
    <TsFormSelect
      v-if="editTag"
      ref="selectInput"
      v-model="tagKeywork"
      v-bind="selectConfig"
      class="select-style"
      @on-blur="onBlur"
      @on-change="change"
      @on-create="create"
    ></TsFormSelect>
    <span v-else-if="canUpdate && !editTag" class="border-primary text-href tsfont-plus add-tag" @click="addTag"></span>
    <template v-if="!list.length && !canUpdate">
      <div>
        -
      </div>
    </template>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
// import handler from '../../../../dashboard/widget/handler';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {},
  props: {
    isShow: { type: Boolean, default: false },
    list: { type: Array, default: () => [] },
    showLogo: {
      //是否显示logo
      type: Boolean,
      default: true
    },
    canUpdate: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selectTagList: [], //选中标签列表
      tagList: [], //标签列表
      tagKeywork: null,
      editTag: false,
      keyword: '',
      selectConfig: {
        placeholder: this.$t('dialog.title.addtarget', {target: this.$t('page.tag')}),
        border: 'border',
        search: true,
        allowCreate: true,
        transfer: true,
        dynamicUrl: '/api/rest/process/tag/get',
        rootName: 'list',
        dataList: [],
        textName: 'text',
        valueName: 'text'
        // filterable: true
      },
      onceSubmit: 1
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
    getTagList() {
      let tagList = [];
      if (this.selectTagList.length > 0) {
        tagList = this.selectTagList.map(item => {
          return item.value;
        });
      }
      return tagList;
    },
    addTag() {
      this.editTag = true;
      this.$nextTick(() => {
        this.$refs.selectInput.$refs.input && this.$refs.selectInput.$refs.input.focus();
      });
    },
    closeTag(index) {
      this.selectTagList.splice(index, 1);
      this.$emit('del', this.selectTagList);
    },
    change(val) {
      this.editTag = false;
      this.tagKeywork = null;
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
      if (this.onceSubmit == 1) {
        this.$emit('add', this.selectTagList);
        this.onceSubmit += 1;
      }
    },
    create(val) {
      this.change(val);
    },
    onBlur() {
      this.editTag = false;
    }
  },
  computed: {},
  watch: {
    isShow: {
      handler(val) {
        if (val == true) {
          this.addTag();
        }
      },
      immediate: true
    },
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
    },
    editTag(val) {
      if (!val) {
        this.onceSubmit = 1;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.tagList {
  .icon-padding {
    padding-right: 8px;
  }
  .add-tag {
    border: 1px solid;
    padding: 2px;
    padding-left: 8px;
    padding-right: 4px;
    border-radius: 2px;
  }
  .select-style{
    display: inline-block;
    width:auto;
  }
}
</style>
