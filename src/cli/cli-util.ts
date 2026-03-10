import type { AstNode, LangiumCoreServices, LangiumDocument } from 'langium';
import { URI } from 'langium';
import * as path from 'node:path';
import * as fs from 'node:fs';

export async function extractDocument(
    fileName: string,
    services: LangiumCoreServices
): Promise<LangiumDocument> {
    const extensions = services.LanguageMetaData.fileExtensions;
    if (!extensions.includes(path.extname(fileName))) {
        console.error(
            `Please choose a file with one of these extensions: ${extensions.join(', ')}.`
        );
        process.exit(1);
    }

    if (!fs.existsSync(fileName)) {
        console.error(`File ${fileName} does not exist.`);
        process.exit(1);
    }

    const document = await services.shared.workspace.LangiumDocuments.getOrCreateDocument(
        URI.file(path.resolve(fileName))
    );
    await services.shared.workspace.DocumentBuilder.build([document], {
        validation: true,
    });

    const validationErrors = (document.diagnostics ?? []).filter(
        (e) => e.severity === 1
    );
    if (validationErrors.length > 0) {
        console.error('There are validation errors:');
        for (const error of validationErrors) {
            console.error(
                `  line ${error.range.start.line + 1}: ${error.message} [${document.textDocument.getText(error.range)}]`
            );
        }
        process.exit(1);
    }

    return document;
}

export async function extractAstNode<T extends AstNode>(
    fileName: string,
    services: LangiumCoreServices
): Promise<T> {
    return (await extractDocument(fileName, services)).parseResult.value as T;
}

export function extractDestinationAndName(
    filePath: string,
    destination: string | undefined
): { destination: string; name: string } {
    filePath = path.basename(filePath, path.extname(filePath)).replace(/[^\w]/g, '-');
    return {
        destination: destination ?? path.join('.', 'generated'),
        name: filePath,
    };
}
