<template>
  <div>
    <TsContain>
      <template v-slot:navigation><span>导航</span></template>
      <template v-slot:topLeft>上左</template>
      <template v-slot:topCenter>上中</template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item" @click="saveCollection()">保存</div>
        </div>
      </template>
      <template v-slot:content>
        <TsForm v-model="collectionData" :item-list="formConfig">
          <template v-slot:phase>
            <div>
              <div v-for="(phase, index) in collectionData.phaseList" :key="index" class="mb-nm">
                <div v-if="index > 0" class="tsfont-arrow-down text-grey mb-nm" style="text-align:center"></div>
                <CollectionPhase ref="collectionPhase" :phaseData="phase" :sort="index + 1"></CollectionPhase>
              </div>
              <div style="border-style: dashed; border-width: 2px; text-align: center" class="radius-sm border-color-base padding">
                <span class="tsfont-plus cursor" @click="createPhase()">阶段</span>
              </div>
            </div>
          </template>
        </TsForm>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    CollectionPhase: resolve => require(['./collection-phase-edit.vue'], resolve)
  },
  props: {},
  data() {
    return {
      id: null,
      collectionData: {},
      formConfig: {
        title: {
          type: 'text',
          label: '标题',
          validateList: ['required']
        },
        content: {
          type: 'ckeditor',
          label: '描述'
        },
        phase: {
          type: 'slot',
          label: '阶段'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.id = this.$route.query.id && parseInt(this.$route.query.id);
    this.getCollectionById();
    this.collectionData = {
      'phaseList': [
        {
          'name': '',
          'taskList': [
            {
              'channelUuid': '879297f20fcf48e399ef3016adc101f5',
              'channelName': '架构变更流程',
              'priorityUuid': '08ca6c7046794b66ad2051b76cea16f4',
              'title': 'aa',
              'formAttributeDataList': [
                {
                  'attributeUuid': 'e673b3aea1e2458780f48bbc741f7c5a',
                  'handler': 'formselect',
                  'dataList': {
                    'text': '自助平台',
                    'value': '1047775013773940'
                  }
                },
                {
                  'attributeUuid': '4cb112a8d7b14c40a64fda680ab93500',
                  'handler': 'formtext',
                  'dataList': 'asss'
                }
              ],
              'hidecomponentList': [],
              'readcomponentList': [],
              'formExtendAttributeDataList': []
            }
          ]
        }
      ]
    };
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
    createPhase() {
      if (!this.collectionData.phaseList) {
        this.$set(this.collectionData, 'phaseList', []);
      }
      this.collectionData.phaseList.push({
        name: '',
        taskList: []
      });
    },
    getCollectionById() {
      if (this.id) {
        this.$api.process.collection.getCollectionById(this.id).then(res => {
          this.collectionData = res.Return;
        });
      }
    },
    saveCollection() {
      const collectionPhase = this.$refs.collectionPhase;
      this.collectionData.phaseList = [];
      if (collectionPhase && collectionPhase.length > 0) {
        collectionPhase.forEach(d => {
          this.collectionData.phaseList.push(d.getData());
        });
      }
      console.log(JSON.stringify(this.collectionData, null, 2));
      return null;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
