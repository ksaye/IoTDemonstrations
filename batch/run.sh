# this is the source script for Azure Batch to build a Yocto image
# more information here:  http://kevinsaye.wordpress.com
# note, the command to call this is something like: 		/bin/bash -c "wget -O - https://raw.githubusercontent.com/ksaye/IoTDemonstrations/master/batch/run.sh | bash"

# ----------------------
# user defined settings
# ----------------------

BUILD=thud
MACHINETYPE=intel-corei7-64
TARGETDIR=/mnt/$AZ_BATCH_JOB_ID/$AZ_BATCH_TASK_ID
BUILDIMAGE=core-image-sato
# note we have a different storage container for each job, and we have to convert it to lower case
# for storage to work set the environment vars: AZURE_STORAGE_ACCOUNT & AZURE_STORAGE_KEY
STORAGECONTAINER=`echo $AZ_BATCH_TASK_ID | tr '[:lower:]' '[:lower:]'`

# ----------------------
# end of user defined settings
# ----------------------

# host setup
sudo apt update
sudo apt-get install -y ca-certificates curl apt-transport-https lsb-release gnupg gawk wget git-core diffstat unzip texinfo gcc-multilib build-essential chrpath socat cpio python python3 python3-pip python3-pexpect xz-utils debianutils iputils-ping python3-git python3-jinja2 libegl1-mesa libsdl1.2-dev xterm locales

# installing az-client from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-apt?view=azure-cli-latest
curl -sL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc.gpg > /dev/null
AZ_REPO=$(lsb_release -cs)
echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | sudo tee /etc/apt/sources.list.d/azure-cli.list
sudo apt-get update
sudo apt-get install azure-cli

sudo rm -f -r $TARGETDIR
sudo mkdir -p $TARGETDIR/source
USERGROUP=`id -gn`
sudo chown -R $USER:$USERGROUP $TARGETDIR
sudo locale-gen en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8

# actual work
echo Building Yocto version: $BUILD

cd $TARGETDIR/source

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

cd $TARGETDIR
source source/poky/oe-init-build-env yocto
cd $TARGETDIR
echo "BBLAYERS += \"$TARGETDIR/source/meta-intel\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"$TARGETDIR/source/meta-rust\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"$TARGETDIR/source/meta-virtualization\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"$TARGETDIR/source/meta-iotedge\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"$TARGETDIR/source/meta-openembedded/meta-oe\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"$TARGETDIR/source/meta-openembedded/meta-networking\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"$TARGETDIR/source/meta-openembedded/meta-python\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"$TARGETDIR/source/meta-openembedded/meta-perl\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"$TARGETDIR/source/meta-openembedded/meta-filesystems\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS += \"$TARGETDIR/source/meta-security/meta-tpm\"" >> yocto/conf/bblayers.conf
echo "BBLAYERS_NON_REMOVABLE += \"$TARGETDIR/source/poky/meta-iotedge\"" >> yocto/conf/bblayers.conf

echo "MACHINE = \"$MACHINETYPE\"" >> yocto/conf/local.conf
echo 'DISTRO_FEATURES_append += " systemd wifi virtualization"' >> yocto/conf/local.conf
echo 'EXTRA_IMAGE_FEATURES += "debug-tweaks ssh-server-dropbear tools-debug tools-sdk"' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " iotedge-daemon "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " iotedge-cli "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " docker "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " docker-contrib "' >> yocto/conf/local.conf
#echo 'IMAGE_INSTALL_append += " tpm2-tools "' >> yocto/conf/local.conf
#echo 'IMAGE_INSTALL_append += " tpm2-tss "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " ca-certificates "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " iw "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " connman "' >> yocto/conf/local.conf
echo 'IMAGE_INSTALL_append += " connman-client "' >> yocto/conf/local.conf
echo 'VIRTUAL-RUNTIME_init_manager = "systemd"' >> yocto/conf/local.conf
echo 'DISTRO_FEATURES_BACKFILL_CONSIDERED = "sysvinit"' >> yocto/conf/local.conf
echo 'VIRTUAL-RUNTIME_initscripts = ""' >> yocto/conf/local.conf
echo 'PACKAGECONFIG_append_pn-qemu-native = " sdl"' >> yocto/conf/local.conf
echo 'PACKAGECONFIG_append_pn-nativesdk-qemu = " sdl"' >> yocto/conf/local.conf

bitbake $BUILDIMAGE

ls -all -h $TARGETDIR/yocto/tmp/deploy/images/$MACHINETYPE/

az storage container create --name $STORAGECONTAINER
az storage blob upload --container-name $STORAGECONTAINER --name local.conf --file $TARGETDIR/yocto/conf/local.conf
az storage blob upload --container-name $STORAGECONTAINER --name bblayers.conf --file $TARGETDIR/yocto/yocto/conf/bblayers.conf
az storage blob upload --container-name $STORAGECONTAINER --name console-latest.log --file $TARGETDIR/yocto/tmp/log/cooker/$MACHINETYPE/console-latest.log
az storage blob upload --container-name $STORAGECONTAINER --name $BUILDIMAGE-$MACHINETYPE.hddimg --file $TARGETDIR/yocto/tmp/deploy/images/$MACHINETYPE/$BUILDIMAGE-$MACHINETYPE.hddimg
az storage blob upload --container-name $STORAGECONTAINER --name $BUILDIMAGE-$MACHINETYPE.wic --file $TARGETDIR/yocto/tmp/deploy/images/$MACHINETYPE/$BUILDIMAGE-$MACHINETYPE.wic
