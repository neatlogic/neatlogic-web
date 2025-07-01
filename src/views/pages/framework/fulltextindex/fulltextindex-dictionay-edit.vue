<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-ok="confirm()" @on-close="close()">
      <template v-slot>
        <div>
          <Tabs v-model="currentTab">
            <TabPane label="词库管理" name="dictionary"></TabPane>
            <TabPane label="测试文本" name="content"></TabPane>
            <TabPane v-if="wordList && wordList.length > 0" label="分词结果" name="result"></TabPane>
          </Tabs>
          <div v-if="currentTab === 'dictionary'">
            <div style="width: 300px">
              <InputSearcher v-model="searchParam.keyword" @change="searchWord(1)"></InputSearcher>
            </div>
            <div v-if="dictionaryData && dictionaryData.tbodyList && dictionaryData.tbodyList.length > 0" class="mt-md">
              <Tag
                v-for="(dict, index) in dictionaryData.tbodyList"
                :key="index"
                size="medium"
                closable
                @on-close="deleteWord(dict.id)"
              >
                {{ dict.word }}
              </Tag>
            </div>
            <div class="mt-md text-grey">提示：删除关键字需要重启服务才能生效。如词库发生变化，旧索引需要重建才能应用新的词库。</div>
            <div v-if="dictionaryData.pageCount > 1" class="mt-md" style="text-align: right">
              <Page
                class="page-container"
                transfer
                size="small"
                show-total
                :total="dictionaryData.rowNum"
                :current="dictionaryData.currentPage"
                :page-size="dictionaryData.pageSize"
                @on-change="searchWord"
              />
            </div>
            <TsFormItem label="导入新词" labelPosition="top">
              <TsFormInput
                ref="word"
                v-model="newWord"
                type="textarea"
                placeholder="多个词用换行分隔，单个词最多20个字符，超过长度将自动切断"
                border="border"
                :validateList="[{ name: 'required', message: '' }]"
              ></TsFormInput>
              <div class="mt-md">
                <Button style="width: 100%" type="primary" @click="addWord()">{{ $t('page.save') }}</Button>
              </div>
            </TsFormItem>
          </div>
          <div v-else-if="currentTab === 'content'">
            <TsFormInput
              ref="content"
              v-model="content"
              border="border"
              type="textarea"
              :validateList="[{ name: 'required', message: ' ' }]"
            ></TsFormInput>
            <div class="mt-md">
              <Button type="primary" @click="testSliceWord()">{{ $t('page.test') }}</Button>
            </div>
          </div>
          <div v-else-if="currentTab === 'result'">
            <span
              v-for="(segment, index) in highlightedSegments"
              :key="index"
              :class="segment.highlight ? 'text-error text-bold' : ''"
            >
              {{ segment.text }}
            </span>
            <!--<Tag v-for="(word, index) in wordList" :key="index">{{ word.word }}({{ word.type }})({{ word.start }}:{{ word.end }})</Tag>-->
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div style="text-align: right">
          <Button type="default" @click="close()">{{ $t('page.close') }}</Button>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: {},
  data() {
    return {
      dialogConfig: {
        title: '字典管理',
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      currentTab: 'dictionary',
      newWord: '',
      content: '',
      dictionaryData: {},
      searchParam: { keyword: '', pageSize: 30 },
      wordList: []
    };
  },
  beforeCreate() {},
  created() {
    this.searchWord();
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
    searchWord(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }

      this.$api.framework.fulltextindex.searchWord(this.searchParam).then(res => {
        this.dictionaryData = res.Return;
      });
    },
    addWord() {
      if (this.$refs.word && this.$refs.word.valid()) {
        this.$api.framework.fulltextindex.addWord({ word: this.newWord }).then(res => {
          if (res.Status === 'OK') {
            this.newWord = '';
            this.$Message.success(this.$t('message.savesuccess'));
            this.searchWord(1);
          }
        });
      }
    },
    testSliceWord() {
      this.wordList = [];
      if (this.$refs.content && this.$refs.content.valid()) {
        this.$api.framework.fulltextindex.testSliceWord(this.content).then(res => {
          this.wordList = res.Return;
          if (this.wordList.length > 0) {
            this.currentTab = 'result';
          }
        });
      }
    },
    deleteWord(id) {
      this.$api.framework.fulltextindex.deleteWordById(id).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.deletesuccess'));
          this.searchWord(1);
        }
      });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    highlightedSegments() {
      let segments = [];
      let lastIndex = 0;

      // 按 start 升序排序
      const sortedList = this.wordList.slice().sort((a, b) => a.start - b.start);

      for (let item of sortedList) {
        const { start, end } = item;

        // 加未匹配部分
        if (lastIndex < start) {
          segments.push({
            text: this.content.slice(lastIndex, start),
            highlight: false
          });
        }

        // 加匹配部分
        segments.push({
          text: this.content.slice(start, end),
          highlight: true
        });

        lastIndex = end;
      }

      // 最后一段
      if (lastIndex < this.content.length) {
        segments.push({
          text: this.content.slice(lastIndex),
          highlight: false
        });
      }

      return segments;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  gap: 10px;
  grid-template-columns: 250px auto;
}
</style>
