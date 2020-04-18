const electron = require('electron');
const {
    app,
    BrowserWindow,
    net,
    shell
} = electron.remote;
const FB = require('fb');
const ipcRenderer = electron.ipcRenderer;

console.log('home/index.js');
window.localization = window.localization || {},
    function (n) {
        localization.home = {
            load: function () {
                var access_token = Metro.storage.setItem("access_token", access_token);
                // Not login
                if (access_token == "") {
                    $("#fb-button").show();
                    $("#fb-infomation").hide();
                } else {
                    $("#fb-button").hide();
                    $("#fb-infomation").show();
                    //================================/*Check login again*/================================//
                    localization.home.fun.loginSussess()
                }
            },
            fun: {
                formSubmitSearchHastag: function () {
                    var hasTag = document.getElementById("txtHastag").value;
                    console.log("call: formSubmitSearchHastag-" + hasTag);

                    // init data:
                    $('.my-search-wrapper').empty();
                    $('.my-rows-wrapper').empty();
                    $('.my-pagination-wrapper').empty();
                    $('.my-table-data').empty();

                    var activityLoadData = Metro.activity.open({
                        type: 'cycle'
                    });
                    //FB Group: 870423283379459 - FackbookFindPostByHastag
                    let access_token = Metro.storage.getItem("access_token");
                    FB.setAccessToken(access_token);
                    let urlSearch = '/870423283379459/feed?fields=message_tags,message,created_time,permalink_url,from'
                    if (hasTag == "")
                        urlSearch += '&limit=50';
                    else
                        urlSearch += '&limit=2020';
                    FB.api(urlSearch, function (res) {
                        //console.log(res);
                        var dataFromHasTag = res.data;
                        if (hasTag != "")
                            dataFromHasTag = dataFromHasTag.filter(function (entry) {
                                return entry.message_tags && entry.message_tags.filter((x) => { return x.name == hasTag }).length > 0
                            });

                        let tableHtml = '<table id="table-result" class="table table-border striped mt-4 row-hover cell-border" data-role="table"';
                        tableHtml += ' data-rows="10" data-rows-steps="10, 20, 50" data-show-activity="false" data-rownum="true"';
                        tableHtml += ' data-search-wrapper=".my-search-wrapper" data-rows-wrapper=".my-rows-wrapper"';
                        tableHtml += ' data-pagination-wrapper=".my-pagination-wrapper" data-list-search-title="Search:"';
                        tableHtml += ' data-horizontal-scroll="true" data-check-col-index="0"';
                        tableHtml += ' data-table-info-title="Show $1 - $2 / $3 items">';
                        tableHtml += '  <thead>';
                        tableHtml += '      <tr>';
                        tableHtml += '          <th data-sortable="true" data-show="false">ID</th>';
                        tableHtml += '          <th data-sortable="true">From</th>';
                        tableHtml += '          <th data-sortable="true">Description</th>';
                        tableHtml += '          <th data-sortable="true" data-format="date" data-format-mask="%d-%m-%y">Date</th>';
                        tableHtml += '          <th data-sortable="true">URL</th>';
                        tableHtml += '      </tr>';
                        tableHtml += '  </thead>';
                        tableHtml += '  <tbody>';

                        let i = 1;
                        if (dataFromHasTag !== undefined)
                            dataFromHasTag.forEach(post => {
                                let dateCreated = new Date(Date.parse(post.created_time));
                                let fromName = post.from != undefined ? post.from.name : "-";
                                tableHtml += '<tr>';
                                tableHtml += '  <td>' + i + '</td>';
                                tableHtml += '  <td>' + fromName + '</td>';
                                tableHtml += '  <td>' + String(post.message).substring(0, 50) + '...</td>';
                                tableHtml += '  <td>' + dateCreated.format("%Y/%m/%d %H:%M:%S") + '</td>';
                                tableHtml += '  <td><a href="javascript:;" onClick="localization.home.fun.openPermarkLink(\'' + post.permalink_url + '\')"><span class="mif-link"></span> Open</a></td>';
                                tableHtml += '</tr>';
                                i++;
                            });

                        tableHtml += '  </tbody>';
                        tableHtml += '</table>';

                        // console.log(dataFromHasTag);
                        $('.my-table-data').empty().append(tableHtml);
                        Metro.activity.close(activityLoadData);
                    });

                },
                checkLoginStateFacebook: function () {
                    ipcRenderer.send("fb-authenticate", "yes");
                },
                loginSussess: function () {
                    let access_token = document.getElementById("access_token").value;
                    Metro.storage.setItem("access_token", access_token);
                    FB.setAccessToken(access_token);
                    FB.api('/me', {
                        fields: ['id', 'name', 'picture.width(800).height(800)']
                    }, function (res) {
                        console.log(res);
                        $("#fb-button").hide();
                        $("#fb-infomation").show();
                        if (res.error) {
                            $("#fb-button").show();
                            $("#fb-infomation").hide();
                            return;
                        }
                        Metro.storage.setItem("fb_name", res.name);
                        Metro.storage.setItem("fb_id", res.id);
                        Metro.storage.setItem("fb_avatar", res.picture.data.url);
                        document.getElementById("fb-id").innerHTML = res.id;
                        document.getElementById("fb-name").innerHTML = res.name;
                        document.getElementById("fb-avatar").src = res.picture.data.url;

                        //================================/*Load new Post*/================================//
                        localization.home.fun.formSubmitSearchHastag()
                    });
                },
                openPermarkLink: function (url) {
                    shell.openExternal(url)
                }
            },

            init: function () {
                this.load();
            }
        }

        n(function () {
            localization.home.init();
        })
    }(jQuery);