FROM prom/prometheus:latest

# Prometheus config másolása
COPY prometheus.yml /etc/prometheus/prometheus.yml

# Expose port
EXPOSE 9090

# Default command
CMD ["--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.path=/prometheus"]
