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
        desc: '',
        uuid: this.uuid
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
      if (!this.uuid) {
        this.catalogValue = this.$utils.deepClone(this.initValue);
        return;
      }
      let data = {
        uuid: this.uuid
      };
      !hideLoading && (this.loading = true);
      this.$api.process.service.getCatalogInfo(data).then(res => {
        this.loading = false;
        if (res.Status == 'OK') {
          let itemValue = res.Return;
          itemValue.desc = this.escape2Html(itemValue.desc);
          this.catalogValue = {
            name: itemValue.name || '',
            isActive: itemValue.isActive || 0,
            authorityList: itemValue.authorityList,
            desc: itemValue.desc || '',
            uuid: this.uuid   
          };
          this.$emit('updateName', this.catalogValue.name);
        } else {
          this.catalogValue = this.$utils.deepClone(this.initValue);
        }
      }).catch(res => {
        this.catalogValue = this.$utils.deepClone(this.initValue);
        this.loading = false;
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
