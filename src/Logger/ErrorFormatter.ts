import chalk from 'Chalk';

export function printError(errorMessage: any) {
    console.error(chalk.red(errorMessage));
}

export function printWarning(errorMessage: any) {
    console.error(chalk.yellow(errorMessage));
}