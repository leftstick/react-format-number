(function(React, FormatNumber, $) {
    'use strict';

    $('#react-number').on('focus', 'input', function() {
        $(this).parent().siblings().addClass('active');
    });

    $('#react-number').on('blur', 'input', function() {
        $(this).parent().siblings().each(function() {
            if ($('#react-number input').val() && $(this)[0].tagName.toUpperCase() === 'LABEL') {
                return;
            }
            $(this).removeClass('active');
        });
    });

    var options = {
        decimal: Number($('input[name="decimal"]:checked').val()),
        previousValue: undefined
    };

    var valueChange = function(value) {
        $('#value').val(value);
        options.previousValue = value;
    };

    var component = React.render(React.createElement(FormatNumber, {
        fractionSize: options.decimal,
        onChange: valueChange,
        value: options.previousValue
    }), $('#react-number')[0]);

    $('input[name="decimal"]').on('change', function() {
        options.decimal = Number($(this).val());
        component.setProps({
            fractionSize: options.decimal,
            value: options.previousValue
        });
    });

}(React, window.FormatNumber, jQuery));
