export const editorProps = {
  value: { default: null },
  definition: { type: Object, default: () => ({}) },
  context: { type: Object, default: () => ({}) },
  mode: { type: String, default: 'edit' },
  disabled: Boolean,
  isRequired: Boolean
};

export async function validateControls(controls, onInvalid = () => {}) {
  let valid = true;
  for (const control of controls.flat().filter(Boolean)) {
    if (control.valid && !(await control.valid())) {
      onInvalid(control);
      valid = false;
    }
  }
  return valid;
}
