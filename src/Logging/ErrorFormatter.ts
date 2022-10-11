/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from 'chalk';

export function printError(errorMessage: any) {
    console.error(chalk.red(errorMessage));
}

export function printWarning(errorMessage: any) {
    console.error(chalk.yellow(errorMessage));
}