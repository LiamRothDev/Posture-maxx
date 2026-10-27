package ch.sparkleme.app

import android.annotation.SuppressLint
import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.os.ParcelUuid
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import java.util.UUID

data class Seen(val address: String, val name: String?, val rssi: Int, val device: BluetoothDevice)
data class Profile(val id: String, val name: String, val groups: List<Group>)

/**
 * Bluetooth Low Energy:
 *  - Gerät sendet ein Sparkle-Signal (Advertising) und läuft als GATT-Server
 *    (Profil lesen, Gruppen lesen, Nachrichten empfangen)
 *  - Scannt nach anderen Sparkle-Geräten (Nähe) oder allen BLE-Geräten (Geräte-Tab)
 *  - Verbindet sich als Client, um Profile zu lesen oder Nachrichten zu schreiben
 */
@SuppressLint("MissingPermission") // Berechtigungen werden in MainActivity vor dem Start angefragt
class Ble(private val ctx: Context, private val store: Store) {
    companion object {
        val SERVICE: UUID = UUID.fromString("5a5a0001-7a1e-4c1e-9d2b-5ba4b1e00001")
        val PROFILE: UUID = UUID.fromString("5a5a0002-7a1e-4c1e-9d2b-5ba4b1e00001")
        val GROUPS: UUID = UUID.fromString("5a5a0003-7a1e-4c1e-9d2b-5ba4b1e00001")
        val MESSAGE: UUID = UUID.fromString("5a5a0004-7a1e-4c1e-9d2b-5ba4b1e00001")
        val BATTERY: UUID = UUID.fromString("00002a19-0000-1000-8000-00805f9b34fb")
    }

    private val main = Handler(Looper.getMainLooper())
    private val manager = ctx.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val adapter: BluetoothAdapter? get() = manager.adapter

    val enabled get() = adapter?.isEnabled == true
    val nearby = mutableStateListOf<Seen>()
    val allDevices = mutableStateListOf<Seen>()
    val status = mutableStateOf("")
    val scanningAll = mutableStateOf(false)

    private var server: BluetoothGattServer? = null
    private var advertising = false

    // ---------- Server + Advertising ----------

    fun start() {
        val ad = adapter ?: run { status.value = "Kein Bluetooth auf diesem Gerät"; return }
        if (!ad.isEnabled) { status.value = "Bitte Bluetooth einschalten"; return }
        if (server == null) startServer()
        startAdvertising(ad)
        startScan(nearby, filtered = true)
    }

    fun stop() {
        stopScan()
        if (advertising) adapter?.bluetoothLeAdvertiser?.stopAdvertising(advCallback)
        advertising = false
        server?.close(); server = null
    }

    private fun startServer() {
        val srv = manager.openGattServer(ctx, serverCallback) ?: return
        val svc = BluetoothGattService(SERVICE, BluetoothGattService.SERVICE_TYPE_PRIMARY)
        svc.addCharacteristic(BluetoothGattCharacteristic(PROFILE,
            BluetoothGattCharacteristic.PROPERTY_READ, BluetoothGattCharacteristic.PERMISSION_READ))
        svc.addCharacteristic(BluetoothGattCharacteristic(GROUPS,
            BluetoothGattCharacteristic.PROPERTY_READ, BluetoothGattCharacteristic.PERMISSION_READ))
        svc.addCharacteristic(BluetoothGattCharacteristic(MESSAGE,
            BluetoothGattCharacteristic.PROPERTY_WRITE, BluetoothGattCharacteristic.PERMISSION_WRITE))
        srv.addService(svc)
        server = srv
    }

    private val serverCallback = object : BluetoothGattServerCallback() {
        override fun onCharacteristicReadRequest(device: BluetoothDevice, requestId: Int, offset: Int,
                                                 c: BluetoothGattCharacteristic) {
            val full = when (c.uuid) {
                PROFILE -> "${store.myId}|${store.myName.value.ifBlank { "Unbekannt" }}"
                GROUPS -> store.groups.joinToString("\n") { "${it.code}|${it.name}" }
                else -> ""
            }.toByteArray()
            val part = if (offset <= full.size) full.copyOfRange(offset, full.size) else ByteArray(0)
            server?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, part)
        }

