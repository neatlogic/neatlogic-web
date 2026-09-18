export default {
  data() {
    return {
      regexValidateList: [
        {
          name: 'tomore',
          trigger: 'change',
          message: this.$t('message.pleaseentertruetarget', {target: this.$t('message.framework.regularexpression')}),
          validator: (rule, value) => this.$utils.isEmpty(value) || this.isValidRegex(value)
        }
      ],
      ruleList: [
        { text: this.$t('page.letter'), value: 'unique_ident' },
        { text: this.$t('page.lowercaseletter'), value: 'lowercase' },
        { text: this.$t('page.capitalletter'), value: 'uppercase' },
        { text: this.$t('page.number'), value: 'number' },
        { text: this.$t('page.lettersandnumbers'), value: 'enchar' },
        { text: this.$t('page.emailaddress'), value: 'mail' },
        { text: this.$t('page.phonenumber'), value: 'phone' },
        { text: this.$t('page.ip'), value: 'ip' },
        { text: this.$t('page.port'), value: 'port' },
        { text: 'URL', value: 'url' },
        { text: this.$t('page.custom'), value: 'custom' }
      ]
    };
  },
  methods: {
    isValidRegex(value) {
      try {
        new RegExp(value);
        return true;
      } catch (error) {
        return false;
      }
    },
    getValidationRule(config) {
      // 旧配置可能只有正则，回显为自定义，不改写原数据。
      return config.validate || (!this.$utils.isEmpty(config.regex) ? 'custom' : null);
    },
    showRegexConfig(config) {
      // 兼容内置规则和正则同时存在的旧配置。
      return config.validate === 'custom' || !this.$utils.isEmpty(config.regex);
    },
    changeValidationRule(config, value) {
      const rule = value || null;
      if (rule === this.getValidationRule(config)) {
        return;
      }
      this.$set(config, 'validate', rule);
      if (rule !== 'custom') {
        this.$set(config, 'regex', '');
        this.$set(config, 'regexMessage', '');
      }
    }
  }
};
