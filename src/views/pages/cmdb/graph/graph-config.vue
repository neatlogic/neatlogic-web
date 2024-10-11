<template>
  <div>
    <!--视图配置-->
    <TsFormItem :label="$t('page.icon')" labelPosition="top">
      <div class="logo bg-block border-color text-primary" @click="isIconDialogShow = true">
        <i class="logo-icon" :class="graphData.icon || 'tsfont-question-o'"></i>
      </div>
    </TsFormItem>
    <TsFormItem v-if="graphData.type === 'public'" :label="$t('page.auth')" labelPosition="top">
      <UserSelect
        v-model="graphData.authList"
        :multiple="true"
        :transfer="true"
        :groupList="['common', 'user', 'role', 'team']"
      ></UserSelect>
    </TsFormItem>
    <TsFormItem :label="$t('page.backgroundcolor')" labelPosition="top">
      <ColorPicker
        :transfer="true"
        recommend
        :value="graphData.config.backgroundColor"
        :visible="true"
        class="colorPicker"
        alpha
        transfer-class-name="color-picker-transfer-class"
        @on-change="setBackgroundColor"
      />
    </TsFormItem>
    <TsFormItem :label="$t('page.backgroundimage')" labelPosition="top">
      <div>
        <div v-if="graphData.config.backgroundImage" class="snapshot">
          <img class="radius-md" style="width: 60%" :src="graphData.config.backgroundImage" />
          <i class="tsfont-trash-o" style="cursor: pointer" @click="removeBackgrounImage"></i>
        </div>
        <TsUpLoad
          v-if="!graphData.config.backgroundImage"
          styleType="button"
          dataType="image"
          className="smallUpload"
          type="drag"
          :multiple="false"
          :format="['png', 'jpg', 'jpeg', 'gif']"
          @getFileList="setBackgroundImage"
        ></TsUpLoad>
      </div>
    </TsFormItem>
    <!--<TsFormItem :label="$t('page.filltype')" labelPosition="top">
      <TsFormRadio
        :value="graphData.config.backgroundLayout"
        :dataList="[
          { value: '', text: $t('page.auto') },
          { value: 'scale', text: $t('term.report.axis.scale') },
          { value: 'stretch', text: $t('term.report.stretch') }
        ]"
        @on-change="setBackgroundLayout"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('page.backgroundresizable')" labelPosition="top">
      <TsFormSwitch v-model="graphData.config.backgroundImageResizable" @on-change="setBackgroundResizable"></TsFormSwitch>
    </TsFormItem>-->
    <TsFormItem :label="$t('page.description')" labelPosition="top">
      <TsFormInput
        v-model="graphData.description"
        type="textarea"
        border="border"
        :maxlength="500"
      ></TsFormInput>
    </TsFormItem>
    <IconDialog
      v-if="isIconDialogShow"
      :currentIcon="graphData.icon"
      @cancel="isIconDialogShow = false"
      @confirm="setGraphIcon"
    ></IconDialog>
  </div>
</template>
<script>
import { Graph } from '@antv/x6';
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue'),
    IconDialog: () => import('@/views/pages/common/icon-dialog.vue')
  },
  props: {
    graph: { type: Graph },
    graphData: { type: Object }
  },
  data() {
    return {
      isIconDialogShow: false,
      routerTypeList: [
        { value: 'normal', text: this.$t('term.diagram.line') },
        { value: 'orth', text: this.$t('term.diagram.orth') },
        { value: 'er', text: this.$t('page.relation') },
        { value: 'metro', text: this.$t('term.diagram.metro') },
        { value: 'manhattan', text: this.$t('term.diagram.manhattan') },
        { value: '', text: this.$t('page.custom') }
      ],
      arrowWidthRate: 0,
      arrowHeightRate: 0,
      sourceMarker: null,
      targetMarker: null,
      color: null,
      router: null,
      text: null,
      markerList: [
        { value: null, text: this.$t('page.nothave') },
        { value: 'classic', text: this.$t('term.diagram.classic') },
        { value: 'block', text: this.$t('term.diagram.block') },
        { value: 'cross', text: this.$t('term.diagram.cross') },
        { value: 'circle', text: this.$t('term.report.dot') }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.edge) {
      if (this.arrowWidth) {
        this.arrowWidthRate = this.width / this.arrowWidth;
      }
      if (this.arrowHeight) {
        this.arrowHeightRate = this.width / this.arrowHeight;
      }
      this.sourceMarker = this.edge.getAttrByPath('line/sourceMarker/name');
      this.targetMarker = this.edge.getAttrByPath('line/targetMarker/name');
      this.color = this.edge.getAttrByPath('line/stroke');
      this.router = this.edge.getRouter() && this.edge.getRouter().name;
      this.text = this.edge.getAttrByPath('label/text');
    }
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
    setGraphIcon(icon) {
      this.graphData.icon = icon;
      this.isIconDialogShow = false;
    },
    setBackgroundColor(val) {
      this.graph.drawBackground({ color: val });
      this.$set(this.graphData.config, 'backgroundColor', val);
    },
    setBackgroundImage(val) {
      if (val && val.length > 0) {
        this.graph.drawBackground({ image: HOME + '/api/binary/image/download?id=' + val[0].id });
        this.$set(this.graphData.config, 'backgroundImage', HOME + '/api/binary/image/download?id=' + val[0].id);
      }
    },
    setBackgroundLayout(val) {
      this.topo.setBackgroundLayout(val);
      this.$set(this.graphData.config, 'backgroundLayout', val);
    },
    setBackgroundResizable(val) {
      this.topo.setBackgroundResizable(val);
      this.$set(this.graphData.config, 'backgroundResizable', val);
    },
    removeBackgrounImage() {
      this.$delete(this.graphData.config, 'backgroundImage');
      this.graph.drawBackground({ image: null });
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.logo {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: inline-block;
  position: relative;
  border: 1px solid;
  top: -5px;
  text-align: center;
  line-height: 40px;
  .logo-icon {
    font-size: 20px;
    // position: absolute;
    // top: 4px;
    // left: 10px;
  }
}</style>
