
<template>
  <TsDialog v-bind="showDialog" @on-close="close" @on-ok="save">
    <div>
      <div class="action-icon text-right">
        <span class="tsfont-rotate-right text-tip-active" @click="refreshTagList"></span>
        <span class="tsfont-edit text-tip-active pl-md" @click="editTag"></span>
      </div>
      <TsForm
        v-if="operateType =='addTag' || operateType =='tagEdit'"
        ref="form"
        v-model="settingConfig"
        :item-list="settingForm"
        type="type"
        label-position="right"
      >
        <template v-slot:tagList>
          <TsFormSelect
            v-model="settingConfig.tagList"
            v-bind="settingForm.tagList"
          >
          </TsFormSelect>
        </template>
      </TsForm>
      <TsForm
        v-if=" operateType =='delTag'"
        ref="form"
        v-model="settingConfig"
        :item-list="delSettingForm"
        type="type"
        label-position="right"
      >
        <template v-slot:tagList>
          <TsFormSelect v-model="settingConfig.tagList" v-bind="delSettingForm.tagList">
          </TsFormSelect>
        </template>
      </TsForm>
    </div>
  </TsDialog>
</template>
<script>
export default {
  name: 'AddTag',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    operateType: String,
    title: String,
    resourceIdList: Array,
    settingConfig: Object
  },
  data() {
    return {
      showDialog: {
        type: 'modal',
        title: this.title,
        maskClose: false,
        isShow: true
      },
      delSettingForm: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        tagList: {
          type: 'slot',
          name: 'tagList',
          label: this.$t('page.tag'),
          transfer: true,
          multiple: true,
          tagList: [],
          search: true,
          allowCreate: true,
          dynamicUrl: 'api/rest/resourcecenter/tag/list/forselect',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.tag')}) }, 'name-special']
        }
      },
      settingForm: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        tagList: {
          type: 'slot',
          name: 'tagList',
          label: this.$t('page.tag'),
          transfer: true,
          multiple: true,
          search: true,
          allowCreate: true,
          dynamicUrl: 'api/rest/resourcecenter/tag/name/list/forselect',
          rootName: 'tbodyList'
        }
      }
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
    close() {
      this.$emit('close');
    },
    save() {
      let form = this.$refs.form;
      if (form.valid()) {
        let newResourceIdList = this.$utils.deepClone(this.resourceIdList);
        if (newResourceIdList.length > 0) {
          newResourceIdList = newResourceIdList.map(item => {
            return item.id;
          });
        }
        let batchData = {
          resourceIdList: newResourceIdList,
          tagList: this.settingConfig.tagList
        };
        if (this.operateType == 'tagEdit') {
          if (this.resourceIdList && this.resourceIdList.length > 0) {
            let data = {
              // 主要是编辑某一个标签的时候才需要
              resourceId: this.resourceIdList[0],
              tagList: this.settingConfig.tagList
            };
            this.$api.cmdb.asset.saveSingleTag(data).then(res => {
              if (res.Status == 'OK') {
                this.$emit('success', {
                  msg: this.$t('message.savesuccess')
                });
              }
            });
          } else {
            // 提示
            this.$Message.warning(this.$t('term.cmdb.reselect'));
          }
        } else if (this.operateType == 'addTag') {
          this.$api.cmdb.asset.batchAddTag(batchData).then(res => {
            if (res.Status == 'OK') {
              this.$emit('success', {
                msg: this.$t('term.cmdb.tagaddsuccess')
              });
            }
          });
        } else if (this.operateType == 'delTag') {
          this.$api.cmdb.asset.batchDelTag(batchData).then(res => {
            if (res.Status == 'OK') {
              this.$emit('success', {
                msg: this.$t('message.deletesuccess')
              });
            }
          });
        }
      }
    },
    refreshTagList() {
      this.$Message.success(this.$t('message.refreshsuccess'));
    },
    editTag() {
      window.open(HOME + '/cmdb.html#/tag-manage', '_blank');
    }
  },
  computed: {},
  watch: {}
};
</script>
