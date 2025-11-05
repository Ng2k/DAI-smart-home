#!/bin/sh
set -e

PASSFILE=${MQTT_PASSWORD_FILE:=/mosquitto/config/mqtt_passwd}
USERNAME=${MQTT_USERNAME:-admin}
PASSWORD=${MQTT_PASSWORD:-admin}

# If password file does not exist, create it
if [ ! -f "$PASSFILE" ]; then
  echo "🔐 Generating Mosquitto password file..."
  mosquitto_passwd -c -b "$PASSFILE" "$USERNAME" "$PASSWORD"
fi

# Secure permissions
chmod 600 "$PASSFILE"
chown mosquitto:mosquitto "$PASSFILE"

echo "✅ Password file ready."
echo "🚀 Starting Mosquitto..."

exec mosquitto -c /mosquitto/config/mosquitto.conf
