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

// function savedata() {
//     $("#savefile").ajaxSubmit(function(message){

//         function(caseid){
//                 var filename = $('#fileupload').prop("files")['name'];
//                 $('#uploadname').text(filename);
//                 var caseID = new STRING(caseid[caseid])
//                 var myURL = document.URL + "?id=" + caseID;
//                 window.history.pushState(null, "", myURL)
//             }

//     })
// }






$(document).ready(function(){
    $('#fileform').on('submit', function(event){
        console.log('hello');
        var formdata = new FormData(document.getElementById('fileupload').files[0]);
        //formdata.append('myfile', document.getElementById('fileupload').files[0]);
        console.log(formdata)
        $.ajax({
            xhr: function(e){
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
                console.log('sucess')
                var filename = $('#fileform').prop("files")['name'];
                $('#uploadname').text(filename);
                var caseID = new STRING(caseid[caseid])
                var myURL = document.URL
                window.location.href = myURL + "?id=" + caseID;
            },
        });
        console.log('done');
        event.preventDefault();
    });
});