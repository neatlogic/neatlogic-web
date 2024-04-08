import {$t} from '@/resources/init.js';

const runnerGroupMixin = {
  data() {
    let _this = this;
    return {
      netWorkList: [{ networkIp: '', mask: '' }],
      theadList: [
        { title: 'IP', key: 'networkIp' },
        { title: $t('term.plugin.mask'), key: 'mask' },
        { key: 'act', title: '' }
      ],
      validConfig: {
        validIp: ['ip'],
        validMask: ['mask']
      },
      formConfig: {
        id: {
          type: 'text',
          name: 'id',
          value: null,
          defaultValue: null,
          isHidden: true,
          label: $t('page.primarykey')
        },
        name: {
          type: 'text', //控件类型
          label: $t('page.groupname'), //控件标题
          value: '',
          maxlength: 50,
          validateList: [
            'required',   
            'name-special', // 字段必须，不能更改
            { 
              name: 'searchUrl', // 字段必须，不能更改
              url: '/api/rest/runnergroup/save', // 换成对应接口地址，保存的接口地址
              params: {
                id: _this.runnerGroupData.id || ''
              },
              key: 'name' // key值
            }]
        },
        description: {
          type: 'text', //控件类型
          label: $t('page.description'), //控件标题
          value: '',
          maxlength: 200,
          validateList: ['required']
        },
        groupNetworkList: {
          label: $t('page.networksegment'),
          type: 'slot'
        } // 网关
      }
    };
  },
  methods: {
    close(needRefresh = false) {
      // 关闭模态框
      this.$emit('close', needRefresh);
    },
    operationRow(type, index) {
      // 操作行，add 表示新增，del表示删除
      if (type == 'add') {
        this.netWorkList.splice(index, 0, {
          networkIp: '', 
          mask: ''
        });
      } else {
        this.netWorkList.splice(index, 1);
      }
    },
    filterEmptyNetworkList() {
      // 过滤空网段列表
      if (!this.$utils.isEmpty(this.netWorkList)) {
        let arr = this.netWorkList.filter((val) => {
          return val.networkIp && (val.mask || val.mask == '0'); // 解决掩码为0被过滤的问题
        });
        return arr;
      } else {
        return [];
      }
    },
    validNetwork() {
      // 验证IP和掩码格式
      let form = this.$refs.formInput ? this.$refs.formInput.$parent : '';
      let valid = true;
      if (form) {
        form.$children && form.$children.forEach((el) => {
          if (!el.valid() && el.currentValue) {
            valid = false;
          }
        }); 
      }
      return valid;
    }
  }
};

export {
  runnerGroupMixin
};
