/* eslint-disable indent */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path = require('path');
import { PackageInfo } from '../Domain/model/packageInfo';

/**
 * Generates a name for the given package in the form: "group-name-version".
 * @param {PackageInfo} packageInfo Entry from bom.json containing information for one package.
 * @returns {string} The generated name for the package.
 */
export function generatePackageName(packageInfo: PackageInfo): string {
    let fileName = '';
    if (packageInfo.group.trim() != '') {
        fileName += packageInfo.group + '-';
    }
    if (packageInfo.name.trim() != '') {
        fileName += packageInfo.name + '-';
    }
    if (fileName === '') {
        fileName = 'unnamed-';
    }
    if (packageInfo.version.trim() != '') {
        fileName += packageInfo.version;
    }
    return fileName.charAt(fileName.length - 1) == '-' ? fileName.substring(0, fileName.length - 1) : fileName;
}

/**
 * Generates a log message from the info of the given package depending on the given level.
 * @param {PackageInfo} packageInfo Entry from bom.json containing information for one package.
 * @param {string} level The level of the log message.
 * @returns {string} The message to be added to the log.
 */
export function generateLogMessage(packageInfo: PackageInfo, level: string): string {
    switch (level) {
        case 'License':
            return `No License found for: ${generatePackageName(packageInfo)}`;
        case 'ExtRefs':
            return `No external references found for: ${generatePackageName(packageInfo)}`;
        case 'Copyright':
            return `Unable to extract copyright notice for: ${generatePackageName(packageInfo)}`;
        default:
            return '';
    }
}

/**
 * Saves the given license file to the disk.
 * @param {string} license The license to be saved.
 * @param {PackageInfo} packageInfo The information about the corresponding package.
 */
export function writeLicenseToDisk(license, fileName: string): void {
    try {
        if (!existsSync(path.join('out', 'licenses'))) {
            mkdirSync(path.join('out', 'licenses'));
        }
        writeFileSync(path.join('out', 'licenses', `${fileName}.txt`), license);
    } catch (err) {
        console.error(err);
    }
}