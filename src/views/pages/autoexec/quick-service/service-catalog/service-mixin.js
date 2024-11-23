export default {
  props: {
    serviceData: {
      type: Object,
      default: () => {
        return {};
      }
    },
    defaultData: {
      type: Object,
      default: () => {
        return {};
      }
    },
    border: {
      type: String,
      default: 'border'
    },
    source: {
      type: String,
      default: ''
    }
  },
  computed: {
    getFlexClass() {
      return value => {
        return this.border == 'border' ? (value ? 'mb-sm flex-between' : 'flex-between') : 'flex-start overflow';
      };
    },
    getDownUpClass() {
      return value => {
        return value ? 'tsfont-down' : 'tsfont-up';
      };
    }
  }
};
