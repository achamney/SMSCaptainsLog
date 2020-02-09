package com.example.captainslog;

import android.content.Context;
import android.database.ContentObserver;
import android.database.Cursor;
import android.net.Uri;
import android.os.Handler;
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

public class SMSObserver extends ContentObserver {
    private Handler m_handler = null;
    Context context;

    public SMSObserver(Handler handler, Context context) {
        super(handler);
        this.context = context;
        m_handler = handler;
    }

    @Override
    public void onChange(boolean selfChange) {
        super.onChange(selfChange);
        Uri uriSMSURI = Uri.parse("content://sms");

        Cursor cur = context.getContentResolver().query(uriSMSURI, null, null,
                null, null);
        cur.moveToNext();

        String protocol = cur.getString(cur.getColumnIndex("protocol"));

        if (protocol == null) {
            Log.i("SMSCL:onsend","SMSCL:onsend");
            Log.i("SMSCL:cols", cur.getColumnNames().toString());
            final String content = cur.getString(cur.getColumnIndex("body"));
            final String address = cur.getString(cur.getColumnIndex("address"));
            FirebaseInstanceId.getInstance().getInstanceId()
                    .addOnCompleteListener(new OnCompleteListener<InstanceIdResult>() {
                           @Override
                           public void onComplete(@NonNull Task<InstanceIdResult> task) {
                               if (!task.isSuccessful()) {
                                   Log.w("Hi", "getInstanceId failed", task.getException());
                                   return;
                               }
                               Log.i("SMSCL", "got instanceid, getting auth");
                               String token = task.getResult().getToken();
                               new GetAuthAsyncTask(context, token, new Response.Listener<Auth>() {
                                   @Override
                                   public void onResponse(Auth auth) {
                                       sendRequest(context, address, content, auth.password, auth.myJsonKey);
                                   }
                               });
                           }
                       });
            Log.i("SMSCL:content", content);
            Log.i("SMSCL:address", address);
        } else {
            Log.i("SMSCL:onreceive","SMSCL:onreceive");
        }
    }

    public void sendRequest(final Context context, final String to, final String text,
                            final String password, final String myJsonKey) {

        String url = "https://api.myjson.com/bins/"+myJsonKey;
        Proxy.sendGetRequest(context, url, new Response.Listener<JSONObject>() {
            @Override
            public void onResponse(JSONObject response) {
                try{
                    String toEnc = AES.encryptText(to, password);
                    String textEnc = AES.encryptText(text, password);
                    if (!response.has(toEnc)){
                        Log.e("newaddress:SMSObs", "No messages found");
                        response.put(toEnc, new JSONArray());
                    }
                    JSONArray messages = response.getJSONArray(toEnc);
                    if (messages.length()>0 &&
                            messages.getJSONObject(messages.length()-1)
                                    .getString("Message").equals(textEnc)) {
                        Log.e("newaddress:SMSObs", "Duplicate");
                        return;
                    }
                    JSONObject message = new JSONObject();
                    message.put("Date", System.currentTimeMillis());
                    message.put("Message", textEnc);
                    message.put("Me", true);
                    messages.put(message);
                    Proxy.sendPutRequest(context, myJsonKey, response);
                } catch (Exception e) {
                    Log.e("SMSCL", e.getMessage());
                }
            }
        });

    }
}