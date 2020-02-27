function send() {
    var body = $("#msg").val();
    var password = localStorage.getItem("password");
    var encryptedBody = CryptoJS.AES.encrypt(body, password).toString();
    var urlParams = new URLSearchParams(window.location.search);
    if (body && body.length > 0) {
        $("#msg").val("");
        sendAjax({
            "address": window.activePhone,
            "body": body,
            "password": localStorage.getItem("password")
        });
        var messageList = $("#messages");
        createMessage(messageList, { Message: body, Date: new Date().getTime(), Me: true });
        messageList.scrollTop(messageList.prop("scrollHeight"));
        var messageKey = phoneData[window.activePhone].MyJson
        $.get("https://api.myjson.com/bins/"+messageKey, function (data, textStatus, jqXHR) {
            var encAddress = CryptoJS.AES.encrypt(window.activePhone, password).toString();
            data.Messages.push({Message: encryptedBody, Date: new Date().getTime(), Me: true});
            $.ajax({
                url: "https://api.myjson.com/bins/"+messageKey,
                type: "PUT",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                }
            });
        });
    }
}
function login() {
    var password = $("#password").val();
    localStorage.setItem("password", password);
    $('#passwordModal').modal('hide')
}
function sendAjax(body) {
    var instanceId = window.phoneData["instanceId"];
    var data = {
        "to": instanceId,
        "data": body,
        "priority": "high"
    };
    var key = atob("QUl6YVN5Q296VTBXTWVqMUs5eVVab1ZjTU9SeU9BYlpYSVRkTTlz");
    var url = atob("aHR0cHM6Ly9mY20uZ29vZ2xlYXBpcy5jb20vZmNtL3NlbmQ=")
    $.ajax({
        url: url,
        type: 'post',
        data: JSON.stringify(data),
        headers: {
            "Authorization": 'key=' + key,
            "Content-Type": "application/json"
        },
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            console.info(data);
        }
    });
}
$(function () {
    if (!localStorage.getItem("password")) {
        $("#passwordModal").modal("show");
    }
    function updateData(first) {
        var urlParams = new URLSearchParams(window.location.search);
        $.get("https://api.myjson.com/bins/"+urlParams.get("key"), function (data, textStatus, jqXHR) {
            var phoneList = $("#phoneList");
            var fst;
            window.phoneData = decryptAddressData(data);
            phoneList.empty();
            var dataArray = [];
            for (var num in phoneData) {
                if (phoneData[num].Num || phoneData[num].Num == 0)
                    dataArray.push({phone:num, Num:phoneData[num].Num, Data: window[num+"Data"]});
            }
            dataArray.sort((a, b) => sortMsgs(a, b));
            for (var key in dataArray) {
                var num = dataArray[key].Num;
                var address = dataArray[key].phone;
                if (!fst && (num || num == 0)) {
                    fst = address;
                }
                if (num || num == 0) {
                    createPhoneNum(address, phoneList);
                    if (first) {
                        getMessages(address, phoneData[address], function(data) {});
                    }
                }
            }
            if (first) {
                setActive(fst, phoneData[fst]);
            } else {
                styleActiveNumber(activePhone);
            }
            if (window.activeMessages && 
                window.activeMessages.Messages.length > 0 &&
                activeMessages.Messages.length != phoneData[window.activePhone].Num){
                makeMessages(phoneData[window.activePhone]);
            }
            if (first) {
                makeMessages(phoneData[window.activePhone]);
                var messageContainer = $("#messages");
                messageContainer.scrollTop(messageContainer.prop("scrollHeight"));
            }
        });
    }
    function sortMsgs(a, b) {
        if (a.Data && b.Data) {
            return a.Data.Messages[a.Data.Messages.length-1].Date < 
                    b.Data.Messages[b.Data.Messages.length-1].Date ? 1 : -1;
        }
        if (!a.Date || !b.Date)
            return -1;
        return a.Date < b.Date ? 1 : -1;
    }
    function createPhoneNum(num, phoneList) {
        var label = num;
        if (window.phoneData[num + "name"]) {
            label = window.phoneData[num + "name"];
        }
        var phonenum = $(`<button class="list-group-item" data-id="${num}">
            ${label}
            <i class="fa fa-pencil" onclick="editName('${num}')"></i>
            </button>`)
            .appendTo(phoneList);
        phonenum.click(function () {
            setActive(num, window.phoneData[num]);
        });
    }
    function setActive(num, address) {
        if (!address){
            return;
        }
        styleActiveNumber(num);
        window.activePhone = num;
        var label = num;
        if (window.phoneData[num + "name"]) {
            label = window.phoneData[num + "name"];
        }
        $("#activeNumLabel").html(label);
        makeMessages(address);
    }
    function styleActiveNumber(num) {
        $('#phoneList .list-group-item').removeClass("active")
        var activePhoneItem = $(`#phoneList .list-group-item[data-id='${num}']`);
        activePhoneItem.addClass("active");
    }
    function makeMessages(address) {
        $.get("https://api.myjson.com/bins/"+address.MyJson, function (data, textStatus, jqXHR) {
            var messageData = decryptMessageData(data);
            window.activeMessages = messageData;
            window[address + "Data"] = messageData;
            var messageList = $("#messages");

            if (messageData) {
                messageList.empty();
                for (var msg of messageData.Messages) {
                    createMessage(messageList, msg);
                }
            }
            messageList.scrollTop(messageList.prop("scrollHeight"));
        });
    }
    
    function getMessages(address, myJson, cb) {
        $.get("https://api.myjson.com/bins/"+myJson.MyJson, function (data, textStatus, jqXHR) {
            var messageData = decryptMessageData(data);
            window[address + "Data"] = messageData;
            cb(messageData);
        });
    }
    updateData(true);
    window.setInterval(function () {
        updateData(false);
    }, 3000);
});
function createMessage(messageList, msg) {
    var date = new Date(msg.Date);
    var secondsSince = Math.floor((new Date() - date) / 1000);
    var dateString;
    if (secondsSince > 60 * 60) {
        dateString = date.getUTCFullYear() + "/" +
            ("0" + (date.getUTCMonth() + 1)).slice(-2) + "/" +
            ("0" + date.getUTCDate()).slice(-2) + " " +
            ("0" + date.getUTCHours()).slice(-2) + ":" +
            ("0" + date.getUTCMinutes()).slice(-2) + ":" +
            ("0" + date.getUTCSeconds()).slice(-2);
    } else {
        dateString = timeSince(date);
    }
    var item = $(`<li class="list-group-item"><div>${msg.Message}</div><div class="text-muted">${dateString}</div></li>`)
        .appendTo(messageList);
    if (msg.Me) {
        item.addClass("me")
    }
}
function createNewPhone() {
    var newPhoneNumber = $("#newPhone").val();
    var pass = localStorage.getItem("password");
    var encryptPhone = CryptoJS.AES.encrypt(newPhoneNumber, pass).toString();
    var urlParams = new URLSearchParams(window.location.search);
    
    $.get("https://api.myjson.com/bins/"+urlParams.get("key"), function (data, textStatus, jqXHR) {
        if (window.editPhone) {
            var phoneAlias = window.editPhone+"name";
            data[CryptoJS.AES.encrypt(phoneAlias, pass).toString()] = newPhoneNumber;
            window.editPhone = false;
            updateData(data, urlParams.get("key"));
        } else {
            $.ajax({
                url: "https://api.myjson.com/bins/",
                type: "post",
                data: JSON.stringify({"Messages":[]}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (newData, textStatus, jqXHR) {
                    var newKeys = newData.uri.split("/");
                    var newKey = newKeys[newKeys.length -1];
                    data[encryptPhone] = { MyJson: newKey, Date: new Date().getTime(), Num: 0 };
                    updateData(data, urlParams.get("key"));
                }
            });
        }
    });
}
function updateData(data, key) {
    $.ajax({
        url: "https://api.myjson.com/bins/"+ key,
        type: "PUT",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            location.reload();
        }
    });
}
function updateData2(data, key) {
    
    var urlParams = new URLSearchParams(window.location.search);
    
    $.get("https://api.myjson.com/bins/"+urlParams.get("key"), function (data, textStatus, jqXHR) {
        delete data["U2FsdGVkX181imgZ7+rE2sKUkdF1N9ZnNUcY+YO3kwc="];
        $.ajax({
            url: "https://api.myjson.com/bins/"+ urlParams.get("key"),
            type: "PUT",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data, textStatus, jqXHR) {
                location.reload();
            }
        });
    });
}
function editName(num) {
    var phoneinput = $("#newPhone");
    phoneinput.focus();
    phoneinput.val("Give Me A Name");
    $("#addButton").html("Save");
    window.editPhone = num;
}

function decryptAddressData(mydata) {
    var pass = localStorage.getItem("password");
    for (var key in mydata) {
        var decryptKey = CryptoJS.AES.decrypt(key, pass).toString(CryptoJS.enc.Utf8);
        if (mydata[key] instanceof Array) {
            mydata[decryptKey] = mydata[decryptKey] || [];
            mydata[decryptKey] = mydata[decryptKey].concat(mydata[key]);
        } else {
            mydata[decryptKey] = mydata[key];
        }
        delete mydata[key];
    }
    return mydata;
    
}

function decryptMessageData(mydata) {
    var pass = localStorage.getItem("password");
    for (var msg of mydata.Messages) {
        if (msg.Message) {
            msg.Message = CryptoJS.AES.decrypt(msg.Message, pass).toString(CryptoJS.enc.Utf8);
        }
    }
    return mydata;
    
}
function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}