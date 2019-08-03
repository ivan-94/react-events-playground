/** @license React vundefined
 * react-events-hover.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react')) :
	typeof define === 'function' && define.amd ? define(['react'], factory) :
	(global.ReactEventsHover = factory(global.React));
}(this, (function (React) { 'use strict';

var UserBlockingEvent = 1;

var targetEventTypes = ['pointerover', 'pointermove', 'pointerout', 'pointercancel'];

// If PointerEvents is not supported (e.g., Safari), also listen to touch and mouse events.
if (typeof window !== 'undefined' && window.PointerEvent === undefined) {
  targetEventTypes.push('touchstart', 'mouseover', 'mousemove', 'mouseout');
}

function isFunction(obj) {
  return typeof obj === 'function';
}

function createHoverEvent(event, context, type, target) {
  var clientX = null;
  var clientY = null;
  var pageX = null;
  var pageY = null;
  var screenX = null;
  var screenY = null;

  if (event) {
    var nativeEvent = event.nativeEvent;
    clientX = nativeEvent.clientX;
    clientY = nativeEvent.clientY;
    pageX = nativeEvent.pageX;
    pageY = nativeEvent.pageY;
    screenX = nativeEvent.screenX;
    screenY = nativeEvent.screenY;
  }

  return {
    target: target,
    type: type,
    timeStamp: context.getTimeStamp(),
    clientX: clientX,
    clientY: clientY,
    pageX: pageX,
    pageY: pageY,
    screenX: screenX,
    screenY: screenY,
    x: clientX,
    y: clientY
  };
}

function dispatchHoverChangeEvent(event, context, props, state) {
  var onHoverChange = props.onHoverChange;
  if (isFunction(onHoverChange)) {
    var bool = state.isActiveHovered;
    context.dispatchEvent(bool, onHoverChange, UserBlockingEvent);
  }
}

function dispatchHoverStartEvents(event, context, props, state) {
  var target = state.hoverTarget;
  if (event !== null) {
    var nativeEvent = event.nativeEvent;

    if (context.isTargetWithinResponderScope(nativeEvent.relatedTarget)) {
      return;
    }
  }

  state.isHovered = true;

  if (state.hoverEndTimeout !== null) {
    context.clearTimeout(state.hoverEndTimeout);
    state.hoverEndTimeout = null;
  }

  if (!state.isActiveHovered) {
    state.isActiveHovered = true;
    var _onHoverStart = props.onHoverStart;
    if (isFunction(_onHoverStart)) {
      var syntheticEvent = createHoverEvent(event, context, 'hoverstart', target);
      context.dispatchEvent(syntheticEvent, _onHoverStart, UserBlockingEvent);
    }
    dispatchHoverChangeEvent(event, context, props, state);
  }
}

function dispatchHoverEndEvents(event, context, props, state) {
  var target = state.hoverTarget;
  if (event !== null) {
    var nativeEvent = event.nativeEvent;

    if (context.isTargetWithinResponderScope(nativeEvent.relatedTarget)) {
      return;
    }
  }

  state.isHovered = false;

  if (state.hoverStartTimeout !== null) {
    context.clearTimeout(state.hoverStartTimeout);
    state.hoverStartTimeout = null;
  }

  if (state.isActiveHovered) {
    state.isActiveHovered = false;
    var _onHoverEnd = props.onHoverEnd;
    if (isFunction(_onHoverEnd)) {
      var syntheticEvent = createHoverEvent(event, context, 'hoverend', target);
      context.dispatchEvent(syntheticEvent, _onHoverEnd, UserBlockingEvent);
    }
    dispatchHoverChangeEvent(event, context, props, state);
    state.hoverTarget = null;
    state.ignoreEmulatedMouseEvents = false;
    state.isTouched = false;
  }
}

function unmountResponder(context, props, state) {
  if (state.isHovered) {
    dispatchHoverEndEvents(null, context, props, state);
  }
}

function isEmulatedMouseEvent(event, state) {
  var type = event.type;

  return state.ignoreEmulatedMouseEvents && (type === 'mousemove' || type === 'mouseover' || type === 'mouseout');
}

var hoverResponderImpl = {
  targetEventTypes: targetEventTypes,
  getInitialState: function () {
    return {
      isActiveHovered: false,
      isHovered: false,
      isTouched: false,
      hoverStartTimeout: null,
      hoverEndTimeout: null,
      ignoreEmulatedMouseEvents: false
    };
  },

  allowMultipleHostChildren: false,
  allowEventHooks: true,
  onEvent: function (event, context, props, state) {
    var pointerType = event.pointerType,
        type = event.type;


    if (props.disabled) {
      if (state.isHovered) {
        dispatchHoverEndEvents(event, context, props, state);
        state.ignoreEmulatedMouseEvents = false;
      }
      if (state.isTouched) {
        state.isTouched = false;
      }
      return;
    }

    switch (type) {
      // START
      case 'pointerover':
      case 'mouseover':
      case 'touchstart':
        {
          if (!state.isHovered) {
            // Prevent hover events for touch
            if (state.isTouched || pointerType === 'touch') {
              state.isTouched = true;
              return;
            }

            // Prevent hover events for emulated events
            if (isEmulatedMouseEvent(event, state)) {
              return;
            }
            state.hoverTarget = event.responderTarget;
            state.ignoreEmulatedMouseEvents = true;
            dispatchHoverStartEvents(event, context, props, state);
          }
          return;
        }

      // MOVE
      case 'pointermove':
      case 'mousemove':
        {
          if (state.isHovered && !isEmulatedMouseEvent(event, state)) {
            var _onHoverMove = props.onHoverMove;
            if (state.hoverTarget !== null && isFunction(_onHoverMove)) {
              var syntheticEvent = createHoverEvent(event, context, 'hovermove', state.hoverTarget);
              context.dispatchEvent(syntheticEvent, _onHoverMove, UserBlockingEvent);
            }
          }
          return;
        }

      // END
      case 'pointerout':
      case 'pointercancel':
      case 'mouseout':
      case 'touchcancel':
      case 'touchend':
        {
          if (state.isHovered) {
            dispatchHoverEndEvents(event, context, props, state);
            state.ignoreEmulatedMouseEvents = false;
          }
          if (state.isTouched) {
            state.isTouched = false;
          }
          return;
        }
    }
  },
  onUnmount: function (context, props, state) {
    unmountResponder(context, props, state);
  },
  onOwnershipChange: function (context, props, state) {
    unmountResponder(context, props, state);
  }
};

var HoverResponder = React.unstable_createResponder('Hover', hoverResponderImpl);

function useHoverResponder(props) {
  return React.unstable_useResponder(HoverResponder, props);
}

var Hover = Object.freeze({
	HoverResponder: HoverResponder,
	useHoverResponder: useHoverResponder
});

var hover = Hover;

return hover;

})));
