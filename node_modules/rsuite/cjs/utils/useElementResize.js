"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = useElementResize;

var _react = require("react");

var _elementResizeEvent = _interopRequireWildcard(require("element-resize-event"));

/**
 * Attach the event handler directly to the specified DOM element,
 * and it will be triggered when the size of the DOM element is changed.
 *
 * @param eventTarget The target to listen for events on
 * @param listener An event handler
 */
function useElementResize(eventTarget, listener) {
  (0, _react.useEffect)(function () {
    var target = typeof eventTarget === 'function' ? eventTarget() : eventTarget;
    (0, _elementResizeEvent.default)(target, listener);
    return function () {
      return (0, _elementResizeEvent.unbind)(target);
    };
  }, [eventTarget, listener]);
}