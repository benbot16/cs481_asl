package com.cwu.friendswithsigns.localdb
import androidx.room.Dao
import androidx.room.Query
import androidx.room.Insert
import androidx.room.Delete

@Dao
interface UserAccess {
    @Query("SELECT * FROM user WHERE uid=(:userID)")
    fun get_by_id(userID: Int): User

    @Insert
    fun insertUser(vararg user: User)

    @Delete
    fun deleteUser(user: User)
}