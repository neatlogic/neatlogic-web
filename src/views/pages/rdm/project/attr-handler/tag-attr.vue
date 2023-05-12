<template>
  <div>
    <span v-if="tagList && tagList.length > 0">
      <span v-for="(tag, index) in tagList" :key="index" class="icon-padding">
        <Tag :closable="!readonly" @on-close="closeTag(index)">
          <span class="tsfont-label">{{ tag }}</span>
        </Tag>
      </span>
    </span>
    <span v-else-if="readonly">-</span>
    <TsFormSelect
      v-if="isEditing"
      ref="selectInput"
      v-model="keyword"
      v-bind="selectConfig"
      style="display: inline-block;width:auto;"
      @on-change="createTag"
      @on-create="createTag"
    ></TsFormSelect>
    <span v-else-if="!readonly" class="tsfont-plus text-href" @click.stop="addTag()">{{ $t('page.tag') }}</span>
  </div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  extends: AttrBase,
  props: {},
  data() {
    return {
      keyword: '',
      isEditing: false,
      tagList: [],
      selectConfig: {
        placeholder: this.$t('dialog.title.addtarget', { target: this.$t('page.tag') }),
        border: 'border',
        search: true,
        allowCreate: this.mode === 'input',
        transfer: true,
        valueName: 'name',
        textName: 'name',
        dynamicUrl: '/api/rest/rdm/tag/search'
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getTagList();
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
    valid() {
      return true;
    },
    addTag() {
      this.isEditing = true;
    },
    closeTag(index) {
      const tag = this.tagList[index];
      this.tagList.splice(index, 1);
      this.$emit('setValue', 'tagList', this.tagList, this.tagList);
    },
    getTagList() {
      if (this.issueData && this.issueData.tagList) {
        this.tagList = this.issueData.tagList;
      } else if (this.valueList) {
        this.tagList = this.valueList;
      }
    },
    createTag(val) {
      if (val) {
        let newVal = val.trim();
        if (newVal != '') {
          let findTag = this.tagList.find(item => item.name === newVal);
          if (!findTag) {
            this.tagList.push(newVal);
            this.$emit('setValue', 'tagList', this.tagList, this.tagList);
          }
        }
      }
      this.isEditing = false;
      this.keyword = '';
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
