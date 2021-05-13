#!/bin/bash

set -euo pipefail


# Install build dependencies

sudo apt install \
    git curl \
    autoconf automake doxygen libtool \
    libcurl4-openssl-dev libdbus-1-dev libgcrypt-dev \
    libglib2.0-dev libjson-c-dev libsqlite3-dev libssl-dev \
    python3-cryptography python3-pyasn1-modules python3-yaml \
    uuid-dev libyaml-dev -y


# Create base source directory

mkdir -p ~/src


# Define the version numbers
#
# Refs:
# - https://tpm2-software.github.io/versions/#tpm2-tools
# - https://github.com/tpm2-software/tpm2-abrmd/releases
# - https://github.com/tpm2-software/tpm2-pkcs11/releases
# - https://github.com/tpm2-software/tpm2-tools/releases
# - https://github.com/tpm2-software/tpm2-tss/releases

declare -A checkouts

checkouts['tpm2-abrmd']='2.4.0'
checkouts['tpm2-pkcs11']='1.5.0'
checkouts['tpm2-tools']='5.0'
checkouts['tpm2-tss']='3.0.3'


# Download `autoconf-2019.01.06` and extract it.
#
# There is a newer autoconfig-archive, but the tpm2-* autoconf files have
# hard-coded things for 2019_01_06

if ! [ -f ~/src/autoconf-archive-2019.01.06.tar.gz ]; then
    curl -L \
        -o ~/src/autoconf-archive-2019.01.06.tar.gz \
        'https://github.com/autoconf-archive/autoconf-archive/archive/v2019.01.06.tar.gz'
fi
if ! [ -d ~/src/autoconf-archive-2019.01.06 ]; then
    (cd ~/src/ && tar xf ~/src/autoconf-archive-2019.01.06.tar.gz)
fi


# Clone and bootstrap the repositories

for d in "${!checkouts[@]}"; do
    (
        set -euo pipefail

        if ! [ -d ~/src/"$d" ]; then
            git clone "https://github.com/tpm2-software/$d" ~/src/"$d"
        fi
        cd ~/src/"$d"

        git fetch --all --prune
        git clean -xffd
        git reset --hard
        git checkout "${checkouts["$d"]}"

        cp -R ~/src/autoconf-archive-2019.01.06/m4 .

        ./bootstrap -I m4
    ) & :
done

wait $(jobs -pr)


# Build `tpm2-tss`

(
    set -euo pipefail

    cd ~/src/tpm2-tss

    ./configure \
        --with-udevrulesdir=/etc/udev/rules.d \
        --with-udevrulesprefix=70-
    make "-j$(nproc)"
    sudo make install
    id -u tss || sudo useradd --system --user-group tss
    sudo udevadm control --reload-rules
    sudo udevadm trigger
    sudo ldconfig
)


# Build `tpm2-abrmd`

(
    set -euo pipefail

    cd ~/src/tpm2-abrmd

    ./configure \
        --with-dbuspolicydir=/etc/dbus-1/system.d \
        --with-systemdsystemunitdir=/lib/systemd/system \
        --with-systemdpresetdir=/lib/systemd/system-preset \
        --datarootdir=/usr/share
    make "-j$(nproc)"
    sudo make install
    sudo ldconfig
    sudo pkill -HUP dbus-daemon
    sudo systemctl daemon-reload
    sudo systemctl enable tpm2-abrmd.service
    sudo systemctl restart tpm2-abrmd.service

    # Verify that the service started and registered itself with dbus
    dbus-send \
        --system \
        --dest=org.freedesktop.DBus --type=method_call \
        --print-reply \
        /org/freedesktop/DBus org.freedesktop.DBus.ListNames |
        (grep -q 'com.intel.tss2.Tabrmd' || :)
)


# Build `tpm2-tools`

(
    set -euo pipefail

    cd ~/src/tpm2-tools

    ./configure
    make "-j$(nproc)"
    sudo make install
)


# Build tpm2-pkcs11

(
    set -euo pipefail

    cd ~/src/tpm2-pkcs11

    # The `tpm2-pkcs11` library uses a filesystem directory to store
    # wrapped keys. Ensure this directory is readable and writable by
    # the user you'll be running `aziot-keyd` as,
    # not just root.
    sudo mkdir -p /opt/tpm2-pkcs11
    sudo chown "$(id -u):$(id -g)" /opt/tpm2-pkcs11
    sudo chmod 0700 /opt/tpm2-pkcs11

    # --enable-debug=!yes is needed to disable assert() in
    # CKR_FUNCTION_NOT_SUPPORTED-returning unimplemented functions.
    ./configure \
        --enable-debug=info \
        --enable-esapi-session-manage-flags \
        --with-storedir=/opt/tpm2-pkcs11
    make "-j$(nproc)"
    sudo make install
)

export TPM2_PKCS11_STORE='/opt/tpm2-pkcs11'
