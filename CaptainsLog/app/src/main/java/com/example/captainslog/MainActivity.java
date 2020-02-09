package com.example.captainslog;


import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.android.volley.Response;
import com.example.captainslog.dao.AddAuthAsyncTask;
import com.example.captainslog.dao.Auth;
import com.example.captainslog.dao.GetAuthAsyncTask;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;

import org.json.JSONObject;

import androidx.annotation.NonNull;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        final LinearLayout lView = new LinearLayout(this);
        setContentView(lView);
        final MainActivity me = this;
        FirebaseInstanceId.getInstance().getInstanceId()
                .addOnCompleteListener(new OnCompleteListener<InstanceIdResult>() {
                    @Override
                    public void onComplete(@NonNull Task<InstanceIdResult> task) {
                        if (!task.isSuccessful()) {
                            Log.w("Hi", "getInstanceId failed", task.getException());
                            return;
                        }
                        // Get new Instance ID token
                        final String token = task.getResult().getToken();
                        Log.i("Getinstanc", ""+token);
                        new GetAuthAsyncTask(me, token, new Response.Listener<Auth>() {
                            @Override
                            public void onResponse(final Auth response) {

                                Log.i("Getinstanceid  ", ""+response);
                                me.runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        Log.i("Getinstanceid  ", "inuithread");
                                        if (response == null) {
                                            final TextView myText = new TextView(me);
                                            final EditText passwordBox = new EditText(me);
                                            final Button go = new Button(me);
                                            myText.setText("Please enter a password that will be used to log in to the web.\n");
                                            passwordBox.setPadding(20, 20, 20, 20);
                                            passwordBox.setHint("PW");
                                            go.setText("Save");
                                            go.setOnClickListener(new View.OnClickListener() {
                                                @Override
                                                public void onClick(View v) {
                                                    savePassword(passwordBox, token, me, myText, lView);
                                                }
                                            });

                                            lView.addView(go);
                                            lView.addView(passwordBox);
                                            lView.addView(myText);
                                        } else {
                                            final TextView myText = new TextView(me);
                                            myText.setText("Your password has been set. You can now log into web. ["+response.password+"]\n" +
                                                    "https://achamney.github.io/SMSCaptainsLog/index.html?key="+response.myJsonKey);
                                            lView.addView(myText);
                                        }
                                    }
                                });
                            }
                        }).execute();
                    }
                });

        this.startService(new Intent(getApplicationContext(), SMSSendService.class));
        Log.i("mainactivityhi", "contentresolver registered");
    }

    private void savePassword(final EditText passwordBox, final String token, final MainActivity me,
                              final TextView myText, final LinearLayout lView) {
        try {
            JSONObject data = new JSONObject();
            String instanceIdKey = AES.encryptText("instanceId", passwordBox.getText().toString());
            data.put(instanceIdKey, token);
            Proxy.sendPostRequest(me, data, new Response.Listener<JSONObject>() {
                @Override
                public void onResponse(JSONObject response) {
                    try {
                        String[] responseSplit = response.getString("uri").split("/");
                        String myJsonKey = responseSplit[responseSplit.length - 1];
                        Auth auth = new Auth();
                        auth.password = passwordBox.getText().toString();
                        auth.instanceId = token;
                        auth.myJsonKey = myJsonKey;
                        new AddAuthAsyncTask(me, auth).execute();
                        myText.setText("Your password has been saved. You may now log into web.\n" +
                                "https://achamney.github.io/SMSCaptainsLog/index.html?key=" + myJsonKey);
                        lView.removeView(passwordBox);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}