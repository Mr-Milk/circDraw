$(document).ready(function () {
    $.fn.extend({
        numOnly: function (num) {
            $(this).on("keydown", function (e) {
                var arr = [8, 16, 17, 20, 35, 36, 37, 38, 39, 40, 45, 46];
                // Allow number
                for (var t = 48; t <= 57; t++) {
                    arr.push(t);
                }

                if (jQuery.inArray(event.which, arr) === -1) {
                    event.preventDefault();
                }
                if ($(this).val().length > num) {
                    $(this).val($(this).val().substr(0, num))
                }
            })
        }
    })

    console.log("running")
    $('#myfile').change(function () {
        $("#processtip").text('')
        var a = $('#myfile').val().toString().split('\\');
        console.log(a)
        $('#filename').text(a[a.length - 1])
        $('#cancel').show().click(function () {
            $('#filename').text('');
            $('#cancel').hide()
        });
    });

    $('.textarea').bind('input propertychange', function () {
        if ($('.textarea').text() !== "") {
            $('#uploadlabel').hide()
        } else {
            $('#uploadlabel').show()
        }
    })

    $('#denvalue').numOnly(2)

    $('#denvalue').change(function () {
        if (parseInt($('#denvalue').val()) > 100) {
            $('#denvalue').val('100')
        }
        if (parseInt($('#denvalue').val()) == 0) {
            $('#denvalue').val('1')
        }
    })


    $('#submit').click(function (e) {
        e.preventDefault();
        //e.stopPropagation();
        var formdata = new FormData(),
            parameters = {
                "FileType": $("#software").val(),
                "Species": $("#species").val(),
                "expvalue": $("#expvalue").val(),
                "denvalue": $("#denvalue").val()
            }

        if ($('.textarea').text() === "") {
            formdata.append('file', document.getElementById('myfile').files[0])
            formdata.append('parameters', JSON.stringify(parameters))
            console.log(JSON.stringify(parameters))

            var ajaxParameters = {
                url: '/tools/upload/',
                type: 'POST',
                cache: false,
                dataType: "json",
                data: formdata,
                processData: false,
                contentType: false
            }
        } else {
            formdata.append('text', $('.textarea').text())
            formdata.append('parameters', JSON.stringify(parameters))
            var ajaxParameters = {
                url: 'text-url',
                type: 'POST',
                cache: false,
                dataType: "json",
                data: formdata,
                processData: false,
                contentType: false
            }

        }

        $.ajax(ajaxParameters)
            .done(
                function (reportID) {
                    $('#submit').text('✓ Submitted').prop('disabled', true);
                    var reportID = reportID[0]
                    $('#resultbutton').show()
                    var sec = 0;
                    intervalID_1 = setInterval(
                        function () {
                            $('#processtip').text('Processing time: ' + sec + 's')
                            sec++;
                        }, 1000);

                    $.getJSON("statusfile").done(function (processState) {
                        if (processState == true) {
                            clearInterval(intervalID_1)
                            $('#processtip').text('Processing Completed! Your report ID is ' + '<b><i>' + reportID + '</i></b>')
                            $('#resultbutton').removeAttr("disabled").attr("href", "www.circdraw.com/tools/" + reportID)
                        }

                        if (processState == false) {
                            clearInterval(intervalID_1)
                            $('#processtip').text('Processing Failed!')
                        }
                    })
                }).fail(
                function () {
                    if ($('#myfile').val() === "") {
                        $('#processtip').text('Please choose a file to upload.').css("color", "#CB4042")
                    } else {
                        $('#processtip').text('Failed to upload, please check your connection and refreash.').css("color", "#CB4042")
                    }
                }
            )

    })
})