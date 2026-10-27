package ch.sparkleme.app

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp

private val Purple = androidx.compose.ui.graphics.Color(0xFFB03FD8)
private val Pink = androidx.compose.ui.graphics.Color(0xFFFF6FB5)

@Composable
fun SparkleTheme(content: @Composable () -> Unit) = MaterialTheme(
    colorScheme = lightColorScheme(primary = Purple, secondary = Pink, primaryContainer = androidx.compose.ui.graphics.Color(0xFFF3D9FF)),
    content = { Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background, content = content) }
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SparkleApp(store: Store, ble: Ble) {
    var tab by remember { mutableIntStateOf(0) }
    var chat by remember { mutableStateOf<Pair<String, String>?>(null) } // key to title
    var askName by remember { mutableStateOf(store.myName.value.isBlank()) }

    if (askName) NameDialog(store.myName.value) { store.setName(it); askName = false }

    chat?.let { (key, title) ->
        ChatScreen(store, ble, key, title) { chat = null }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Sparkle Me ✨") },
                actions = { TextButton(onClick = { askName = true }) { Text(store.myName.value.ifBlank { "Name" }) } },
            )
        },
        bottomBar = {
            NavigationBar {
                listOf("Gruppen" to Icons.Default.Groups, "Freunde" to Icons.Default.People,
                    "Nähe" to Icons.Default.BluetoothSearching, "Geräte" to Icons.Default.Bluetooth
                ).forEachIndexed { i, (label, icon) ->
                    NavigationBarItem(selected = tab == i, onClick = { tab = i }, icon = { Icon(icon, label) }, label = { Text(label) })
                }
            }
        }
    ) { pad ->
        Column(Modifier.padding(pad).fillMaxSize()) {
            if (ble.status.value.isNotBlank() || !ble.enabled)
                Text(ble.status.value.ifBlank { "Bluetooth ist aus – bitte einschalten" },
                    Modifier.fillMaxWidth().padding(8.dp), color = MaterialTheme.colorScheme.error)
            when (tab) {
                0 -> GroupsTab(store) { chat = it.code to it.name }
                1 -> FriendsTab(store) { chat = "@${it.id}" to it.name }
                2 -> NearbyTab(store, ble)
                else -> DevicesTab(ble)
            }
        }
    }
}

@Composable
private fun NameDialog(current: String, onSave: (String) -> Unit) {
    var name by remember { mutableStateOf(current) }
    AlertDialog(
        onDismissRequest = { if (current.isNotBlank()) onSave(current) },
        title = { Text("Wie heisst du?") },
        text = {
            OutlinedTextField(name, { name = it.take(20) }, singleLine = true, label = { Text("Dein Name") },
                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Words))
        },
        confirmButton = { TextButton(onClick = { if (name.isNotBlank()) onSave(name) }) { Text("Speichern") } }
    )
}

@Composable
private fun GroupsTab(store: Store, open: (Group) -> Unit) {
    var dialog by remember { mutableStateOf<String?>(null) } // "create" | "join"
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { dialog = "create" }) { Text("Gruppe erstellen") }
            OutlinedButton(onClick = { dialog = "join" }) { Text("Mit Code beitreten") }
        }
        Spacer(Modifier.height(12.dp))
        if (store.groups.isEmpty()) Text("Noch keine Gruppen. Erstelle eine oder tritt mit einem Code bei. Gruppen in deiner Nähe findest du im Tab «Nähe».")
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(store.groups.toList()) { g ->
                Card(Modifier.fillMaxWidth().clickable { open(g) }) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(g.name, style = MaterialTheme.typography.titleMedium)
                            Text("Code: ${g.code}", style = MaterialTheme.typography.bodySmall)
                        }
                        IconButton(onClick = { store.leaveGroup(g) }) { Icon(Icons.Default.ExitToApp, "Verlassen") }
                    }
                }
            }
        }
    }
    if (dialog != null) {
        var text by remember { mutableStateOf("") }
        val create = dialog == "create"
        AlertDialog(
            onDismissRequest = { dialog = null },
            title = { Text(if (create) "Neue Gruppe" else "Gruppe beitreten") },
            text = {
                OutlinedTextField(text, { text = it.take(if (create) 30 else 6).let { s -> if (create) s else s.uppercase() } },
                    singleLine = true, label = { Text(if (create) "Gruppenname" else "6-stelliger Code") })
            },
            confirmButton = {
                TextButton(onClick = {
                    if (text.isNotBlank()) {
                        if (create) store.createGroup(text) else store.addGroup(Group(text, "Gruppe $text"))
                        dialog = null
                    }
                }) { Text("OK") }
            },
            dismissButton = { TextButton(onClick = { dialog = null }) { Text("Abbrechen") } }
        )
    }
}

@Composable
private fun FriendsTab(store: Store, open: (Friend) -> Unit) {
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        if (store.friends.isEmpty()) Text("Noch keine Freunde. Öffne den Tab «Nähe» und füge Freunde per Bluetooth hinzu.")
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(store.friends.toList()) { f ->
                Card(Modifier.fillMaxWidth().clickable { open(f) }) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Person, null); Spacer(Modifier.width(12.dp))
                        Text(f.name, Modifier.weight(1f), style = MaterialTheme.typography.titleMedium)
                        IconButton(onClick = { store.friends.remove(f) }) { Icon(Icons.Default.Close, "Entfernen") }
                    }
                }
            }
        }
    }
}

