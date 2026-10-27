package ch.sparkleme.app

import android.content.Context
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

data class Group(val code: String, val name: String)
data class Friend(val id: String, val name: String)

/** key = Gruppen-Code oder "@" + Freund-ID (Direktnachricht) */
data class ChatMsg(val key: String, val senderName: String, val text: String, val ts: Long, val mine: Boolean)

/** Alles liegt nur lokal auf dem Handy (SharedPreferences). */
class Store(ctx: Context) {
    private val prefs = ctx.getSharedPreferences("sparkle", Context.MODE_PRIVATE)

    val myId: String = prefs.getString("id", null) ?: UUID.randomUUID().toString().take(8).also {
        prefs.edit().putString("id", it).apply()
    }
    val myName = mutableStateOf(prefs.getString("name", "") ?: "")
    val groups = mutableStateListOf<Group>()
    val friends = mutableStateListOf<Friend>()
    val messages = mutableStateListOf<ChatMsg>()

    init {
        JSONArray(prefs.getString("groups", "[]")).let { a ->
            for (i in 0 until a.length()) a.getJSONObject(i).let { groups += Group(it.getString("c"), it.getString("n")) }
        }
        JSONArray(prefs.getString("friends", "[]")).let { a ->
            for (i in 0 until a.length()) a.getJSONObject(i).let { friends += Friend(it.getString("i"), it.getString("n")) }
        }
        JSONArray(prefs.getString("messages", "[]")).let { a ->
            for (i in 0 until a.length()) a.getJSONObject(i).let {
                messages += ChatMsg(it.getString("k"), it.getString("s"), it.getString("t"), it.getLong("ts"), it.getBoolean("m"))
            }
        }
    }

    fun setName(n: String) {
        myName.value = n.trim()
        prefs.edit().putString("name", myName.value).apply()
    }

    fun createGroup(name: String): Group {
        val code = (1..6).map { "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".random() }.joinToString("")
        return Group(code, name.trim()).also { addGroup(it) }
    }

    fun addGroup(g: Group) {
        if (groups.none { it.code == g.code }) {
            groups += g
            saveGroups()
        }
    }

    fun leaveGroup(g: Group) {
        groups.remove(g)
        messages.removeAll { it.key == g.code }
        saveGroups(); saveMessages()
    }

    fun addFriend(f: Friend) {
        if (f.id != myId && friends.none { it.id == f.id }) {
            friends += f
            prefs.edit().putString("friends", JSONArray().also { a ->
                friends.forEach { a.put(JSONObject().put("i", it.id).put("n", it.name)) }
            }.toString()).apply()
        }
    }

    fun addMessage(m: ChatMsg) {
        messages += m
        if (messages.size > 500) messages.removeAt(0)
        saveMessages()
    }

    /** Wire-Format: key|senderId|senderName|text */
    fun receive(raw: String) {
        val p = raw.split("|", limit = 4)
        if (p.size < 4) return
        val (key, senderId, senderName, text) = p
        val storeKey = when {
            key == "@$myId" -> "@$senderId"
            groups.any { it.code == key } -> key
            else -> return
        }
        addMessage(ChatMsg(storeKey, senderName, text, System.currentTimeMillis(), false))
    }

    private fun saveGroups() = prefs.edit().putString("groups", JSONArray().also { a ->
        groups.forEach { a.put(JSONObject().put("c", it.code).put("n", it.name)) }
    }.toString()).apply()

    private fun saveMessages() = prefs.edit().putString("messages", JSONArray().also { a ->
        messages.forEach {
            a.put(JSONObject().put("k", it.key).put("s", it.senderName).put("t", it.text).put("ts", it.ts).put("m", it.mine))
        }
    }.toString()).apply()
}
