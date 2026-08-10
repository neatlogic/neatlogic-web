export const TONE_TEXT_CLASS_MAP = {
  primary: 'text-primary',
  blue: 'text-primary',
  info: 'text-info',
  success: 'text-success',
  green: 'text-success',
  warning: 'text-warning',
  orange: 'text-warning',
  danger: 'text-danger',
  red: 'text-danger'
};

export const TONE_BACKGROUND_CLASS_MAP = {
  primary: 'bg-selected',
  blue: 'bg-selected',
  info: 'bg-info-grey',
  success: 'bg-success-grey',
  green: 'bg-success-grey',
  warning: 'bg-warning-grey',
  orange: 'bg-warning-grey',
  danger: 'bg-error-grey',
  red: 'bg-error-grey'
};

export const TONE_COLOR_MAP = {
  primary: 'var(--primary-color, #00bcd4)',
  blue: 'var(--primary-color, #00bcd4)',
  info: 'var(--info-color, #2d8cf0)',
  success: 'var(--success-color, #19be6b)',
  green: 'var(--success-color, #19be6b)',
  warning: 'var(--warning-color, #ff9900)',
  orange: 'var(--warning-color, #ff9900)',
  danger: 'var(--error-color, #ed4014)',
  red: 'var(--error-color, #ed4014)'
};

export function getToneTextClass(tone) {
  return TONE_TEXT_CLASS_MAP[tone] || 'text-primary';
}

export function getToneBackgroundClass(tone) {
  return TONE_BACKGROUND_CLASS_MAP[tone] || 'bg-selected';
}

export function getToneColor(tone) {
  return TONE_COLOR_MAP[tone] || TONE_COLOR_MAP.primary;
}
