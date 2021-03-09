#!/bin/bash
set -e

SCRIPT_DIR=$( cd $( dirname $(readlink -f ${BASH_SOURCE[0]}) ) && pwd )
CONFIG_DIR=${SCRIPT_DIR}/.obsidian

helpFunc(){
    echo ""
    echo "Usage: ./setup.sh backup/restore"
    echo ""
    echo -e " ./setup.sh backup \t Back up config files before open"
    echo -e "                   \t the vault for the first time"
    echo -e " ./setup.sh restore \t Restore config files with backup"
    exit 1
}

backup(){
    cp "${CONFIG_DIR}/config" "${CONFIG_DIR}/config.backup"
    cp "${CONFIG_DIR}/workspace" "${CONFIG_DIR}/workspace.backup"
}

restore(){
    cp "${CONFIG_DIR}/config.backup" "${CONFIG_DIR}/config"
    cp "${CONFIG_DIR}/workspace.backup" "${CONFIG_DIR}/workspace"
    rm "${CONFIG_DIR}/config.backup"
    rm "${CONFIG_DIR}/workspace.backup"
}

setup() {
    if [ $# = 0 ] || [ $1 = "-h" ] || [ $1 = "--help" ]; then
        helpFunc
    fi
    case $1 in
        "backup" )  backup;;
        "restore" )  restore;;
        ?) helpFunc;;
    esac
}

setup $@
