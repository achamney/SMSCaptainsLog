package com.example.captainslog.dao;

import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity
public class Auth {
    @PrimaryKey(autoGenerate = true)
    public int uid;

    @ColumnInfo(name = "password")
    public String password;

    @ColumnInfo(name = "instanceId")
    public String instanceId;

    @ColumnInfo(name = "myJsonKey")
    public String myJsonKey;
}