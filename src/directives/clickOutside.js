export default {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!el.contains(event.target)) {
        binding.value(event);
      }
    };
    document.body.addEventListener('mouseup', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('mouseup', el.clickOutsideEvent);
  },
};
