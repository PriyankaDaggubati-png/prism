# PRISM Topology Digest — Priyanka Daggubati GitHub Portfolio

Source: `~/workspace/your_files/priyanka-github-v2/` (profile README, 12 repo READMEs, all `.txt` lab configs, `BIO.md`, `KEYWORDS.md`, `REPO_DESCRIPTIONS.md`, `SETUP_GUIDE.md`, `FOLDER_STRUCTURE.md`). GitHub account: `PriyankaDaggubati-png` — https://github.com/PriyankaDaggubati-png
Date extracted: 2026-11-25. All values copied exactly from source. Where a value is not stated, this file says "not stated". Nothing is invented. Lab addresses reuse the same documentation and private ranges across repos by design; they are separate labs, not one network.

## Counting method (so the totals below are auditable)

- Devices: every distinct named device / host / VM / AWS resource instance listed in the per-repo tables below, counting the same hostname in a different lab as a separate lab instance. Generic unnamed items (e.g. "Core Switch" in Palo Alto vs FortiGate) are counted once per repo.
- Interfaces with IPs: every distinct interface + IP assignment, deduplicated where the same device + interface + IP repeats across files in the same repo (e.g. EDGE-R1 Gi0/0 in `router-baseline.txt` and `acl-nat.txt` counts once).
- VLANs: 4 unique VLAN IDs exist in the whole source (10, 20, 30, 99). VLAN definitions (ID + name in a file) total 28 across all files.
- Rules: ACL lines + firewall security/NAT policies + UFW/iptables rules + AWS security-group ingress rules + Splunk searches, as itemised per repo. NAT rules are also subtotalled separately.

## Totals

- Devices / hosts / VMs / AWS resources: 62
- Interfaces with IP addresses: 47
- Unique VLAN IDs: 4 (10 SALES, 20 HR, 30 GUEST, 99 MANAGEMENT); 28 VLAN definitions across files
- ACL / firewall / NAT / host-firewall / security-group / Splunk rules: 26 (of which NAT rules: 3)
- DHCP pools: 2 (both in cisco-routing-switching)
- VRRP groups: 3 (VRRP 10, 20, 30)
- EtherChannel / LACP groups: Po1 and Po2 in enterprise Lab 3, plus Port-channel1 in cisco-routing-switching stp-etherchannel (3 groups named in configs)
- STP instances: rapid-pvst in enterprise Lab 3 (priorities 4096 / 8192 / 12288) and in cisco-routing-switching (root primary, no numeric priority stated)
- AWS resources named: VPC lab-vpc 10.0.0.0/16, second VPC 10.1.0.0/16, 4 subnets, IGW lab-igw, NAT Gateway lab-nat, 2 route tables, Security Group lab-web-sg, VPC peering, Transit Gateway lab-tgw, VPN Gateway lab-vgw, Customer Gateway 203.0.113.10, ALB lab-alb, EC2 lab-app (t2.micro), S3 buckets lab-bucket-0123456789 and lab-trail-bucket-0123456789, IAM user lab-user, IAM role lab-ec2-role, CloudTrail trail lab-trail, CloudWatch alarm lab-failed-logins

## Person and production experience (the only production content)

- Name: Sri Sai Priyanka Daggubati. GitHub: PriyankaDaggubati-png. Education: B.Tech, Computer Science and Engineering, Jawaharlal Nehru Technological University, Hyderabad, 2018 to 2022, CGPA 6.74.
- BIO.md: "Network Engineer with 3+ years in enterprise networking, now building labs in security, Linux, and AWS cloud networking."
- Production job 1: Provin Tech Pvt Ltd, Hyderabad — Network Engineer, Associate Consultant, December 2025 to June 2026. Work: Wireshark captures on live traffic (protocol errors, latency, packet drops); Inter-VLAN routing through SVIs and Router-on-a-Stick, OSPF states; VRRP redundancy; DHCP addressing including DORA, static routes, ACLs; ServiceNow and Jira Incidents and Request Items (RITMs), diagnostic logs to L2/L3; rack cabling, hardware maintenance, network upgrades.
- Production job 2: TeamLease Services Limited, Bangalore — Network Engineer, Partner Consultant, May 2022 to July 2025 (profile README dates; see Gaps and ambiguities for a conflicting date in the task brief). Work: live traffic, device health, uptime, bandwidth monitoring; L1 fixes (connection drops, internet drops, IP conflicts, slow links, performance bottlenecks) within SLA; switch ports, VLANs, trunk/access modes, basic port security, unused ports closed; Cisco routers 1900 and 4300 series, switches 2960 and 3850 series; core/access switches and edge routers; rack mounting, patch panel termination, structured cabling; regular Cisco IOS config backups; weekly/monthly network health, bandwidth and SLA reports.
- Production skills (profile README, Enterprise Networking Skills): TCP/IP and OSI, IPv4 and IPv6, subnetting and VLSM, OSPF and EIGRP, static and default routing, VRRP and gateway redundancy, VLANs and Inter-VLAN routing, trunking and access ports, STP and RSTP, EtherChannel with LACP and PAgP, DNS, DHCP, ARP, ICMP, NAT and ACLs, Cisco IOS on 1900/4300 routers and 2960/3850 switches, network monitoring, Wireshark, GNS3 and Cisco Packet Tracer, ServiceNow and Jira.
- Contact for site footer: email srisaipriyankad@gmail.com; LinkedIn www.linkedin.com/in/sri-sai-priyanka-daggubati-54ab45216. No phone number is included in this file by instruction.

## Shared lab addressing (reused across repos, not one network)

- 192.168.10.0/24 is the LAN in enterprise labs, cisco-routing-switching, Palo Alto trust LAN, FortiGate internal LAN, cybersecurity home lab, Linux lab, SIEM lab and automation lab, with different hosts per lab.
- 192.168.20.0/24 is HR VLAN 20 in enterprise/cisco labs and also the branch LAN 192.168.20.0/24 in the Palo Alto and FortiGate VPN labs.
- 192.168.30.0/24 is Guest VLAN 30 and also the Palo Alto guest zone / FortiGate guest LAN.
- 203.0.113.0/30 documentation range: WAN 203.0.113.2, gateway 203.0.113.1, branch peer 203.0.113.10. Used identically in cisco-routing-switching, Palo Alto and FortiGate.
- 192.168.99.0/24 is the management network in cisco-routing-switching (VLAN 99), the Palo Alto management interface, the FortiGate SSL VPN pool and the automation REST controller is not on it (see per-repo notes).
- AWS lab CIDRs are distinct from the on-prem labs: VPC 10.0.0.0/16, second VPC 10.1.0.0/16, on-prem VPN peer network 192.168.10.0/24.

---

## 1. enterprise-networking-labs — LAB WORK

Status in source: "three labs I built and tested in GNS3", "finished labs with full configs". Platform: GNS3, Cisco IOS router and switch images. Hardware named: Cisco 1900 and 4300 series routers, 2960 and 3850 series switches. This is lab work that mirrors her production skills; it is not presented as a production network.

### Lab 1 — Multi-area OSPF with EIGRP

Goal: OSPF in two areas, EIGRP site connected through redistribution on R2.

Topology (README diagram): R1 — R2 — R3, R2 — R4. R1 Area 0, R2 Area 0 + 1 (ABR), R3 Area 1, R4 EIGRP 100 only.

| Device | Interface | IP / Mask | Description |
|---|---|---|---|
| R1 | Loopback0 | 1.1.1.1 255.255.255.255 | Router ID 1.1.1.1 |
| R1 | GigabitEthernet0/0 | 10.0.12.1 255.255.255.252 | Link to R2 |
| R1 | GigabitEthernet0/1 | 192.168.10.1 255.255.255.0 | LAN 192.168.10.0/24 |
| R2 | Loopback0 | 2.2.2.2 255.255.255.255 | Router ID 2.2.2.2 |
| R2 | GigabitEthernet0/0 | 10.0.12.2 255.255.255.252 | Link to R1, Area 0 |
| R2 | GigabitEthernet0/1 | 10.0.23.2 255.255.255.252 | Link to R3, Area 1 |
| R2 | GigabitEthernet0/2 | 10.0.24.2 255.255.255.252 | Link to R4, EIGRP |
| R3 | Loopback0 | 3.3.3.3 255.255.255.255 | Router ID 3.3.3.3 |
| R3 | GigabitEthernet0/0 | 10.0.23.3 255.255.255.252 | Link to R2, Area 1 |
| R3 | GigabitEthernet0/1 | 192.168.30.1 255.255.255.0 | LAN 192.168.30.0/24 |
| R4 | Loopback0 | 4.4.4.4 255.255.255.255 | Router ID not stated as OSPF ID; EIGRP router |
| R4 | GigabitEthernet0/0 | 10.0.24.4 255.255.255.252 | Link to R2, EIGRP |
| R4 | GigabitEthernet0/1 | 192.168.40.1 255.255.255.0 | LAN 192.168.40.0/24 |

