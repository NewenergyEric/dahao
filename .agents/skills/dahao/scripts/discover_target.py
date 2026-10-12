"""Local LAN hints and one selected SSH endpoint check; never authenticates or installs."""
from __future__ import annotations

import argparse
import ipaddress
import json
import platform
import re
import socket
import subprocess
import time

# RFC 1918 network constants, not addresses of any user's devices.
PRIVATE_NETS = tuple(ipaddress.IPv4Network(pair) for pair in ((0x0A000000, 8), (0xAC100000, 12), (0xC0A80000, 16)))
WINDOWS_QUERY = r"""
$addresses = @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop | Select-Object IPAddress,PrefixLength,InterfaceIndex)
$routes = @(Get-NetRoute -AddressFamily IPv4 -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue | Select-Object InterfaceIndex,NextHop)
$neighbors = @(Get-NetNeighbor -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object IPAddress,InterfaceIndex,@{Name='State';Expression={$_.State.ToString()}})
[pscustomobject]@{addresses=$addresses;routes=$routes;neighbors=$neighbors} | ConvertTo-Json -Depth 5 -Compress
"""


class DiscoveryError(Exception):
    pass


def private_ip(value):
    try:
        address = ipaddress.IPv4Address(value)
    except (ValueError, TypeError, ipaddress.AddressValueError):
        raise DiscoveryError('invalid_private_ipv4') from None
    if not any(address in network for network in PRIVATE_NETS):
        raise DiscoveryError('private_lan_ipv4_required')
    return address


def command(argv):
    try:
        result = subprocess.run(argv, capture_output=True, timeout=15, check=False)
    except (OSError, subprocess.TimeoutExpired):
        raise DiscoveryError('local_inventory_unavailable') from None
    if result.returncode:
        raise DiscoveryError('local_inventory_unavailable')
    # Only numeric network metadata is consumed. Never echo command stderr.
    return result.stdout.decode('utf-8-sig', errors='replace')


def as_list(value):
    return value if isinstance(value, list) else ([] if value is None else [value])


def normalize(addresses, routes, neighbors):
    networks = []
    gateways = {str(row.get('NextHop')) for row in routes if isinstance(row, dict)}
    active = {row.get('InterfaceIndex') for row in routes if isinstance(row, dict)}
    for row in addresses:
        if not isinstance(row, dict) or row.get('InterfaceIndex') not in active:
            continue
        try:
            address = private_ip(row.get('IPAddress'))
            prefix = row['PrefixLength']
            if type(prefix) is not int or not 8 <= prefix <= 30:
                continue
            subnet = ipaddress.IPv4Network((address, prefix), strict=False)
        except (DiscoveryError, ValueError, KeyError):
            continue
        networks.append({'interface': row['InterfaceIndex'], 'controller_ip': str(address), 'subnet': str(subnet)})
    own = {row['controller_ip'] for row in networks}
    candidates = {}
    for row in neighbors:
        if not isinstance(row, dict) or row.get('State') not in ('Reachable', 'Stale', 'Delay', 'Probe', 'Permanent'):
            continue
        try:
            address = private_ip(row.get('IPAddress'))
        except DiscoveryError:
            continue
        if str(address) in own | gateways:
            continue
        for network in networks:
            subnet = ipaddress.IPv4Network(network['subnet'])
            if row.get('InterfaceIndex') != network['interface'] or address not in subnet or address in (subnet.network_address, subnet.broadcast_address):
                continue
            candidates[str(address)] = {'address': str(address), 'source': 'local_neighbor_cache',
                                        'target_confirmed': False, 'ssh_checked': False}
    ordered = sorted(candidates, key=ipaddress.IPv4Address)
    return {'schema': 1, 'status': 'candidate_hints_only', 'networks': networks,
            'candidates': [candidates[name] for name in ordered[:64]], 'omitted_candidates': max(0, len(ordered)-64),
            'discovery_complete': False, 'remote_connections_made': False,
            'next': 'Ask the user to confirm the intended device; an empty cache does not prove the device is absent.'}


