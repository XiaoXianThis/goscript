import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
    Program,
    Statement,
    Expression,
} from '../language/generated/ast.ts';
import {
    isStringLiteral,
    isNumberLiteral,
    isVariableReference,
    isPrintStatement,
    isVariableDeclaration,
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
    const bodyLines = program.statements
        .map(stmt => generateStatement(stmt))
        .filter(Boolean)
        .map(line => `\t${line}`);

    return `package main

import "fmt"

func main() {
${bodyLines.join('\n')}
}
`;
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
    if (isVariableReference(expr)) {
        return expr.variable.ref?.name ?? '<unresolved>';
    }
    return '';
}
