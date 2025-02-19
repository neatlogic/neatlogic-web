<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close()"
  >
    <template v-slot>
      <TsForm
        v-model="resourceEntityData"
        :item-list="formConfig"
      >
        <!-- <template v-slot:xml>
          <TsCodemirror
            ref="code"
            v-model="resourceEntityData.xml"
            codeMode="xml"
          ></TsCodemirror>
        </template> -->
        <template v-slot:mainCi>
          <template v-if="resourceEntityData.config">
            <CiSetting ref="ciSetting" :children="ciList" @updateCiList="updateCiList"></CiSetting>
            <MappingSetting
              v-if="!$utils.isEmpty(resourceEntityData)"
              ref="mappingSetting"
              :data="resourceEntityData"
              :mainCi="resourceEntityData.config.mainCi"
              :ciList="ciList"
              class="pt-nm"
            ></MappingSetting>
          </template>
        </template>
      </TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    // TsCodemirror:()=>import('@/resources/plugins/TsCodemirror/TsCodemirror.vue'),
    MappingSetting: () => import('./mapping-setting.vue'),
    CiSetting: () => import('./ci/ci-setting.vue')
  },
  props: {name: {type: String}},
  data() {
    return {
      resourceEntityData: {},
      dialogConfig: {
        title: this.$t('term.cmdb.viewsetting'),
        isShow: true,
        width: 'large',
        type: 'slider'
      },
      formConfig: [
        {
          name: 'name',
          label: this.$t('term.cmdb.view'),
          type: 'text',
          readonly: true
        },
        {
          name: 'label',
          label: this.$t('page.name'),
          type: 'text',
          readonly: true
        },
        {
          name: 'description',
          label: this.$t('page.description'),
          type: 'textarea',
          readonly: true
        },
        // {
        //   name: 'xml',
        //   label: this.$t('page.config'),
        //   type: 'slot'
        // },
        {
          name: 'mainCi',
          label: this.$t('term.cmdb.mainci'),
          type: 'slot',
          validateList: ['required']
        }
      ],
      treeConfig: {
        url: 'api/rest/cmdb/ci/listtree',
        valueName: 'name',
        textName: 'label',
        transfer: true,
        showPath: true,
        validateList: ['required']
      },
      ciList: []
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() { this.getResourceEntityData(); },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getResourceEntityData() {
      if (this.name) {
        this.$api.cmdb.resourceentity.getResourceEntity(this.name).then(res => {
          this.resourceEntityData = res.Return || {};
          if (!this.resourceEntityData.config) {
            this.$set(this.resourceEntityData, 'config', {});
            this.$set(this.resourceEntityData.config, 'mainCi', '');
            this.ciList = [];
          } else {
            if (!this.$utils.isEmpty(this.resourceEntityData.config.relNode)) {
              this.ciList = [{
                ...this.resourceEntityData.config.relNode
              }];
            } else if (this.resourceEntityData.config.mainCi) {
              this.ciList = [{
                uuid: this.$utils.setUuid(),
                ciName: this.resourceEntityData.config.mainCi,
                ciLabel: this.resourceEntityData.config.mainCi,
                children: []
              }];
            } else {
              this.ciList = [];
            }
          }
        });
      }
    },
    save() {
      // console.log(JSON.stringify(this.resourceEntityData, null, 2));
      let isValid = true;
      isValid = this.$refs.ciSetting.valid() && isValid;
      isValid = this.$refs.mappingSetting.valid() && isValid;
      if (!isValid) {
        return;
      }
      let fieldMappingList = this.$refs.mappingSetting.getData();
      fieldMappingList.forEach(item => {
        for (let key in item) {
          if (this.$utils.isEmpty(item[key])) { //清除多余字段
            this.$delete(item, key);
          }
        }
      });
      this.$set(this.resourceEntityData.config, 'fieldMappingList', fieldMappingList);
      this.$set(this.resourceEntityData.config, 'relNode', this.ciList[0]);
      this.$api.cmdb.resourceentity.saveResourceEntity(this.resourceEntityData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    updateCiList(list) {
      this.$set(this.resourceEntityData.config, 'mainCi', list[0].ciName);
      this.ciList = this.$utils.deepClone(list);
    }
  },
  filter: {},
  computed: {
    placeholder() {
      if (this.resourceEntityData.type === 'resource') {
        return '&lt;resource ci=&quot;xx&quot;&gt;&lt;/resource&gt;';
      } else if (this.resourceEntityData.type === 'scene') {
        return '&lt;scene ci=&quot;xx&quot;&gt;&lt;/scene&gt;';
      }
      return '';
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
