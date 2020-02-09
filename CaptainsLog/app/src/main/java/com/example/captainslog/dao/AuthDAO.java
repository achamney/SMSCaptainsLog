package com.example.captainslog.dao;

import java.util.List;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;

@Dao
public interface AuthDAO {
    @Query("SELECT * FROM auth")
    List<Auth> getAll();

    @Query("SELECT * FROM auth WHERE instanceId LIKE :instanceId LIMIT 1")
    Auth findByName(String instanceId);

    @Insert
    void insertAll(Auth... auths);

    @Delete
    void delete(Auth auth);
}