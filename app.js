function send() {
    var body = $("#msg").val();
    var encryptedBody = CryptoJS.AES.encrypt(body, localStorage.getItem("password")).toString();
    if (body && body.length > 0) {
        $("#msg").val("");
        sendAjax({
            "address": window.activePhone,
            "body": body,
            "password": localStorage.getItem("password")
        });
        var messageList = $("#messages");
        createMessage(messageList, { Message: body, Date: 123, Me: true });
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
            window.phoneData = decryptData(data);
            phoneList.empty();
            var dataArray = [];
            for (var num in data) {
                dataArray.push({ num: num, messages: data[num] });
            }
            dataArray.sort((a, b) => sortMsgs(a, b));
            for (var numMsg of dataArray) {
                var messages = numMsg.messages;
                var num = numMsg.num;
                if (!fst && messages instanceof Array) {
                    fst = num;
                }
                if (messages instanceof Array) {
                    createPhoneNum(num, phoneList);
                }
            }
            if (first) {
                setActive(fst, data[fst]);
            } else {
                styleActiveNumber(activePhone);
            }
            makeMessages(data[window.activePhone]);
            if (first) {
                var messageContainer = $("#messages");
                messageContainer.scrollTop(messageContainer.prop("scrollHeight"));
            }
        });
    }
    function sortMsgs(a, b) {
        if (!(a.messages instanceof Array) || !(b.messages instanceof Array)
            || a.messages.length == 0 || b.messages.length == 0)
            return -1;
        return a.messages[a.messages.length - 1].Date < b.messages[b.messages.length - 1].Date ?
            1 :
            -1
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
    function setActive(num, messages) {
        styleActiveNumber(num);
        window.activePhone = num;
        var label = num;
        if (window.phoneData[num + "name"]) {
            label = window.phoneData[num + "name"];
        }
        $("#activeNumLabel").html(label);
        makeMessages(messages);
        var messageContainer = $("#messages");
        messageContainer.scrollTop(messageContainer.prop("scrollHeight"));
    }
    function styleActiveNumber(num) {
        $('#phoneList .list-group-item').removeClass("active")
        var activePhoneItem = $(`#phoneList .list-group-item[data-id='${num}']`);
        activePhoneItem.addClass("active");
    }
    function makeMessages(messages) {
        var messageList = $("#messages");

        if (messages) {
            messageList.empty();
            for (var msg of messages) {
                createMessage(messageList, msg);
            }
        }
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
        } else {
            data[encryptPhone] = [];
        }
        $.ajax({
            url: "https://api.myjson.com/bins/"+urlParams.get("key"),
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
function writeInstanceId() {
    var urlParams = new URLSearchParams(window.location.search);
    $.get("https://api.myjson.com/bins/"+urlParams.get("key"), function (data, textStatus, jqXHR) {
        $.ajax({
            url: "https://api.myjson.com/bins/"+urlParams.get("key"),
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
function decryptData(mydata) {
    var pass = localStorage.getItem("password");
    for (var key in mydata){
        for (var msg of mydata[key]){
            if (msg.Message) {
                msg.Message = CryptoJS.AES.decrypt(msg.Message, pass).toString(CryptoJS.enc.Utf8);
            }
        }
    }
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