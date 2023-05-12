<template>
  <div>
    <Input
      :placeholder="placeholder"
      search
      :clearable="clearable"
      @input="debounceInput"
    />
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {
    clearable: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('form.validate.pleaseenterthecontent');
      }
    },
    url: {
      type: String
    },
    delay: {
      type: Number,
      default: 500
    },
    param: {
      type: Object,
      default: null
    },
    search: {
      type: String,
      default: 'keyword'
    }
  },
  data() {
    return {
      timeout: null,
      cancelAxios: null
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

  destroyed() {},
  beforeDestroy() {
    //取消正在搜索的请求
    this.cancelAxios && this.cancelAxios.cancel();
  },

  methods: {
    debounceInput(value) {
      if (this.timeout !== null) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => {
        let search = this.search;
        let data = {};
        this.$set(data, search, value.trim());
        if (this.param) {
          Object.assign(data, this.param);
        }
        //取消正在搜索的请求
        let cancel = this.cancelAxios;
        cancel && (this.cancelAxios = null) && cancel.cancel();
       
        this.cancelAxios = this.$https.CancelToken.source();
        this.$https.post(this.url, data, {
          cancelToken: this.cancelAxios.token
        }).then(res => {
          if (res && res.Status == 'OK') {
            let dataList = res.Return;
            this.$emit('input', dataList);
          }
        });
      }, this.delay);
    }
  },

  filter: {},

  computed: {},

  watch: {}
};
</script>

<style lang="less"></style>
