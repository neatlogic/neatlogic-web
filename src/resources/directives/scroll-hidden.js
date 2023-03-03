
/*  1、tsformselect userselect  tsformdatepick timeselect 插件有自己的滚出容器的事件  
*   2、tooltip  poptip  ckedit的图片按钮等需要单独的判断
*/
import utils from '@/resources/assets/js/util.js';
const scrollHidden = {
  bind(el, binding) {
    el.addEventListener('scroll', onScroll);
    el.addEventListener('DOMMouseScroll', onScroll);
  },
  unbind(el, binding) {
    el.removeEventListener('scroll', onScroll);
    el.removeEventListener('DOMMouseScroll', onScroll);
  }
};
function onScroll(event) {
  let $target = event.target;
  $target.querySelectorAll('.ivu-tooltip ,.ivu-poptip').forEach(el => { //tooltip  poptip
    let elVue = el.__vue__;
    if (elVue && elVue.transfer && elVue.visible) {
      let $contain = event.target;
      let $target = el;
      let targetTop = $target.getBoundingClientRect().top;
      let containTop = $contain.getBoundingClientRect().top;
      if (!(targetTop > containTop + 10 && targetTop < containTop + $contain.clientHeight)) {
        elVue.visible = false;
      }
    }
  });
  $target.querySelectorAll('.form-li').forEach(el => { //tsformselect userselect  tsformdatepick timeselect
    let elVue = el.__vue__;
    if (elVue && elVue.transfer && elVue.isVisible) {
      elVue.onScroll && elVue.onScroll(event);
    } else if (el.querySelector('.ivu-date-picker')) {
      let $date = el.querySelector('.ivu-date-picker');
      let dateVue = $date.__vue__;
      dateVue && dateVue.visible && elVue.onScroll && elVue.onScroll(event);
    }
  });

  document.querySelectorAll('body>.ck-reset_all>.ck-balloon-panel_visible').forEach(el => { //kedit的图片按钮等需要单独的判断
    let $contain = event.target;
    let $target = el;
    let targetTop = $target.offsetTop;
    let containTop = $contain.getBoundingClientRect().top;
    if (!(targetTop > containTop + 10 && targetTop < containTop + $contain.clientHeight)) {
      utils.toggleClass(el, 'ck-balloon-panel_visible', 'remove');
    }
  });
}
export default scrollHidden;
