import { prototype as api } from "./prototype";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    addTree: build.mutation<AddTreeApiResponse, AddTreeApiArg>({
      query: (queryArg) => ({
        url: `/api/add_tree`,
        method: "POST",
        body: queryArg.createTreeRequest,
      }),
    }),
    applyRule: build.mutation<ApplyRuleApiResponse, ApplyRuleApiArg>({
      query: (queryArg) => ({
        url: `/api/apply`,
        method: "POST",
        body: queryArg.applyRuleParams,
      }),
    }),
    check: build.mutation<CheckApiResponse, CheckApiArg>({
      query: (queryArg) => ({
        url: `/api/check`,
        method: "POST",
        body: queryArg.statement,
      }),
    }),
    getExercises: build.query<GetExercisesApiResponse, GetExercisesApiArg>({
      query: () => ({ url: `/api/exercise` }),
    }),
    createExercise: build.mutation<
      CreateExerciseApiResponse,
      CreateExerciseApiArg
    >({
      query: (queryArg) => ({
        url: `/api/exercise`,
        method: "POST",
        body: queryArg.createExerciseRequest,
      }),
    }),
    getExercise: build.query<GetExerciseApiResponse, GetExerciseApiArg>({
      query: (queryArg) => ({ url: `/api/exercise/${queryArg.id}` }),
    }),
    postFeedback: build.mutation<PostFeedbackApiResponse, PostFeedbackApiArg>({
      query: (queryArg) => ({
        url: `/api/exercise/${queryArg.id}/feedback`,
        method: "POST",
        body: queryArg.feedback,
      }),
    }),
    parse: build.mutation<ParseApiResponse, ParseApiArg>({
      query: (queryArg) => ({
        url: `/api/parse`,
        method: "POST",
        body: queryArg.parseParams,
      }),
    }),
    allRules: build.query<AllRulesApiResponse, AllRulesApiArg>({
      query: () => ({ url: `/api/rules` }),
    }),
    getTipp: build.mutation<GetTippApiResponse, GetTippApiArg>({
      query: (queryArg) => ({
        url: `/api/statement/hint`,
        method: "POST",
        body: queryArg.statement,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type AddTreeApiResponse = unknown;
export type AddTreeApiArg = {
  createTreeRequest: CreateTreeRequest;
};
export type ApplyRuleApiResponse = /** status 200  */ Statement[];
export type ApplyRuleApiArg = {
  applyRuleParams: ApplyRuleParams;
};
export type CheckApiResponse = unknown;
export type CheckApiArg = {
  statement: Statement;
};
export type GetExercisesApiResponse = /** status 200  */ Exercise[];
export type GetExercisesApiArg = void;
export type CreateExerciseApiResponse = unknown;
export type CreateExerciseApiArg = {
  createExerciseRequest: CreateExerciseRequest;
};
export type GetExerciseApiResponse = /** status 200  */ Statement;
export type GetExerciseApiArg = {
  id: string;
};
export type PostFeedbackApiResponse = unknown;
export type PostFeedbackApiArg = {
  id: string;
  feedback: Feedback;
};
export type ParseApiResponse = /** status 200  */ Formula;
export type ParseApiArg = {
  parseParams: ParseParams;
};
export type AllRulesApiResponse = /** status 200  */ DerivationRule[];
export type AllRulesApiArg = void;
export type GetTippApiResponse = /** status 200  */ Tipp[];
export type GetTippApiArg = {
  statement: Statement;
};
export type Rules =
  | "Ax"
  | "ImplIntro"
  | "ImplElim"
  | "FalseElim"
  | "NotIntro"
  | "NotElim"
  | "AndIntro"
  | "AndElimL"
  | "AndElimR"
  | "OrIntroL"
  | "OrIntroR"
  | "OrElim"
  | "ForallElim"
  | "ForallIntro"
  | "ExistsElim"
  | "ExistsIntro"
  | "AlphaExists"
  | "AlphaForall";
export type Identifier =
  | {
      type: "Literal";
      value: string;
    }
  | {
      type: "Element";
      value: string;
    };
export type Formula =
  | {
      body: {
        lhs: Formula;
        rhs: Formula;
      };
      type: "And";
    }
  | {
      body: {
        lhs: Formula;
        rhs: Formula;
      };
      type: "Or";
    }
  | {
      body: Formula;
      type: "Not";
    }
  | {
      body: Identifier;
      type: "Ident";
    }
  | {
      body: {
        lhs: Formula;
        rhs: Formula;
      };
      type: "Imp";
    }
  | {
      type: "True";
    }
  | {
      type: "False";
    }
  | {
      body: {
        formula: Formula;
        identifier: Identifier;
      };
      type: "Forall";
    }
  | {
      body: {
        formula: Formula;
        identifier: Identifier;
      };
      type: "Exists";
    }
  | {
      body: {
        identifier: Identifier;
        identifiers: Identifier[];
      };
      type: "Predicate";
    };
export type Statement = {
  formula: Formula;
  lhs: Formula[];
};
export type Node = {
  name: string;
  premisses: string[];
  rule: Rules;
  statement: Statement;
};
export type CreateTreeRequest = {
  nodes: Node[];
  root_id: string;
};
export type FormulaMapping = {
  from: number;
  to: Formula;
};
export type ElementMapping = {
  from: string;
  to: string;
};
export type ApplyRuleParams = {
  mapping: FormulaMapping[];
  rule: Rules;
  statement: Statement;
  substitution: ElementMapping[];
};
export type Exercise = {
  difficulty: number;
  dislikes: number;
  exercise: Statement;
  hint: boolean;
  id: string;
  likes: number;
};
export type CreateExerciseRequest = {
  lhs: Formula[];
  rhs: Formula;
};
export type Feedback = {
  difficulty?: number | null;
  like: boolean;
};
export type ParseParams = {
  formula: string;
};
export type RuleIdentifier =
  | {
      type: "Formula";
      value: number;
    }
  | {
      type: "Element";
      value: string;
    };
export type RuleFormula =
  | {
      body: RuleIdentifier;
      type: "Ident";
    }
  | {
      body: {
        lhs: RuleIdentifier;
        rhs: RuleIdentifier;
      };
      type: "And";
    }
  | {
      body: {
        lhs: RuleIdentifier;
        rhs: RuleIdentifier;
      };
      type: "Or";
    }
  | {
      body: RuleIdentifier;
      type: "Not";
    }
  | {
      body: {
        lhs: RuleIdentifier;
        rhs: RuleIdentifier;
      };
      type: "Imp";
    }
  | {
      type: "False";
    }
  | {
      type: "True";
    }
  | {
      body: {
        formula: RuleFormula;
        identifier: RuleIdentifier;
      };
      type: "Forall";
    }
  | {
      body: {
        formula: RuleFormula;
        identifier: RuleIdentifier;
      };
      type: "Exists";
    }
  | {
      body: {
        identifier: RuleIdentifier;
        lhs: RuleIdentifier;
        rhs: RuleIdentifier;
      };
      type: "Substitution";
    };
export type RuleStatement = {
  formula: RuleFormula;
  lhs?: null | RuleIdentifier;
};
export type DerivationRule = {
  conclusion: RuleStatement;
  name: Rules;
  premises: RuleStatement[];
};
export type Tipp = {
  premisses: Statement[];
  rule: Rules;
};
export const {
  useAddTreeMutation,
  useApplyRuleMutation,
  useCheckMutation,
  useGetExercisesQuery,
  useCreateExerciseMutation,
  useGetExerciseQuery,
  usePostFeedbackMutation,
  useParseMutation,
  useAllRulesQuery,
  useGetTippMutation,
} = injectedRtkApi;
