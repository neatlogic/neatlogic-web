export default class Popup {
  constructor(parent, custom_html) {
    this.parent = parent;
    this.custom_html = custom_html;
    this.make();
  }

  make() {
    this.parent.innerHTML = `
    <div class="ivu-poptip-content">
      <div class="ivu-poptip-arrow"></div>
      <div class="ivu-poptip-inner">
        <div class="ivu-poptip-title">
          <div class="ivu-poptip-title-inner"></div>
        </div>
        <div class="ivu-poptip-body">
          <div class="ivu-poptip-body-content">
            <div class="ivu-poptip-body-content-inner"></div>
          </div>
        </div>
      </div>
    </div>
        `;

    this.hide();

    this.title = this.parent.querySelector('.ivu-poptip-title-inner');
    this.subtitle = this.parent.querySelector('.ivu-poptip-body-content-inner');
    //this.pointer = this.parent.querySelector('.ivu-poptip-body-content-inner');
  }

  show(options) {
    if (!options.target_element) {
      throw new Error('target_element is required to show popup');
    }
    if (!options.position) {
      options.position = 'left';
    }
    const target_element = options.target_element;

    if (this.custom_html) {
      let html = this.custom_html(options.task);
      //html += '<div class="pointer"></div>';
      //this.parent.innerHTML = html;
      this.subtitle.innerHTML = html;
      //this.pointer = this.parent.querySelector('.pointer');
    } else {
      // set data
      this.title.innerHTML = options.title;
      this.subtitle.innerHTML = options.subtitle;
      this.parent.style.width = this.parent.clientWidth + 'px';
    }
    // set position
    let position_meta;
    if (target_element instanceof HTMLElement) {
      position_meta = target_element.getBoundingClientRect();
    } else if (target_element instanceof SVGElement) {
      position_meta = options.target_element.getBBox();
    }

    if (options.position === 'left') {
      this.parent.style.left = position_meta.x + (position_meta.width + 10) + 'px';
      this.parent.style.top = position_meta.y + 60 + 'px'; //60是主体到头部的padding

      /*this.pointer.style.transform = 'rotateZ(90deg)';
      this.pointer.style.left = '-7px';
      this.pointer.style.top = '2px';*/
    }

    // show
    this.parent.style.opacity = 1;
  }

  hide() {
    this.parent.style.opacity = 0;
    this.parent.style.left = 0;
  }
}
