"""Discovery is passive; probing needs a selected local endpoint and never authenticates."""
import contextlib
import importlib.util
import io
import ipaddress
import json
from pathlib import Path
import unittest
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / '.agents/skills/eric-dahao-agent-skill/scripts/discover_target.py'
spec = importlib.util.spec_from_file_location('dahao_discovery', SCRIPT)
discovery = importlib.util.module_from_spec(spec)
spec.loader.exec_module(discovery)


def addr(last):
    return str(ipaddress.IPv4Address(0xC0A80700 + last))


def inventory():
    return discovery.normalize(
        [{'IPAddress': addr(2), 'PrefixLength': 24, 'InterfaceIndex': 7}],
        [{'NextHop': addr(1), 'InterfaceIndex': 7}],
        [{'IPAddress': addr(3), 'State': 'Stale', 'InterfaceIndex': 7}])


class DiscoveryTests(unittest.TestCase):
    def test_filters_own_gateway_broadcast_wrong_interface_and_incomplete(self):
        neighbors = [{'IPAddress': addr(i), 'State': 'Reachable', 'InterfaceIndex': 7}
                     for i in (0, 1, 2, 3, 255)]
        neighbors += [{'IPAddress': addr(4), 'State': 'Incomplete', 'InterfaceIndex': 7},
                      {'IPAddress': addr(5), 'State': 'Reachable', 'InterfaceIndex': 8}]
        result = discovery.normalize(
            [{'IPAddress': addr(2), 'PrefixLength': 24, 'InterfaceIndex': 7}],
            [{'NextHop': addr(1), 'InterfaceIndex': 7}], neighbors)
        self.assertEqual([c['address'] for c in result['candidates']], [addr(3)])
        self.assertFalse(result['remote_connections_made'])
        self.assertFalse(result['discovery_complete'])
        self.assertFalse(result['candidates'][0]['target_confirmed'])

    def test_no_default_interface_returns_no_guessed_network(self):
        result = discovery.normalize([{'IPAddress': addr(2), 'PrefixLength': 24, 'InterfaceIndex': 7}], [], [])
        self.assertEqual(result['networks'], [])
        self.assertEqual(result['candidates'], [])

    def test_windows_reads_only_local_metadata_and_drops_extra_fields(self):
        payload = {'addresses': [{'IPAddress': addr(2), 'PrefixLength': 24, 'InterfaceIndex': 7}],
                   'routes': [{'NextHop': addr(1), 'InterfaceIndex': 7}],
                   'neighbors': [{'IPAddress': addr(3), 'State': 'Reachable', 'InterfaceIndex': 7,
                                  'UntrustedExtra': 'do-not-propagate'}]}
        runner = Mock(return_value=json.dumps(payload))
        with patch.object(discovery.socket, 'create_connection') as connection:
            result = discovery.discover('Windows', runner)
        connection.assert_not_called()
        self.assertEqual(runner.call_count, 1)
        self.assertNotIn('do-not-propagate', json.dumps(result))
        self.assertEqual(len(result['candidates']), 1)

    def test_mac_static_address_and_incomplete_neighbors(self):
        outputs = [f' gateway: {addr(1)}\n interface: en0\n', addr(2),
                   f' inet {addr(2)} netmask 0xffffff00 broadcast {addr(255)}',
                   f'? ({addr(3)}) at 00:00:00:00:00:00 on en0 ifscope\n? ({addr(4)}) at (incomplete) on en0\n']
        runner = Mock(side_effect=outputs)
        result = discovery.discover('Darwin', runner)
        self.assertEqual([c['address'] for c in result['candidates']], [addr(3)])
        self.assertEqual(runner.call_args_list[2].args[0], ['/sbin/ifconfig', 'en0'])
        self.assertNotIn('00:00:00:00:00:00', json.dumps(result))

    def test_malformed_metadata_has_safe_error(self):
        for value in ('not-json', '[]', 'null'):
            with self.subTest(value=value), self.assertRaisesRegex(discovery.DiscoveryError, 'local_inventory_invalid'):
                discovery.discover('Windows', Mock(return_value=value))

    def test_unsupported_controller(self):
        runner = Mock()
        with self.assertRaisesRegex(discovery.DiscoveryError, 'controller_os_not_supported'):
            discovery.discover('Unknown', runner)
        runner.assert_not_called()

    def test_invalid_public_and_loopback_addresses_rejected(self):
        for value in ('localhost', '127.0.0.1', '8.8.8.8', '::1', '-oProxyCommand=anything', 'not-an-address'):
            with self.subTest(value=value), self.assertRaises(discovery.DiscoveryError):
                discovery.private_ip(value)

    def test_cli_requires_confirmation_before_inventory(self):
        with patch.object(discovery, 'discover') as local, contextlib.redirect_stdout(io.StringIO()) as output:
            code = discovery.main(['probe', '--host', addr(3)])
        self.assertEqual(code, 2)
        local.assert_not_called()
        self.assertEqual(json.loads(output.getvalue())['error'], 'target_confirmation_required')

    def test_cli_invalid_host_does_not_run_inventory(self):
        with patch.object(discovery, 'discover') as local, contextlib.redirect_stdout(io.StringIO()):
            code = discovery.main(['probe', '--host', '8.8.8.8', '--confirmed-target'])
        self.assertEqual(code, 2)
        local.assert_not_called()

    def test_self_off_subnet_and_broadcast_do_not_connect(self):
        connector = Mock()
        for host in (addr(2), addr(0), addr(255), str(ipaddress.IPv4Address(0xC0A80803))):
            with self.subTest(host=host), self.assertRaises(discovery.DiscoveryError):
                discovery.probe(host, inventory(), connector)
        connector.assert_not_called()

    def test_fragmented_ssh_banner_is_not_identity_or_authentication(self):
        connection = Mock()
        connection.__enter__ = Mock(return_value=connection)
        connection.__exit__ = Mock(return_value=False)
        connection.recv.side_effect = [b'SSH-', b'2.0-SYNTHETIC\r\n']
        connector = Mock(return_value=connection)
        result = discovery.probe(addr(3), inventory(), connector)
        self.assertTrue(result['ssh_banner_seen'])
        self.assertFalse(result['authenticated'])
        self.assertFalse(result['host_identity_verified'])
        self.assertFalse(result['changes_applied'])
        self.assertNotIn('SYNTHETIC', json.dumps(result))
        connection.send.assert_not_called()
        connection.sendall.assert_not_called()
        connector.assert_called_once_with((addr(3), 22), timeout=3)

    def test_non_ssh_or_incomplete_banner_is_not_ssh_success(self):
        for banner in (b'HTTP/1.0 200 OK\r\n', b'SSH-2.0-incomplete', b''):
            connection = Mock()
            connection.__enter__ = Mock(return_value=connection)
            connection.__exit__ = Mock(return_value=False)
            connection.recv.side_effect = [banner, b'']
            with self.subTest(banner=banner):
                result = discovery.probe(addr(3), inventory(), Mock(return_value=connection))
                self.assertTrue(result['tcp_open'])
                self.assertFalse(result['ssh_banner_seen'])

    def test_connection_failure_is_reported_without_exception_text(self):
        for error in (ConnectionRefusedError('private detail'), TimeoutError('private detail')):
            result = discovery.probe(addr(3), inventory(), Mock(side_effect=error))
            self.assertFalse(result['tcp_open'])
            self.assertNotIn('private detail', json.dumps(result))

    def test_banner_timeout_is_bounded(self):
        connection = Mock()
        connection.__enter__ = Mock(return_value=connection)
        connection.__exit__ = Mock(return_value=False)
        with patch.object(discovery.time, 'monotonic', side_effect=[0, 3]):
            result = discovery.probe(addr(3), inventory(), Mock(return_value=connection))
        connection.recv.assert_not_called()
        self.assertFalse(result['ssh_banner_seen'])


if __name__ == '__main__':
    unittest.main()
