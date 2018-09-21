// //File upload
// $(document).ready(function(){
//     $('form').on('submit', function(event){
//         event.preventDefault();
//         var formdata = new FormData($('form')[0])
//         $.ajax({
//             xhr: function(){
//                 var xhr = new window.XMLHttpRequest();
//                 xhr.upload.addEventLister('process', function(e){
//                     if (e.lengthComputable) {
//                         var percent = Math.round((e.loaded / e.total) * 100)
//                         $('#bar').attr('aria-valuenow', percent).css('width', percent + '%').text(percent + '%')
//                     };
//                 });

//                 return xhr;
//             },
//             type: 'POST',
//             url: 'upload_url',
//             data: formdata,
//             processData: false,
//             contentType: false,
//             success: function(caseid){
//                 var filename = $('#fileupload').prop("files")['name'];
//                 $('#uploadname').text(filename);
//                 var caseID = new STRING(caseid[caseid])
//                 var myURL = document.URL
//                 window.location.href = myURL + "?id=" + caseID
//             },
//         });
//     });
// });


//File upload
$(document).ready(function(){
    $('form').on('submit', function(event){
        event.preventDefault();
        var formdata = new FormData($('form')[0])
        $.ajax({
            xhr: function(){
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventLister('process', function(e){
                    if (e.lengthComputable) {
                        var percent = Math.round((e.loaded / e.total) * 100)
                        $('#bar').attr('aria-valuenow', percent).css('width', percent + '%').text(percent + '%')
                    };
                });

                return xhr;
            },
            type: 'POST',
            url: '/tools/save/',
            data: formdata,
            processData: false,
            contentType: false,
            success: function(caseid){
                var filename = $('#fileupload').prop("files")['name'];
                $('#uploadname').text(filename);
                var caseID = new STRING(caseid[caseid])
                var myURL = document.URL
                window.location.href = myURL + "?id=" + caseID
            },
        });
    });
});