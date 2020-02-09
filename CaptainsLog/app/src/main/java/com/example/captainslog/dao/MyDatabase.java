package com.example.captainslog.dao;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

@Database(entities = {Auth.class}, version = 5)
public abstract class MyDatabase extends RoomDatabase {
    private static MyDatabase instance;
    public abstract AuthDAO AuthDAO();

    public static MyDatabase getInstance(Context c) {
        if (instance == null) {
            instance = Room.databaseBuilder(c, MyDatabase.class, "database-name")
                    .fallbackToDestructiveMigration()
                    .build();
        }
        return instance;
    }
}
