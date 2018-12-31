var $range = $("#view-selector"),
    $region = $("#region-selector")
    $inputFrom = $(".js-input-from"),
    $inputTo = $(".js-input-to"),
    min = 0,
    max = 248956422,
    from = 0,
    to = 0,
    chrmin = 0,
    chrmax = 248956422,
    start = 0,
    end = 0;

$region.ionRangeSlider({
    skin:"flat",
    type: "double",
    min: chrmin,
    max: chrmax,
    from: chrmax/2,
    to: 10000000+chrmax/2,
    grid: true,
    decorate_both: true,
    values_separator: " to ",
    drag_interval: true,
    min_interval: 1000000,
    onFinish: updateRange
})

$range.ionRangeSlider({
	skin: "flat",
    type: "double",
    min: min,
    max: max,
    from: min+9*(max-min)/20,
    to: min+11*(max-min)/20,
    grid: true,
    decorate_both: true,
    values_separator: " to ",
    drag_interval: true,
    onStart: updateInputs,
    onChange: updateInputs
});
var instance1 = $range.data("ionRangeSlider");
var instance2 = $region.data("ionRangeSlider");

function updateRange (data) {
	min = data.from;
    max = data.to;
    
    instance1.update({
        min: min,
        max: max,
        from: min+9*(max-min)/20,
        to: min+11*(max-min)/20,
    })
}

function updateInputs (data) {
	from = data.from;
    to = data.to;
    
    $inputFrom.prop("value", from);
    $inputTo.prop("value", to);	
}

$('#go').click(function(){
    var val1 = $inputFrom.prop("value")
    var val2 = $inputTo.prop("value")

    if (val1 < from) {
        val1 = from;
    } else if (val1 > to) {
        val1 = to;
    }

    if (val2 < from) {
        val2 = from;
    } else if (val2 > to) {
        val2 = to;
    }

    instance1.update({
        from: val1,
        to: val2
    });

    $inputFrom.prop("value", val1);
    $inputTo.prop("value", val2);

    start = val1
    end = val2
    console.log("start_input: ", start)
    console.log("end_input: ", end)
})

/*
$inputFrom.on("input", function () {
    var val = $(this).prop("value");
    
    // validate
    if (val < min) {
        val = min;
    } else if (val > to) {
        val = to;
    }
    
    instance1.update({
        start: val
    });
});

$inputTo.on("input", function () {
    var val = $(this).prop("value");
    
    // validate
    if (val < from) {
        val = from;
    } else if (val > max) {
        val = max;
    }
    
    instance1.update({
        to: val
    });
});*/