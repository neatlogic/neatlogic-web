<template>
  <div class="ivu-poptip-popper" :x-placement="placement" :style="'width:' + width + 'px;height:' + height + 'px'">
    <div class="ivu-poptip-content">
      <div class="ivu-poptip-arrow"></div>
      <div class="ivu-poptip-inner">
        <div class="ivu-poptip-title">
          <div class="ivu-poptip-title-inner">{{ $t('page.summaryinfo') }}</div>
        </div>
        <div class="ivu-poptip-body">
          <div class="ivu-poptip-body-content">
            <div class="scroll" :style="'height:' + (height - 35) + 'px'">
              <table v-if="(attrList && attrList.length > 0) || (constList && constList.length > 0)" style="width: 100%" class="attr-main">
                <tr v-for="(attr, index) in attrList" :key="index" class="attr-item">
                  <td class="text-grey fz10">{{ attr.label }}</td>
                  <td class="attr-content fz10">
                    <div v-if="attr.ciId" class="content">
                      <AttrViewer
                        v-if="ciEntityData.attrEntityData && ciEntityData.attrEntityData['attr_' + attr.id]"
                        :handler="ciEntityData.attrEntityData['attr_' + attr.id].type"
                        :ciEntity="ciEntityData"
                        :attrEntity="ciEntityData.attrEntityData['attr_' + attr.id]"
                        :authData="ciEntityData.authData"
                      ></AttrViewer>
                      <div v-else>-</div>
                    </div>
                    <div v-else class="content">
                      {{ ciEntityData[attr.name.replace('_', '')] || '-' }}
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AttrViewer from '../../cientity/attr-viewer.vue';
export default {
  name: '',
  components: {
    AttrViewer
  },
  props: {
    placement: { type: String, default: 'right-start' },
    width: { type: Number, default: 300 },
    height: { type: Number, default: 200 },
    ciId: { type: Number },
    ciEntityId: { type: Number }
  },
  data() {
    return {
      ciEntityData: {},
      attrList: [],
      constList: []
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
    getConstList() {
      this.$api.cmdb.ci.getViewConstList(this.ciId, 'detail').then(res => {
        this.constList = res.Return;
      });
    },
    getAttrByCiId() {
      if (this.ciId) {
        this.$api.cmdb.ci.getAttrByCiId(this.ciId, { showType: 'detail' }).then(res => {
          this.attrList = res.Return;
        });
      }
    },
    getCiEntityById() {
      this.$api.cmdb.cientity.getCiEntityById(this.ciId, this.ciEntityId, false, true, true).then(res => {
        this.ciEntityData = res.Return;
      });
    },
    hover() {
      console.log('aaa');
    }
  },
  filter: {},
  computed: {},
  watch: {
    ciId: {
      handler: function(val) {
        this.getConstList();
        this.getAttrByCiId();
      },
      immediate: true
    },
    ciEntityId: {
      handler: function(val) {
        this.getCiEntityById();
      },
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
