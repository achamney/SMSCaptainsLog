function send() {
    var urlParams = new URLSearchParams(window.location.search);
    var body = $("#msg").val();
    if (body && body.length > 0) {
        $("#msg").val("");
        var data = {
            "to": urlParams.get("key"),
            "data": {
                "address": window.activePhone,
                "body": body
            },
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
        var messageList = $("#messages");
        createMessage(messageList, { Message: body, Date: 123, Me: true });
    }
}
$(function () {
    function updateData(first) {
        $.get("https://api.myjson.com/bins/wm3k2", function (data, textStatus, jqXHR) {
            var phoneList = $("#phoneList");
            var fst;
            window.phoneData = data;
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
            return 0;
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
    if (window.editPhone) {
        window.phoneData[window.editPhone + "name"] = newPhoneNumber;
        window.editPhone = false;
    } else {
        window.phoneData[newPhoneNumber] = [];
    }
    $.ajax({
        url: "https://api.myjson.com/bins/wm3k2",
        type: "PUT",
        data: JSON.stringify(window.phoneData),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            location.reload();
        }
    });
}
function editName(num) {
    var phoneinput = $("#newPhone");
    phoneinput.focus();
    phoneinput.val("Give Me A Name");
    $("#addButton").html("Save");
    window.editPhone = num;
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