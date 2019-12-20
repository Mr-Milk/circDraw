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
        document.querySelector('.textarea').innerText = example_content;
        $('#submit').prop('disabled', true);
        finishProcess('4672896d383d34c10a4561dddece79aa');
    });

    function finishProcess(md5, display_time) {
        //$('#timer').remove();
        $('#processtip').append('<p>Uploading Completed! Please remember your result URL (Accessible for next 72h) ' + '<div class="input-group input-group-sm col-5 pl-1" id="reportURL">' +
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
            $('#submit').hide();
        } else {
            $('#uploadlabel').show();
            $('#submit').show();
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

    //$("div#drop-select-file").dropzone({ url: "/tools/upload/" });

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
                contentType: false,
                timeout: 5000000000,
            };

             /* else {
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
                };
            } */

            $('#submit').text('✓ Submitted').prop('disabled', true);
            $('#cancel').hide();
            
            $('#processtip').after('<div class="lds-roller d-inline-block"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div><p class="d-inine-block" id="upload-text">Uploading...</p>');
            /*var sec = 0;
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
            }, 1000);*/

            $.ajax(ajaxParameters)
                .done(
                    function (reportID) {
                        var md5 = reportID[0].md5,
                            status = reportID[0].save_status;

                        console.log(reportID, md5, status);
                        if (status === false) {
                            $('.lds-roller').remove();
                            $('#upload-text').remove();
                            $('#processtip').html('<p>Processing Failed! Please <a id="refresher" onclick="location.reload()"><i>refresh</i><i class="fas fa-redo-alt ml-1"></i></a></p>');
                            $('#refresher').hover(function(){
                                $('#refresher').css({'cursor':'pointer', 'color': '#fed136'});
                            },
                            function(){
                                $('#refresher').css('color', 'black');
                            });
                        }
                        else if (status == "Finished" || status === "Running") {
                            $('.lds-roller').remove();
                            $('#upload-text').remove();
                            finishProcess(md5);
                        }
                        else if (status === true) {
                            $('.lds-roller').remove();
                            $('#upload-text').remove();
                            finishProcess(md5);
                            $.getJSON("/tools/run/", {
                                'caseid': md5
                            }).done(function(processResult){
                                if (processResult[0].call_process === true) {
                                    pass
                                } else if (processResult[0].call_process === false) {
                                    $('#processtip').text("<p>" + processResult[0].error + 'Please <a id="refresher" onclick="location.reload()"><i>refresh</i><i class="fas fa-redo-alt ml-1"></i></a></p>');
                                }
                            });
                            
                        }
                        /*else if (status === true || status === "Running") {
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
                        }*/
                    }).fail(
                    function () {
                        $('.lds-roller').remove();
                        $('#upload-text').remove();
                        $('#processtip').html('<p>Server timeout, please <a id="refresher" onclick="location.reload()"><i>refresh</i><i class="fas fa-redo-alt ml-1"></i></a></p>');
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
    })

    var example_content = "chr9\t128246721\t128268696\nchr2\t113258782\t113260758\nchrX\t106331665\t106332069\nchr19\t37185703\t37203769\nchr4\t62758373\t62863983\nchr8\t109462051\t109462721\nchr2\t53941520\t53943880\nchr5\t112874770\t112878200\nchr8\t68015271\t68066371\nchr5\t93978977\t93999613\nchr2\t160585519\t160619504\nchr4\t47746418\t47809064\nchr7\t72877251\t72884813\nchr7\t156619298\t156619438\nchr12\t69214104\t69218431\nchr12\t105504902\t105521067\nchr14\t91409421\t91444868\nchr5\t37201692\t37205556\nchrX\t77227117\t77258733\nchr2\t9083315\t9114564\nchr16\t27544611\t27556844\nchr17\t58332535\t58366043\nchr11\t108163345\t108168109\nchr2\t62227835\t62228117\nchr1\t84981905\t85018807\nchr13\t25825786\t25848325\nchr5\t108103793\t108134090\nchrX\t40518478\t40518859\nchr11\t14793482\t14810788\nchr12\t111064166\t111070364\nchr11\t128963515\t129034322\nchr10\t103558598\t103570071\nchr3\t169840378\t169840532\nchr6\t43527914\t43541338\nchr10\t21120401\t21124552\nchr10\t5827814\t5842668\nchr2\t73784346\t73786269\nchr15\t44624185\t44673174\nchr7\t22999874\t23004150\nchr1\t8674619\t8684439\nchr15\t76161291\t76175765\nchr20\t43132455\t43141635\nchr2\t33487788\t33505225\nchr18\t55355530\t55362764\nchr11\t33368838\t33370833\nchr7\t127447537\t127569382\nchr10\t71964628\t71969441\nchr15\t59963381\t59972507\nchr3\t101374947\t101391057\nchr6\t111665127\t111678328\nchr2\t242194465\t242196221\nchr13\t61109241\t61141784\nchr12\t64811825\t64825603\nchr5\t34823060\t34824596\nchr6\t144835044\t144854396\nchr16\t68358585\t68373871\nchr17\t58342772\t58372162\nchr12\t109654422\t109654725\nchr12\t49065581\t49073616\nchr1\t225226395\t225347187\nchr17\t29490203\t29497015\nchr11\t103151076\t103158334\nchr5\t37122531\t37164429\nchr7\t16737672\t16744294\nchr6\t43193770\t43194133\nchr2\t97024782\t97026448\nchr8\t18490122\t18662408\nchr14\t31827842\t31833504\nchr3\t97611703\t97634580\nchr12\t63989745\t64041145\nchrX\t107819139\t107821613\nchr10\t88649818\t88651986\nchr5\t108281830\t108382899\nchr15\t90763024\t90764997\nchr6\t99328428\t99382755\nchrX\t128631821\t128645960\nchr22\t40749076\t40750331\nchr1\t92798947\t92846430\nchr18\t48444479\t48447557\nchr5\t70888752\t70900295\nchr15\t69502654\t69553668\nchr2\t24357988\t24362320\nchr1\t52211207\t52231653\nchr7\t148708937\t148709452\nchr5\t128977551\t129040084\nchr11\t72578909\t72613683\nchr5\t139819703\t139825560\nchr2\t136467002\t136467801\nchr9\t114840817\t114842445\nchr15\t85657103\t85661070\nchr11\t3784131\t3793158\nchr13\t40268770\t40293964\nchr15\t49325161\t49329966\nchr1\t53267490\t53267811\nchr5\t54763696\t54786942\nchr14\t58965500\t59006854\nchr14\t93760203\t93762503\nchr17\t44127898\t44145033\nchr7\t5778906\t5781446\nchr1\t230798886\t230810870\nchrX\t135318402\t135322645\nchr12\t57064058\t57066849\nchr2\t179538359\t179543224\nchr12\t112743867\t112750951\nchr13\t103468777\t103474509\nchr18\t34261398\t34273386\nchr3\t129177441\t129197061\nchr17\t29093520\t29096983\nchr18\t43496402\t43505868\nchr5\t54993673\t55000262\nchr2\t159992704\t160007067\nchr6\t99347143\t99382755\nchr17\t37579949\t37580991\nchr6\t116966876\t116982009\nchr7\t98988515\t98988876\nchr1\t8525984\t8601377\nchr7\t17908029\t17915413\nchrX\t123156380\t123176495\nchr4\t153332454\t153333681\nchr4\t56376078\t56376232\nchr12\t109660311\t109665294\nchr5\t112162804\t112164669\nchr8\t125332326\t125343033\nchr3\t125271024\t125271523\nchr12\t19501332\t19506936\nchr9\t86395296\t86403593\nchr1\t200558344\t200561368\nchr2\t179527692\t179585929\nchr2\t207406775\t207414884\nchr2\t165378489\t165383645\nchr15\t30922905\t30936905\nchr22\t26219471\t26224935\nchr1\t51005263\t51061888\nchr16\t68155889\t68160513\nchr1\t100340242\t100350259\nchr1\t35846859\t35855699\nchr2\t170728745\t170770656\nchr5\t68414325\t68423959\nchr7\t72159676\t72178756\nchr1\t169767997\t169775229\nchr1\t46511589\t46597628\nchr17\t18210204\t18212255\nchr18\t46904936\t46906128\nchr11\t61133516\t61135470\nchr3\t155551256\t155560408\nchr2\t102459070\t102483771\nchr18\t39618744\t39629569\nchr1\t234582548\t234596142\nchr11\t73829272\t73829427\nchr3\t42661155\t42674315\nchr10\t69407172\t69408574\nchr11\t67942484\t67953395\nchr6\t42646276\t42647570\nchr14\t45701935\t45716580\nchr3\t9514919\t9516266\nchr2\t32142994\t32157204\nchr14\t50130032\t50141145\nchr9\t33351557\t33354890\nchr4\t13578461\t13589395\nchr2\t179534318\t179535897\nchr1\t100335955\t100343384\nchr11\t17112880\t17121516\nchr12\t50821547\t50848200\nchr5\t78692645\t78697878\nchr11\t68282495\t68287119\nchr20\t47688822\t47689234\nchr11\t17167214\t17167489\nchr4\t121702297\t121732604\nchr12\t49398289\t49399635\nchr7\t117825700\t117828459\nchr7\t155499553\t155511137\nchr1\t8555122\t8617582\nchr14\t35078843\t35078948\nchr9\t115567055\t115626679\nchr2\t179534944\t179585929\nchr19\t34921480\t34924317\nchr2\t179527692\t179586861\nchr3\t78763546\t78767033\nchr1\t39747879\t39753234\nchr11\t76670120\t76709865\nchr1\t76198328\t76200556\nchr8\t133790037\t133823373\nchr4\t89574019\t89602476\nchr3\t171965322\t172016577\nchr22\t40513058\t40521866\nchr15\t91136867\t91150710\nchr1\t155408117\t155408859\nchr7\t74538936\t74550867\nchr4\t76691591\t76695949\nchr6\t82920530\t82922510\nchr20\t5086833\t5090091\nchr5\t80809446\t80946158\nchr14\t104037959\t104038157\nchr3\t37315026\t37337710\nchr2\t32515551\t32526564\nchr3\t179131199\t179134344\nchr2\t112821738\t112824644\nchr4\t148406763\t148441130\nchr12\t109509416\t109511337\nchr10\t97681772\t97687089\nchr10\t31644075\t31676195\nchr3\t56992850\t57110920\nchr17\t37453379\t37457328\nchr3\t174814579\t174974319\nchr11\t61094250\t61097546\nchr17\t2367501\t2376958\nchr12\t110819556\t110820765\nchr1\t28075578\t28081841\nchr1\t74701785\t74737392\nchr2\t114697535\t114699936\nchr4\t3156019\t3158926\nchr2\t11426664\t11427862\nchr12\t88909310\t88939642\nchr4\t2883624\t2886393\nchr2\t43805651\t43809067\nchr9\t103065913\t103111654\nchr3\t62423778\t62478121\nchr11\t116741046\t116747079\nchr7\t74227271\t74234553\nchr9\t125772632\t125839041\nchr10\t81049531\t81052113\nchr1\t52215816\t52227643\nchr14\t69695532\t69695789\nchr2\t197135916\t197172809\nchr2\t63660878\t63798760\nchr18\t74728787\t74778341\nchr1\t237919587\t237924328\nchr9\t95030455\t95032265\nchr12\t49168184\t49168301\nchr3\t130649259\t130660543\nchr14\t51710573\t51716483\nchr17\t29119457\t29120690\nchr1\t10207020\t10221344\nchr13\t42742575\t42793930\nchr19\t30476129\t30503438\nchr6\t57017018\t57025950\nchr18\t46855942\t46860223\nchr10\t94669183\t94715471\nchr1\t94667275\t94685948\nchr6\t18212718\t18214012\nchr13\t61013821\t61068709\nchr1\t57140053\t57161832\nchr2\t179519171\t179585929\nchr17\t64092368\t64128881\nchr6\t149663820\t149668393\nchr10\t26998566\t27013056\nchr12\t459786\t461490\nchr8\t30332294\t30336893\nchr5\t96328718\t96350799\nchr11\t113682997\t113688559\nchr6\t154749261\t154771392\nchr18\t45391429\t45396935\nchr3\t32750161\t32758729\nchr22\t24133942\t24135875\nchr18\t76856475\t76936907\nchr1\t14042035\t14068652\nchr13\t21961646\t21965993\nchr13\t76195898\t76335174\nchr1\t176118141\t176133027\nchr5\t173371969\t173380275\nchr2\t102440389\t102448313\nchr2\t61472344\t61493302\nchr10\t88635623\t88659883\nchr1\t213341200\t213349835\nchr2\t99802639\t99832577\nchr1\t237580348\t237586548\nchr1\t227327276\t227327443\nchr14\t73544076\t73550259\nchr4\t56830439\t56865811\nchr3\t47712147\t47719801\nchr7\t86783705\t86792648\nchr7\t31862686\t31864601\nchr11\t16339991\t16362798\nchr12\t2714246\t2742878\nchr8\t126049478\t126069908\nchr2\t61722589\t61727029\nchr2\t201796061\t201802689\nchr5\t68874847\t68875691\nchr5\t179132679\t179134191\nchr10\t51287080\t51363787\nchr17\t60629662\t60631116\nchr1\t89236034\t89237562\nchr15\t50592985\t50593565\nchr11\t67938481\t67947667\nchr15\t90991804\t90999547\nchr14\t81329100\t81372425\nchr10\t69366614\t69408574\nchr13\t96600249\t96648389\nchr20\t45923409\t45927691\nchr1\t67411832\t67425426\nchr2\t36805739\t36818154\nchr10\t34620044\t34673182\nchr13\t42729426\t42748280\nchr3\t140675368\t140678382\nchr11\t76227185\t76234335\nchr8\t104417003\t104420012\nchr1\t21083658\t21103243\nchr11\t32118689\t32120074\nchr18\t55230105\t55247431\nchr10\t428586\t436803\nchr6\t111711288\t111726833\nchr5\t107521817\t107703654\nchr2\t32822817\t32836649\nchr7\t134632258\t134635265\nchr2\t98430433\t98435184\nchr6\t139266355\t139269050\nchr8\t141874410\t141900868\nchr8\t17092224\t17094882\nchr20\t48471974\t48497572\nchr2\t159389691\t159490801\n"


});