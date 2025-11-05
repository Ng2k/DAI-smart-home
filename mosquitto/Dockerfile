FROM eclipse-mosquitto:openssl

# Create config directory (if not already present)
RUN mkdir -p /mosquitto/config /mosquitto/data /mosquitto/log

# Copy custom config and entrypoint
COPY mosquitto.conf /mosquitto/config/mosquitto.conf
COPY entrypoint.sh /entrypoint.sh

# Ensure entrypoint is executable
RUN chmod +x /entrypoint.sh

# Run Mosquitto as default entrypoint
ENTRYPOINT ["/entrypoint.sh"]
