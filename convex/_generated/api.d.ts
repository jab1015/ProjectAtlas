/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accountDeletion from "../accountDeletion.js";
import type * as accountDeletionPolicy from "../accountDeletionPolicy.js";
import type * as atlasChat from "../atlasChat.js";
import type * as atlasChatAction from "../atlasChatAction.js";
import type * as atlasUsage from "../atlasUsage.js";
import type * as atlasWorkOrchestration from "../atlasWorkOrchestration.js";
import type * as atlasWorkState from "../atlasWorkState.js";
import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as autonomyMaintenance from "../autonomyMaintenance.js";
import type * as autonomyMaintenanceLogic from "../autonomyMaintenanceLogic.js";
import type * as betaAccess from "../betaAccess.js";
import type * as betaAccessLogic from "../betaAccessLogic.js";
import type * as blockedWorkResponseMutation from "../blockedWorkResponseMutation.js";
import type * as cadArtifactKinds from "../cadArtifactKinds.js";
import type * as cadDrawing from "../cadDrawing.js";
import type * as cadGeometry from "../cadGeometry.js";
import type * as canonicalWorkPlan from "../canonicalWorkPlan.js";
import type * as categories from "../categories.js";
import type * as chatEvidenceCapture from "../chatEvidenceCapture.js";
import type * as chatEvidenceLogic from "../chatEvidenceLogic.js";
import type * as chatPolicyLogic from "../chatPolicyLogic.js";
import type * as conceptImageLogic from "../conceptImageLogic.js";
import type * as consequentialApprovalMutation from "../consequentialApprovalMutation.js";
import type * as costEconomicsLogic from "../costEconomicsLogic.js";
import type * as crons from "../crons.js";
import type * as deliverableDownloads from "../deliverableDownloads.js";
import type * as deliverableLogic from "../deliverableLogic.js";
import type * as deliverablePersistenceLogic from "../deliverablePersistenceLogic.js";
import type * as departmentAgentLogic from "../departmentAgentLogic.js";
import type * as departmentExtensions from "../departmentExtensions.js";
import type * as downloadHandler from "../downloadHandler.js";
import type * as entitlementPolicyLogic from "../entitlementPolicyLogic.js";
import type * as evidenceExtractionControl from "../evidenceExtractionControl.js";
import type * as evidenceFileExtraction from "../evidenceFileExtraction.js";
import type * as evidenceImpact from "../evidenceImpact.js";
import type * as evidenceImpactScopeLogic from "../evidenceImpactScopeLogic.js";
import type * as evidenceIntegrityLogic from "../evidenceIntegrityLogic.js";
import type * as evidenceRequests from "../evidenceRequests.js";
import type * as externalUseAuthorization from "../externalUseAuthorization.js";
import type * as faqEntries from "../faqEntries.js";
import type * as files from "../files.js";
import type * as filesInternal from "../filesInternal.js";
import type * as fulfillmentWebhook from "../fulfillmentWebhook.js";
import type * as fullJourneyDefinition from "../fullJourneyDefinition.js";
import type * as fullProductWorkPlan from "../fullProductWorkPlan.js";
import type * as http from "../http.js";
import type * as inventionClassificationLogic from "../inventionClassificationLogic.js";
import type * as inventionInitialization from "../inventionInitialization.js";
import type * as inventionMigrations from "../inventionMigrations.js";
import type * as inventionRefresh from "../inventionRefresh.js";
import type * as inventionSharing from "../inventionSharing.js";
import type * as inventionWorkPlanLogic from "../inventionWorkPlanLogic.js";
import type * as inventionWorkspace from "../inventionWorkspace.js";
import type * as journeyCenter from "../journeyCenter.js";
import type * as journeyEngine from "../journeyEngine.js";
import type * as lifecycleDepartments from "../lifecycleDepartments.js";
import type * as lifecycleWorkKinds from "../lifecycleWorkKinds.js";
import type * as manufacturingMaturityLogic from "../manufacturingMaturityLogic.js";
import type * as manufacturingReleaseMutation from "../manufacturingReleaseMutation.js";
import type * as mockValidationResearchProvider from "../mockValidationResearchProvider.js";
import type * as nativeCad from "../nativeCad.js";
import type * as nativeCadGeneration from "../nativeCadGeneration.js";
import type * as openaiValidationResearchProvider from "../openaiValidationResearchProvider.js";
import type * as operationalHealth from "../operationalHealth.js";
import type * as operationalHealthLogic from "../operationalHealthLogic.js";
import type * as organizationDailyUsage from "../organizationDailyUsage.js";
import type * as organizationExport from "../organizationExport.js";
import type * as organizationInventions from "../organizationInventions.js";
import type * as organizationInvitations from "../organizationInvitations.js";
import type * as organizationNavigation from "../organizationNavigation.js";
import type * as organizationOwnership from "../organizationOwnership.js";
import type * as organizationPolicyLogic from "../organizationPolicyLogic.js";
import type * as organizationUsage from "../organizationUsage.js";
import type * as organizationUsageScope from "../organizationUsageScope.js";
import type * as organizations from "../organizations.js";
import type * as pilotEvaluationLogic from "../pilotEvaluationLogic.js";
import type * as pitchDeckArtifact from "../pitchDeckArtifact.js";
import type * as pptxWriter from "../pptxWriter.js";
import type * as privacyExport from "../privacyExport.js";
import type * as privacyRequests from "../privacyRequests.js";
import type * as productDesign from "../productDesign.js";
import type * as productFiles from "../productFiles.js";
import type * as products from "../products.js";
import type * as productsAdmin from "../productsAdmin.js";
import type * as productsInternal from "../productsInternal.js";
import type * as productsMutations from "../productsMutations.js";
import type * as professionalReviewLogic from "../professionalReviewLogic.js";
import type * as professionalReviewMutation from "../professionalReviewMutation.js";
import type * as professionalReviewPolicy from "../professionalReviewPolicy.js";
import type * as projectStateSummaryLogic from "../projectStateSummaryLogic.js";
import type * as purchases from "../purchases.js";
import type * as purchasesInternal from "../purchasesInternal.js";
import type * as purchasesMutations from "../purchasesMutations.js";
import type * as reviewLogic from "../reviewLogic.js";
import type * as riskTriageLogic from "../riskTriageLogic.js";
import type * as seed from "../seed.js";
import type * as softwareWorkPlan from "../softwareWorkPlan.js";
import type * as stalenessLogic from "../stalenessLogic.js";
import type * as statusBriefingLogic from "../statusBriefingLogic.js";
import type * as subscriptionMutations from "../subscriptionMutations.js";
import type * as subscriptionPolicyLogic from "../subscriptionPolicyLogic.js";
import type * as subscriptionWebhook from "../subscriptionWebhook.js";
import type * as supportCases from "../supportCases.js";
import type * as tabularExportLogic from "../tabularExportLogic.js";
import type * as testimonials from "../testimonials.js";
import type * as usagePolicyLogic from "../usagePolicyLogic.js";
import type * as usageSettlementLogic from "../usageSettlementLogic.js";
import type * as users from "../users.js";
import type * as usersMutations from "../usersMutations.js";
import type * as validation_researchProvider from "../validation/researchProvider.js";
import type * as validationActions from "../validationActions.js";
import type * as validationConfidenceLogic from "../validationConfidenceLogic.js";
import type * as validationEvidence from "../validationEvidence.js";
import type * as validationMutations from "../validationMutations.js";
import type * as validationResearchMutations from "../validationResearchMutations.js";
import type * as validationResearchOrchestration from "../validationResearchOrchestration.js";
import type * as validationResearchOrchestrationRunner from "../validationResearchOrchestrationRunner.js";
import type * as validationResearchProvider from "../validationResearchProvider.js";
import type * as validationResearchRecovery from "../validationResearchRecovery.js";
import type * as validationResearchRecoveryLogic from "../validationResearchRecoveryLogic.js";
import type * as validationResearchSessionMutations from "../validationResearchSessionMutations.js";
import type * as validationResearchTypes from "../validationResearchTypes.js";
import type * as webRetrievalEvidenceLogic from "../webRetrievalEvidenceLogic.js";
import type * as webhookSecurityLogic from "../webhookSecurityLogic.js";
import type * as workFailureSummary from "../workFailureSummary.js";
import type * as workOrchestratorLogic from "../workOrchestratorLogic.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accountDeletion: typeof accountDeletion;
  accountDeletionPolicy: typeof accountDeletionPolicy;
  atlasChat: typeof atlasChat;
  atlasChatAction: typeof atlasChatAction;
  atlasUsage: typeof atlasUsage;
  atlasWorkOrchestration: typeof atlasWorkOrchestration;
  atlasWorkState: typeof atlasWorkState;
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  autonomyMaintenance: typeof autonomyMaintenance;
  autonomyMaintenanceLogic: typeof autonomyMaintenanceLogic;
  betaAccess: typeof betaAccess;
  betaAccessLogic: typeof betaAccessLogic;
  blockedWorkResponseMutation: typeof blockedWorkResponseMutation;
  cadArtifactKinds: typeof cadArtifactKinds;
  cadDrawing: typeof cadDrawing;
  cadGeometry: typeof cadGeometry;
  canonicalWorkPlan: typeof canonicalWorkPlan;
  categories: typeof categories;
  chatEvidenceCapture: typeof chatEvidenceCapture;
  chatEvidenceLogic: typeof chatEvidenceLogic;
  chatPolicyLogic: typeof chatPolicyLogic;
  conceptImageLogic: typeof conceptImageLogic;
  consequentialApprovalMutation: typeof consequentialApprovalMutation;
  costEconomicsLogic: typeof costEconomicsLogic;
  crons: typeof crons;
  deliverableDownloads: typeof deliverableDownloads;
  deliverableLogic: typeof deliverableLogic;
  deliverablePersistenceLogic: typeof deliverablePersistenceLogic;
  departmentAgentLogic: typeof departmentAgentLogic;
  departmentExtensions: typeof departmentExtensions;
  downloadHandler: typeof downloadHandler;
  entitlementPolicyLogic: typeof entitlementPolicyLogic;
  evidenceExtractionControl: typeof evidenceExtractionControl;
  evidenceFileExtraction: typeof evidenceFileExtraction;
  evidenceImpact: typeof evidenceImpact;
  evidenceImpactScopeLogic: typeof evidenceImpactScopeLogic;
  evidenceIntegrityLogic: typeof evidenceIntegrityLogic;
  evidenceRequests: typeof evidenceRequests;
  externalUseAuthorization: typeof externalUseAuthorization;
  faqEntries: typeof faqEntries;
  files: typeof files;
  filesInternal: typeof filesInternal;
  fulfillmentWebhook: typeof fulfillmentWebhook;
  fullJourneyDefinition: typeof fullJourneyDefinition;
  fullProductWorkPlan: typeof fullProductWorkPlan;
  http: typeof http;
  inventionClassificationLogic: typeof inventionClassificationLogic;
  inventionInitialization: typeof inventionInitialization;
  inventionMigrations: typeof inventionMigrations;
  inventionRefresh: typeof inventionRefresh;
  inventionSharing: typeof inventionSharing;
  inventionWorkPlanLogic: typeof inventionWorkPlanLogic;
  inventionWorkspace: typeof inventionWorkspace;
  journeyCenter: typeof journeyCenter;
  journeyEngine: typeof journeyEngine;
  lifecycleDepartments: typeof lifecycleDepartments;
  lifecycleWorkKinds: typeof lifecycleWorkKinds;
  manufacturingMaturityLogic: typeof manufacturingMaturityLogic;
  manufacturingReleaseMutation: typeof manufacturingReleaseMutation;
  mockValidationResearchProvider: typeof mockValidationResearchProvider;
  nativeCad: typeof nativeCad;
  nativeCadGeneration: typeof nativeCadGeneration;
  openaiValidationResearchProvider: typeof openaiValidationResearchProvider;
  operationalHealth: typeof operationalHealth;
  operationalHealthLogic: typeof operationalHealthLogic;
  organizationDailyUsage: typeof organizationDailyUsage;
  organizationExport: typeof organizationExport;
  organizationInventions: typeof organizationInventions;
  organizationInvitations: typeof organizationInvitations;
  organizationNavigation: typeof organizationNavigation;
  organizationOwnership: typeof organizationOwnership;
  organizationPolicyLogic: typeof organizationPolicyLogic;
  organizationUsage: typeof organizationUsage;
  organizationUsageScope: typeof organizationUsageScope;
  organizations: typeof organizations;
  pilotEvaluationLogic: typeof pilotEvaluationLogic;
  pitchDeckArtifact: typeof pitchDeckArtifact;
  pptxWriter: typeof pptxWriter;
  privacyExport: typeof privacyExport;
  privacyRequests: typeof privacyRequests;
  productDesign: typeof productDesign;
  productFiles: typeof productFiles;
  products: typeof products;
  productsAdmin: typeof productsAdmin;
  productsInternal: typeof productsInternal;
  productsMutations: typeof productsMutations;
  professionalReviewLogic: typeof professionalReviewLogic;
  professionalReviewMutation: typeof professionalReviewMutation;
  professionalReviewPolicy: typeof professionalReviewPolicy;
  projectStateSummaryLogic: typeof projectStateSummaryLogic;
  purchases: typeof purchases;
  purchasesInternal: typeof purchasesInternal;
  purchasesMutations: typeof purchasesMutations;
  reviewLogic: typeof reviewLogic;
  riskTriageLogic: typeof riskTriageLogic;
  seed: typeof seed;
  softwareWorkPlan: typeof softwareWorkPlan;
  stalenessLogic: typeof stalenessLogic;
  statusBriefingLogic: typeof statusBriefingLogic;
  subscriptionMutations: typeof subscriptionMutations;
  subscriptionPolicyLogic: typeof subscriptionPolicyLogic;
  subscriptionWebhook: typeof subscriptionWebhook;
  supportCases: typeof supportCases;
  tabularExportLogic: typeof tabularExportLogic;
  testimonials: typeof testimonials;
  usagePolicyLogic: typeof usagePolicyLogic;
  usageSettlementLogic: typeof usageSettlementLogic;
  users: typeof users;
  usersMutations: typeof usersMutations;
  "validation/researchProvider": typeof validation_researchProvider;
  validationActions: typeof validationActions;
  validationConfidenceLogic: typeof validationConfidenceLogic;
  validationEvidence: typeof validationEvidence;
  validationMutations: typeof validationMutations;
  validationResearchMutations: typeof validationResearchMutations;
  validationResearchOrchestration: typeof validationResearchOrchestration;
  validationResearchOrchestrationRunner: typeof validationResearchOrchestrationRunner;
  validationResearchProvider: typeof validationResearchProvider;
  validationResearchRecovery: typeof validationResearchRecovery;
  validationResearchRecoveryLogic: typeof validationResearchRecoveryLogic;
  validationResearchSessionMutations: typeof validationResearchSessionMutations;
  validationResearchTypes: typeof validationResearchTypes;
  webRetrievalEvidenceLogic: typeof webRetrievalEvidenceLogic;
  webhookSecurityLogic: typeof webhookSecurityLogic;
  workFailureSummary: typeof workFailureSummary;
  workOrchestratorLogic: typeof workOrchestratorLogic;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
