<template>
  <div>
    <span v-for="(item, index) in tagList" :key="index">
      <Tag
        :name="item.id"
        closable
        class="bg-op"
        border="border"
        @on-close="closeTag(index)"
      >{{ item.name }}</Tag>
    </span>
    <TsFormSelect
      v-if="editTag"
      ref="selectInput"
      v-model="tagKeywork"
      v-bind="selectConfig"
      style="display: inline-block;width:auto;"
      @inputBlur="inputBlur"
      @on-change="selectTag"
      @on-create="createTag"
    ></TsFormSelect>
    <span
      v-else
      class="tsfont-plus"
      style="cursor:pointer"
      @click="addTag"
    ></span>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {},
  model: {
    prop: 'tagList',
    event: 'change'
  },
  props: {
    tagList: { type: Array, default: () => [] }
  },
  data() {
    let _this = this;
    return {
      tagKeywork: null,
      editTag: false,
      keyword: '',
      selectConfig: {
        placeholder: '添加标签',
        border: 'border',
        search: true,
        allowCreate: true,
        transfer: true,
        //size: 'small',
        textName: 'name',
        valueName: 'id',
        dynamicUrl: '/api/rest/cmdb/tag/search',
        dataList: []
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
    getTagList() {
      return tagList;
    },
    addTag() {
      this.editTag = true;
      this.$nextTick(() => {
        this.$refs.selectInput.$refs.input && this.$refs.selectInput.$refs.input.focus();
      });
    },
    closeTag(index) {
      this.tagList.splice(index, 1);
      this.$emit('inputBlur', this.tagList);
    },
    selectTag(val, opt) {
      if (typeof val != 'string') {
        let newVal = val;
        if (newVal != '') {
          let findTag = this.tagList.find(item => item.id === newVal);
          if (!findTag) {
            this.tagList.push({
              id: opt.value,
              name: opt.text
            });
          }
        }
      }
      this.editTag = false;
      this.tagKeywork = '';
    },
    createTag(val) {
      if (val) {
        let newVal = val.trim();
        if (newVal != '') {
          let findTag = this.tagList.find(item => item.name === newVal);
          if (!findTag) {
            this.tagList.push({
              name: newVal
            });
          }
        }
      }
      this.editTag = false;
      this.tagKeywork = '';
    },
    inputBlur() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.editTag = false;
          this.tagKeywork = '';
          this.$emit('inputBlur', this.tagList);
        });
      }, 200);
    }
  },
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
</style>
