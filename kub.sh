#!/usr/bin/env bash

sudo swapoff -a && sudo sed -i -e '/swap.img/d' /etc/fstab
sudo sudo modprobe br_netfilter && sudo sysctl -w net.bridge.bridge-nf-call-iptables=1 && sudo sysctl -w net.ipv4.ip_forward=1
sudo apt-get update && sudo apt-get install -y apt-transport-https ca-certificates curl containerd

# kubernetes time
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update && sudo apt-get install -y kubelet kubeadm kubectl && sudo apt-mark hold kubelet kubeadm kubectl
kubectl version --output=json
