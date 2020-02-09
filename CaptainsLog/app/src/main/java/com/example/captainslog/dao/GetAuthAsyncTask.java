package com.example.captainslog.dao;

import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

import com.android.volley.Response;

import java.lang.ref.WeakReference;

public class GetAuthAsyncTask extends AsyncTask<Void, Void, Integer> {

    //Prevent leak
    private WeakReference<Context> weakActivity;
    private String instanceId;
    private Response.Listener<Auth> onDone;

    public GetAuthAsyncTask(Context activity, String instanceId, Response.Listener<Auth> onDone) {
        weakActivity = new WeakReference<>(activity);
        this.instanceId = instanceId;
        this.onDone = onDone;
    }

    @Override
    protected Integer doInBackground(Void... params) {
        AuthDAO authDAO = MyDatabase.getInstance(weakActivity.get()).AuthDAO();
        Log.i("getinstanc", "Getting auth");
        try {
            onDone.onResponse(authDAO.findByName(instanceId));
        } catch (Exception e) {
            Log.i("getinstanc", e.getMessage());
            e.printStackTrace();
        }
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