<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okProfile"
      @on-close="close"
    >
      <template v-slot:header>
        <div v-if="toolProfileId">{{ type == 'copy' ? $t('dialog.title.copytarget', {target: $t('term.autoexec.presetparameterset')}) : $t('dialog.title.edittarget', {target: $t('term.autoexec.presetparameterset')}) }}</div>
        <div v-else>{{ $t('page.newtarget', {target: $t('term.autoexec.presetparameterset')}) }}</div>
      </template>
      <template v-slot>
        <TsForm
          ref="profileForm"
          v-model="profileFormConfig"
          :item-list="profileForm"
          :labelWidth="100"
        >
          <template v-slot:profileParamVoList>
            <div class="mt-sm">
              <ParamsList
                ref="param"
                :paramList="profileFormConfig.profileParamVoList"
              ></ParamsList>
            </div>
          </template>
          <template v-slot:argumentList>
            <ArgumentEdit ref="argumentList" :tableData="profileFormConfig.argumentList"></ArgumentEdit>
          </template>
        </TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import ParamsList from './params-list.vue';
export default {
  name: '',
  components: {
    ParamsList,
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    ArgumentEdit: () => import('./argument-edit.vue')
  },
  props: {
    toolProfileId: {
      type: [String, Number],
      default: null
    },
    type: {
      // copy/edit/add 操作类型
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogSetting: {
        isShow: true,
        type: 'slider',
        width: 'large'
      },
      profileFormConfig: {
        name: '',
        description: '',
        fromSystemId: null,
        autoexecOperationVoList: [],
        profileParamVoList: [],
        argumentList: {
          hideAction: false,
          tbodyList: []
        }
      },
      profileForm: {
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          width: '100%',
          label: this.$t('page.name'),
          validateList: [
            'required',
            'name-special',
            { name: 'searchUrl',
              url: '/api/rest/autoexec/profile/save',
              key: 'name',
              message: this.$t('message.targetisexists', {target: this.$t('page.name')}),
              params: { id: ''}
            }
          ]
        },
        description: {
          type: 'textarea',
          name: 'description',
          value: '',
          maxlength: 200,
          label: this.$t('page.description')
        },
        fromSystemId: {
          type: 'select',
          name: 'fromSystemId',
          value: '',
          label: this.$t('term.autoexec.owningsystem'),
          dynamicUrl: '/api/rest/resourcecenter/appsystem/list/forselect',
          rootName: 'tbodyList',
          dealDataByUrl: this.getSystemList,
          validateList: ['required']
        },
        autoexecOperationVoList: {
          type: 'select',
          name: 'autoexecOperationVoList',
          value: '',
          label: this.$t('term.autoexec.associatedtool'),
          multiple: true,
          search: true,
          validateList: ['required'],
          dynamicUrl: '/api/rest/autoexec/scriptandtool/search',
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          onChange: (value, objectValue, selectedList) => {
            this.getParamsList(value, objectValue, selectedList);
          }
        },
        profileParamVoList: {
          type: 'slot',
          name: 'profileParamVoList',
          label: this.$t('term.autoexec.toolparameter'),
          tooltip: this.$t('term.autoexec.toolparamstooltip'),
          value: []
        },
        argumentList: {
          type: 'slot',
          name: 'argumentList',
          label: this.$t('term.autoexec.freeparameter'),
          value: []
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.toolProfileId) {
      this.editProfile(this.toolProfileId);
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
    okProfile() {
      if (!this.$refs.profileForm.valid()) {
        return;
      }
      if (this.$refs.param && !this.$refs.param.valid()) {
        return;
      }
      if (this.$refs.argumentList && (this.$refs.argumentList.validKeyRepeat() || this.$refs.argumentList.validValueIsEmpty())) {
        return;
      }
      let data = this.$utils.deepClone(this.profileFormConfig);
      if (this.toolProfileId && this.type != 'copy') {
        this.$set(data, 'id', this.toolProfileId);
      }
      this.$set(data, 'autoexecOperationVoList', this.defaultAutoexecOperationVoList); // 关联工具
      data.profileParamVoList = []; // 工具参数处理
      data.profileParamVoList = this.$refs && this.$refs.param ? this.$refs.param.getValueList() : [];
      let argumentList = this.$refs && this.$refs.argumentList ? this.$refs.argumentList.getData() : [];
      data.profileParamVoList.push(...argumentList);
      this.$api.autoexec.profile.saveProfile(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      });
    },
    async getParamsList(value, objectValue, selectedList) {
      // 根据关联工具获取工具参数列表
      if (selectedList && selectedList.length > 0) {
        this.defaultAutoexecOperationVoList = selectedList;
        await this.$api.autoexec.profile.getParamList({autoexecOperationVoList: selectedList}).then((res) => {
          let profileParamVoList = res.Return;
          if (res.Status == 'OK' && profileParamVoList) {
            profileParamVoList.forEach((item) => {
              if (item.isRequired) {
                item.isRequired = 0;
              }
            });
            this.$set(this.profileFormConfig, 'profileParamVoList', profileParamVoList);
          }
        });
      }
    },
    getSystemList(nodeList) {
      let columlist = [];
      nodeList.forEach(n => {
        let text = n.abbrName;
        if (n.name) {
          text += '[' + n.name + ']';
        }
        columlist.push(
          { text: text, value: n.id, config: n }
        );
      });
      columlist.unshift({
        value: -1,
        text: this.$t('page.global')
      });
      return columlist;
    },
    isValidSelf(id = null) {
      // 修复编辑时，名称改回自身，不需要校验自身
      if (this.profileForm && this.profileForm.hasOwnProperty('name')) {
        this.profileForm['name'].validateList.forEach((item) => {
          if (item && item.hasOwnProperty('params')) {
            item.params.id = id || '';
          }
        });
      }
    },
    editProfile(profileId) {
      if (!profileId) {
        return false;
      }
      let dataObj = {
        name: '',
        description: '',
        fromSystemId: null,
        autoexecOperationVoList: [],
        profileParamVoList: [],
        argumentList: {
          hideAction: false,
          tbodyList: []
        }
      };
      this.isValidSelf(this.type == 'copy' ? '' : profileId);
      this.$api.autoexec.profile.getProfileDetailById(profileId).then((res) => {
        if (res.Status == 'OK') {
          let data = res.Return;
          let toolParamsValue = {}; // 工具参数值，用于工具参数回显
          dataObj.name = (this.type == 'copy' && data.name) ? `${data.name}_copy` : data.name;
          dataObj.description = data.description;
          dataObj.fromSystemId = data.fromSystemId;
          data.autoexecOperationVoList && data.autoexecOperationVoList.forEach((item) => {
            if (item && item.id) {
              // 处理关联工具回显
              dataObj['autoexecOperationVoList'].push(item.id);
            }
          });
          data.profileParamVoList && data.profileParamVoList.filter(o => o.type !== 'argument').forEach((item) => {
            if (item && item.isRequired) {
              item.isRequired = 0;
            }
            toolParamsValue[item.key] = {defaultValue: item.defaultValue, mappingMode: item.mappingMode, mappingModeText: item.mappingModeText};
          });

          if (this.type == 'copy') {
            this.getParamsList('', '', data.autoexecOperationVoList).then(() => {
              // 解除工具参数关联的id
              this.profileFormConfig.profileParamVoList.forEach((item) => {
                if (toolParamsValue[item.key]) {
                  this.$set(item, 'defaultValue', toolParamsValue[item.key].defaultValue);
                  this.$set(item, 'mappingMode', toolParamsValue[item.key].mappingMode);
                  this.$set(item, 'mappingModeText', toolParamsValue[item.key].mappingModeText);
                }
              });
              dataObj.profileParamVoList = this.profileFormConfig.profileParamVoList || [];
              Object.assign(this.profileFormConfig, dataObj);
            });
          } else {
            dataObj.profileParamVoList = data.profileParamVoList ? data.profileParamVoList.filter(o => o.type !== 'argument') : [];
            dataObj.argumentList.tbodyList = data.profileParamVoList ? data.profileParamVoList.filter(o => o.type === 'argument') : [];
            this.defaultAutoexecOperationVoList = data.autoexecOperationVoList;
            Object.assign(this.profileFormConfig, dataObj);
          }
        }
      });
    },
    close(needRefresh = false) {
      this.profileFormConfig = {};
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
