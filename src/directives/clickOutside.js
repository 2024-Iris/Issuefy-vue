export default {
    beforeMount(el, binding) {
        el.clickOutsideEvent = function (event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        setTimeout(() => {
            document.body.addEventListener('click', el.clickOutsideEvent);
        }, 0);
    },
    unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
    },
};
