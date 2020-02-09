package com.example.captainslog;

import android.content.Context;
import android.util.Log;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONObject;

public class Proxy {
    public static String TAG = "CaptainProxy";
    public static void sendPutRequest(Context context, String myJsonKey, JSONObject obj) {
        try{
            String url = "https://api.myjson.com/bins/"+myJsonKey;
            RequestQueue requestQueue = Volley.newRequestQueue(context);
            JsonObjectRequest stringRequest = new JsonObjectRequest(Request.Method.PUT, url,
                    obj,
                    new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            // Display the first 500 characters of the response string.
                            Log.i(TAG,"Response is: "+ response.toString());
                        }
                    }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.i(TAG,"That didn't work!");
                }
            });
            requestQueue.add(stringRequest);
        } catch (Exception e) {

        }
    }
    public static void sendPostRequest(Context context, JSONObject obj, final Response.Listener<JSONObject> onComplete) {
        try{
            String url = "https://api.myjson.com/bins/";
            RequestQueue requestQueue = Volley.newRequestQueue(context);
            JsonObjectRequest stringRequest = new JsonObjectRequest(Request.Method.POST, url,
                    obj,
                    new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            // Display the first 500 characters of the response string.
                            onComplete.onResponse(response);
                        }
                    }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.i(TAG,"That didn't work!");
                }
            });
            requestQueue.add(stringRequest);
        } catch (Exception e) {

        }
    }
    public static void sendGetRequest(Context context, String url, final Response.Listener<JSONObject> onComplete) {
        try{
            RequestQueue requestQueue = Volley.newRequestQueue(context);
            JsonObjectRequest stringRequest = new JsonObjectRequest(Request.Method.GET, url,
                    null,
                    new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            // Display the first 500 characters of the response string.
                            Log.i(TAG,"Response is: "+ response.toString());
                            onComplete.onResponse(response);
                        }
                    }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.i(TAG,"That didn't work!");
                }
            });
            requestQueue.add(stringRequest);
        } catch (Exception e) {

        }
    }
}