Links: R1 Gi0/0 — R2 Gi0/0 (10.0.12.0/30); R2 Gi0/1 — R3 Gi0/0 (10.0.23.0/30); R2 Gi0/2 — R4 Gi0/0 (10.0.24.0/30).

Routing:
- OSPF process 1 on R1, R2, R3. R1 router-id 1.1.1.1, passive-interface Gi0/1, networks 10.0.12.0 0.0.0.3 area 0, 192.168.10.0 0.0.0.255 area 0, 1.1.1.1 0.0.0.0 area 0.
- R2 router-id 2.2.2.2, networks 10.0.12.0 0.0.0.3 area 0, 10.0.23.0 0.0.0.3 area 1, 2.2.2.2 0.0.0.0 area 0; `redistribute eigrp 100 subnets`.
- R3 router-id 3.3.3.3, passive-interface Gi0/1, networks 10.0.23.0 0.0.0.3 area 1, 192.168.30.0 0.0.0.255 area 1, 3.3.3.3 0.0.0.0 area 1.
- EIGRP AS 100 on R2 and R4. R2: network 10.0.24.0 0.0.0.3, network 2.2.2.2 0.0.0.0, `redistribute ospf 1 metric 10000 100 255 1 1500`, `no auto-summary`. R4: network 10.0.24.0 0.0.0.3, network 192.168.40.0 0.0.0.255, network 4.4.4.4 0.0.0.0, `no auto-summary`.
- No static routes, no default route, no ACLs, no NAT in Lab 1. No VLANs in Lab 1.
- Checks: `show ip ospf neighbor` (R1, R2, R3); `show ip route ospf` on R3; `show ip eigrp neighbors` (R2, R4); ping 192.168.30.1 from R1; ping 192.168.40.1 from R3.

### Lab 2 — Inter-VLAN routing with SVI and Router-on-a-Stick, plus VRRP

Goal: route between VLANs two ways (Router-on-a-Stick, then SVI on a multilayer switch), plus VRRP gateway redundancy. Part A and Part B are alternatives: "build one at a time".

VLANs (both Part A SW1 and Part B SW-CORE): 10 SALES, 20 HR, 30 GUEST.

Part A — Router-on-a-Stick with VRRP:

| Device | Interface / subinterface | IP / Mask | VRRP group | Virtual IP | Priority | Role |
|---|---|---|---|---|---|---|
| R1 (master) | GigabitEthernet0/0 | no ip address | — | — | — | Trunk to SW1 |
| R1 | GigabitEthernet0/0.10, dot1Q 10 | 192.168.10.1 255.255.255.0 | VRRP 10 | 192.168.10.254 | 120, preempt | Master |
| R1 | GigabitEthernet0/0.20, dot1Q 20 | 192.168.20.1 255.255.255.0 | VRRP 20 | 192.168.20.254 | 120, preempt | Master |
| R1 | GigabitEthernet0/0.30, dot1Q 30 | 192.168.30.1 255.255.255.0 | VRRP 30 | 192.168.30.254 | 120, preempt | Master |
| R2 (backup) | GigabitEthernet0/0 | no ip address | — | — | — | Trunk to SW1 |
| R2 | GigabitEthernet0/0.10, dot1Q 10 | 192.168.10.2 255.255.255.0 | VRRP 10 | 192.168.10.254 | 100, preempt | Backup |
| R2 | GigabitEthernet0/0.20, dot1Q 20 | 192.168.20.2 255.255.255.0 | VRRP 20 | 192.168.20.254 | 100, preempt | Backup |
| R2 | GigabitEthernet0/0.30, dot1Q 30 | 192.168.30.2 255.255.255.0 | VRRP 30 | 192.168.30.254 | 100, preempt | Backup |

VRRP details not stated: virtual MAC, authentication, timers, track object/interface. All three groups use preempt on both routers.

SW1 (switch-access.txt, hostname SW1):
- Trunk: interface range GigabitEthernet0/0-1, trunk to R1 and R2, dot1q, mode trunk, allowed VLAN 10,20,30.
- Access VLAN 10: GigabitEthernet1/0-3, mode access, access VLAN 10, spanning-tree portfast.
- Access VLAN 20: GigabitEthernet1/4-7, mode access, access VLAN 20, spanning-tree portfast.
- Access VLAN 30: GigabitEthernet2/0-1, mode access, access VLAN 30, spanning-tree portfast.
- No IP address, no SVI, no default gateway stated for SW1 in this file.

Part B — SVI routing on multilayer switch SW-CORE (switch-core-svi.txt):
- `ip routing` enabled.
- VLAN 10 SALES, 20 HR, 30 GUEST (same names as Part A).
- Vlan10 192.168.10.3 255.255.255.0; Vlan20 192.168.20.3 255.255.255.0; Vlan30 192.168.30.3 255.255.255.0.
- GigabitEthernet0/0 downlink trunk to SW1, dot1q, mode trunk, allowed VLAN 10,20,30.
- No VRRP on SW-CORE. No static/default route stated.
- Checks: `show ip route` on R1; `show vlan brief` on SW1; `show vrrp brief` on R1 and R2 (R1 master); ping VLAN 10 host to VLAN 20 host; shut R1–SW1 link, ping VIP, watch R2 take over.

### Lab 3 — STP, RSTP, and EtherChannel (LACP)

Goal: triangle of three switches, rapid STP with one link blocked, other links bundled into LACP EtherChannels.

| Device | STP mode | STP priority (VLAN 10,20,30) | Role in README |
|---|---|---|---|
| SW1 | rapid-pvst | 4096 | Root bridge |
| SW2 | rapid-pvst | 8192 | not stated |
| SW3 | rapid-pvst | 12288 | not stated |

VLANs on all three switches: 10 SALES, 20 HR, 30 GUEST. No IP addresses / SVIs stated on any Lab 3 switch.

Links / EtherChannels:
- SW1 Gi0/0-1 — SW2 Gi0/0-1: Port-channel1 (Po1), LACP mode active (`channel-group 1 mode active`), trunk dot1q, allowed VLAN 10,20,30. Named "EtherChannel to SW2" on SW1 and "EtherChannel to SW1" on SW2.
- SW2 Gi0/2-3 — SW3 Gi0/0-1: Port-channel2 (Po2), LACP mode active (`channel-group 2 mode active`), trunk dot1q, allowed VLAN 10,20,30.
- SW1 Gi0/2 — SW3 Gi0/2: single trunk link (not bundled), dot1q, allowed VLAN 10,20,30. This is the link STP blocks in the triangle (specific blocked port not stated in configs; README says "find the port STP put into blocking state").
- Checks: `show spanning-tree vlan 10` (SW1 root); `show etherchannel summary` (Po1 and Po2 in use); `show interfaces status`; shut one member of Po1, channel stays up on the other member.

---

## 2. cisco-routing-switching — LAB WORK

Status in source: "Baseline configs I reuse for Cisco switches and routers", "They match the gear I work with, Cisco 2960 and 3850 series switches and 1900 and 4300 series routers." Interface names follow GNS3 IOSvL2 and IOSv naming; a real 2960 numbers ports differently. Lab work / reusable baselines, not a single production network. DHCP pools hand out 7-day leases (README).

### Devices and interfaces

