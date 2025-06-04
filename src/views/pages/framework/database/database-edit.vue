<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      :okBtnDisable="!!errorMsg"
      @on-close="close"
      @on-ok="save"
    >
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
          <template v-slot:fileIdList>
            <div>
              <TsUpLoad
                styleType="button"
                dataType="DATASOURCE"
                className="smallUpload"
                type="drag"
                width="75%"
                :multiple="true"
                :uploadCount="100"
                :format="['jar']"
                :defaultList="fileList"
                @remove="getFileList"
                @getFileList="getFileList"
              ></TsUpLoad>
            </div>
          </template>
        </TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
// import { defineComponent } from '@vue/composition-api'

export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue')
  },
  props: {
    id: {
      type: Number
    }
  },
  data() {
    const _this = this;
    return {
      errorMsg: '',
      fileList: [],
      // fileDownurl: '/api/binary/matrix/view/xmlfile/download',,
      // fileDownParam: {
      //   matrixUuid: this.matrixUuid
      // },
      databaseData: {
        id: null,
        name: '',
        config: {},
        fileIdList: []
      },
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        title: !this.id ? this.$t('dialog.title.addtarget', { target: this.$t('page.database') }) : this.$t('dialog.title.edittarget', { target: this.$t('page.database') }),
        width: 'medium'
      },
      formConfig: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.name')}) }, { name: 'name-special' }, {
            name: 'searchUrl',
            url: '/api/rest/database/save',
            key: 'name'
          }],
          maxlength: 50,
          onChange: name => {
            this.databaseData.name = name;
          }
        },
        {
          type: 'radio',
          name: 'type',
          label: this.$t('page.type'),
          dataList: [
            {
              value: 'jdbc',
              text: 'jdbc'
            }
          ],
          validateList: ['required'],
          onChange: type => {
            this.databaseData.type = type;
          }
        },
        {
          type: 'textarea',
          name: 'config',
          label: this.$t('page.config'),
          validateList: ['required'],
          onChange: config => {
            this.databaseData.config = config;
          }
        },
        {
          type: 'slot',
          name: 'fileIdList',
          label: '驱动jar包',
          value: null,
          transfer: true,
          width: '75%',
          validateList: ['required']
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getDatabaseById();
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
    getDatabaseById() {
      if (this.id) {
        this.$api.framework.database.getDatabaseById({id: this.id}).then(res => {
          this.databaseData = res.Return;
          if (this.databaseData.fileList && this.databaseData.fileList.length > 0) {
            this.fileList = this.databaseData.fileList;
          }
          this.formConfig.forEach(element => {
            if (element.name == 'config') {
              this.$set(element, 'value', JSON.stringify(this.databaseData[element.name]));
            } else {
              this.$set(element, 'value', this.databaseData[element.name]);
            }
          });
        });
      } else {
        this.databaseData = { type: 'jdbc', config: {}};
        this.formConfig.forEach(element => {
          if (element.name == 'config') {
            this.$set(element, 'value', JSON.stringify(this.databaseData[element.name]));
          } else {
            this.$set(element, 'value', this.databaseData[element.name]);
          }
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        if (this.id) {
          this.databaseData.id = this.id;
        }
        let fileIdList = [];
        if (this.fileList && this.fileList.length > 0) {
          this.fileList.forEach(element => {
            fileIdList.push(element.id);
          });
        }
        this.databaseData.fileIdList = fileIdList;
        this.$api.framework.database.saveDatabase(this.databaseData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    getFileList(fileList) {
      this.fileList = fileList;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
