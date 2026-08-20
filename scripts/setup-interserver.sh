#!/usr/bin/env bash
# ==============================================================================
# APAP AI Server - Automated InterServer VPS & Coolify Host Provisioning Script
# Tested on Ubuntu 22.04 LTS / Ubuntu 24.04 LTS
# ==============================================================================

set -e

echo "========================================================"
echo " Starting APAP AI InterServer VPS Setup & Hardening"
echo "========================================================"

# 1. Update system packages
echo "[1/6] Updating system packages..."
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git htop ufw software-properties-common jq net-tools ca-certificates gnupg lsb-release

# 2. Configure 8GB Swap space for CPU LLM inference stability
echo "[2/6] Configuring 8GB Swap space..."
if ! grep -q '/swapfile' /etc/fstab; then
  fallocate -l 8G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=8192
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "Swap configured successfully."
else
  echo "Swapfile already exists in /etc/fstab. Skipping creation."
fi

# Kernel memory tuning
sysctl vm.swappiness=15 || true
sysctl vm.vfs_cache_pressure=50 || true
if ! grep -q 'vm.swappiness=15' /etc/sysctl.conf; then
  echo 'vm.swappiness=15' >> /etc/sysctl.conf
  echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
fi

# 3. Configure UFW Firewall
echo "[3/6] Configuring UFW Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 8000/tcp comment 'Coolify Dashboard'
ufw --force enable
echo "UFW Firewall active."

# 4. Install Coolify & Docker Engine
echo "[4/6] Installing Coolify (Self-hosted PaaS)..."
if ! command -v coolify &> /dev/null; then
  curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
else
  echo "Coolify already installed."
fi

# 5. Create backup directories
echo "[5/6] Creating backup folders..."
mkdir -p /root/apap-backups

echo "========================================================"
echo " InterServer VPS Hardening & Coolify Setup Complete! 🎉"
echo " Access Coolify at: http://$(curl -s ifconfig.me):8000"
echo "========================================================"