| File | Hostname | Interface | IP / Mask | Notes |
|---|---|---|---|---|
| switch-baseline.txt | ACCESS-SW | Vlan99 | 192.168.99.10 255.255.255.0 | Management VLAN 99 |
| switch-baseline.txt | ACCESS-SW | — | default gateway 192.168.99.1 | `ip default-gateway 192.168.99.1` |
| router-baseline.txt / acl-nat.txt | EDGE-R1 | GigabitEthernet0/0 | 203.0.113.2 255.255.255.252 | WAN link to provider, NAT outside |
| router-baseline.txt / acl-nat.txt | EDGE-R1 | GigabitEthernet0/1 | 192.168.10.1 255.255.255.0 | LAN, NAT inside |
| ios-backup-restore.txt | EDGE-R1 (implied) | TFTP server | 192.168.10.5 | Backup/restore target, not an interface on the router |
| stp-etherchannel.txt | DIST-SW | — | not stated | No IP stated |
| port-security.txt | ACCESS-SW | — | not stated | No IP stated |

Static / default routes: `ip route 0.0.0.0 0.0.0.0 203.0.113.1` in router-baseline.txt only. No other static routes. No routing protocol in this repo.

### VLANs

| File | VLAN ID | Name |
|---|---|---|
| switch-baseline.txt | 10 | SALES |
| switch-baseline.txt | 20 | HR |
| switch-baseline.txt | 30 | GUEST |
| switch-baseline.txt | 99 | MANAGEMENT |
| stp-etherchannel.txt | 10 | SALES |
| stp-etherchannel.txt | 20 | HR |
| stp-etherchannel.txt | 30 | GUEST |

switch-baseline.txt ports: Gi0/0-1 uplink trunks, dot1q, allowed VLAN 10,20,30,99. Gi1/0-5 access VLAN 10 portfast; Gi1/6-11 access VLAN 20 portfast; Gi1/12-17 access VLAN 30 portfast.

### STP and EtherChannel (stp-etherchannel.txt, DIST-SW)

- `spanning-tree mode rapid-pvst`; `spanning-tree vlan 10,20,30 root primary` (no numeric priority stated).
- Gi0/0-1 EtherChannel LACP to core, `channel-group 1 mode active`, trunk dot1q, allowed VLAN 10,20,30; Port-channel1 same description.

### Port security (port-security.txt, ACCESS-SW)

- Gi1/0-11 access ports: `switchport port-security`, maximum 2, violation restrict, mac-address sticky.
- Gi1/12-23 unused ports: access mode, shutdown.
- No MAC addresses stated. No violation count or aging stated.

### ACLs and NAT (acl-nat.txt, EDGE-R1)

Standard ACL 10 (NAT source list):
- `access-list 10 permit 192.168.10.0 0.0.0.255`
- `access-list 10 permit 192.168.20.0 0.0.0.255`
- `access-list 10 permit 192.168.30.0 0.0.0.255`

Extended ACL 100 (applied inbound on Gi0/0, `ip access-group 100 in`):
- `access-list 100 deny tcp any any eq 23` (Telnet)
- `access-list 100 deny tcp any any eq 445` (SMB)
- `access-list 100 permit ip any any`

NAT: `ip nat inside source list 10 interface GigabitEthernet0/0 overload` (PAT/NAT overload, inside hosts to WAN interface address 203.0.113.2). NAT rule count in this repo: 1.

### DHCP (dhcp.txt, EDGE-R1)

Exclusions: `ip dhcp excluded-address 192.168.10.1 192.168.10.10`; `ip dhcp excluded-address 192.168.20.1 192.168.20.10`.

| Pool | Network / Mask | Default router | DNS servers | Lease |
|---|---|---|---|---|
| LAN-10 | 192.168.10.0 255.255.255.0 | 192.168.10.1 | 8.8.8.8, 8.8.4.4 | 7 (README: 7 days) |
| LAN-20 | 192.168.20.0 255.255.255.0 | 192.168.20.1 | 8.8.8.8, 8.8.4.4 | 7 (README: 7 days) |

No pool for VLAN 30 / 192.168.30.0 stated. No DHCP relay, no option other than default-router and DNS stated.

### IOS backup / restore (ios-backup-restore.txt)

- `copy running-config startup-config`; backup running config to TFTP 192.168.10.5, destination filename `EDGE-R1-backup-2026-11-25`; backup startup config to same TFTP host, filename `EDGE-R1-startup-2026-11-25`; restore with `copy tftp running-config` from 192.168.10.5, source `EDGE-R1-backup-2026-11-25`; then `copy running-config startup-config`. Verification: `show running-config`, `show startup-config`.

---

## 3. palo-alto-firewall-labs — CURRENTLY LEARNING (lab template, not finished)

Status in source, verbatim in substance: "Lab template to be completed. This repo is a hands-on lab plan for learning Palo Alto firewalls. It is not production experience and it is not a completed project. No lab in this repo is finished yet." Platform: Palo Alto PA-VM, PAN-OS, GNS3 or EVE-NG, trial VM. LAN switches: Cisco 2960 and 3850.

Architecture: Internet → Palo Alto PA-VM → Core Switch → VLAN 10 Sales, VLAN 20 HR, VLAN 30 Guest; PA-VM → Management PC.

### Interfaces, zones, routes

| Interface | Zone | IP | Notes |
|---|---|---|---|
| ethernet1/1 | untrust | 203.0.113.2/30 | WAN, gateway 203.0.113.1 |
| ethernet1/2 | trust | 192.168.10.1/24 | LAN |
| ethernet1/3 | guest | 192.168.30.1/24 | Guest LAN |
| management (dedicated management interface) | not stated | 192.168.99.1/24 | Management |

Branch site for VPN lab: peer 203.0.113.10, LAN 192.168.20.0/24. VLAN 20 HR is named in the architecture diagram but no Palo Alto interface for 192.168.20.0/24 is stated (it is the remote branch LAN, not a local interface).

Default route: virtual router `default`, interfaces ethernet1/1, ethernet1/2, ethernet1/3; static route `Default-Route`, destination 0.0.0.0/0, nexthop 203.0.113.1, interface ethernet1/1. No other routes stated.

### Security rules (rulebase security)

| Rule | From | To | Source | Destination | Application / Service | Action |
|---|---|---|---|---|---|---|
| Allow-Web | trust | untrust | any | any | web-browsing / application-default | allow |
| Allow-DNS | trust | untrust | any | any | dns / application-default | allow |
| Block-Guest-to-Trust | guest | trust | any | any | any / any | deny |
| Allow-VPN-Traffic | trust | untrust | 192.168.10.0/24 | 192.168.20.0/24 | any / any | allow |

Rule order not stated beyond "Palo Alto checks rules top to bottom" in troubleshooting notes.

### NAT

- Outbound-NAT: from trust to untrust, source 192.168.10.0/24, destination any, source-translation dynamic-ip-and-port interface-address, interface ethernet1/1. NAT rule count: 1. No NAT rule for guest stated.

### IPsec VPN

- IKE gateway HQ-GW: pre-shared key `<redacted>` in source, IKEv2, DPD enable, peer-address 203.0.113.10, local-address interface ethernet1/1, local-address IP 203.0.113.2.
- IPsec tunnel HQ-Tunnel: auto-key, IKE gateway HQ-GW, proxy-id local 192.168.10.0/24, remote 192.168.20.0/24, protocol any. Phase 1 / phase 2 proposals not stated (unlike FortiGate).
- Verification example host: 192.168.10.5 (test policy match to 203.0.113.50, TCP 443; session filter source 192.168.10.5). That host IP is an example test address, not a named device.
- Troubleshooting scenarios (5): no rule match (check rule order); ping works but no browsing (check NAT + web-browsing App-ID, not just port 80); VPN tunnel down (peer address, pre-shared key, IKE phase 1 proposal); phase 1 up but no traffic (proxy ID subnets, security rule for VPN traffic); commit fails (read commit error, fix named object).

---

## 4. fortigate-security-labs — CURRENTLY LEARNING (lab template, not finished)

Status in source: "Lab template to be completed. This repo is a hands-on lab plan for learning Fortinet FortiGate firewalls. It is not production experience and it is not a completed project. No lab in this repo is finished yet." Platform: FortiGate VM, FortiOS, GNS3 or EVE-NG, trial VM. LAN switches: Cisco 2960 and 3850.

