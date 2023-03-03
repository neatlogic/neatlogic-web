import Vue from 'vue';
import TsDialog from './TsDialog.vue';

TsDialog.install = function(_Vue, options) {
  _Vue.prototype.$createDialog = config => {
    let instance = null;
    const TsDialogConstructor = _Vue.extend(TsDialog);
    config.isShow = true;
    config.width = config.width || '500px';
    config.type = config.type || 'modal';
    config.cancelText = config.cancelText || Vue.prototype.i18n.t('button.cancel');
    config.okText = config.okText || Vue.prototype.i18n.t('button.confirm');
    !config.title && (config.hasHeader = false);
    let oDiv = document.createElement('div');
    document.body.appendChild(oDiv);
    instance = new TsDialogConstructor({ propsData: config }).$mount(oDiv);
    Object.assign(instance, config);
    instance.closeDailog = function() {
      config.isShow = false;
      instance.isShow = false;
    };
  };
  _Vue.component('TsDialog', TsDialog);
};
export default TsDialog;
