package com.example.captainslog;

import android.content.Context;
import android.telephony.SmsManager;
import android.util.Log;

import com.android.volley.Response;
import com.example.captainslog.dao.Auth;
import com.example.captainslog.dao.GetAuthAsyncTask;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Map;

import androidx.annotation.NonNull;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // ...

        // TODO(developer): Handle FCM messages here.
        // Not getting messages here? See why this may be: https://goo.gl/39bRNJ
        Log.d("HI", "From: " + remoteMessage.getFrom());

        // Check if message contains a data payload.
        if (remoteMessage.getData().size() > 0) {
            Log.d("HI", "Message data payload: " + remoteMessage.getData());
        } else {
            return;
        }

        // Check if message contains a notification payload.
        if (remoteMessage.getNotification() != null) {
            Log.d("HI", "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }
        try {
            final MyFirebaseMessagingService me = this;
            Map<String, String> data = remoteMessage.getData();
            if (data.containsKey("address")) {
                final String address = data.get("address");
                final String message = data.get("body");
                final String password = data.get("password");
                Log.i("FBMS Auth", "Getting token");
                FirebaseInstanceId.getInstance().getInstanceId()
                        .addOnCompleteListener(new OnCompleteListener<InstanceIdResult>() {
                            @Override
                            public void onComplete(@NonNull Task<InstanceIdResult> task) {
                                if (!task.isSuccessful()) {
                                    Log.w("Hi", "getInstanceId failed", task.getException());
                                    return;
                                }
                                // Get new Instance ID token
                                String token = task.getResult().getToken();
                                Log.i("FBMS Auth", "Got token" + token);
                                new GetAuthAsyncTask(me, token, new Response.Listener<Auth>() {
                                    @Override
                                    public void onResponse(Auth auth) {
                                        if (!auth.password.equals(password)) {
                                            Log.i("FBMS Auth", "Last auth was a failure, cancelling");
                                            return;
                                        }
                                        Log.i("FBMS Auth","Auth success. Continuing. Auth ["+password+"]");
                                        SmsManager smsManager = SmsManager.getDefault();
                                        smsManager.sendTextMessage(address, null, message, null, null);
                                        sendSMSRequest(getBaseContext(), address, message,
                                                auth.password, auth.myJsonKey);
                                    }
                                }).execute();
                            }
                        });

            }
        } catch (Exception e) {
            Log.e("fbasehi", e.getMessage());
        }
        // Also if you intend on generating your own notifications as a result of a received FCM
        // message, here is where that should be initiated. See sendNotification method below.
    }

    public void sendSMSRequest(final Context context, final String from, final String text,
                               final String password, final String myJsonKey) {

        String url = "https://api.myjson.com/bins/"+myJsonKey;
        Proxy.sendGetRequest(context, url, new Response.Listener<JSONObject>() {
            @Override
            public void onResponse(JSONObject response) {
                try{
                    String fromenc = AES.encryptText(from, password);
                    if (!response.has(fromenc)){
                        Log.e("newaddress:fbasehi", "No messages found ["+fromenc+"]");
                        response.put(fromenc, new JSONArray());
                    }
                    JSONArray messages = response.getJSONArray(fromenc);
                    JSONObject message = new JSONObject();
                    message.put("Date", System.currentTimeMillis());
                    message.put("Message", AES.encryptText(text, password));
                    message.put("Me", true);
                    messages.put(message);
                    Proxy.sendPutRequest(context, myJsonKey, response);
                } catch (Exception e) {
                    Log.e("fbasehi", e.getMessage());
                }
            }
        });
    }

    public boolean verifyTest(String test1, String test2, String instanceId) {
        int testnum1 = Integer.parseInt(test1);
        int testnum2 = Integer.parseInt(test2);
        int hash = Math.abs(instanceId.hashCode());
        Log.i("FBMS","Hash "+hash);
        return testnum1 * testnum2 == hash;
    }

    @Override
    public void onNewToken(@NonNull String newToken) {
        Log.i("Hi", newToken);
        super.onNewToken(newToken);
    }
}