def discover(system=None, runner=command):
    system = system or platform.system()
    if system == 'Windows':
        try:
            value = json.loads(runner(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', WINDOWS_QUERY]))
            return normalize(as_list(value.get('addresses')), as_list(value.get('routes')), as_list(value.get('neighbors')))
        except (ValueError, AttributeError):
            raise DiscoveryError('local_inventory_invalid') from None
    if system == 'Darwin':
        route = runner(['/sbin/route', '-n', 'get', 'default'])
        interface = re.search(r'^\s*interface:\s*([a-zA-Z]+[0-9]+)\s*$', route, re.M)
        gateway = re.search(r'^\s*gateway:\s*([0-9.]+)\s*$', route, re.M)
        if not interface or not gateway:
            raise DiscoveryError('local_inventory_unavailable')
        iface = interface.group(1)
        address = runner(['/usr/sbin/ipconfig', 'getifaddr', iface]).strip()
        # ifconfig also handles manually configured addresses without a DHCP lease.
        config = runner(['/sbin/ifconfig', iface])
        mask_match = re.search(r'\binet\s+'+re.escape(address)+r'\s+netmask\s+(0x[0-9a-fA-F]+|[0-9.]+)', config)
        if not mask_match:
            raise DiscoveryError('local_inventory_invalid')
        mask = mask_match.group(1)
        try:
            if mask.startswith('0x'):
                mask = str(ipaddress.IPv4Address(int(mask, 16)))
            subnet = ipaddress.IPv4Network((private_ip(address), mask), strict=False)
        except ValueError:
            raise DiscoveryError('local_inventory_invalid') from None
        arp = runner(['/usr/sbin/arp', '-an'])
        neighbors = [{'IPAddress': match.group(1), 'InterfaceIndex': iface, 'State': 'Stale'}
                     for match in re.finditer(r'\(([0-9.]+)\) at (?!\(incomplete\))\S+ on '+re.escape(iface)+r'\b', arp)]
        return normalize([{'IPAddress': address, 'PrefixLength': subnet.prefixlen, 'InterfaceIndex': iface}],
                         [{'InterfaceIndex': iface, 'NextHop': gateway.group(1)}], neighbors)
    raise DiscoveryError('controller_os_not_supported')


def probe(host, inventory, connector=socket.create_connection):
    address = private_ip(host)
    eligible = any(address in ipaddress.IPv4Network(n['subnet']) and
                   address not in (ipaddress.IPv4Network(n['subnet']).network_address,
                                   ipaddress.IPv4Network(n['subnet']).broadcast_address) for n in inventory['networks'])
    if not eligible or str(address) in {n['controller_ip'] for n in inventory['networks']}:
        raise DiscoveryError('selected_target_not_on_observed_lan')
    result = {'schema': 1, 'address': str(address), 'port': 22, 'tcp_open': False,
              'ssh_banner_seen': False, 'host_identity_verified': False, 'authenticated': False,
              'changes_applied': False}
    try:
        with connector((str(address), 22), timeout=3) as connection:
            result['tcp_open'] = True
            connection.settimeout(2)
            data = bytearray()
            deadline = time.monotonic() + 2
            try:
                while len(data) < 255 and b'\n' not in data:
                    remaining = deadline - time.monotonic()
                    if remaining <= 0:
                        break
                    connection.settimeout(remaining)
                    chunk = connection.recv(255-len(data))
                    if not chunk:
                        break
                    data.extend(chunk)
            except (TimeoutError, OSError):
                pass
            result['ssh_banner_seen'] = bool(re.match(rb'^SSH-(?:2\.0|1\.99)-[^\r\n]+\r?\n', data))
            result['status'] = 'ssh_banner_seen' if result['ssh_banner_seen'] else 'tcp_open_without_verified_ssh_banner'
    except ConnectionRefusedError:
        result['status'] = 'connection_refused'
    except (TimeoutError, OSError):
        result['status'] = 'connection_unavailable'
    # Banner contents are untrusted; never copy them into agent instructions or reports.
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='action', required=True)
    commands.add_parser('discover')
    selected = commands.add_parser('probe')
    selected.add_argument('--host', required=True)
    selected.add_argument('--confirmed-target', action='store_true', help='Use only after the user has selected and authorized this target; the flag is not itself consent.')
    args = parser.parse_args(argv)
    try:
        if args.action == 'probe':
            if not args.confirmed_target:
                raise DiscoveryError('target_confirmation_required')
            private_ip(args.host)
        inventory = discover()
        result = inventory if args.action == 'discover' else probe(args.host, inventory)
        print(json.dumps(result, ensure_ascii=True))
        return 0
    except DiscoveryError as error:
        print(json.dumps({'status': 'blocked', 'error': str(error), 'authenticated': False, 'changes_applied': False}))
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
