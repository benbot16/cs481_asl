package com.cwu.friendswithsigns.localdb
import androidx.room.ColumnInfo
import androidx.room.PrimaryKey
import androidx.room.Entity

@Entity
data class User(
    @PrimaryKey val uid: Int,
    @ColumnInfo(name = "first_name") val first_name: String?,
    @ColumnInfo(name = "last_name") val last_name: String?,
    @ColumnInfo(name = "middle_name") val middle_name: String?,
    @ColumnInfo(name = "age") val age: Int?,
    @ColumnInfo(name = "history") val history: List<String>?
)