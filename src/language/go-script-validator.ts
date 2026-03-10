import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { GoScriptAstType, VariableDeclaration, Program } from './generated/ast.ts';

export type GoScriptValidationRegistry = ValidationChecks<GoScriptAstType>;

export class GoScriptValidator {
    checkUniqueVariableNames(decl: VariableDeclaration, accept: ValidationAcceptor): void {
        const program = decl.$container as Program;
        const allDecls = program.statements.filter(
            (s): s is VariableDeclaration => s.$type === 'VariableDeclaration'
        );
        const duplicates = allDecls.filter(d => d.name === decl.name);
        if (duplicates.length > 1 && duplicates[0] !== decl) {
            accept('error', `Duplicate variable name: '${decl.name}'`, {
                node: decl,
                property: 'name',
            });
        }
    }
}
