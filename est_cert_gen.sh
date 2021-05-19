#!/bin/bash

## Copyright (c) Microsoft. All rights reserved.
## Licensed under the MIT license. See LICENSE file in the project root for full license information.

# Prints help message and exits.
help_docs()
{
    echo "This script provides an EST client as a shell script. It can be used"
    echo "to request device CA and ID certs from an EST server."
    echo ""
    echo "Usage with EST server:"
    echo "$0 --server-base-url SERVER --output-dir DIR \\"
    echo -e "\t--req-subject STRING \\"
    echo -e "\t--type [ca | id]"
    echo -e "\t[--auth-cert FILE] [--auth-user USER --auth-pass PASS] \\"
    echo -e "\t[--rsa-key-length NUMBER | --ec-curve NAME] \\"
    echo -e "\t[--additional-path STRING] \\"
    echo -e "\t[--root-ca FILE] \\"
    echo ""
    echo "It can also be used to issue a device ID certificate from a device CA"
    echo "cert without an EST server by passing --chain-id-to-ca."
    echo ""
    echo "Usage to issue device ID cert from device CA cert:"
    echo "$0 --output-dir DIR --req-subject STRING --type id \\"
    echo -e "\t--device-ca-cert FILE --device-ca-cert-key FILE \\"
    echo -e "\t--chain-id-to-ca \\"
    echo -e "\t[--rsa-key-length NUMBER | --ec-curve NAME] \\"
    echo -e "\t[--id-expiry-days NUMBER]"
    echo ""
    echo "Required arguments:"
    echo "--output-dir DIR"
    echo -e "\tOutput directory for enrolled credentials."
    echo "--req-subject STRING"
    echo -e "\tRequest subject to include with certificate requests. Separate each RDN"
    echo -e "\twith a '/', e.g. \"/C=US/ST=WA/L=Redmond/O=Contoso/CN=Test\""
    echo "--type [ca | id]"
    echo -e "\tType of certificate requested from the EST server. If --chain-id-to-ca"
    echo -e "\tis passed, only id is valid."
    echo ""
    echo "Additional required arguments when using an EST server:"
    echo "--server-base-url SERVER"
    echo -e "\tHTTPS URL of EST server."
    echo "--auth-cert FILE"
    echo -e "\tPath to certificate for authentication with server."
    echo "--auth-user USER --auth-pass PASS"
    echo -e "\tUser name and password for authentication with server. Authentication"
    echo -e "\twith certificate is recommended instead of user name and password."
    echo ""
    echo "Additional required arguments when issuing device ID cert from device CA cert:"
    echo "--chain-id-to-ca"
    echo -e "\tSign the device ID cert with the device CA cert instead of EST CSR."
    echo "--device-ca-cert FILE"
    echo -e "\tPath to device CA cert."
    echo "--device-ca-cert-key FILE"
    echo -e "\tPath to device CA cert key."
    echo ""
    echo "Optional arguments:"
    echo "--rsa-key-length NUMBER"
    echo -e "\tLength of RSA private key to generate. Defaults to 2048 if not provided."
    echo "--ec-curve NAME"
    echo -e "\tGenerate EC credentials instead of RSA credentials. This argument specifies"
    echo -e "\tthe name of the curve to use. Run 'openssl ecparam -list_curves' to see a list"
    echo -e "\tof available curves. This script generates RSA credentials unless this argument"
    echo -e "\tis provided."
    echo ""
    echo "Additional optional arguments when using an EST server:"
    echo "--additional-path STRING"
    echo -e "\tAdditional path segment for the EST server. This is used to distinguish"
    echo -e "\tbetween multiple CAs as specified for EST in RFC 7045."
    echo "--root-ca FILE"
    echo -e "\tPath to trusted root CA certificate. System root store will be used if"
    echo -e "\tnot provided."
    echo ""
    echo "Additional optional arguments when issuing device ID cert from device CA cert:"
    echo "--id-expiry-days NUMBER"
    echo -e "\tHow long (in days) until expiry of the device ID cert when it is signed with"
    echo -e "\tthe device CA cert. Defaults to 365 if not provided."

    exit 0
}

