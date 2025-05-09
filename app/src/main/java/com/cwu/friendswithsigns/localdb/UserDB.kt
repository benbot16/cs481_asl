package com.cwu.friendswithsigns.localdb
import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

@Database(entities = [User::class], version = 1)
@TypeConverters(ListTypeConverter::class)
abstract class UserDB : RoomDatabase() {
    abstract fun UserAccess() : UserAccess
}