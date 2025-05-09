package com.cwu.friendswithsigns.localdb

import androidx.room.TypeConverter
import kotlinx.serialization.json.Json

class ListTypeConverter {
    @TypeConverter
    fun listStringToString(inList: List<String>): String? {
        return Json.encodeToString(inList)
    }

    @TypeConverter
    fun stringToListString(inString: String): List<String>? {
        return Json.decodeFromString(inString)
    }
}