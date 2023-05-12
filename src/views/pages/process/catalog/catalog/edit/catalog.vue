<template>
  <div>
    <Loading v-if="loading" :loadingShow="loading"></Loading>
    <TsForm
      v-else
      ref="form"
      v-model="catalogValue"
      :itemList="catalogForm"
    ></TsForm>
    <div class="btnRightText">
      <Button
        v-if="!loading"
        class="save"
        type="primary"
        @click="save()"
      >{{ $t('page.save') }}</Button>
    </div>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
import editmixin from './editmixin.js';
export default {
  name: '',
  components: {
    TsForm
  },
  filters: {},
  mixins: [editmixin],
  props: {
  },
  data() {
    return {
      catalogValue: {
        name: '',
        isActive: 1,
        authorityList: null,
        desc: ''
      },
      catalogForm: [
        {
          type: 'text',
          name: 'name',
          placeholder: '',
          maxlength: 50,
          width: '75%',
          label: this.$t('page.name'),
          validateList: ['required', 'name-special']
        },
        {
          type: 'switch',
          name: 'isActive',
          isHidden: false,
          label: this.$t('page.enable'),
          validateList: ['required']
        },
        {
          type: 'userselect',
          name: 'authorityList',
          label: this.$t('page.auth'),
          width: '75%',
          groupList: ['user', 'team', 'role', 'common'],
          value: ['common#alluser']
        },
        {
          type: 'ckeditor',
          name: 'desc',
          width: '75%',
          label: this.$t('page.description')
        }
      ],
      initValue: {
        name: '',
        isActive: 1,
        authorityList: ['common#alluser'],
        desc: ''
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getData();
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
    getData(hideLoading) {
      let _this = this;
      if (this.uuid == true) {
        _this.catalogValue = _this.$utils.deepClone(_this.initValue);
        return;
      }
      let data = {
        uuid: this.uuid
      };
      !hideLoading && (this.loading = true);
      this.$api.process.service.getCatalogInfo(data).then(res => {
        _this.loading = false;
        if (res.Status == 'OK') {
          let itemValue = res.Return;
          itemValue.desc = this.escape2Html(itemValue.desc);
          this.catalogValue = {
            name: itemValue.name || '',
            isActive: itemValue.isActive || 0,
            authorityList: itemValue.authorityList,
            desc: itemValue.desc || ''    
          };
          _this.$emit('updateName', _this.catalogValue.name);
        } else {
          _this.catalogValue = _this.$utils.deepClone(_this.initValue);
        }
      }).catch(res => {
        _this.catalogValue = _this.$utils.deepClone(_this.initValue);
        _this.loading = false;
      });
    },
    save() {
      if (this.$refs.form.valid()) {
        this.$emit('save', this.catalogValue);
      } else {
        this.$emit('save', false);
      }
    }
  },
  computed: {},
  watch: {
    uuid(val) {
      this.getData(true);
    }
  }

};

</script>
<style lang="less" scoped>
.btnRightText{
  padding-left: 120px;
  padding-top: 16px;
}
</style>