Architecture: Internet → FortiGate VM → Core Switch → VLAN 10 Sales, VLAN 20 HR, VLAN 30 Guest; FortiGate → Branch Site over IPsec.

### Interfaces and routes

| Interface | IP / Mask | allowaccess |
|---|---|---|
| wan1 | 203.0.113.2 255.255.255.252 | ping |
| internal | 192.168.10.1 255.255.255.0 | ping, https, ssh |
| guest | 192.168.30.1 255.255.255.0 | ping |

Branch site: 203.0.113.10, LAN 192.168.20.0/24. SSL VPN users: pool 192.168.99.0/24 (pool name SSLVPN_TUNNEL_ADDR1).

Static routes:
- Route 1 (edit 1): gateway 203.0.113.1, device wan1 (default route; destination not stated in the block, implied 0.0.0.0/0).
- Route 2 (edit 2): destination 192.168.20.0 255.255.255.0, device To-Branch (IPsec tunnel interface).

### Firewall policies

| Policy ID | Name | Source interface | Destination interface | Source addr | Destination addr | Service | Schedule | NAT | Action |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Allow-LAN-to-WAN | internal | wan1 | all | all | ALL | always | enable | accept |
| 2 | Block-Guest-to-LAN | guest | internal | all | all | ALL | always | not stated | deny |

No policy for guest to WAN stated. No policy for SSL VPN interface stated (troubleshooting notes say to check it).

### IPsec VPN

- Phase 1 To-Branch: interface wan1, peertype any, proposal aes256-sha256, remote-gw 203.0.113.10, psksecret `<redacted>` in source.
- Phase 2 To-Branch-P2: phase1name To-Branch, proposal aes256-sha256, src-subnet 192.168.10.0 255.255.255.0, dst-subnet 192.168.20.0 255.255.255.0.
- No IKE version stated. No DPD stated.

### SSL VPN

- `config vpn ssl settings`: servercert Fortinet_Factory, tunnel-ip-pools SSLVPN_TUNNEL_ADDR1, source-interface wan1, source-address all. Portal name, user/group, authentication method not stated. Test user is to be created in implementation steps, name not stated.

Troubleshooting scenarios (5): host cannot reach internet (matching allow rule + NAT on); VPN tunnel down (peer address, pre-shared key, phase 1 proposal); phase 1 up but phase 2 down (phase 2 proposal, source/destination subnets); SSL VPN connects but reaches nothing (portal settings, firewall policy for SSL VPN interface); policy change has no effect (policy order, first match wins).

---

## 5. cybersecurity-home-lab — CURRENTLY LEARNING (lab template, not finished)

Status in source: "Lab template to be completed. This repo is a plan for a home security lab built from virtual machines on one host. It is not production experience and it is not a completed project. No exercise in this repo is finished yet." Platform: VirtualBox or VMware, host-only network.

Architecture: Home Router → Lab Firewall → Lab Switch → Kali Linux Attacker, Vulnerable Target 1, Vulnerable Target 2, Detection Box (Suricata and Wazuh).

### Lab topology

| Host / device | IP | Role / software |
|---|---|---|
| Lab network | 192.168.10.0/24 | Fully separate from home network; lab hosts reach internet only for updates, via lab firewall |
| Kali Linux attacker | 192.168.10.10 | Attacker, Nmap |
| Metasploitable 2 (Vulnerable Target 1) | 192.168.10.20 | Vulnerable target |
| DVWA (Vulnerable Target 2) | 192.168.10.30 | Vulnerable target, web app |
| Detection box | 192.168.10.40 | Suricata and Wazuh |
| Lab Firewall | not stated | Between lab switch and home router |
| Home Router | not stated | Upstream, not a lab host |

No VLANs, no routing protocol, no static routes, no firewall rules with numbers stated. No gateway IP stated for the lab network.

Tools: Kali Linux, Metasploitable 2, DVWA, Nmap, Nessus Essentials, Suricata, Snort, Wazuh, Wireshark, TCPdump, VirtualBox/VMware, OWASP Top 10, MITRE ATT&CK.

Commands / examples:
- `nmap -sV -sC 192.168.10.0/24`; `nmap -A -T4 192.168.10.20`; `nmap -sU --top-ports 20 192.168.10.20`
- `suricata -c /etc/suricata/suricata.yaml -i eth0`; `suricata-update`; `tail -f /var/log/suricata/fast.log`
- `snort -T -c /etc/snort/snort.conf -i eth0`; `snort -A console -c /etc/snort/snort.conf -i eth0`
- `tcpdump -i eth0 -n -w lab-capture.pcap host 192.168.10.20`
- Wazuh all-in-one install: `curl -sO https://packages.wazuh.com/4.7/wazuh-install.sh` then `bash wazuh-install.sh -a` (on detection box)

Exercises (5): 1 full Nmap scan, list open ports and services; 2 same scan while Suricata watches, match alerts to scans; 3 Nessus Essentials scan against one target, fix one finding; 4 one OWASP Top 10 item on DVWA, write detection in logs; 5 one MITRE ATT&CK technique, write what detection box saw.

MITRE ATT&CK study notes (5 tactics): Reconnaissance (port scanning/service discovery); Initial access (brute force logins); Discovery (internal scanning from compromised host); Command and control (DNS to strange names, long-running connections); Exfiltration (large uploads).

OWASP Top 10 study notes (10 items): Broken access control; Cryptographic failures; Injection; Insecure design; Security misconfiguration; Vulnerable components; Authentication failures; Software integrity failures; Logging failures; Server-side request forgery.

Incident response steps (6): Prepare; Detect; Contain; Eradicate; Recover; Learn.

Rules: scan only inside the lab; keep vulnerable targets off home network and internet; weak passwords only inside lab, never reused; snapshot every VM before each exercise.

---

## 6. linux-administration-labs — CURRENTLY LEARNING (lab template, not finished)

Status in source: "Lab template to be completed. This repo is a hands-on lab plan for learning Linux administration. It is not production experience and it is not a completed project. No lab in this repo is finished yet." Distros: Ubuntu, Kali Linux, Red Hat fundamentals.

Architecture: Laptop → Ubuntu Server VM (SSH/SCP, web service, UFW/iptables, system logs); Laptop → Kali Linux VM.

### Hosts and services

| Host | IP | Network | Services / role |
|---|---|---|---|
| Ubuntu Server VM | 192.168.10.50 | 192.168.10.0/24 | SSH, small web service (nginx), UFW, iptables |
| Kali Linux VM | 192.168.10.10 | 192.168.10.0/24 | Attacker / client for exercises; same IP as Kali in cybersecurity-home-lab and SIEM lab, separate lab context |

No gateway, DNS, VLAN, routing protocol or static route stated. No hostname for either VM stated beyond the distro names.

Users / permissions (examples): user `priya`, `sudo useradd -m priya`, `sudo passwd priya`, `sudo usermod -aG sudo priya`; `chmod 750 /home/priya/scripts`; `chown priya:priya /home/priya/scripts`; `ls -l /home/priya/scripts`.

Packages / services: `sudo apt update`, `sudo apt install -y nginx` (Ubuntu); `sudo dnf install -y nginx` (Red Hat); `systemctl start/stop/status/enable nginx`; logs `journalctl -u nginx --since today`, `journalctl -u ssh -f`.

SSH / SCP: `scp backup.sh priya@192.168.10.50:/home/priya/scripts/`; `ssh priya@192.168.10.50`; `ssh-keygen -t ed25519`; `ssh-copy-id priya@192.168.10.50`.

Cron: `0 2 * * * /home/priya/scripts/backup.sh` (nightly 2 AM backup). Backup script `backup.sh` copies `/etc/ssh/sshd_config` and `/etc/nginx/nginx.conf` to `/var/backups/configs` with date suffix `$(date +%Y%m%d)`, filename `<basename>.<DATE>.bak`; `chmod +x backup.sh`, `./backup.sh`.

Firewall rules:
- UFW: `ufw allow 22/tcp`, `ufw allow 80/tcp`, `ufw enable`, `ufw status verbose`. (2 allow rules.)
- iptables: `iptables -A INPUT -p tcp --dport 22 -j ACCEPT`; `iptables -A INPUT -p tcp --dport 80 -j ACCEPT`; `iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT`; `iptables -P INPUT DROP`; `iptables -L -n -v`. (3 ACCEPT rules + default DROP policy.)
- No NAT, no forwarding rules stated.

