FROM jenkins/jenkins:lts

USER root

# Docker CLI telepítése
RUN apt-get update && \
    apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli

# Ansible telepítése
RUN apt-get install -y python3-pip python3-venv && \
    pip3 install --break-system-packages ansible

# Terraform telepítése (bináris letöltéssel)
RUN apt-get install -y wget unzip && \
    wget https://releases.hashicorp.com/terraform/1.6.6/terraform_1.6.6_linux_amd64.zip && \
    unzip terraform_1.6.6_linux_amd64.zip && \
    mv terraform /usr/local/bin/ && \
    rm terraform_1.6.6_linux_amd64.zip && \
    chmod +x /usr/local/bin/terraform

# Node.js telepítése (LTS verzió)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Git és egyéb eszközök
RUN apt-get install -y git curl

USER jenkins
