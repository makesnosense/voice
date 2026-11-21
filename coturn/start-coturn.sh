#!/bin/sh
set -e

# webrtc only needs udp relays to public addresses. without these limits, anyone
# holding turn credentials can aim the relay at the host's own networks

# private networks: denied so a relay can't reach this host's other networks.
#################################
# COMMENT OUT THE LINES BELOW IF YOU ARE HOSTING COTURN LOCALLY (lan-only or local development),
# otherwise coturn's own relay address is denied and calls never connect

# all docker networks (172.17 to 172.20 here); 172.x.0.1 on each is the host itself
DOCKER_AND_PRIVATE_172="172.16.0.0-172.31.255.255"

# the hosting provider's internal network, home or office lans
PRIVATE_10="10.0.0.0-10.255.255.255"
PRIVATE_192="192.168.0.0-192.168.255.255"

# carrier-grade nat space, used by some cloud-internal services
CARRIER_NAT="100.64.0.0-100.127.255.255"

# ipv6 private addresses (unique local)
PRIVATE_IPV6="fc00::-fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff"
################################ COMMENT OUT UNTIL HERE

# always denied: no legitimate relay target is ever in these ranges

# "this network", and 0.0.0.0 reaches this host itself (the old loopback bypass, cve-2020-26262)
THIS_NETWORK="0.0.0.0-0.255.255.255"

# this vps's own localhost, where localhost-only services listen
LOOPBACK_IPV4="127.0.0.0-127.255.255.255"
LOOPBACK_IPV6="::1-::1"

# link-local, includes the cloud metadata service at 169.254.169.254
LINK_LOCAL_IPV4="169.254.0.0-169.254.255.255"
LINK_LOCAL_IPV6="fe80::-febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff"

DENIED_PEER_RANGES=""
for range in $THIS_NETWORK $LOOPBACK_IPV4 $LOOPBACK_IPV6 $LINK_LOCAL_IPV4 $LINK_LOCAL_IPV6 \
  $DOCKER_AND_PRIVATE_172 $PRIVATE_10 $PRIVATE_192 $CARRIER_NAT $PRIVATE_IPV6; do
  DENIED_PEER_RANGES="$DENIED_PEER_RANGES --denied-peer-ip=$range"
done

echo "🚀 Starting COTURN with CLI arguments..."

exec turnserver \
  -n --log-file=stdout \
  --listening-port=$VITE_TURN_SERVER_PORT \
  --min-port=49152 --max-port=65535 \
  --use-auth-secret \
  --static-auth-secret="$COTURN_SECRET" \
  --realm="$VITE_TURN_SERVER_HOST" \
  --server-name="$VITE_TURN_SERVER_HOST" \
  --no-multicast-peers \
  --no-tcp-relay \
  $DENIED_PEER_RANGES \
  --verbose \
  --stale-nonce=600 \
  --max-allocate-lifetime=600 \
  --channel-lifetime=600 \
  --mobility \
  --no-rfc5780 \
  --log-binding
