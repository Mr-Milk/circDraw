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
                    $(this).val($(this).val().substr(0, num));
                }
            });
        }
    });

    var species2assembly = {
        'Human (hg19)': 'hg19',
        'Human (hg38)': 'hg38',
        'Mouse (mm10)': 'mm10',
        'Rat (rn6)': 'rn6',
        'Yeast (sacCer3)': 'sacCer3',
        'Zebra Fish (danRer11)': 'danRer11'
    };

    $('#example').click(function () {
        $('#uploadlabel').hide();
        $('.textarea').html(example_content);
        $('#submit').prop('disabled', true);
        finishProcess('a91ead50cb480b1aa4d8329c74aa0e84');
    });

    function finishProcess(md5, display_time) {
        $('#timer').remove();
        $('#processtip').append('<p>Processing Completed (Used ' + display_time + ')! Please remember your result URL (Accessible for next 24h) ' + '<div class="input-group input-group-sm col-5 pl-1" id="reportURL">' +
            '<input type="text" class="form-control" value="https://www.circdraw.com/tools/display/' + md5 + '" id="copy-input">' +
            '<div class="input-group-append">' +
            '<button class="btn btn-primary btn-sm" id="copy-button" data-toggle="tooltip" data-placement="bottom" title="Copied!">' +
            '<i class="far fa-copy"></i>' +
            '</button></div>' +
            '<div class="input-group-append"><a class="btn btn-primary btn-sm" style="border-left: 2px solid" href="display/' + md5 + '">View Result</a></div></div>');
        $('#copy-button').tooltip('hide');
        $('#copy-button').bind('click', function () {
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
    }

    //console.log("running");
    $('#myfile').change(function () {
        $("#processtip").text('');
        var a = $('#myfile').val().toString().split('\\'),
            fileSize = document.getElementById('myfile').files[0].size,
            fileSize_num = Math.round(100*fileSize/1024)/100 == 0 ? 0.01: Math.round(100*fileSize/1024)/100;
            displaySize = fileSize_num >= 1024 ? Math.round(100*fileSize_num/1024)/100 + 'MB ' : fileSize_num+'KB ';
        //console.log(a);
        $('#filename').text(displaySize + a[a.length - 1]);
        if ($('#myfile').val() !== "") {
            $('#cancel').show().click(function () {
                $('#filename').text('');
                $('#cancel').hide();
                $('#processtip').children('p').remove();
                $('#myfile').val('');
                //console.log('Hello', $('#myfile').val());
                $('#submit').removeAttr('disabled');
            });
        }
        //console.log("File size: ", document.getElementById('myfile').files[0].size);
        if (fileSize >= 30 * 1024 * 1024) {
            $('#submit').prop('disabled', true);
            $('#processtip').append('<p>File size are limited to 30MB. Try following steps to reduce file size: </p>').css("color", "#000");
            $('#processtip').append('<p> 1. Filter your Data</p>' + '<p> 2. Remove useless info</p>' + '<p> 3. Contact us for help</p>').css("color", "#000");
        }
    });

    $('.textarea').bind('input propertychange', function () {
        if ($('.textarea').text() !== "") {
            $('#uploadlabel').hide();
        } else {
            $('#uploadlabel').show();
        }
    });

    $('#denvalue').numOnly(2);

    $('#denvalue').change(function () {
        if (parseInt($('#denvalue').val()) > 100) {
            $('#denvalue').val('100');
        }
        if (parseInt($('#denvalue').val()) == 0) {
            $('#denvalue').val('1');
        }
    });

    $('#submit').click(function (e) {
        e.preventDefault();
        //e.stopPropagation();
        if ($('#myfile').val() === "" && $('.textarea').text() === "") {
            $('#processtip').text('Please choose a file to upload.').css("color", "#CB4042");
        } else {
            var formdata = new FormData(),
                species_val = $("#species").val(),
                parameters = {
                    "filetype": $("#software").val(),
                    "species": species2assembly[species_val],
                };
            
                //console.log(parameters);

            if ($('.textarea').text() === "") {
                formdata.append('file', document.getElementById('myfile').files[0]);
                formdata.append('parameters', JSON.stringify(parameters));
                //console.log(JSON.stringify(parameters));
                //console.log(parameters);
                var ajaxParameters = {
                    url: '/tools/upload/',
                    type: 'POST',
                    cache: false,
                    dataType: "json",
                    data: formdata,
                    processData: false,
                    contentType: false
                };

            } else {
                var inputText = JSON.stringify({
                    'text': document.querySelector('.textarea').innerText
                });
                formdata.append('text', inputText);
                formdata.append('parameters', JSON.stringify(parameters));
                var ajaxParameters = {
                    url: '/tools/upload/',
                    type: 'POST',
                    cache: false,
                    dataType: "json",
                    data: formdata,
                    processData: false,
                    contentType: false,
                    timeout: 4*60*1000
                };
            }

            $('#submit').text('✓ Submitted').prop('disabled', true);
            $('#cancel').hide();
            $('#processtip').after('<div class="lds-roller d-inline-block"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div><p class="d-inine-block" id="upload-text">Processing...</p>');
            var sec = 0;
            var timer = setInterval(function(){
                if (sec < 60) {
                    $('#upload-text').text('Processing... '+ sec +' s');
                    sec++;
                }
                if (sec >= 60) {
                    var display_min = Math.floor(sec/60),
                        display_sec = sec % 60;
                    $('#upload-text').text('Processing... '+ display_min + 'm'+ display_sec +'s');
                    sec++;
                }
            }, 1000);

            $.ajax(ajaxParameters)
                .done(
                    function (reportID) {
                        var md5 = reportID[0].md5,
                            status = reportID[0].save_status;
                        //console.log(reportID, status);
                        if (status === false) {
                            $('#processtip').html('<p>Processing Failed! Wrong file type or server failed. Please <a id="refresher" onclick="location.reload()"><i>refresh</i><i class="fas fa-redo-alt ml-1"></i></a></p>');
                            $('#refresher').hover(function(){
                                $('#refresher').css({'cursor':'pointer', 'color': '#fed136'});
                            },
                            function(){
                                $('#refresher').css('color', 'black');
                            });
                        }
                        else if (status == 'Finished') {
                            $('.lds-roller').remove();
                            $('#upload-text').remove();
                            clearInterval(timer);
                            if (sec < 60) {
                                var display_time = sec + 's';
                            }
                            if (sec >= 60) {
                                var display_time = Math.floor(sec/60) + 'm' + sec % 60 + 's';
                            }
                            finishProcess(md5, display_time);
                        }
                        else if (status === true || status === "Running") {
                            get_status = setInterval(function () {
                                $.getJSON("statusfile", {
                                    'caseid': md5
                                }).done(function (processStatus) {
                                    var status = processStatus[0].status;
                                    //console.log(status, processStatus);
                                    if (status == 200) {
                                        $('.lds-roller').remove();
                                        $('#upload-text').remove();
                                        clearInterval(get_status);
                                        clearInterval(timer);
                                        if (sec < 60) {
                                            var display_time = sec + 's';
                                        }
                                        if (sec >= 60) {
                                            var display_time = Math.floor(sec/60) + 'm' + sec % 60 + 's';
                                        }
                                        finishProcess(md5, display_time);
                                    } else if (status == 404) {
                                        $('.lds-roller').remove();
                                        $('#upload-text').remove();
                                        $('#processtip').html('<p>Server Error! Please <a id="refresher" onclick="location.reload()"><i>refresh</i><i class="fas fa-redo-alt ml-1"></i></a></p>');
                                        $('#refresher').hover(function(){
                                            $('#refresher').css({'cursor':'pointer', 'color': '#fed136'});
                                        },
                                        function(){
                                            $('#refresher').css('color', 'black');
                                        });
                                        clearInterval(get_status);
                                        clearInterval(timer);
                                    }
                                });
                            }, 1000);
                        }
                    }).fail(
                    function () {
                        $('.lds-roller').remove();
                        $('#upload-text').remove();
                        $('#processtip').html('<p>Failed to upload, please check your connection and <a id="refresher" onclick="location.reload()"><i>refresh</i><i class="fas fa-redo-alt ml-1"></i></a></p>');
                        $('#refresher').hover(function(){
                            $('#refresher').css({'cursor':'pointer', 'color': '#fed136'});
                        },
                        function(){
                            $('#refresher').css('color', 'black');
                        });
                        $('#submit').text('Submit');
                    }
                );
        }
    })});