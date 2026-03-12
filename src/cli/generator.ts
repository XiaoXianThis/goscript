import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
    Program,
    Statement,
    Expression,
    TopLevelDeclaration,
    FunctionDeclaration,
} from '../language/generated/ast.ts';
import {
    isStringLiteral,
    isNumberLiteral,
    isIdentifierReference,
    isPrintStatement,
    isVariableDeclaration,
    isFunctionDeclaration,
} from '../language/generated/ast.ts';
import { extractDestinationAndName } from './cli-util.ts';

export function generateGo(model: Program, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = path.join(data.destination, `${data.name}.go`);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }

    const goCode = generateProgram(model);
    fs.writeFileSync(generatedFilePath, goCode);
    return generatedFilePath;
}

function generateProgram(program: Program): string {
    const pkg = program.packageClause?.name ?? 'main';
    const importLines = (program.imports ?? [])
        .map(imp => (imp.importSpec ? `import ${imp.importSpec} ${imp.path}` : `import ${imp.path}`))
        .join('\n');
    const declLines = (program.declarations ?? [])
        .map(d => generateTopLevelDeclaration(d))
        .filter(Boolean)
        .join('\n\n');

    return `package ${pkg}

${importLines}

${declLines}
`;
}

function generateTopLevelDeclaration(decl: TopLevelDeclaration): string {
    if (isFunctionDeclaration(decl)) {
        return generateFunctionDeclaration(decl);
    }
    return '';
}

function generateFunctionDeclaration(fn: FunctionDeclaration): string {
    const name = fn.name;
    const params = (fn.params ?? []).map(p => p.name).join(', ');
    const body = fn.block?.statements
        ? fn.block.statements.map(s => generateStatement(s)).filter(Boolean).map(line => `\t${line}`).join('\n')
        : '';
    return `func ${name}(${params}) {\n${body}\n}`;
}

function generateStatement(stmt: Statement): string {
    if (isPrintStatement(stmt)) {
        const expr = generateExpression(stmt.value);
        return `fmt.Println(${expr})`;
    }
    if (isVariableDeclaration(stmt)) {
        const expr = generateExpression(stmt.value);
        return `${stmt.name} := ${expr}`;
    }
    return '';
}

function generateExpression(expr: Expression): string {
    if (isStringLiteral(expr)) {
        return `"${expr.value}"`;
    }
    if (isNumberLiteral(expr)) {
        return expr.value;
    }
    if (isIdentifierReference(expr)) {
        return expr.name;
    }
    return '';
}
