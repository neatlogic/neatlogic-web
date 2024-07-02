export default {
  props: {
    rowData: {
      type: Object,
      default: () => {
        return {};
      }
    },
    headerKey: {
      type: String,
      default: ''
    }
  },
  methods: {
    sliceFn(list, key) {
      if (key) {
        return list.slice(0, 2);
      } else {
        return list.slice(2, list.length);
      }
    }
  }
};
