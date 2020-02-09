package com.example.captainslog.dao;

import android.content.Context;
import android.os.AsyncTask;

import java.lang.ref.WeakReference;

public class AddAuthAsyncTask extends AsyncTask<Void, Void, Integer> {

    //Prevent leak
    private WeakReference<Context> weakActivity;
    private Auth auth;

    public AddAuthAsyncTask(Context activity, Auth auth) {
        weakActivity = new WeakReference<>(activity);
        this.auth = auth;
    }

    @Override
    protected Integer doInBackground(Void... params) {
        AuthDAO agentDao = MyDatabase.getInstance(weakActivity.get()).AuthDAO();
        agentDao.insertAll(auth);
        return 0;
    }

    @Override
    protected void onPostExecute(Integer agentsCount) {
        Context activity = weakActivity.get();
        if(activity == null) {
            return;
        }
    }
}