# Logs a message to stdout in blue.
log_msg()
{
    echo -e "\033[0;36m$1\033[0m"
}

# Logs a message to stderr in red.
log_err()
{
    echo -e "\033[0;31m$1\033[0m" 1>&2
}

# Checks that prerequisites are available.
check_prereqs()
{
    local prereqs=("openssl" "curl")

    for p in "${prereqs[@]}"; do
        if ! [ -x "$(command -v "$p")" ]; then
            echo "$p missing. Please install before proceeding."
            exit 1
        fi
    done
}

# Default values for optional arguments.
chain_id=false
additional_path=""
root_ca=""
key_length=2048
ec_curve=""
expiry_days=365

# Parses command line arguments. Silently ignores unknown arguments.
parse_args()
{
    for opt in "$@"; do
        case "$opt" in
            "--additional-path")
                additional_path="${2}/"
                shift 2
                ;;
            "--auth-cert")
                auth_cert="$2"
                shift 2
                ;;
            "--auth-pass")
                auth_pass="$2"
                shift 2
                ;;
            "--auth-user")
                auth_user="$2"
                shift 2
                ;;
            "--chain-id-to-ca")
                chain_id=true
                shift
                ;;
            "--device-ca-cert")
                device_ca_cert="$2"
                shift 2
                ;;
            "--device-ca-cert-key")
                device_ca_cert_key="$2"
                shift 2
                ;;
            "--ec-curve")
                ec_curve="$2"
                shift 2
                ;;
            "--id-expiry-days")
                expiry_days="$2"
                shift 2
                ;;
            "--output-dir")
                out_dir="$2"
                shift 2
                ;;
            "--req-subject")
                req_subj="$2"
                shift 2
                ;;
            "--root-ca")
                root_ca="$2"
                shift 2
                ;;
            "--rsa-key-length")
                key_length="$2"
                shift 2
                ;;
            "--server-base-url")
                server_base="$2"
                shift 2
                ;;
            "--type")
                type="$2"
                shift 2
                ;;
        esac
    done
}

# Check arguments and sets auth_option argument for curl.
check_args()
{
    if [ -z "$out_dir" ]; then
        log_err "Missing required argument: --output-dir DIR"
        help_docs
    else
        mkdir -p "$out_dir"
    fi

    if [ -z "$req_subj" ]; then
        log_err "Missing required argument: --req-subject STRING"
        help_docs
    fi

    if [ -z "$type" ]; then
        log_err "Missing required argument: --type [ca | id]"
        help_docs
    else
        if [ "$type" != "ca" ] && [ "$type" != "id" ]; then
            log_err "Invalid type $type. Valid options are ca or id."
            help_docs
        fi
    fi

    if [ "$chain_id" = true ]; then
        if [ "$type" != "id" ]; then
            log_err "Invalid type $type for --chain-id-to-ca. Only id is valid."
            help_docs
        fi

        if [ -z "$device_ca_cert" ]; then
            log_err "Missing required argument: --device-ca-cert FILE"
            help_docs
        fi

        if [ -z "$device_ca_cert_key" ]; then
            log_err "Missing required argument: --device-ca-cert-key FILE"
            help_docs
        fi
    else
        if [ -z "$server_base" ]; then
            log_err "Missing required argument: --server-base-url SERVER"
            help_docs
        fi

        auth_option=""
        if [ -n "$auth_cert" ]; then
            auth_option+="--cert $auth_cert"
        fi

        if [ -n "$auth_user" ]; then
            if [ -n "$auth_pass" ]; then
                auth_option+=" --user $auth_user:$auth_pass"
            else
                log_err "Username provided, but missing --auth-pass."
                help_docs
            fi
        else
            if [ -n "$auth_pass" ]; then
                log_err "Password provided, but missing --auth-user."
                help_docs
            fi
        fi

        if [ -z "$auth_option" ]; then
            log_err "Authentication options (--auth-cert, --auth-user, --auth-pass) missing."
            help_docs
        fi
    fi
}

