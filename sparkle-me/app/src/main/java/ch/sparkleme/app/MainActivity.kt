package ch.sparkleme.app

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    private lateinit var store: Store
    private lateinit var ble: Ble

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        store = Store(this)
        ble = Ble(this, store)
        setContent {
            SparkleTheme {
                var granted by remember { mutableStateOf(false) }
                val perms = if (Build.VERSION.SDK_INT >= 31) arrayOf(
                    Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT,
                    Manifest.permission.BLUETOOTH_ADVERTISE
                ) else arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)
                val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
                    granted = it.values.all { ok -> ok }
                    if (granted) ble.start()
                }
                LaunchedEffect(Unit) { launcher.launch(perms) }

                if (!granted) {
                    Column(Modifier.fillMaxSize().padding(32.dp), verticalArrangement = Arrangement.Center) {
                        Text("Sparkle Me ✨", style = MaterialTheme.typography.headlineLarge)
                        Spacer(Modifier.height(12.dp))
                        Text("Sparkle Me braucht Bluetooth-Rechte, um Freunde und Gruppen in deiner Nähe zu finden.")
                        Spacer(Modifier.height(16.dp))
                        Button(onClick = { launcher.launch(perms) }) { Text("Bluetooth erlauben") }
                    }
                } else SparkleApp(store, ble)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (::ble.isInitialized && ble.enabled && ble.nearby.isNotEmpty().not()) runCatching { ble.start() }
    }

    override fun onDestroy() {
        super.onDestroy()
        ble.stop()
    }
}
