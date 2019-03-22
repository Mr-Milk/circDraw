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

        $('#submit').text('✓ Submitted').prop('disabled', true);
        $('#cancel').hide()
        $('#processtip').after('<div class="lds-roller d-inline-block"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div><p class="d-inine-block" id="upload-text">Uploading...</p>')

        $.ajax(ajaxParameters)
            .done(
                function (reportID) {
                    var md5 = reportID[0].md5,
                        systime = reportID[0].time.toString(),
                        status = reportID[0].save_status
                        console.log(reportID, status)
                        $('.lds-roller').remove()
                        $('#upload-text').hide()
                    if (status === false) {
                        $('#processtip').text('Processing Failed! Wrong file type or server failed.')
                    }
                    else if (status === true || status === undefined) {
                        $.getJSON("/tools/run", {'md5':md5})
                        var now = new Date()
                        uploadUsed = now.getTime().toString().substr(0,10) - systime.substr(0,10)
                        interval_1 = setInterval(
                        function () {
                            var d = new Date()
                            console.log(d.getTime(), systime)
                            processTime = d.getTime().toString().substr(0,10) - systime.substr(0,10) - uploadUsed
                            $('#processtip').html('<p id="timer">Uploading used: ' + uploadUsed + 's, now processing: ' + processTime + 's.</p>')
                        }, 1000);
                        if (status === undefined) {
                            clearInterval(interval_1)
                        }

                        interval_2 = setInterval(function(){
                            $.getJSON("statusfile", {'caseid':md5}).done(function (processStatus) {
    
                                var status = processStatus[0].status
                                console.log(status, processStatus)
                                if (status == 200) {
                                    clearInterval(interval_1)
                                    $('#timer').remove()
                                    $('#processtip').append('<p>Processing Completed! Please remember your result URL (Accessible for next 24h) ' +   '<div class="input-group input-group-sm col-5 pl-1" id="reportURL">'+
                                    '<input type="text" class="form-control" value="http://www.circdraw.com/tools/display/' + md5 + '" id="copy-input">' +
                                    '<div class="input-group-append">' +
                                      '<button class="btn btn-primary btn-sm" id="copy-button" data-toggle="tooltip" data-placement="bottom" title="Copied!">' +
                                        '<i class="far fa-copy"></i>' +
                                      '</button></div>'+
                                      '<div class="input-group-append"><button class="btn btn-primary btn-sm" style="border-left: 2px solid" href="www.circdraw.com/tools/display/'+ md5 + '">View Result</button></div></div>')
                                      $('#copy-button').tooltip('hide')
                                      $('#copy-button').bind('click', function() {
                                        var input = document.querySelector('#copy-input');
                                        input.select();
                                        try {
                                          var success = document.execCommand('copy');
                                          if (success) {
                                            $('#copy-button').tooltip('enable');
                                            $('#copy-button').tooltip('show');
                                            $('#copy-button').tooltip('disable');
                                    
                                          } else {
                                            $('#copy-button').tooltip('enable');
                                            $('#copy-button').attr('title', 'Failed to copy!');
                                            $('#copy-button').tooltip('show');
                                            $('#copy-button').tooltip('disable');
                                          }
                                        } catch (err) {
                                          $('#copy-button').tooltip('enable');
                                          $('#copy-button').attr('title', 'Failed to copy!');
                                          $('#copy-button').tooltip('show');
                                          $('#copy-button').tooltip('disable');
                                        }
                                      });                                    
                                    clearInterval(interval_2)
                                }
    
                                else if (status == 404) {
                                    clearInterval(interval_1)
                                    $('#timer').remove()
                                    $('#processtip').text('Server Error!')
                                    clearInterval(interval_2)
                                }
    
                                else if (status == 101) {
                                }
                            })
                        },2500)
                    }
                }).fail(
                function () {
                        $('.lds-roller').remove()
                        $('#upload-text').hide()
                        $('#processtip').text('Failed to upload, please check your connection and refreash.').css("color", "#CB4042")
                        $('#submit').text('Submit')
                }
            )
            }
    })
})
