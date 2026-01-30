# TEST MODULE WILL BE STARTING BLE FRAMEWORK FROM HERE
 

# UI IMPORTS
from rich.table import Table
from rich.live import Live
from rich.panel import Panel
from rich.console import Console


# HACKING IMPORTS
from bleak import BleakClient, BleakScanner


# ETC IMPORTS
import asyncio, os, time, random, threading


# NSM IMPORTS
from nsm_database import DataBase


console = Console()
LOCK = threading.Lock


class BLE_Sniffer(): 
    """This will be a ble hacking framework"""



    @classmethod
    async def _ble_discover(cls):
        """This will sniff traffic"""


        devices = await BleakScanner.discover(timeout=60, return_adv=True)

        return devices
    
    

    @staticmethod
    def _get_manuf(manuf):
        """This will parse and get manuf"""


        data = {}

        for key, value in manuf.items():
            data[key] = value.hex()

        return data



    @classmethod
    async def _ble_printer(cls,war_drive: bool, print: bool = True) -> None:
        """Lets enumerate"""


        c1 = "bold red"
        c2 = "bold yellow"
        c3 = "bold green"
        c4 = "bold red"
        c5 = "bold blue"
        table = ""
        timeout = 10

        if print:
            table = Table(title="BLE Sniffer" if not war_drive else "BLE Driving", title_style="bold red", border_style="bold purple", style="bold purple", header_style="bold red")
            table.add_column("#"); table.add_column("RSSI", style=c2); table.add_column("Mac", style=c3); table.add_column("Manufacturer", style=c5); table.add_column("Local_name"); table.add_column("UUID", style=c3)


        try:

            scanner = BleakScanner()

            with Live(table, console=console, refresh_per_second=4):
                while 0 < timeout:
                    

                    await scanner.start()
                    await asyncio.sleep(5)
                    await scanner.stop()
                    devices = scanner.discovered_devices_and_advertisement_data


                    if not devices: return
                    
                    
                    for mac, (device, adv) in devices.items():

                        name  = adv.local_name or False
                        rssi  = adv.rssi
                        uuid  = adv.service_uuids or False
                        manuf = DataBase._get_manufacturers(manufacturer_hex=adv.manufacturer_data, verbose=False) 
                        vendor = DataBase._get_vendor_main(mac=mac, verbose=False) 
                        up_time = time.time()
                                        

                        data = {
                            "rssi": rssi,
                            "addr": mac,
                            "manuf": manuf,
                            "vendor": vendor,
                            "name": name,
                            "uuid": uuid,
                            "up_time": up_time
                        }


                        cls.live_map[mac] = data

                        if mac not in cls.devices:
                            
                            cls.devices.append(mac); cls.num += 1
                            cls.war_drive[len(cls.devices)] = data
                            
                            if print:
                                if uuid: table.add_section()
                            
                                p1 = c3; p2 = "white" 
                                table.add_row(f"{len(cls.devices)}", f"{rssi}", f"{mac}", f"{manuf}", f"{name}",   f"{uuid}")

                                if uuid: table.add_section()
                            

                            elif war_drive:
                                console.print(f"{len(cls.devices)}", rssi, mac, manuf, vendor, name, uuid)
                


                            #if vendor_lookup:  console.print(f"[{c2}][+][/{c2}] [{p1}]Addr:[{p2}] {mac} - [{p1}]RSSI:[{p2}] {rssi} - [{p1}]Local_name:[{p2}] {name} - [{p1}]Manufacturer:[{p2}] {manuf} - [{p1}]UUID:[{p2}] {uuid}") 
                            #else: console.print(f"[{c2wq   }][+][/{c2}] [{p1}]Addr:[{p2}] {mac} - [{p1}]RSSI:[{p2}] {rssi} - [{p1}]Local_name:[{p2}] {name} - [{p1}]Manufacturer:[{p2}] {manuf} - [{p1}]UUID:[{p2}] {uuid}")
                        
                        if print:
                            if cls.num > 50:
                                cls.num = 0
                                console.print(table)
                                table = Table(title="BLE Sniffer", title_style="bold red", border_style="bold purple", style="bold purple", header_style="bold red")
                                table.add_column("#"); table.add_column("RSSI", style=c2); table.add_column("Mac", style=c3); table.add_column("Manufacturer", style=c5); table.add_column("Local_name"); table.add_column("UUID", style=c3)

 
                    DataBase.push_results(devices=cls.war_drive, verbose=False)


                        

            console.print(f"\n[bold green][+] Found a total of:[bold yellow] {len(cls.devices)} devices")


        except KeyboardInterrupt:  
            if war_drive: DataBase.push_results(devices=cls.war_drive, verbose=False)
            return KeyboardInterrupt

        except Exception as e: 
            console.print(f"[bold red]Sniffer Exception Error:[bold yellow] {e}") 
            if war_drive: DataBase.push_results(devices=cls.war_drive, verbose=False)



        
    @classmethod
    def main(cls, war_drive=False, print=False):
        """Run from here"""
        
        cls.war_drive = {}
        cls.devices = []
        cls.live_map = {}
        cls.num =0
        if war_drive: timeout = 30 * 60; vendor_lookup = True


        try:
            
            
            if war_drive or print: from nsm_server import Web_Server; threading.Thread(target=Web_Server.start, args=(console, ), daemon=True).start(); time.sleep(1)
            asyncio.run(BLE_Sniffer._ble_printer(war_drive=war_drive, print=print))
            #threading.Thread(target=asyncio.run(BLE_Sniffer._ble_printer), args=(timeout, vendor_lookup, war_drive, print), daemon=True).start()
            while True: time.sleep(1)
        
        
        except KeyboardInterrupt:
            console.print("\n[bold red]Stopping....")
            if war_drive: DataBase.push_results(devices=cls.war_drive, verbose=False)
        
        except Exception as e:
            console.print(f"[bold red]Sniffer Exception Error:[bold yellow] {e}")
            if war_drive: DataBase.push_results(devices=cls.war_drive, verbose=False)
