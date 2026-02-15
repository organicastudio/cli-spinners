export type OrganizationCategory = 'group' | 'library' | 'workflow' | 'nft';

export type OrganizationEntry = {
        readonly type: 'directory';
        readonly category: OrganizationCategory;
        readonly name: string;
        readonly path: string;
};

export type OrganizationMirror = {
        readonly name: string;
        readonly library: string;
        readonly workflow: string;
        readonly nft: string;
};

export type OrganizationBlueprint = {
        readonly root: string;
        readonly entries: readonly OrganizationEntry[];
        readonly mirrors: ReadonlyMap<string, OrganizationMirror>;
        readonly richTreeFallback: boolean;
        readonly template: string | null;
        readonly templateDetails: OrganizationTemplate | null;
};

export type AssembleOrganizationOptions = {
        readonly root?: string;
        readonly libraries?: readonly string[];
        readonly workflows?: readonly string[];
        readonly nfts?: readonly string[];
        readonly richTreeFallback?: boolean;
        readonly template?: string;
        readonly templates?: ReadonlyMap<string, OrganizationTemplate> | Record<string, OrganizationTemplate>;
};

export type RenderOrganizationOptions = {
        readonly rich?: boolean;
};

export type MaterializeOrganizationOptions = {
        readonly dryRun?: boolean;
        readonly fsPromises?: typeof import('node:fs/promises');
};

export type MaterializeOrganizationResult = {
        readonly dryRun: boolean;
        readonly created: readonly string[];
        readonly skipped: readonly string[];
};

export type PlannedPathSummary = {
        readonly total: number;
        readonly groups: number;
        readonly libraries: number;
        readonly workflows: number;
        readonly nfts: number;
};

export type OrganizationTemplate = {
        readonly name: string;
        readonly description: string;
        readonly libraries: readonly string[];
        readonly workflows: readonly string[];
        readonly nfts: readonly string[];
        readonly richTreeFallback: boolean;
};

export type OrganizationTemplateRegistry = ReadonlyMap<string, OrganizationTemplate>;

export function assembleMirroredOrganizationBlueprint(options?: AssembleOrganizationOptions): OrganizationBlueprint;

export function renderOrganizationBlueprint(blueprint: OrganizationBlueprint, options?: RenderOrganizationOptions): string;

export function materializeOrganizationBlueprint(blueprint: OrganizationBlueprint, options?: MaterializeOrganizationOptions): Promise<MaterializeOrganizationResult>;

export function summarizePlannedPaths(blueprint: OrganizationBlueprint): PlannedPathSummary;

export const ORGANIC_SEMANTICS_TEMPLATE: OrganizationTemplate;

export const DEFAULT_ORGANIZATION_TEMPLATES: OrganizationTemplateRegistry;
