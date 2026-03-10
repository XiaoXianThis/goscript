import {
    type Module,
    type LangiumCoreServices,
    type LangiumSharedCoreServices,
    type PartialLangiumCoreServices,
    type DefaultSharedCoreModuleContext,
    createDefaultCoreModule,
    createDefaultSharedCoreModule,
    inject,
} from 'langium';
import { GoScriptGeneratedModule, GoScriptGeneratedSharedModule } from './generated/module.ts';
import { GoScriptValidationRegistry, GoScriptValidator } from './go-script-validator.ts';

export type GoScriptAddedServices = {
    validation: {
        GoScriptValidator: GoScriptValidator;
    };
};

export type GoScriptServices = LangiumCoreServices & GoScriptAddedServices;

export const GoScriptModule: Module<GoScriptServices, PartialLangiumCoreServices & GoScriptAddedServices> = {
    validation: {
        GoScriptValidator: () => new GoScriptValidator(),
    },
};

export function createGoScriptServices(context: DefaultSharedCoreModuleContext): {
    shared: LangiumSharedCoreServices;
    GoScript: GoScriptServices;
} {
    const shared = inject(
        createDefaultSharedCoreModule(context),
        GoScriptGeneratedSharedModule
    );
    const GoScript = inject(
        createDefaultCoreModule({ shared }),
        GoScriptGeneratedModule,
        GoScriptModule
    );
    shared.ServiceRegistry.register(GoScript);
    registerValidationChecks(GoScript);
    shared.workspace.WorkspaceManager.initializeWorkspace([]);
    return { shared, GoScript };
}

function registerValidationChecks(services: GoScriptServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.GoScriptValidator;
    const checks: GoScriptValidationRegistry = {
        VariableDeclaration: [
            validator.checkUniqueVariableNames,
        ],
    };
    registry.register(checks, validator);
}
