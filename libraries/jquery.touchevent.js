// Passive event listeners
function regiterTouchHandler(jQuery) {

    jQuery.event.special.touchstart = {
        setup: function (_, ns, handle) {
            this.addEventListener("touchstart", handle, { passive: true });
        }
    };
    jQuery.event.special.touchmove = {
        setup: function (_, ns, handle) {
            this.addEventListener("touchmove", handle, { passive: true });
        }
    };
}
export default regiterTouchHandler;