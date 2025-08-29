<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close()"
  >
    <template v-slot>
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <TsForm
        ref="form"
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
        <template v-slot:sceneTemplateName>
          <TsFormSelect
            v-if="resourceEntityData.config"
            v-model="resourceEntityData.config.sceneTemplateName"
            v-bind="sceneTemplateNameConfig"
            :readonly="!!name && !isCopy"
            @on-change="(val, item, selectItem) => { 
              changeSceneTemplateName(selectItem);
            }"
          ></TsFormSelect>
        </template>
        <template v-slot:mainCi>
          <template v-if="isReady">
            <CiSetting ref="ciSetting" :children="ciList" @updateCiList="updateCiList"></CiSetting>
            <MappingSetting
              ref="mappingSetting"
              :resourceEntityData="resourceEntityData"
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
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    MappingSetting: () => import('./mapping-setting.vue'),
    CiSetting: () => import('./ci/ci-setting.vue')
  },
  props: {
    name: {type: String},
    isCopy: {type: Boolean}
  },
  data() {
    return {
      loadingShow: true,
      isReady: false,
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
          readonly: true,
          validateList: ['required', 'unique_ident', { name: 'searchUrl', url: '/api/rest/resourcecenter/resourceentity/save', key: 'name' }]
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
          name: 'sceneTemplateName',
          label: this.$t('page.template'),
          type: 'slot',
          validateList: ['required']
        },
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
      sceneTemplateNameConfig: {
        dynamicUrl: '/api/rest/resourcecenter/suportmultipleview/scenetemplate',
        rootName: 'tbodyList',
        textName: 'label',
        valueName: 'name',
        validateList: ['required'],
        transfer: true
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
        this.formConfig.forEach(item => {
          if (item.hasOwnProperty('readonly') && (['label', 'description'].includes(item.name) || this.isCopy)) {
            this.$set(item, 'readonly', false);
          } 
        });
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
          if (!this.resourceEntityData.isMultiple) {
            let findItem = this.formConfig.find(item => item.name === 'sceneTemplateName');
            if (findItem) {
              this.$set(findItem, 'isHidden', true);
            }
          }
          if (this.isCopy) {
            this.$set(this.resourceEntityData, 'name', this.resourceEntityData.name + '_copy');
          }
        }).finally(() => {
          this.isReady = true;
          this.loadingShow = false;
        });
      } else {
        //新增
        this.formConfig.forEach(item => {
          if (item.hasOwnProperty('readonly')) {
            this.$set(item, 'readonly', false);
          } 
        });
        this.resourceEntityData = {
          name: '',
          label: '',
          description: '',
          fieldList: [],
          config: {
            sceneTemplateName: '',
            mainCi: '',
            fieldMappingList: []
          }
        };
        this.ciList = [{
          uuid: this.$utils.setUuid(),
          ciName: '',
          ciLabel: '',
          children: []
        }];
        this.isReady = true;
        this.loadingShow = false;
      }
    },
    save() {
      // console.log(JSON.stringify(this.resourceEntityData, null, 2));
      let isValid = true;
      isValid = this.$refs.form.valid() && isValid;
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
    },
    changeSceneTemplateName(selectItem) {
      this.isReady = false;
      this.$set(this.resourceEntityData, 'fieldList', selectItem && selectItem.fieldList || []);
      this.$set(this.resourceEntityData.config, 'fieldMappingList', []);
      this.$nextTick(() => {
        this.isReady = true; 
      });
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
