var $range = $("#view-selector"),
    $region = $("#region-selector")
    $inputFrom = $(".js-input-from"),
    $inputTo = $(".js-input-to"),
    min = 0,
    max = 248956422,
    from = 0,
    to = 0,
    chrmin = 0,
    chrmax = 248956422;

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
});