# FF-5MP API - Discovery Reference

## UDP Discovery Protocol

FlashForge printers can be discovered on the local network using UDP broadcast messages.

## Configuration

| Setting | Value |
|---------|-------|
| Discovery Port | 48899 (UDP) |
| Response Port | 18007 (UDP) |
| Default Timeout | 10000 ms |
| Idle Timeout | 1500 ms |
| Max Retries | 3 |

## Discovery Packet

Send this 20-byte UDP packet to port 48899:

```
Offset | Hex   | ASCII
-------|-------|-------
0x00   | 77 77 77 2e 75 73 72 22 | "www.usr""
0x08   | 65 36 c0 00 00 00 00 00 | e6....
0x10   | 00 00 00 00             | ....

Full: 0x77 0x77 0x77 0x2e 0x75 0x73 0x72 0x22
      0x65 0x36 0xc0 0x00 0x00 0x00 0x00 0x00
      0x00 0x00 0x00 0x00
```

## Response Packet

Printers respond with at least 196 bytes (0xC4):

| Offset | Size | Description |
|--------|------|-------------|
| 0x00 | 32 | Printer name (ASCII, null-padded) |
| 0x92 | 32 | Serial number (ASCII, null-padded) |

### Parsing

```typescript
const name = response.toString('ascii', 0, 32).replace(/\0+$/, '');
const serialNumber = response.toString('ascii', 0x92, 0x92 + 32).replace(/\0+$/, '');
const ipAddress = rinfo.address;  // From UDP message info
const isAD5X = name === "AD5X";
```

## API Usage

### FlashForgePrinterDiscovery

```typescript
class FlashForgePrinterDiscovery {
    async discoverPrintersAsync(
        timeoutMs: number = 10000,
        idleTimeoutMs: number = 1500,
        maxRetries: number = 3
    ): Promise<FlashForgePrinter[]>
}
```

### FlashForgePrinter

```typescript
class FlashForgePrinter {
    name: string;           // Printer name
    serialNumber: string;   // Serial number
    ipAddress: string;      // IP address
    isAD5X?: boolean;       // True if AD5X model

    toString(): string {
        return `Name: ${name}, Serial: ${serialNumber}, IP: ${ipAddress}`;
    }
}
```

## Complete Example

```typescript
import { FlashForgePrinterDiscovery } from 'ff-api';

const discovery = new FlashForgePrinterDiscovery();

// Discover with default settings
const printers = await discovery.discoverPrintersAsync();

// Or with custom timeout
const printers = await discovery.discoverPrintersAsync(
    15000,  // 15 second total timeout
    2000,   // 2 second idle timeout
    5       // 5 retries
);

// Process results
for (const printer of printers) {
    console.log(`Found: ${printer.name}`);
    console.log(`  Serial: ${printer.serialNumber}`);
    console.log(`  IP: ${printer.ipAddress}`);
    if (printer.isAD5X) {
        console.log(`  Model: AD5X with Material Station`);
    }
}
```

## Broadcast Address Calculation

The discovery automatically calculates broadcast addresses for all network interfaces:

```
Broadcast Address = IP | (~Subnet Mask)

Example:
IP:         192.168.1.10  (11000000.10101000.00000001.00001010)
Subnet:     255.255.255.0 (11111111.11111111.11111111.00000000)
~Subnet:    0.0.0.255      (00000000.00000000.00000000.11111111)
Broadcast:  192.168.1.255  (11000000.10101000.00000001.11111111)
```

## Network Interface Selection

The discovery:
1. Enumerates all network interfaces via `os.networkInterfaces()`
2. Skips loopback (127.0.0.1) and internal interfaces
3. Calculates broadcast address for each IPv4 interface
4. Sends discovery packet to each broadcast address
5. Listens on port 18007 for responses

## Debug Output

The `printDebugInfo()` method provides hex dump:

```typescript
discovery.printDebugInfo(responseBuffer, ipAddress);

// Output:
// Received response from 192.168.1.100:
// Response length: 196 bytes
// Hex dump:
// 0000   41 44 35 58 00 00 00 00 00 00 00 00 00 00 00 00  AD5X.............
// ...
```

## Troubleshooting

### No Printers Found

1. Check firewall allows UDP on ports 48899 and 18007
2. Verify printer and computer on same network
3. Try increasing `timeoutMs` and `maxRetries`
4. Check for multiple network adapters causing confusion

### Duplicate Entries

Caused by multiple network adapters (Wi-Fi + Ethernet + virtual adapters).

**Solution**: Bind to specific interface (not supported in base API, requires modification).

## Integration with FiveMClient

```typescript
import { FlashForgePrinterDiscovery, FiveMClient } from 'ff-api';

const discovery = new FlashForgePrinterDiscovery();
const printers = await discovery.discoverPrintersAsync();

for (const printer of printers) {
    // For modern printers (5M, 5M Pro, AD5X)
    if (printer.name.includes('5M') || printer.isAD5X) {
        const client = new FiveMClient(
            printer.ipAddress,
            printer.serialNumber,
            'YOUR_CHECK_CODE'  // Must be known beforehand
        );

        if (await client.initialize()) {
            console.log(`Connected to ${printer.name}`);
        }
    }
}
```

## Protocol Notes

1. **Response Timing**: Printers respond immediately (within milliseconds)
2. **Multiple Responses**: Same printer may respond multiple times (once per broadcast address)
3. **Packet Size**: Response is typically exactly 196 bytes, but code checks for minimum
4. **Port Binding**: Client binds to port 18007 to receive responses
5. **Retry Logic**: If no printers found, retries up to `maxRetries` times with 1s delay
