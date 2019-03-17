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
        if ($('#myfile').val() !== ""){
        $('#cancel').show().click(function () {
            $('#filename').text('');
            $('#cancel').hide()
            $('#processtip').children('p').remove()
            $('#myfile').value = ""
            $('#submit').removeAttr('disabled')
        });}
        console.log("File size: ", document.getElementById('myfile').files[0].size)
        if (document.getElementById('myfile').files[0].size >= 30 * 1024 * 1024 ) {
            $('#submit').prop('disabled', true)
            $('#processtip').append('<p>File size are limited to 50MB. Try following steps to reduce file size: </p>').css("color", "#000")
            $('#processtip').append('<p> 1. Filter your Data</p>' + '<p> 2. Remove useless info</p>' + '<p> 3. Contact us for help</p>').css("color", "#000")
        }
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
        if ($('#myfile').val() === "" && $('.textarea').text() === "") {
            $('#processtip').text('Please choose a file to upload.').css("color", "#CB4042")
        }
        else {
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
            var inputText = JSON.stringify({'text': $('.textarea').text()})
            formdata.append('text', inputText)
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

        $('#submit').text('Uploading...')

        $.ajax(ajaxParameters)
            .done(
                function (reportID) {
                    $('#submit').text('✓ Submitted').prop('disabled', true);
                    var md5 = reportID[0].md5,
                        systime = reportID[0].time.toString()
                    $('#processtip').html('Your process ID is ' + '<b><i>' + md5 + '</i></b>')
                    $('#resultbutton').show()

                    $.getJSON("statusfile", {'caseid':md5}).done(function (processStatus) {
                        var status = processStatus[0].save_status
                        if (status === 404) {
                            $.getJSON("run/", {'md5': md5})
                        }
                    })

                    var sec;
                    interval_1 = setInterval(
                        function () {
                            var d = new Date()
                            console.log(d.getTime(), systime)
                            sec = d.getTime().toString().substr(0,10) - systime.substr(0,10)
                            $('#processtip').text('Processing time: ' + sec + 's')
                        }, 1000);

                    interval_2 = setInterval(function(){
                        $.getJSON("statusfile", {'caseid':md5}).done(function (processStatus) {

                            var status = processStatus[0].save_status
                            if (status == 200) {
                                clearInterval(interval_1)
                                $('#processtip').text('Processing Completed! Please remember your result URL (Accessible for next 24h)' + '<b><i>' + 'www.circdraw.com/tools/display/' + md5 + '</i></b>' + '\n')
                                $('#resultbutton').removeAttr("disabled").attr("href", "www.circdraw.com/tools/display/" + md5)
                                clearInterval(interval_2)
                            }

                            else if (status == 404) {
                                clearInterval(interval_1)
                                $('#processtip').text('Processing Failed!')
                                clearInterval(interval_2)
                            }

                            else if (status == 101) {
                            }

                            else if (status == 'Format404') {
                                clearInterval(interval_1)
                                $('#processtip').text('Upload file format is different from your claim')
                            }
                        })
                    },2500)
                }).fail(
                function () {
                        $('#processtip').text('Failed to upload, please check your connection and refreash.').css("color", "#CB4042")
                }
            )
            }
    })
})
