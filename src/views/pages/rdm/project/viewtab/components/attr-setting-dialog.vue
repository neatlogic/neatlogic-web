<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot>
      <div>
        <div class="grid">
          <div class="text-grey">{{ $t('page.sort') }}</div>
          <div class="text-grey">{{ $t('term.cmdb.fieldname') }}</div>
          <div class="text-grey">{{ $t('term.cmdb.fieldtype') }}</div>
          <div class="text-grey">{{ $t('page.description') }}</div>
          <div class="text-grey">{{ $t('term.cmdb.displaytype') }}</div>
        </div>
        <draggable
          v-bind="dragOptions"
          tag="div"
          class="dataSource-ul"
          :list="attrList"
          :group="{ name: 'item-sub' }"
          handle=".tsfont-bar"
          :forceFallback="false"
        >
          <div v-for="(item, index) in attrList" :key="index" class="grid">
            <div><i class="tsfont-bar" style="cursor: move"></i></div>
            <div>{{ item.label }}</div>
            <div>{{ item.typeText }}</div>
            <div>{{ item.description }}</div>
            <div>
              <TsFormSelect
                v-model="item.showType"
                :dataList="attrShowTypeList"
                :width="100"
                border="border"
                :clearable="false"
                :transfer="true"
              ></TsFormSelect>
            </div>
          </div>
        </draggable>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    draggable,
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: { projectId: { type: Number }, appId: { type: Number } },
  data() {
    return {
      attrShowTypeList: [],
      systemAttrShowTypeList: [],
      dialogConfig: {
        type: 'modal',
        title: this.$t('term.rdm.attributesetting'),
        width: 'medium',
        maskClose: false,
        isShow: true
      },
      dragOptions: {
        animation: 150,
        scroll: true,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      },
      appSetting: {},
      attrList: [] //对象属性列表，此处会返回所有属性，包括未激活属性
    };
  },
  beforeCreate() {},
  async created() {
    this.getAttrShowTypeList();
    //this.getSystemAttrShowTypeList();
    await this.searchAppAttr();
    this.getAppSetting();
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
    getAppSetting() {
      this.$api.rdm.app.getAppUserSetting(this.appId).then(res => {
        this.appSetting = res.Return;
        if (this.appSetting && this.appSetting?.config?.attrList && this.appSetting.config.attrList.length > 0 && this.attrList && this.attrList.length > 0) {
          this.appSetting.config.attrList.forEach(attrconf => {
            const attr = this.attrList.find(d => (attrconf.attrId ? d.id === attrconf.attrId : d.type === attrconf.attrType));
            if (attr) {
              this.$set(attr, 'sort', attrconf.sort);
              this.$set(attr, 'showType', attrconf.showType || 'all');
            }
          });
        }
        this.attrList.forEach(attr => {
          if (!attr.showType) {
            this.$set(attr, 'showType', 'all');
          }
        });
        this.attrList.sort((a, b) => {
          return (a.sort || 0) - (b.sort || 0);
        });
      });
    },
    getAttrShowTypeList() {
      this.$api.common.getSelectList({ enumClass: 'neatlogic.framework.rdm.enums.AttrShowType' }).then(res => {
        this.attrShowTypeList = res.Return;
      });
    },
    getSystemAttrShowTypeList() {
      this.$api.common.getSelectList({ enumClass: 'neatlogic.framework.rdm.enums.SystemAttrShowType' }).then(res => {
        this.systemAttrShowTypeList = res.Return;
      });
    },
    async searchAppAttr() {
      await this.$api.rdm.app.searchAppAttr({ appId: this.appId, needSystemAttr: 1 }).then(res => {
        this.attrList = res.Return;
      });
    },
    updateAttrList(event, val) {
      this.attrList = val;
      const idList = [];
      this.attrList.forEach(element => {
        idList.push(element.id);
      });
      this.$api.rdm.project.updateAttrSort({ idList: idList, appId: this.appId });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const saveAttrList = [];
      this.attrList.forEach((attr, index) => {
        saveAttrList.push({ attrId: attr.id, attrType: attr.type, sort: index + 1, showType: attr.showType });
      });
      this.$api.rdm.app.saveAppUserSetting({ appId: this.appId, config: { attrList: saveAttrList } }).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.grid {
  display: grid;
  height: 40px;
  line-height: 40px;
  grid-template-columns: 50px 150px 150px auto 130px;
}
</style>
