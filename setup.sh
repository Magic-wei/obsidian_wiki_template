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
    for entry in $(ls ${CONFIG_DIR}); do
        if (test -f ${CONFIG_DIR}/${entry}) ; then
            cp "${CONFIG_DIR}/${entry}" "${CONFIG_DIR}/${entry}.bak"
        fi
    done
}

restore(){
    for entry in $(ls ${CONFIG_DIR}); do
        if (test -f ${CONFIG_DIR}/${entry}.bak) ; then
            mv "${CONFIG_DIR}/${entry}.bak" "${CONFIG_DIR}/${entry}"
        fi
    done
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