Capture: `tcpdump -i eth0 -n host 192.168.10.10`; `tcpdump -i any port 53 -c 20`.

Troubleshooting scenarios (5): SSH login fails (service, firewall port 22, key location); service will not start (journalctl); cron never runs (cron service, exact script path); web page does not load (service, firewall, `ss` listening ports); file cannot be written (owner/permissions, `ls -l`).

---

## 7. aws-cloud-networking — CURRENTLY LEARNING (lab template, not finished)

Status in source: "Lab template to be completed. This repo is a hands-on lab plan for learning AWS networking. It is not production experience and it is not a completed project. No lab in this repo is finished yet." Region: us-east-1. Account: free tier / personal AWS account (account ID not stated except placeholder 123456789012 in the companion AWS security repo).

Architecture: Internet → Internet Gateway → Public Subnet A / B → NAT Gateway → Private Subnet A / B → EC2 App Server; Public Subnet → Application Load Balancer → EC2 App Server; Private Subnet → Transit Gateway → Second VPC and Site-to-Site VPN.

### VPC and subnets

| Resource | Name / ID in source | CIDR / AZ |
|---|---|---|
| VPC | lab-vpc, vpc-0123456789abcdef0 (example ID) | 10.0.0.0/16, us-east-1 |
| Public subnet A | lab-public-a | 10.0.1.0/24, us-east-1a |
| Public subnet B | lab-public-b (name from topology; no CLI line for this subnet in source) | 10.0.2.0/24, us-east-1b |
| Private subnet A | lab-private-a | 10.0.11.0/24, us-east-1a |
| Private subnet B | lab-private-b (name from topology; no CLI line for this subnet in source) | 10.0.12.0/24, us-east-1b |
| Second VPC | not named; vpc-0123456789abcdef1 (example peer ID) | 10.1.0.0/16 |
| On-premises lab network (VPN peer) | not stated | 192.168.10.0/24, customer gateway 203.0.113.10 |

Note: the CLI examples create only public-a and private-a explicitly; public-b and private-b appear in the topology list and architecture only. Subnet IDs in CLI examples are all the placeholder `subnet-0123456789abcdef0` / `subnet-0123456789abcdef1` (repeated, not distinct real IDs). VPC IDs are likewise placeholders.

### Gateways, route tables, load balancer

- Internet Gateway: lab-igw, igw-0123456789abcdef0 (example ID), attached to lab-vpc.
- NAT Gateway: lab-nat, nat-0123456789abcdef0 (example ID), in a public subnet (subnet ID in example is the placeholder; which public subnet is not distinguished), with an Elastic IP eipalloc-0123456789abcdef0 (example ID).
- Public route table lab-public-rt, rtb-0123456789abcdef0 (example ID): route 0.0.0.0/0 → igw-0123456789abcdef0; associated with a public subnet (placeholder subnet ID).
- Private route table lab-private-rt, rtb-0123456789abcdef1 (example ID): route 0.0.0.0/0 → nat-0123456789abcdef0. Association to private subnets is described in steps but no associate command for the private table is shown in the examples.
- No NACL rules stated (NACLs named as a topic only; no rule numbers, ports or CIDRs given).
- No VPC Flow Logs rule detail beyond enabling (see below).

### Security Groups

- lab-web-sg, sg-0123456789abcdef0 (example ID), description "Lab web server group", VPC lab-vpc.
- Ingress rule 1: TCP port 80, CIDR 0.0.0.0/0.
- Ingress rule 2: TCP port 22, CIDR 203.0.113.5/32 (own address; 203.0.113.5 is an example address, not a named host).
- Egress rules: not stated. No other security groups stated.

### EC2

- EC2 instance lab-app: AMI ami-0123456789abcdef0 (example ID), instance type t2.micro, subnet placeholder (private subnet in text), security groups sg-0123456789abcdef0. No private/public IP stated. No key pair, no second instance stated (load balancer targets are not enumerated).

### VPC peering, Transit Gateway, VPN, load balancer, DNS, flow logs

- VPC peering: `create-vpc-peering-connection` vpc-0123456789abcdef0 → peer vpc-0123456789abcdef1, accept pcx-0123456789abcdef0 (example ID). Peering route entries on both sides are described in steps but no CIDR route commands are shown.
- Transit Gateway: lab-tgw, tgw-0123456789abcdef0 (example ID), description "lab-tgw"; VPC attachment `create-transit-gateway-vpc-attachment` for lab-vpc with one placeholder subnet ID. Second VPC attachment is described in steps but no second attachment command is shown.
- Site-to-Site VPN: Customer Gateway, BGP ASN 65000, public IP 203.0.113.10, type ipsec.1, ID cgw-0123456789abcdef0 (example); VPN Gateway lab-vgw, vgw-0123456789abcdef0 (example), type ipsec.1, attached to lab-vpc; VPN connection `create-vpn-connection`, type ipsec.1, customer-gateway cgw-0123456789abcdef0, vpn-gateway vgw-0123456789abcdef0. Pre-shared key, tunnel IPs, BGP details not stated.
- Application Load Balancer: lab-alb, internet-facing, type application, subnets placeholder IDs (two), security groups sg-0123456789abcdef0. Listener, target group, health check port/path not stated.
- Route 53: a record for the load balancer is in the steps; hosted zone, record name and type not stated.
- VPC Flow Logs: `create-flow-logs`, resource-type VPC, resource vpc-0123456789abcdef0, traffic-type ALL, log-destination-type cloud-watch-logs, log-group-name lab-flow-logs.
- Terraform lab: same VPC in `main.tf` (VPC 10.0.0.0/16, DNS hostnames enabled; public_a 10.0.1.0/24 us-east-1a; private_a 10.0.11.0/24 us-east-1a; IGW lab-igw; public route table with 0.0.0.0/0 → IGW). No NAT gateway, private route table, security group or EC2 in the Terraform block shown.

Troubleshooting scenarios (5): private instance no internet (private route table → NAT gateway, NAT in public subnet with Elastic IP); public instance no internet (route to IGW, public IP present); peering fails (route tables both sides, CIDRs must not overlap); VPN down (customer gateway address, pre-shared key, VPN gateway attachment); load balancer no healthy targets (security group allows health check port, targets running).

---

## 8. aws-cloud-security — CURRENTLY LEARNING (lab template, not finished)

Status in source: "Lab template to be completed. This repo is a hands-on lab plan for learning AWS security. It is not production experience and it is not a completed project. No lab in this repo is finished yet." Region us-east-1, one AWS account for the lab.

### Lab topology

- One VPC 10.0.0.0/16 with a public and a private subnet (subnet CIDRs not stated in this repo; see aws-cloud-networking for 10.0.1.0/24, 10.0.2.0/24, 10.0.11.0/24, 10.0.12.0/24).
- S3 bucket for CloudTrail logs, versioning on, public access blocked. Bucket name lab-trail-bucket-0123456789 (also written lab-trail-bucket-0123456789 in CLI; see Gaps).
- IAM user for lab work, MFA on. IAM role for EC2 with read-only S3 access.
- GuardDuty and Security Hub on in the same region (us-east-1).

### IAM