        override fun onCharacteristicWriteRequest(device: BluetoothDevice, requestId: Int, c: BluetoothGattCharacteristic,
                                                  prepared: Boolean, needsResponse: Boolean, offset: Int, value: ByteArray) {
            if (c.uuid == MESSAGE && !prepared) {
                val raw = String(value)
                main.post { store.receive(raw) }
            }
            if (needsResponse) server?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value)
        }
    }

    private val advCallback = object : AdvertiseCallback() {
        override fun onStartFailure(errorCode: Int) { status.value = "Sichtbarkeit fehlgeschlagen ($errorCode)" }
    }

    private fun startAdvertising(ad: BluetoothAdapter) {
        val adv = ad.bluetoothLeAdvertiser ?: run { status.value = "Dieses Gerät kann sich nicht per BLE zeigen"; return }
        if (advertising) return
        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setConnectable(true).setTimeout(0).build()
        val data = AdvertiseData.Builder().setIncludeDeviceName(false)
            .addServiceUuid(ParcelUuid(SERVICE)).build()
        adv.startAdvertising(settings, data, advCallback)
        advertising = true
    }

    // ---------- Scan ----------

    private var scanTarget: MutableList<Seen>? = null
    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, r: ScanResult) {
            val list = scanTarget ?: return
            val seen = Seen(r.device.address, r.scanRecord?.deviceName ?: r.device.name, r.rssi, r.device)
            val i = list.indexOfFirst { it.address == seen.address }
            if (i >= 0) list[i] = seen else list += seen
        }
        override fun onScanFailed(errorCode: Int) { status.value = "Suche fehlgeschlagen ($errorCode)" }
    }

    private fun startScan(target: MutableList<Seen>, filtered: Boolean) {
        val scanner = adapter?.bluetoothLeScanner ?: return
        stopScan()
        target.clear()
        scanTarget = target
        val filters = if (filtered) listOf(ScanFilter.Builder().setServiceUuid(ParcelUuid(SERVICE)).build()) else emptyList()
        scanner.startScan(filters, ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build(), scanCallback)
    }

    private fun stopScan() {
        if (scanTarget != null) adapter?.bluetoothLeScanner?.stopScan(scanCallback)
        scanTarget = null
    }

    fun scanAllDevices(on: Boolean) {
        if (on && enabled) { startScan(allDevices, filtered = false); scanningAll.value = true }
        else { scanningAll.value = false; if (enabled) startScan(nearby, filtered = true) }
    }

    // ---------- Client ----------

    private sealed interface Op {
        data class Read(val uuid: UUID) : Op
        data class Write(val uuid: UUID, val data: ByteArray) : Op
    }

    private class Job(val ops: List<Op>, val onDone: (Map<UUID, ByteArray>, List<String>) -> Unit, val onFail: (String) -> Unit)

    private fun run(device: BluetoothDevice, job: Job) {
        val results = mutableMapOf<UUID, ByteArray>()
        val services = mutableListOf<String>()
        var step = 0
        var finished = false
        var gatt: BluetoothGatt? = null

        fun end(error: String?) {
            if (finished) return
            finished = true
            gatt?.close()
            main.post { if (error == null) job.onDone(results, services) else job.onFail(error) }
        }

        fun find(g: BluetoothGatt, uuid: UUID): BluetoothGattCharacteristic? =
            g.services.firstNotNullOfOrNull { s -> s.getCharacteristic(uuid) }

        fun next(g: BluetoothGatt) {
            if (step >= job.ops.size) return end(null)
            val ok = when (val op = job.ops[step]) {
                is Op.Read -> find(g, op.uuid)?.let { g.readCharacteristic(it) } ?: run { step++; next(g); return }
                is Op.Write -> find(g, op.uuid)?.let { c ->
                    c.writeType = BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT
                    @Suppress("DEPRECATION") run { c.value = op.data; g.writeCharacteristic(c) }
                } ?: return end("Das Gerät kann keine Nachrichten empfangen")
            }
            if (!ok) end("Bluetooth-Anfrage abgelehnt")
        }

        val cb = object : BluetoothGattCallback() {
            override fun onConnectionStateChange(g: BluetoothGatt, status: Int, newState: Int) {
                if (newState == BluetoothProfile.STATE_CONNECTED && status == BluetoothGatt.GATT_SUCCESS) g.requestMtu(247)
                else if (newState == BluetoothProfile.STATE_DISCONNECTED) end(if (step < job.ops.size || job.ops.isEmpty()) "Verbindung getrennt" else null)
            }
            override fun onMtuChanged(g: BluetoothGatt, mtu: Int, status: Int) { g.discoverServices() }
            override fun onServicesDiscovered(g: BluetoothGatt, status: Int) {
                g.services.forEach { s ->
                    services += "Dienst ${s.uuid.short()}"
                    s.characteristics.forEach { services += "   • ${it.uuid.short()}" }
                }
                next(g)
            }
            @Suppress("OVERRIDE_DEPRECATION")
            override fun onCharacteristicRead(g: BluetoothGatt, c: BluetoothGattCharacteristic, status: Int) {
                if (android.os.Build.VERSION.SDK_INT < 33) handleRead(g, c, c.value ?: ByteArray(0), status)
            }
            override fun onCharacteristicRead(g: BluetoothGatt, c: BluetoothGattCharacteristic, value: ByteArray, status: Int) =
                handleRead(g, c, value, status)

            private fun handleRead(g: BluetoothGatt, c: BluetoothGattCharacteristic, value: ByteArray, status: Int) {
                if (status != BluetoothGatt.GATT_SUCCESS) return end("Lesen fehlgeschlagen")
                results[c.uuid] = value; step++; next(g)
            }
            override fun onCharacteristicWrite(g: BluetoothGatt, c: BluetoothGattCharacteristic, status: Int) {
                if (status != BluetoothGatt.GATT_SUCCESS) return end("Senden fehlgeschlagen")
                step++; next(g)
            }
        }
        gatt = device.connectGatt(ctx, false, cb, BluetoothDevice.TRANSPORT_LE)
        main.postDelayed({ end("Zeitüberschreitung") }, 15_000)
    }

    private fun UUID.short() = toString().substring(4, 8).let { if (toString().endsWith("-0000-1000-8000-00805f9b34fb")) it else toString().take(8) }

    fun readProfile(d: Seen, onDone: (Profile) -> Unit, onFail: (String) -> Unit) =
        run(d.device, Job(listOf(Op.Read(PROFILE), Op.Read(GROUPS)), { res, _ ->
            val p = String(res[PROFILE] ?: ByteArray(0)).split("|", limit = 2)
            if (p.size < 2) return@Job onFail("Kein Sparkle-Gerät")
            val groups = String(res[GROUPS] ?: ByteArray(0)).lines().mapNotNull { l ->
                l.split("|", limit = 2).takeIf { it.size == 2 }?.let { Group(it[0], it[1]) }
            }
            onDone(Profile(p[0], p[1], groups))
        }, onFail))

    /** Schickt die Nachricht an alle Sparkle-Geräte in der Nähe; wer die Gruppe hat, speichert sie. */
    fun send(key: String, text: String, onResult: (Int) -> Unit) {
        val payload = "$key|${store.myId}|${store.myName.value.ifBlank { "Unbekannt" }}|$text".toByteArray()
        val targets = nearby.toList()
        if (targets.isEmpty()) return onResult(0)
        var done = 0; var ok = 0
        // Eine Verbindung nach der anderen, Android erlaubt nur wenige gleichzeitige GATT-Clients.
        fun go(i: Int) {
            if (i >= targets.size) return onResult(ok)
            run(targets[i].device, Job(listOf(Op.Write(MESSAGE, payload)), { _, _ -> ok++; go(i + 1) }, { go(i + 1) }))
        }
        go(0)
    }

    /** Verbindet sich mit einem beliebigen BLE-Gerät: zeigt Dienste und (falls vorhanden) den Akkustand. */
    fun inspect(d: Seen, onDone: (List<String>, Int?) -> Unit, onFail: (String) -> Unit) =
        run(d.device, Job(listOf(Op.Read(BATTERY)), { res, services ->
            onDone(services, res[BATTERY]?.firstOrNull()?.toInt()?.and(0xFF))
        }, onFail))
}
