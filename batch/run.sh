# setup on Standard D64 v3 (64 vcpus, 256 GiB memory)
sudo apt update
sudo apt-get install -y gawk wget git-core diffstat unzip texinfo gcc-multilib build-essential chrpath socat cpio python python3 python3-pip python3-pexpect xz-utils debianutils iputils-ping python3-git python3-jinja2 libegl1-mesa libsdl1.2-dev xterm locales

USERGROUP=`id -gn`
BUILD=warrior
MACHINETYPE=intel-corei7-64

sudo mkdir -p /mnt/yocto/source
sudo chown -R $USER:$USERGROUP /mnt/yocto

# script
cd /mnt/yocto/source
rm -f -r *
sudo locale-gen en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8

git clone -b $BUILD http://git.yoctoproject.org/git/poky
git clone -b $BUILD http://git.yoctoproject.org/git/meta-intel
git clone -b $BUILD https://github.com/Azure/meta-iotedge.git
git clone -b $BUILD git://git.yoctoproject.org/meta-security

# adding iotedge stuff
git clone -b $BUILD git://git.yoctoproject.org/meta-virtualization

git clone -b master git://github.com/meta-rust/meta-rust.git
# note RUST has been updated to version 1.37.x+, which is incompatible
# reverting to a known good version 
cd meta-rust
git checkout 9487b089ea4779c2b494b17b9254219226efa539
cd ..

git clone -b $BUILD git://git.openembedded.org/meta-openembedded

cd /mnt/yocto
source source/poky/oe-init-build-env yocto
cd /mnt/yocto
echo "BBLAYERS += \"/mnt/yocto/source/meta-intel\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/yocto/source/meta-rust\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/yocto/source/meta-virtualization\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/yocto/source/meta-iotedge\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/yocto/source/meta-openembedded/meta-oe\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/yocto/source/meta-openembedded/meta-networking\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/yocto/source/meta-openembedded/meta-python\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/yocto/source/meta-openembedded/meta-perl\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/yocto/source/meta-openembedded/meta-filesystems\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/yocto/source/meta-security\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"/mnt/yocto/source/meta-security/meta-tpm\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS_NON_REMOVABLE += \"/mnt/yocto/source/poky/meta-iotedge\"" >> yocto/conf/bblayers.conf

echo "MACHINE = \"$MACHINETYPE\"" >> yocto/conf/local.conf
echo 'DISTRO_FEATURES_append += " systemd wifi virtualization"' >> yocto/conf/local.conf
echo 'EXTRA_IMAGE_FEATURES += "debug-tweaks ssh-server-dropbear tools-debug tools-sdk"' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " iotedge-daemon "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " iotedge-cli "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " docker-ce "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " tpm2-tools "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " tpm2-tss "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " ca-certificates "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " iw "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " connman "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " connman-client "' >> yocto/conf/local.conf
echo 'VIRTUAL-RUNTIME_init_manager = "systemd"' >> yocto/conf/local.conf
echo 'DISTRO_FEATURES_BACKFILL_CONSIDERED = "sysvinit"' >> yocto/conf/local.conf
echo 'VIRTUAL-RUNTIME_initscripts = ""' >> yocto/conf/local.conf
echo 'PACKAGECONFIG_append_pn-qemu-native = " sdl"' >> yocto/conf/local.conf
echo 'PACKAGECONFIG_append_pn-nativesdk-qemu = " sdl"' >> yocto/conf/local.conf

bitbake core-image-sato

ls -all -h /mnt/yocto/yocto/tmp/deploy/images/intel-corei7-64

# how to copy the hdd file and etc