# Generate a private key and signing request.
# Parameter: File path for private key.
gen_key_and_req()
{
    if [ -z "$ec_curve" ]; then
        log_msg "Creating private key $1 (RSA $key_length)."
        openssl genrsa -out "$1" "$key_length"
    else
        log_msg "Creating private key $1 (EC $ec_curve)."
        openssl ecparam -name "$ec_curve" -genkey -noout -out "$private_key"
    fi

    openssl req -new -key "$private_key" -subj "$req_subj" -out "$temp_dir/req.p10"
}

# Enroll a certificate by sending a /simpleenroll request to the EST server.
# Parameter: "device_ca_cert" or "device_id_cert".
enroll_cert()
{
    log_msg "Starting certificate signing request for $1."

    local private_key="$out_dir/$1_key.pem"
    gen_key_and_req "$private_key"

    local ca_cert_file=""
    if [ -n "$root_ca" ]; then
        ca_cert_file="--cacert $root_ca"
    fi

    log_msg "Sending EST enrollment request for $1."
    local result=$(curl "$server_base/.well-known/est/${additional_path}simpleenroll" \
        $auth_option \
        $ca_cert_file \
        --output "$temp_dir/cert.p7" \
        --header "Content-Type: application/pkcs10" \
        --header "Content-Transfer-Encoding: base64" \
        --data-binary "@$temp_dir/req.p10" \
        --write-out "%{http_code}" \
        --dump-header "$temp_dir/resp.hdr")

    if [ "$result" -ne "200" ]; then
        if [ "$result" -ne "000" ]; then
            log_err "The EST request to $server_base failed with HTTP $result."
            cat "$temp_dir/resp.hdr"
            cat "$temp_dir/cert.p7"
        fi

        rm "$private_key"
        exit 1
    fi

    openssl base64 -d -in "$temp_dir/cert.p7" | \
    openssl pkcs7 -inform DER -outform PEM -print_certs | \
    openssl x509 -out "$out_dir/$1.pem"

    log_msg "Successfully enrolled $1."
}

# If requested, sign the device ID cert with the device CA cert.
sign_device_id_cert()
{
    local private_key="$out_dir/device_id_cert_key.pem"
    gen_key_and_req "$private_key"

    # Configure cert extensions for issued device ID cert.
    local cert_extensions="
    [ device_id_cert ]
    basicConstraints = CA:FALSE
    nsCertType = client, email
    subjectKeyIdentifier = hash
    authorityKeyIdentifier = keyid:always,issuer:always
    keyUsage = critical, nonRepudiation, digitalSignature, keyEncipherment
    extendedKeyUsage = clientAuth, emailProtection
    "
    echo "$cert_extensions" > "$temp_dir/device_id_cert.conf"

    openssl x509 -req \
        -CAcreateserial -days "$expiry_days" -sha256 \
        -extfile "$temp_dir/device_id_cert.conf" \
        -extensions device_id_cert \
        -in "$temp_dir/req.p10" \
        -CA "$device_ca_cert" \
        -CAkey "$device_ca_cert_key" \
        -out "$out_dir/device_id_cert.pem"

    # Append device CA cert to device ID cert to establish the cert
    # chain for IoT Edge.
    cat "$device_ca_cert" >> "$out_dir/device_id_cert.pem"
}

set -Eeo pipefail

# Management of script's temporary directory.
temp_dir="$(mktemp -d)"
trap 'rm -rf $temp_dir' EXIT

# Check prerequisites and process command-line arguments.
check_prereqs
parse_args "$@"
check_args

# Generate credentials.
set -u

if [ "$chain_id" = true ]; then
    sign_device_id_cert
    log_msg "device_id_cert has been signed with $device_ca_cert."
else
    enroll_cert "device_${type}_cert"
    log_msg "device_${type}_cert has been generated."
fi

log_msg "Certificates are output in $out_dir"
log_msg "Please update IoT Edge's config.yaml accordingly."
