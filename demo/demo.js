(function(React, FormatNumber, $) {
    'use strict';


    var options = {
        decimal: Number($('input[name="decimal"]:checked').val()),
        previousValue: undefined
    };

    var valueChange = function(value) {
        $('#value').val(value);
        options.previousValue = value;
    };

    var component = React.render(<FormatNumber decimal={options.decimal} onChange={valueChange} value={options.previousValue}/>, $('#react-number')[0]);

    $('#react-number input').on('focus', function() {
        $(this).parent().siblings().addClass('active');
    });
    $('#react-number input').on('blur', function() {
        $(this).parent().siblings().each(function() {
            if ($('#react-number input').val() && $(this)[0].tagName.toUpperCase() === 'LABEL') {
                return;
            }
            $(this).removeClass('active');
        });
    });

    $('input[name="decimal"]').on('change', function() {
        console.log($(this).val());
        options.decimal = Number($(this).val());
        component.setProps({
            decimal: options.decimal,
            value: options.previousValue
        });
    });

}(React, window.FormatNumber, jQuery));
