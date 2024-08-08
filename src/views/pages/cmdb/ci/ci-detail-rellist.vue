<template>
  <div class="divRel">
    <div class="action-group padding-sm">
      <div class="action-item">
        <TsFormSwitch
          :value="directionType === 'from'"
          :showStatus="true"
          :trueValue="true"
          :falseValue="false"
          :trueText="$t('term.cmdb.onlyupward')"
          :falseText="$t('term.cmdb.onlyupward')"
          @on-change="
            val => {
              if (val) {
                directionType = 'from';
              } else {
                directionType = null;
              }
            }
          "
        ></TsFormSwitch>
      </div>
      <div class="action-item">
        <TsFormSwitch
          :value="directionType === 'to'"
          :showStatus="true"
          :trueValue="true"
          :falseValue="false"
          :trueText="$t('term.cmdb.onlydownward')"
          :falseText="$t('term.cmdb.onlydownward')"
          @on-change="
            val => {
              if (val) {
                directionType = 'to';
              } else {
                directionType = null;
              }
            }
          "
        ></TsFormSwitch>
      </div>
      <div class="action-item">
        <TsFormSwitch
          v-model="noExtended"
          :showStatus="true"
          :trueValue="true"
          :falseValue="false"
          :trueText="$t('term.cmdb.noextend')"
          :falseText="$t('term.cmdb.noextend')"
        ></TsFormSwitch>
      </div>
    </div>
    <TsCard
      v-if="finalRelList.length > 0"
      :cardList="finalRelList"
      :sm="24"
      :md="24"
      :lg="12"
      :xl="12"
      :xxl="8"
    >
      <template slot-scope="{ row }">
        <div class="rel-container" style="cursor: pointer" @click="editRel(row)">
          <div v-if="ciData.authData['cimanage'] && row.isExtended == 0" class="rel-control">
            <i class="tsfont-trash-o" @click.stop="deleteRel(row)"></i>
          </div>
          <div class="rel-main">
            <div class="rel-left">
              <div class="rel-left-rule text-grey">{{ row.fromRuleText }}</div>
              <div class="rel-left-label text-grey overflow">{{ row.fromLabel }}({{ row.fromName }})</div>
              <div class="rel-icon border-color" :class="row.fromCiId == ciData.id ? 'border-primary text-primary' : ''">
                <i :class="row.fromCiIcon"></i>
              </div>
              <div class="overflow">
                <span>{{ row.fromCiLabel }}</span>
                <span v-if="row.direction === 'to' && row.alias" class="text-grey">({{ row.alias }})</span>
              </div>
              <div class="overflow text-grey" style="font-size: 12px">{{ row.fromGroupName }}</div>
            </div>
            <div class="rel-line border-color"></div>
            <div class="rel-middle">
              <div class="rel-name bg-block text-grey border-color overflow">{{ row.typeText }}</div>
            </div>
            <div class="rel-right">
              <div class="rel-right-rule text-grey">{{ row.toRuleText }}</div>
              <div class="rel-right-label text-grey overflow">({{ row.toName }}){{ row.toLabel }}</div>
              <div class="rel-icon border-color" :class="row.toCiId == ciData.id ? 'border-primary text-primary' : ''">
                <i :class="row.toCiIcon"></i>
              </div>
              <div class="overflow">
                <span>{{ row.toCiLabel }}</span>
                <span v-if="row.direction === 'from' && row.alias" class="text-grey">({{ row.alias }})</span>
              </div>
              <div class="overflow text-grey" style="font-size: 12px">{{ row.toGroupName }}</div>
            </div>
            <div v-if="row.relativeRelList && row.relativeRelList.length > 0" class="rel-relative">
              <span class="text-href" @click.stop="rebuildRelativeRel(row)">{{ $t('term.cmdb.calccascaderelation') }}</span>
            </div>
          </div>
        </div>
      </template>
    </TsCard>
  </div>
</template>
<script>
import TsCard from '@/resources/components/TsCard/TsCard.vue';

export default {
  name: '',
  components: {
    TsCard,
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    ciData: { type: Object },
    relData: { type: Object }
  },
  data() {
    return {
      directionType: null,
      noExtended: false
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
    editRel: function(rel) {
      if (this.ciData.authData['cimanage']) {
        this.$emit('edit', rel);
      }
    },
    deleteRel: function(rel) {
      if (this.ciData.authData['cimanage']) {
        this.$emit('delete', rel);
      }
    },
    rebuildRelativeRel(row) {
      this.$createDialog({
        title: this.$t('dialog.title.executeconfirm'),
        content: this.$t('dialog.content.rebuildrelation'),
        'on-ok': vnode => {
          this.$api.cmdb.ci.rebuildRelativeRel(row.id).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              vnode.isShow = false;
            }
          });
        }
      });
    }
  },
  filter: {},
  computed: {
    finalRelList() {
      const relList = [];
      this.relData.cardList.forEach(rel => {
        if ((!this.noExtended || (this.noExtended && !rel.isExtended)) && (!this.directionType || this.directionType === rel.direction)) {
          relList.push(rel);
        }
      });
      return relList;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
/deep/.tscard-container .tscard-ul .tscard-li .tscard-body {
  padding: 0px;
  .rel-container {
    text-align: right;
    padding: 0 8px;
    height: 120px;
    padding-top: 25px;
    &:hover {
      .rel-control {
        visibility: visible;
      }
    }
    .rel-control {
      visibility: hidden;
      cursor: pointer;
      position: absolute;
      top: 0;
      right: 3px;
      width: 100%;
    }
  }
  .rel-main {
    position: relative;
    padding-left: 50px;
    padding-right: 50px;
    height: 100px;
    .rel-left {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 80px;
      text-align: center;
    }
    .rel-right {
      position: absolute;
      top: 0px;
      right: 0px;
      width: 80px;
      text-align: center;
    }
    .rel-icon {
      // border-radius: 50px;
      width: 48px;
      height: 48px;
      font-size: 25px;
      /* text-align: center; */
      border-width: 1px;
      border-style: solid;
      border-radius: 2px;
      /* display: inline-block; */
      /* padding-top: 4px; */
      margin-bottom: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 16px;
    }
    .rel-line {
      position: absolute;
      top: 26px;
      left: 80px;
      right: 80px;
      height: 0px;
      border-top: 1px solid;
      z-index: 0;
    }
    .rel-middle {
      width: 100%;
      height: 48px;
      line-height: 48px;
      text-align: center;
    }
    .rel-left-rule {
      font-size: 12px;
      position: absolute;
      top: 5px;
      left: 80px;
      white-space: nowrap;
    }
    .rel-right-rule {
      font-size: 12px;
      position: absolute;
      top: 5px;
      right: 80px;
      white-space: nowrap;
    }
    .rel-left-label {
      font-size: 12px;
      width: 120px;
      position: absolute;
      top: 30px;
      left: 80px;
      text-align: left;
    }
    .rel-right-label {
      font-size: 12px;
      width: 120px;
      position: absolute;
      top: 30px;
      right: 80px;
      text-align: right;
    }
    .rel-name {
      position: absolute;
      margin: auto;
      z-index: 1;
      left: 50%;
      top: 5px;
      width: 40px;
      height: 40px;
      line-height: 40px;
      font-size: 12px;
      border: 1px solid;
      border-radius: 50%;
      transform: translate(-50%, 0);
    }
    .rel-relative {
      position: absolute;
      bottom: 10px;
      left: 0px;
      padding: 0px 15px;
      width: 100%;
    }
  }
}
.divRel {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
}
</style>
