import { Command } from 'commander';
import chalk from 'chalk';
import { NodeFileSystem } from 'langium/node';
import type { Program } from '../language/generated/ast.ts';
import { GoScriptLanguageMetaData } from '../language/generated/module.ts';
import { createGoScriptServices } from '../language/go-script-module.ts';
import { extractAstNode, extractDocument } from './cli-util.ts';
import { generateGo } from './generator.ts';

const program = new Command();

program
    .name('goscript')
    .description('GoScript CLI - compile .gs files to Go')
    .version('0.1.0');

const fileExtensions = GoScriptLanguageMetaData.fileExtensions.join(', ');

interface GenerateOptions {
    destination?: string;
}

program
    .command('generate')
    .argument('<file>', `Source file to compile (${fileExtensions})`)
    .option('-d, --destination <dir>', 'Output directory for generated Go code')
    .description('Compile a GoScript file to Go')
    .action(async (fileName: string, opts: GenerateOptions) => {
        const services = createGoScriptServices(NodeFileSystem).GoScript;
        const model = await extractAstNode<Program>(fileName, services);
        const generatedFilePath = generateGo(model, fileName, opts.destination);
        console.log(chalk.green(`Go code generated successfully: ${generatedFilePath}`));
    });

program
    .command('parseAndValidate')
    .argument('<file>', `Source file to validate (${fileExtensions})`)
    .description('Parse and validate a GoScript file without generating output')
    .action(async (fileName: string) => {
        const services = createGoScriptServices(NodeFileSystem).GoScript;
        const document = await extractDocument(fileName, services);
        const parseResult = document.parseResult;
        if (parseResult.lexerErrors.length === 0 && parseResult.parserErrors.length === 0) {
            console.log(chalk.green(`Parsed and validated ${fileName} successfully!`));
        } else {
            console.log(chalk.red(`Failed to parse and validate ${fileName}!`));
        }
    });

program.parse(process.argv);
