# setup on Standard D64 v3 (64 vcpus, 256 GiB memory)
sudo apt update
sudo apt-get install -y gawk wget git-core diffstat unzip texinfo gcc-multilib build-essential chrpath socat cpio python python3 python3-pip python3-pexpect xz-utils debianutils iputils-ping python3-git python3-jinja2 libegl1-mesa libsdl1.2-dev xterm locales
sudo rm -f -r /mnt/intel9
sudo mkdir -p /mnt/intel9
sudo chown _azbatch:_azbatchgrp /mnt/intel9

# script
mkdir -p /mnt/intel9/source
cd /mnt/intel9/source
rm -f -r *
sudo locale-gen en_US.UTF-8

git clone -b warrior http://git.yoctoproject.org/git/poky
git clone -b warrior http://git.yoctoproject.org/git/meta-intel
git clone -b warrior https://github.com/Azure/meta-iotedge.git
git clone -b warrior git://git.yoctoproject.org/meta-security

# adding iotedge stuff
git clone -b warrior git://git.yoctoproject.org/meta-virtualization

git clone -b master git://github.com/meta-rust/meta-rust.git
# note RUST has been updated to version 1.37.x+, which is incompatible
# reverting to a known good version 
cd meta-rust
git checkout 9487b089ea4779c2b494b17b9254219226efa539
cd ..

git clone -b warrior git://git.openembedded.org/meta-openembedded

cd /mnt/intel9
source source/poky/oe-init-build-env intel9
cd /mnt/intel9
echo "BBLAYERS += \"/mnt/intel9/source/meta-intel\"" >> intel9/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/intel9/source/meta-rust\"" >> intel9/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/intel9/source/meta-virtualization\"" >> intel9/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/intel9/source/meta-iotedge\"" >> intel9/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/intel9/source/meta-openembedded/meta-oe\"" >> intel9/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/intel9/source/meta-openembedded/meta-networking\"" >> intel9/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/intel9/source/meta-openembedded/meta-python\"" >> intel9/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/intel9/source/meta-openembedded/meta-perl\"" >> intel9/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/intel9/source/meta-openembedded/meta-filesystems\"" >> intel9/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/intel9/source/meta-security\"" >> intel9/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/intel9/source/meta-security/meta-tpm\"" >> intel9/conf/bblayers.conf
echo "BBLAYERS_NON_REMOVABLE += \"/mnt/intel9/source/poky/meta-iotedge\"" >> intel9/conf/bblayers.conf

echo "MACHINE = \"intel-corei7-64\"" >> intel9/conf/local.conf
echo 'DISTRO_FEATURES_append += " systemd wifi virtualization"' >> intel9/conf/local.conf
echo 'EXTRA_IMAGE_FEATURES += "debug-tweaks ssh-server-dropbear tools-debug tools-sdk"' >> intel9/conf/local.conf
echo 'IMAGE_INSTALL_append += " iotedge-daemon "' >> intel9/conf/local.conf
echo 'IMAGE_INSTALL_append += " iotedge-cli "' >> intel9/conf/local.conf
echo 'IMAGE_INSTALL_append += " docker-ce "' >> intel9/conf/local.conf
echo 'IMAGE_INSTALL_append += " tpm2-tools "' >> intel9/conf/local.conf
echo 'IMAGE_INSTALL_append += " tpm2-tss "' >> intel9/conf/local.conf
echo 'IMAGE_INSTALL_append += " ca-certificates "' >> intel9/conf/local.conf
echo 'IMAGE_INSTALL_append += " iw "' >> intel9/conf/local.conf
echo 'IMAGE_INSTALL_append += " connman "' >> intel9/conf/local.conf
echo 'IMAGE_INSTALL_append += " connman-client "' >> intel9/conf/local.conf
echo 'VIRTUAL-RUNTIME_init_manager = "systemd"' >> intel9/conf/local.conf
echo 'DISTRO_FEATURES_BACKFILL_CONSIDERED = "sysvinit"' >> intel9/conf/local.conf
echo 'VIRTUAL-RUNTIME_initscripts = ""' >> intel9/conf/local.conf
echo 'PACKAGECONFIG_append_pn-qemu-native = " sdl"' >> intel9/conf/local.conf
echo 'PACKAGECONFIG_append_pn-nativesdk-qemu = " sdl"' >> intel9/conf/local.conf

bitbake core-image-sato

ls -all -h /mnt/intel9/intel9/tmp/deploy/images/intel-corei7-64

# how to copy the hdd file and etc
