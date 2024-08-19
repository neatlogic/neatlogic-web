export default ({ reaction, view }) => {
  if (reaction.event) {
    const emitData = {};
    emitData[reaction.event] = view.formData[view.formItem.uuid];
    view.$emit('emit', emitData);
    view.addExecuteCount('emit');
  }
};
