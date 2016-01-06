/**
 *
 *  @author Howard.Zuo
 *  @date   Jan 6, 2016
 *
 **/

(function(global, factory) {
    'use strict';
    if (typeof exports === 'object') {
        module.exports = factory(require('react'));
    } else if (typeof define === 'function' && define.amd) {
        define(['react'], factory);
    } else {
        global.FormatNumber = factory(global.React);
    }

}(window, function(React) {
    'use strict';

    var isObject = function(value) {
        var type = typeof value;
        return !!value && (type == 'object' || type == 'function');
    };

    var isUndefined = function(value) {
        return typeof value === 'undefined';
    };

    var toFixed = function(number, fractionSize) {
        var patt = new RegExp('\\d+(?:\\.\\d{0,' + fractionSize + '})?');
        if (fractionSize === 0) {
            patt = new RegExp('\\d+');
        }
        return Number(number.toString().match(patt));
    };

    var NUMBER_FORMATS = {
        DECIMAL_SEP: '.',
        GROUP_SEP: ',',
        PATTERN: { // Decimal Pattern
            minInt: 1,
            minFrac: 0,
            maxFrac: 3,
            posPre: '',
            posSuf: '',
            negPre: '-',
            negSuf: '',
            gSize: 3,
            lgSize: 3
        }
    };

    //copied from AngularJS
    var format = function(number, fractionSize) {
        if (isObject(number)) {
            return '';
        }

        var isNegative = number < 0;
        number = Math.abs(number);

        var isInfinity = number === Infinity;
        if (!isInfinity && !isFinite(number)) {
            return '';
        }

        var numStr = number + '';
        var formatedText = '';
        var hasExponent = false;
        var parts = [];

        if (isInfinity) {
            formatedText = '\u221e';
        }

        if (!isInfinity && numStr.indexOf('e') !== -1) {
            var match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
            if (match && match[2] == '-' && match[3] > fractionSize + 1) {
                number = 0;
            } else {
                formatedText = numStr;
                hasExponent = true;
            }
        }

        if (!isInfinity && !hasExponent) {
            var fractionLen = (numStr.split(NUMBER_FORMATS.DECIMAL_SEP)[1] || '').length;

            // determine fractionSize if it is not specified
            if (isUndefined(fractionSize)) {
                fractionSize = Math.min(Math.max(NUMBER_FORMATS.PATTERN.minFrac, fractionLen), NUMBER_FORMATS.PATTERN.maxFrac);
            }

            // safely round numbers in JS without hitting imprecisions of floating-point arithmetics
            // inspired by:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
            number = +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);

            var fraction = ('' + number).split(NUMBER_FORMATS.DECIMAL_SEP);
            var whole = fraction[0];
            fraction = fraction[1] || '';

            var i;
            var pos = 0;
            var lgroup = NUMBER_FORMATS.PATTERN.lgSize;
            var group = NUMBER_FORMATS.PATTERN.gSize;

            if (whole.length >= (lgroup + group)) {
                pos = whole.length - lgroup;
                for (i = 0; i < pos; i++) {
                    if ((pos - i) % group === 0 && i !== 0) {
                        formatedText += NUMBER_FORMATS.GROUP_SEP;
                    }
                    formatedText += whole.charAt(i);
                }
            }

            for (i = pos; i < whole.length; i++) {
                if ((whole.length - i) % lgroup === 0 && i !== 0) {
                    formatedText += NUMBER_FORMATS.GROUP_SEP;
                }
                formatedText += whole.charAt(i);
            }

            // format fraction part.
            while (fraction.length < fractionSize) {
                fraction += '0';
            }

            if (fractionSize && fractionSize !== '0') {
                formatedText += NUMBER_FORMATS.DECIMAL_SEP + fraction.substr(0, fractionSize);
            }
        } else {
            if (fractionSize > 0 && number < 1) {
                formatedText = number.toFixed(fractionSize);
                number = parseFloat(formatedText);
            }
        }

        if (number === 0) {
            isNegative = false;
        }

        parts.push(isNegative ? NUMBER_FORMATS.PATTERN.negPre : NUMBER_FORMATS.PATTERN.posPre,
            formatedText,
            isNegative ? NUMBER_FORMATS.PATTERN.negSuf : NUMBER_FORMATS.PATTERN.posSuf);
        return parts.join('');
    };

    var unFormat = function(str) {
        if (!str) {
            return '';
        }
        return str.replace(/,/g, '');
    };

    var debounce = function(func, wait, options) {
        var args;
        var maxTimeoutId;
        var result;
        var stamp;
        var thisArg;
        var timeoutId;
        var trailingCall;
        var lastCalled = 0;
        var leading = false;
        var maxWait = false;
        var trailing = true;

        if (typeof func != 'function') {
            throw new TypeError('Expected a function');
        }
        wait = wait < 0 ? 0 : (+wait || 0);
        if (isObject(options)) {
            leading = !!options.leading;
            maxWait = 'maxWait' in options && Math.max(+options.maxWait || 0, wait);
            trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        function cancel() {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (maxTimeoutId) {
                clearTimeout(maxTimeoutId);
            }
            lastCalled = 0;
            maxTimeoutId = timeoutId = trailingCall = undefined;
        }

        function complete(isCalled, id) {
            if (id) {
                clearTimeout(id);
            }
            maxTimeoutId = timeoutId = trailingCall = undefined;
            if (isCalled) {
                lastCalled = Date.now();
                result = func.apply(thisArg, args);
                if (!timeoutId && !maxTimeoutId) {
                    args = thisArg = undefined;
                }
            }
        }

        function delayed() {
            var remaining = wait - (Date.now() - stamp);
            if (remaining <= 0 || remaining > wait) {
                complete(trailingCall, maxTimeoutId);
            } else {
                timeoutId = setTimeout(delayed, remaining);
            }
        }

        function maxDelayed() {
            complete(trailing, timeoutId);
        }

        function debounced() {
            args = arguments;
            stamp = Date.now();
            thisArg = this;
            trailingCall = trailing && (timeoutId || !leading);

            if (maxWait === false) {
                var leadingCall = leading && !timeoutId;
            } else {
                if (!maxTimeoutId && !leading) {
                    lastCalled = stamp;
                }
                var remaining = maxWait - (stamp - lastCalled);
                var isCalled = remaining <= 0 || remaining > maxWait;

                if (isCalled) {
                    if (maxTimeoutId) {
                        maxTimeoutId = clearTimeout(maxTimeoutId);
                    }
                    lastCalled = stamp;
                    result = func.apply(thisArg, args);
                } else if (!maxTimeoutId) {
                    maxTimeoutId = setTimeout(maxDelayed, remaining);
                }
            }
            if (isCalled && timeoutId) {
                timeoutId = clearTimeout(timeoutId);
            } else if (!timeoutId && wait !== maxWait) {
                timeoutId = setTimeout(delayed, wait);
            }
            if (leadingCall) {
                isCalled = true;
                result = func.apply(thisArg, args);
            }
            if (isCalled && !timeoutId && !maxTimeoutId) {
                args = thisArg = undefined;
            }
            return result;
        }
        debounced.cancel = cancel;
        return debounced;
    };

    var getCaretPosition = function(oField) {
        // Initialize
        var iCaretPos = 0;
        // IE Support
        if (document.selection) {
            // Set focus on the element
            oField.focus();
            // To get cursor position, get empty selection range
            var oSel = document.selection.createRange();
            // Move selection start to 0 position
            oSel.moveStart('character', -oField.value.length);
            // The caret position is selection length
            iCaretPos = oSel.text.length;
        } else if (oField.selectionStart || oField.selectionStart === 0) {
            iCaretPos = oField.selectionStart;
        }
        // Return results
        return (iCaretPos);
    };

    var setCaretPosition = function(oField, caretPos) {
        if (oField.createTextRange) {
            var range = oField.createTextRange();
            range.move('character', caretPos);
            range.select();
        } else if (oField.selectionStart) {
            oField.focus();
            oField.setSelectionRange(caretPos, caretPos);
        } else {
            oField.focus();
        }
    };

    class FormatNumber extends React.Component {

        constructor(props) {
            super(props);

            this.onChange = this.onChange.bind(this);
            this.handleInput = this.handleInput.bind(this);
            this.bounceChange = debounce(() => this.handleInput(this.props), 500);
        }

        componentDidMount() {
            this.refs.userinput.value = this.props.value;
            this.handleInput(this.props);
        }

        componentWillReceiveProps(nextProps) {
            this.refs.userinput.value = nextProps.value;
            this.handleInput(nextProps);
        }

        handleInput(props) {
            var field = React.findDOMNode(this.refs.userinput);
            var srcTxt = this.refs.userinput.value;
            var unformatted = unFormat(srcTxt);
            var src = Number(unformatted);

            if (isNaN(src)) {
                props.onChange(NaN);
                return;
            }
            if (props.fractionSize >= 0) {
                src = toFixed(src, props.fractionSize);
            }
            var formated = format(src, props.fractionSize);
            var lastPos = getCaretPosition(field);
            var newPos = formated.length - (srcTxt.length - lastPos);
            props.onChange(src);
            field.value = formated;
            setCaretPosition(field, newPos);
        }

        onChange(e) {
            this.bounceChange();
        }

        render() {
            return (
                <input type='text'
                  ref='userinput'
                  style={ this.props.style }
                  onChange={ this.onChange } />
                );
        }

    }

    FormatNumber.propTypes = {
        fractionSize: React.PropTypes.number,
        onChange: React.PropTypes.func,
        value: React.PropTypes.number
    };

    FormatNumber.defaultProps = {
        fractionSize: 0,
        onChange: function() {},
        value: 0
    };

    return FormatNumber;
}));