| Principal | Name | Policies / access |
|---|---|---|
| IAM user | lab-user | Managed policy AmazonEC2ReadOnlyAccess (arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess); custom policy LabS3ReadOnly (see below); access key created (`create-access-key`); MFA on |
| IAM role | lab-ec2-role | Assume-role trust policy file trust-policy.json (contents not stated); managed policy AmazonS3ReadOnlyAccess (arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess) |
| Custom policy | LabS3ReadOnly | Allows s3:ListBucket and s3:GetObject only, on arn:aws:s3:::lab-bucket-0123456789 and arn:aws:s3:::lab-bucket-0123456789/*; policy ARN arn:aws:iam::123456789012:policy/LabS3ReadOnly (123456789012 is a placeholder account ID) |

S3 bucket in the custom policy: lab-bucket-0123456789 (a different name from the CloudTrail bucket lab-trail-bucket-0123456789). No bucket policy text stated.

### Detection, logging, alarming

- GuardDuty: `guardduty create-detector --enable`. Detector ID in verification example: 0123456789abcdef0123456789abcdef (example/placeholder).
- Security Hub: `securityhub enable-security-hub`.
- CloudTrail trail: lab-trail, S3 bucket lab-trail-bucket-0123456789, multi-region trail (`--is-multi-region-trail`), logging started (`start-logging`). Trail status checked with `get-trail-status`.
- VPC Flow Logs: same as aws-cloud-networking — VPC vpc-0123456789abcdef0, traffic-type ALL, CloudWatch Logs, log group lab-flow-logs.
- CloudWatch alarm: lab-failed-logins, metric ConsoleSignInFailureCount, namespace AWS/CloudTrail, statistic Sum, period 300 (seconds), threshold 3, comparison GreaterThanOrEqualToThreshold, evaluation periods 1, alarm action arn:aws:sns:us-east-1:123456789012:lab-alerts (SNS topic lab-alerts, placeholder account ID). Note: the troubleshooting notes say the alarm depends on a CloudTrail metric filter, but no metric filter creation command is shown.
- No Security Group, NACL, route table or EC2 instance is defined in this repo (EC2 is referenced only as the role's target and as read-only EC2 access).

Troubleshooting scenarios (6): IAM user can do too much (check attached policies, broad managed policy); simulator says denied but real call works (permission boundary or second policy/group); GuardDuty no findings (quiet lab is normal); CloudTrail no events (trail logging status, S3 bucket policy allows CloudTrail writes); flow logs empty (log group exists, IAM role for flow logs, traffic actually moved); alarm never fires (metric name/namespace vs metric filter).

Shared responsibility model (as stated): AWS looks after security of the cloud (physical data centres, hardware, software running the services); user looks after security in the cloud (data, IAM users/roles, security groups, encryption, logs).

---

## 9. wireshark-packet-analysis — LAB WORK (core sections from professional work; security section is lab exposure)

Status in source: "Hands-on lab experience, based on professional work. The core sections below come from packet captures I have run while troubleshooting live networks. The security analysis section is lab exposure, built from practice captures in a lab, not from production incidents." Project status repeats that the DHCP, ARP, DNS, OSPF and latency sections come from real troubleshooting work; security analysis is lab exposure and still being practised.

Architecture: Problem Host → Access Switch → SPAN Port → Wireshark Laptop; Access Switch → Core Switch → Router → Internet. No IPs, hostnames, VLAN IDs or device models stated for this topology (example filter uses ip.addr 192.168.10.5 and vlan.id 10 as examples to change to match the host/VLAN being chased).

### Capture scenarios

| Scenario | What is captured / checked | Filters stated |
|---|---|---|
| DHCP DORA | Discover, Offer, Request, Ack (4 packets); clean DORA proves client reaches server, offered address/mask/gateway/DNS are in Ack; Discover with no Offer = server/relay fault; Offer with no Request = client never got Offer | `dhcp`, `bootp` |
| ARP troubleshooting | Normal request/reply; two replies with different MACs for same IP = duplicate IP; no reply = host down or other VLAN with no route | `arp` |
| DNS troubleshooting | One query + one response is normal; query with no response = DNS unreachable; wrong address in response = wrong DNS server or wrong record | `dns` |
| TCP handshake | SYN, SYN-ACK, ACK; SYN with no SYN-ACK = server never got it or not listening; SYN-ACK with no ACK = client never got reply; many SYNs with no replies = often a scan; reset after SYN = port closed | `tcp.flags.syn == 1`, `tcp.flags.reset == 1` |
| TLS handshake | Client Hello (TLS version, cipher suites offered); Server Hello (cipher picked, certificate); stops after Client Hello = server may not support offered version | `tls.handshake.type == 1` |
| OSPF neighbour states | Down, Init, 2-Way (DR/BDR picked), ExStart, Exchange, Loading, Full; stuck Init = hello not returned; stuck ExStart/Exchange = MTU mismatch; stuck Loading = duplicate router IDs | `ospf` |
| Latency / packet drops | Delta time request to response; retransmissions = packet never Acked; duplicate Acks = receiver re-asking; ICMP ping/unreachable; compare client-side vs server-side captures | `tcp.analysis.retransmission`, `tcp.analysis.duplicate_ack`, `icmp` |
| Security analysis (lab exposure only) | Clear-text credentials in HTTP/FTP; DNS tunnelling (strange names, high query count); odd ports (web not on 80/443); long-running connections to one outside address; brute force (many failed logins) | `http.request.method == "POST"`, `ftp.request.command == "PASS"`, `dns.qry.name contains "xyz"`, `tcp.port == 22 and tcp.flags.reset == 1` |

Other filters listed as most-used: `eigrp`, `ip.addr == 192.168.10.5`, `vlan.id == 10`. No PCAP files, no capture filenames, no packet counts stated. Capture method: SPAN/mirror port, wide capture then narrow with display filters, save with date/site/fault in the name. No real capture names are given.

Troubleshooting scenarios (4): empty capture (wrong interface / SPAN not set up); only own traffic (SPAN session missing the link); cannot read capture (Follow TCP Stream one conversation at a time); filter returns nothing (spelling, try wider filter).

---

## 10. siem-threat-detection — CURRENTLY LEARNING (lab template, not finished)

Status in source: "Lab template to be completed. This repo is a hands-on lab plan for learning SIEM tools and threat detection. It is not production experience and it is not a completed project. No lab in this repo is finished yet." Tools: Splunk Free, Wazuh, Suricata, Snort, syslog, journalctl, MITRE ATT&CK.

Architecture: Linux Server → Wazuh Agent → Wazuh Manager; Linux Server → Syslog Forwarding → Splunk; Firewall → Syslog Forwarding → Splunk; Suricata Sensor → Log Files → Splunk; Wazuh Manager → Alerts Dashboard; Splunk → Alerts Dashboard.

### Lab topology

| Host | IP | Role |
|---|---|---|
| Splunk server | 192.168.10.60 | Splunk Free, syslog destination port 514 (UDP in rsyslog line `*.* @192.168.10.60:514`) |
| Wazuh manager | 192.168.10.61 | Wazuh all-in-one install (packages.wazuh.com/4.7/wazuh-install.sh, `bash wazuh-install.sh -a`) |
| Linux server | 192.168.10.50 | Wazuh agent + syslog forwarding to Splunk; same IP as Ubuntu Server VM in linux-administration-labs, separate lab context |
| Suricata sensor | 192.168.10.40 | Suricata + Snort, alerts to Splunk; same IP as detection box in cybersecurity-home-lab, separate lab context |
| Kali Linux | 192.168.10.10 | Source of test traffic, lab only |
| Firewall | not stated (no IP, no model) | Log source forwarding to Splunk |

No VLAN, gateway, DNS, routing or firewall rule numbers stated. No Splunk index other than `index=main` stated. No Wazuh agent key, enrollment details or port numbers stated (except syslog 514).

### Splunk searches (SPL, 5 searches)

1. Failed SSH logins by source: `index=main sourcetype=syslog "Failed password" | stats count by src_ip | sort -count`
2. Top 10 firewall sources: `index=main sourcetype=firewall | stats count by src_ip | sort -count | head 10`
3. Suricata alerts by signature: `index=main sourcetype=suricata | stats count by alert.signature | sort -count`
4. DNS queries to unusual names: `index=main sourcetype=dns | stats count by query | sort -count`
5. Logins outside working hours: `index=main sourcetype=syslog "Accepted password" | eval hour=strftime(_time, "%H") | where hour < 7 OR hour > 19 | table _time user src_ip` (working hours defined here as 07:00–19:00)

No saved-search names, no alert thresholds, no severity levels stated.

### Detection use cases (6)

Brute force login (many failed logins, one address, short time); port scan (one address, many ports, many hosts); DNS tunnelling (one host, many DNS queries to strange names); lateral movement (new login from a host that never logged in before); data exfiltration (sudden rise in outbound traffic, one host); malware callback (host connecting to an address in a threat feed).

### MITRE ATT&CK mapping (9 tactics)

Reconnaissance (port scanning); Initial access (brute force logins); Persistence (new scheduled task/service, cron/systemd changes); Privilege escalation (normal user running admin commands, sudo outside usual pattern); Discovery (internal scanning from compromised host); Lateral movement (logins between servers that never talked before); Collection (host reading files it never touched before); Exfiltration (large uploads outside); Command and control (host calling out to odd address on regular schedule).

### Alert triage workflow (7 steps)

Read alert (source, destination, time); check if source is known scanner or normal host; read raw logs, confirm activity real; check same source other alerts same hour; decide true positive / false positive / benign; write down decision and next step; tune rule if it keeps firing on normal traffic.

Incident response steps (6): same as cybersecurity-home-lab — Prepare, Detect, Contain, Eradicate, Recover, Learn.

Suricata / Snort commands: `suricata -c /etc/suricata/suricata.yaml -i eth0`; `suricata-update`; `tail -f /var/log/suricata/fast.log`; `snort -T -c /etc/snort/snort.conf -i eth0`; `snort -A console -c /etc/snort/snort.conf -i eth0`. Syslog forwarding line: `*.* @192.168.10.60:514`, then `systemctl restart rsyslog`.

---

## 11. network-automation-python — CURRENTLY LEARNING (lab template, not finished)

Status in source: "Lab template to be completed. This repo is a hands-on lab plan for learning network automation. It is not production experience and it is not a completed project. No lab in this repo is finished yet." Target: GNS3 lab devices. Technologies: Python fundamentals, Netmiko, Bash, Git/GitHub, Ansible, REST APIs, JSON, YAML, Terraform fundamentals, Docker fundamentals, CI/CD fundamentals.

### Lab topology

- GNS3 lab, two routers and one switch, "the same topology as the enterprise networking labs".
- Router 1: 192.168.10.1; Router 2: 192.168.10.2; Switch 1: 192.168.10.3. SSH on for all three. (These IPs reuse the enterprise-lab gateway addresses; they are the automation lab's target addresses as stated.)
- Laptop on same lab network, Python 3 and Netmiko installed. Laptop IP not stated.
- Lab controller for REST API example: https://192.168.10.100/restconf/data/ietf-interfaces:interfaces (controller name/type not stated; `verify=False`, auth admin / example password in source).

### Scripts (purpose only; no script is a finished production tool)

| File | Purpose |
|---|---|
| backup_one.py | Netmiko (cisco_ios) to 192.168.10.1, username admin, `show running-config`, write to r1-backup.txt |
| backup_all.py | Netmiko loop over 192.168.10.1, 192.168.10.2, 192.168.10.3, `show running-config` each, write `<host>-backup.txt` per device |
| push_config.py | Netmiko to 192.168.10.1, `send_config_from_file("change.txt")`, `save_config()`; contents of change.txt not stated |
| ping_check.py | Subprocess ping `-c 2` to 192.168.10.1, 192.168.10.2, 192.168.10.3, print "is up" / "is down" |
| REST API example (inline, no filename stated) | requests GET to https://192.168.10.100/restconf/data/ietf-interfaces:interfaces, Accept application/yang-data+json, auth admin, print status code and JSON |
| JSON parse example (inline, no filename stated) | Load device.json, print each interface name + status from data["interfaces"] |
| backup.yml (Ansible) | Playbook "Back up lab device configs", hosts lab, gather_facts false, cisco.ios.ios_command `show running-config`, save to ./backups/{{ inventory_hostname }}-backup.txt |
| hosts.ini (Ansible inventory) | [lab_routers] r1 ansible_host=192.168.10.1, r2 ansible_host=192.168.10.2; [lab_switches] sw1 ansible_host=192.168.10.3; [lab:children] lab_routers, lab_switches |
| Dockerfile | FROM python:3.12-slim, WORKDIR /app, COPY requirements.txt, pip install, COPY backup_all.py, CMD ["python3", "backup_all.py"]; image tag lab-backup; requirements.txt contents not stated |
| .github/workflows/check.yml | GitHub Actions, on push to main, ubuntu-latest, Python 3.12, `python3 -m compileall .` |

Credentials in source: username `admin` throughout; password shown in the examples as the literal example string in the source (lab example only, not a real credential). This digest does not repeat it as a usable credential. Security notes in source: never put a real password in a script (use environment variables or a vault), test only against lab devices, run Ansible in check mode first, back up before pushing, keep credentials out of Git.

Other commands: `pip install netmiko`; `pip install ansible`; `ansible-playbook backup.yml --check`, `ansible-playbook backup.yml`; `docker run hello-world`, `docker ps`, `docker images`, `docker build -t lab-backup .`, `docker run lab-backup`.

Troubleshooting scenarios (6): Netmiko cannot connect (SSH on, address right, ping first); backup file empty (command output, login worked); Ansible host unreachable (inventory, test SSH by hand); playbook fails on one device (run one host at a time); Docker build fails (Dockerfile spelling, copied files exist); CI fails (read workflow log, fix named file).

---

## 12. network-troubleshooting-playbook — LAB WORK (runbooks 1–4 from professional work; 5–8 lab-practised)

Status in source: "Hands-on lab experience, based on professional work. The runbooks below come from faults I have worked on in live enterprise networks." Project status: "Runbooks 1 to 4 come from real faults worked on live networks. Runbooks 5 to 8 are written from the same troubleshooting method and are practised in the lab." No named devices, IPs, VLANs or hostnames are stated in this repo; all checks use generic device roles (user machine, switch, edge router, DHCP server/router, provider).

Triage flow: Fault reported → one user or many → one user: check user port and cable; many users: check switch and uplink → fixed? yes: close ticket and write notes; no: check gateway and DNS → fixed? yes: close; no: capture packets and escalate.

### Runbooks (8)

| Runbook | Fault | Key checks (in order as stated) | Escalate when |
|---|---|---|---|
| 1 Connection drops | User loses network seconds/minutes, then back; one user / floor / switch | Cable loose, link light; `show interfaces status` for flapping port; `show interfaces` input/CRC/collision errors; swap patch cable, try known-good port; port config, right VLAN/mode; switch logs at drop time, STP changes | Port keeps flapping after cable/port swap; more than one switch same fault same time; logs point at uplink/core fault |
| 2 Internet drops | Inside servers reachable, internet not; whole site at once | Ping LAN gateway, then WAN address on edge router; ping 8.8.8.8 from router, then ping google.com (DNS test); `show ip interface brief` WAN up; `show ip nat translations`; `show ip route` default route to provider; ACL on outside interface not blocking | WAN down, provider must be called; NAT stops building though link up; default route missing and will not return |
| 3 IP conflicts | Windows "IP address already in use", fault moves machine to machine | Note IP from warning, find rightful holder; `show ip dhcp binding`, who holds lease; `arp -a`, two MACs on one IP; static IP inside DHCP pool range; move static device out of pool or reserve it; release/renew, confirm warning gone | Clash returns after fix; rogue DHCP server handing out addresses; pool full, more addresses needed |
| 4 Slow links / performance bottlenecks | File copies crawl, video breaks up, pages slow; worst at busy times | Ping LAN gateway, high/jumping times; `show interfaces` output drops, input errors, link at full speed; `show processes cpu` high CPU; Wireshark retransmissions / duplicate Acks; bandwidth use, top talker host/app; duplex mismatch, speed/duplex agree both ends | Link full, needs more bandwidth; CPU stays high after top talkers found; fault on provider link |
| 5 DNS failure | Ping IP works, no website by name; whole site or one user | Ping 8.8.8.8 (path works); `nslookup google.com`; which DNS server machine uses vs working machine; `nslookup google.com 8.8.8.8` (public DNS direct); DHCP scope hands out right DNS servers; Wireshark DNS queries with no response | DNS server down (restart/rebuild); provider DNS fault; some names work, some fail (record problem) |
| 6 OSPF neighbour down | One site loses routes to another; neighbour down / stuck below Full | `show ip ospf neighbor`, note state; ping neighbour address (link up); `show ip ospf interface`, hello/dead timers match both sides; area number matches both sides; MTU both interfaces (mismatch stops adjacency in ExStart); duplicate router IDs; `debug ip ospf hello` briefly | Link up but adjacency will not form after timer/area/MTU checks; more than one neighbour drops at once; core router / provider link fault |
| 7 VRRP failover check | Gateway lost briefly then back; master/backup keep swapping | `show vrrp brief` both routers, which is master; priority both routers, master higher; virtual IP matches both routers; tracked interface/object up on master; flapping on tracked interface in logs; shut master link in lab first, watch backup take over | Both routers claim master at once; backup never takes over when master down; roles swap repeatedly with no clear cause |
| 8 VLAN misconfiguration | Link light on but user reaches nothing, or lands in wrong VLAN / wrong servers | `show vlan brief`, which VLAN port sits in; `show interfaces switchport`, mode and VLAN; trunk ports on path, VLAN allowed on each trunk; native VLAN matches both ends of every trunk; ping gateway for right VLAN; DHCP scope for that VLAN hands out addresses | VLAN missing from core switch, must be created there; fault spans more than one switch; native VLAN mismatch points at trunk config change |

Escalation matrix: L1 — work runbook, fix what you can, write down findings; L2 — deeper config work or change on core device; L3 — design work, vendor case, or architecture change; Provider — WAN/internet link fault only provider can fix.

Ticketing: log every fault in ServiceNow or Jira as an Incident; use a Request Item (RITM) for a user change request. Ticket template fields: title (fault + site); affected users (how many, where); start time; symptoms; checks run (each step + result); fix applied (what changed, when); result (fixed or escalated, who has it now); follow up (what to watch).

---

## Cross-repo index (for the 3D site)

- VLANs: 10 SALES, 20 HR, 30 GUEST everywhere they appear; 99 MANAGEMENT only in cisco-routing-switching (Vlan99 192.168.99.10, gateway 192.168.99.1). Palo Alto and FortiGate name VLAN 10/20/30 in diagrams without a VLAN config block.
- Gateways: 192.168.10.1 is the LAN gateway in enterprise Lab 1 (R1), Lab 2 R1 subinterface, cisco-routing-switching EDGE-R1, Palo Alto trust, FortiGate internal. 192.168.10.254 is the VRRP virtual IP (Lab 2 only). 192.168.20.1 / 192.168.30.1 are the Lab 2 R1 subinterface gateways; 192.168.30.1 is also the Palo Alto guest and FortiGate guest address. 203.0.113.1 is the WAN gateway everywhere it appears.
- WAN: 203.0.113.2/30 on EDGE-R1, Palo Alto ethernet1/1 and FortiGate wan1 (same documentation address, separate labs).
- DNS: 8.8.8.8 and 8.8.4.4 (DHCP pools, LAN-10 and LAN-20 only). No other DNS servers stated.
- Routing protocols: OSPF 1 (areas 0 and 1), EIGRP 100 (redistribution on R2 only). No BGP in the on-prem labs; AWS VPN customer gateway BGP ASN 65000 is stated but no BGP neighbour or route is configured in the examples.
- Lab networks by IP, for node placement: 10.0.12.0/30, 10.0.23.0/30, 10.0.24.0/30, 192.168.10.0/24, 192.168.20.0/24, 192.168.30.0/24, 192.168.40.0/24, 192.168.99.0/24, 203.0.113.0/30, AWS 10.0.0.0/16 (10.0.1.0/24, 10.0.2.0/24, 10.0.11.0/24, 10.0.12.0/24), second VPC 10.1.0.0/16, SIEM/Linux lab 192.168.10.0/24 hosts .10, .40, .50, .60, .61.

## Gaps and ambiguities

1. TeamLease dates conflict: profile README says May 2022 to July 2025; the task brief for this digest says "TeamLease May 2022 onward". The profile README dates are used in this file; the brief wording is not corroborated in the source files.
2. Same IPs reused across labs: 192.168.10.10 is Kali in cybersecurity-home-lab, Linux lab and SIEM lab; 192.168.10.40 is the detection box and the Suricata sensor; 192.168.10.50 is the Ubuntu VM and the SIEM Linux server; 192.168.10.1 is a gateway in at least five repos; 203.0.113.2 is the WAN in three repos. These are separate lab topologies sharing example addressing, not one network. Do not merge them into a single topology.
3. AWS IDs are placeholders: vpc-0123456789abcdef0, subnet-0123456789abcdef0, igw/nat/rtb/sg/ami/eipalloc IDs all use the same 0123456789abcdef0 pattern, repeated for different resources; account ID 123456789012 and detector ID 0123456789abcdef0123456789abcdef are placeholders. Bucket names lab-bucket-0123456789 vs lab-trail-bucket-0123456789 are two different buckets in aws-cloud-security; the CLI in that repo writes the trail bucket as lab-trail-bucket-0123456789 in both create-bucket and create-trail, so that spelling is used here.
4. AWS subnet creation: only public-a (10.0.1.0/24) and private-a (10.0.11.0/24) have CLI create commands; public-b (10.0.2.0/24) and private-b (10.0.12.0/24) appear only in the topology list. The private route-table association command is not shown. Peering route commands, second Transit Gateway attachment, Route 53 record details, ALB listener/target group/health check, and the CloudTrail metric filter behind the lab-failed-logins alarm are all described in steps but not shown as commands.
5. Palo Alto vs FortiGate branch: both use peer 203.0.113.10 and branch LAN 192.168.20.0/24, but Palo Alto proxy IDs are 192.168.10.0/24 ↔ 192.168.20.0/24 while FortiGate phase 2 uses the same pair; no branch-side config is given in either repo, so the far end is not verified.
6. VRRP: no virtual MAC, authentication, timers or track object are stated in Lab 2. The enterprise Lab 2 README topology lists VIPs only; the config files give priority and preempt. SW-CORE SVI addresses (.3) are not VRRP virtual IPs.
7. STP blocked link: Lab 3 README says one link stays blocked but no config states which port is blocking; the SW1–SW3 Gi0/2 single link is the unbundled link in the triangle, but the source does not name it as the blocked one.
8. Cisco stp-etherchannel uses `root primary` with no numeric priority, so it cannot be compared numerically with Lab 3 priorities 4096/8192/12288.
9. DHCP: lease is written as `lease 7` in dhcp.txt; the unit (days) comes from the cisco-routing-switching README ("7 day leases"), not from the config line itself. No pool for 192.168.30.0/24 is given anywhere.
10. FortiGate default route: the static route block (edit 1) gives gateway 203.0.113.1 and device wan1 with no destination stated; it is treated here as the default route as the README labels it, but the destination field is not in the source block.
11. Palo Alto management IP 192.168.99.1/24 is the same address as the cisco-routing-switching management default gateway 192.168.99.1; different labs, same example address.
12. Wireshark example addresses: ip.addr 192.168.10.5 and vlan.id 10 are examples to change, not assigned hosts; 192.168.10.5 is also the Palo Alto test host and the FortiGate debug-flow filter address. No PCAP file, capture name, packet count or real host behind 192.168.10.5 is stated.
13. Automation lab: router/switch IPs 192.168.10.1/.2/.3 conflict with enterprise-lab gateway IPs by design ("same topology as the enterprise networking labs"); the lab controller at 192.168.10.100 has no name, type or interface list beyond the one RESTCONF URL. The contents of change.txt, device.json, requirements.txt and trust-policy.json are not stated.
14. No passwords, no real production addresses: SETUP_GUIDE.md checklist states "No phone number, no password, and no real production address anywhere in the files". Pre-shared keys in Palo Alto and FortiGate are `<redacted>` in source. The automation examples show an example admin password string; it is a lab example in the source, not a real credential, and this digest does not present it as one.
15. Screenshot placeholders: every template repo lists screenshot files (dashboard, rules, VPN status, Nmap, Suricata, Wazuh, Splunk, terminal, UFW, journalctl, VPC console, flow logs, Terraform plan, backup script, Ansible run, CI workflow, triage flow, ticket example, DORA, OSPF states, retransmissions) that do not exist in the source package; no screenshot content was extracted.
16. BIO.md is one line only ("Network Engineer with 3+ years in enterprise networking, now building labs in security, Linux, and AWS cloud networking."). No other biographical facts are in the package files beyond the profile README.