@Composable
private fun NearbyTab(store: Store, ble: Ble) {
    var selected by remember { mutableStateOf<Seen?>(null) }
    var profile by remember { mutableStateOf<Profile?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Sparkle-Geräte in deiner Nähe (beide Handys brauchen die App offen).", style = MaterialTheme.typography.bodySmall)
        Spacer(Modifier.height(8.dp))
        if (ble.nearby.isEmpty()) Text("Suche läuft …")
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(ble.nearby.toList()) { s ->
                Card(Modifier.fillMaxWidth().clickable {
                    selected = s; profile = null; error = null; loading = true
                    ble.readProfile(s, { loading = false; profile = it }, { loading = false; error = it })
                }) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Bluetooth, null); Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text("Sparkle-Gerät", style = MaterialTheme.typography.titleMedium)
                            Text(s.address, style = MaterialTheme.typography.bodySmall)
                        }
                        Text("${s.rssi} dBm")
                    }
                }
            }
        }
    }
    if (selected != null) {
        AlertDialog(
            onDismissRequest = { selected = null },
            title = { Text(profile?.name ?: "Verbinde …") },
            text = {
                Column {
                    if (loading) LinearProgressIndicator(Modifier.fillMaxWidth())
                    error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
                    profile?.let { p ->
                        val isFriend = store.friends.any { it.id == p.id }
                        Button(enabled = !isFriend, onClick = { store.addFriend(Friend(p.id, p.name)) }) {
                            Text(if (isFriend) "Schon befreundet" else "Als Freund hinzufügen")
                        }
                        Spacer(Modifier.height(12.dp))
                        Text("Gruppen von ${p.name}:", style = MaterialTheme.typography.titleSmall)
                        if (p.groups.isEmpty()) Text("Keine Gruppen")
                        p.groups.forEach { g ->
                            val member = store.groups.any { it.code == g.code }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(g.name, Modifier.weight(1f))
                                TextButton(enabled = !member, onClick = { store.addGroup(g) }) { Text(if (member) "Drin" else "Beitreten") }
                            }
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { selected = null }) { Text("Schliessen") } }
        )
    }
}

@Composable
private fun DevicesTab(ble: Ble) {
    var info by remember { mutableStateOf<Pair<Seen, String>?>(null) }
    var busy by remember { mutableStateOf(false) }
    DisposableEffect(Unit) { onDispose { ble.scanAllDevices(false) } }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Verbinde dich mit beliebigen Bluetooth-Geräten (z. B. Armband, Lampe, Kopfhörer mit BLE).", style = MaterialTheme.typography.bodySmall)
        Spacer(Modifier.height(8.dp))
        Button(onClick = { ble.scanAllDevices(!ble.scanningAll.value) }) {
            Text(if (ble.scanningAll.value) "Suche stoppen" else "Geräte suchen")
        }
        Spacer(Modifier.height(8.dp))
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(ble.allDevices.sortedByDescending { it.rssi }) { d ->
                Card(Modifier.fillMaxWidth().clickable {
                    busy = true
                    ble.inspect(d, { services, battery ->
                        busy = false
                        info = d to buildString {
                            battery?.let { append("Akku: $it %\n\n") }
                            append(if (services.isEmpty()) "Keine Dienste gefunden" else services.joinToString("\n"))
                        }
                    }, { busy = false; info = d to it })
                }) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(d.name ?: "Unbenannt", style = MaterialTheme.typography.titleMedium)
                            Text(d.address, style = MaterialTheme.typography.bodySmall)
                        }
                        Text("${d.rssi} dBm")
                    }
                }
            }
        }
    }
    if (busy) AlertDialog(onDismissRequest = {}, confirmButton = {}, title = { Text("Verbinde …") }, text = { LinearProgressIndicator() })
    info?.let { (d, text) ->
        AlertDialog(
            onDismissRequest = { info = null },
            title = { Text(d.name ?: d.address) },
            text = { Text(text) },
            confirmButton = { TextButton(onClick = { info = null }) { Text("OK") } }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ChatScreen(store: Store, ble: Ble, key: String, title: String, back: () -> Unit) {
    var text by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }
    val msgs = store.messages.filter { it.key == key }
    val list = rememberLazyListState()
    LaunchedEffect(msgs.size) { if (msgs.isNotEmpty()) list.animateScrollToItem(msgs.lastIndex) }

    Scaffold(topBar = {
        TopAppBar(title = { Text(title) }, navigationIcon = { IconButton(onClick = back) { Icon(Icons.Default.ArrowBack, "Zurück") } })
    }) { pad ->
        Column(Modifier.padding(pad).fillMaxSize().imePadding()) {
            LazyColumn(Modifier.weight(1f).padding(horizontal = 12.dp), state = list, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                items(msgs) { m ->
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = if (m.mine) Arrangement.End else Arrangement.Start) {
                        Surface(shape = RoundedCornerShape(14.dp),
                            color = if (m.mine) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant) {
                            Column(Modifier.padding(10.dp)) {
                                if (!m.mine) Text(m.senderName, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
                                Text(m.text)
                            }
                        }
                    }
                }
            }
            if (note.isNotBlank()) Text(note, Modifier.padding(horizontal = 12.dp), style = MaterialTheme.typography.bodySmall)
            Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(text, { text = it.take(200) }, Modifier.weight(1f), placeholder = { Text("Nachricht …") })
                IconButton(onClick = {
                    val t = text.trim().replace("\n", " ")
                    if (t.isNotEmpty()) {
                        text = ""
                        store.addMessage(ChatMsg(key, store.myName.value, t, System.currentTimeMillis(), true))
                        note = "Sende per Bluetooth …"
                        ble.send(key, t) { n -> note = if (n == 0) "Niemand in Reichweite – nicht zugestellt" else "An $n Gerät(e) gesendet" }
                    }
                }) { Icon(Icons.Default.Send, "Senden", tint = MaterialTheme.colorScheme.primary) }
            }
        }
    }
}
