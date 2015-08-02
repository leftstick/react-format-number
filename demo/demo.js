(function(React, FormatNumber) {
    'use strict';

    var valueChange = function(value) {
        document.querySelector('#value').innerHTML = value;
    };

    React.render(<FormatNumber decimal={2} onChange={valueChange.bind(this)} />, document.querySelector('#number'));

}(React, window.FormatNumber));
