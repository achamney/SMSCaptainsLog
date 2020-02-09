package com.example.captainslog;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

import com.android.volley.Response;
import com.example.captainslog.dao.Auth;
import com.example.captainslog.dao.GetAuthAsyncTask;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;

import org.json.JSONArray;
import org.json.JSONObject;

import androidx.annotation.NonNull;

public class CLReceiveSMSBroadcastReceiver extends BroadcastReceiver {

    private static final String SMS_RECEIVED = "android.provider.Telephony.SMS_RECEIVED";
    private static final String TAG = "SMSBroadcastReceiver";

    @Override
    public void onReceive(final Context context, Intent intent) {
        Log.i(TAG, "Intent received: " + intent.getAction());

        if (SMS_RECEIVED.equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[])bundle.get("pdus");
                if (pdus == null)
                    return;
                final SmsMessage[] messages = new SmsMessage[pdus.length];
                for (int i = 0; i < pdus.length; i++) {
                    messages[i] = SmsMessage.createFromPdu((byte[])pdus[i]);
                }
                if (messages.length > 0) {
                    Log.i(TAG, "Message recieved: " + messages[0].getMessageBody());
                    final String from = messages[0].getOriginatingAddress();
                    final StringBuilder body = new StringBuilder();
                    for (int i=0;i<messages.length; i++) {
                        body.append(messages[i].getMessageBody());
                    }
                    Log.i(TAG, "Getting instanceid");
                    FirebaseInstanceId.getInstance().getInstanceId()
                            .addOnCompleteListener(new OnCompleteListener<InstanceIdResult>() {
                                @Override
                                public void onComplete(@NonNull Task<InstanceIdResult> task) {
                                    if (!task.isSuccessful()) {
                                        Log.w("Hi", "getInstanceId failed", task.getException());
                                        return;
                                    }
                                    Log.i(TAG, "got instanceid, getting auth");
                                    String token = task.getResult().getToken();
                                    new GetAuthAsyncTask(context, token, new Response.Listener<Auth>() {
                                        @Override
                                        public void onResponse(Auth auth) {
                                            Log.i(TAG, "got auth, sending request");
                                            sendRequest(context,
                                                    AES.encryptText(from, auth.password),
                                                    AES.encryptText(body.toString(), auth.password),
                                                    auth.myJsonKey);
                                        }
                                    }).execute();
                                }
                            });
                }
            }
        }
    }
    public void sendRequest(final Context context, final String from, final String text, final String myJsonKey) {

            String url = "https://api.myjson.com/bins/"+myJsonKey;
            Proxy.sendGetRequest(context, url, new Response.Listener<JSONObject>() {
                @Override
                public void onResponse(JSONObject response) {
                    try{
                        if (!response.has(from)){
                            response.put(from, new JSONArray());
                            Log.e("newaddress:BCastrec", "No messages found ["+from+"]");
                        }
                        JSONArray messages = response.getJSONArray(from);
                        JSONObject message = new JSONObject();
                        message.put("Date", System.currentTimeMillis());
                        message.put("Message", text);
                        message.put("Me", false);
                        messages.put(message);
                        Proxy.sendPutRequest(context, myJsonKey, response);
                    } catch (Exception e) {
                        Log.e(TAG, e.getMessage());
                    }
                }
            });

    }

}