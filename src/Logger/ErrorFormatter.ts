import chalk from 'Chalk';

export function printError(errorMessage: never) {
    console.error(chalk.red(errorMessage));
}

export function printWarning(errorMessage: never) {
    console.error(chalk.yellow(errorMessage));
}