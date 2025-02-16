import { prototype as api } from "./prototype";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
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
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
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
export type ParseApiResponse = /** status 200  */ Formula;
export type ParseApiArg = {
  parseParams: ParseParams;
};
export type AllRulesApiResponse = /** status 200  */ DerivationRule[];
export type AllRulesApiArg = void;
export type Identifier =
  | {
      Literal: string;
    }
  | {
      Element: string;
    };
export type Formula =
  | {
      And: Formula[];
    }
  | {
      Or: Formula[];
    }
  | {
      Not: Formula;
    }
  | {
      Ident: Identifier;
    }
  | {
      Imp: Formula[];
    }
  | "True"
  | "False"
  | {
      Forall: object[];
    }
  | {
      Exists: object[];
    }
  | {
      Predicate: object[];
    };
export type Statement = {
  formula: Formula;
  lhs: Formula[];
};
export type FormulaMapping = {
  from: number;
  to: Formula;
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
  dislikes: number;
  exercise: Statement;
  id: string;
  likes: number;
};
export type CreateExerciseRequest = {
  lhs: Formula[];
  rhs: Formula;
};
export type ParseParams = {
  formula: string;
};
export type RuleIdentifier =
  | {
      Formula: number;
    }
  | {
      Element: string;
    };
export type RuleFormula =
  | {
      Ident: RuleIdentifier;
    }
  | {
      And: RuleIdentifier[];
    }
  | {
      Or: RuleIdentifier[];
    }
  | {
      Not: RuleIdentifier;
    }
  | {
      Imp: RuleIdentifier[];
    }
  | "False"
  | "True"
  | {
      Forall: object[];
    }
  | {
      Exists: object[];
    }
  | {
      Substitution: RuleIdentifier[];
    };
export type RuleStatement = {
  formula: RuleFormula;
  lhs?: RuleIdentifier | null;
};
export type DerivationRule = {
  conclusion: RuleStatement;
  name: Rules;
  premises: RuleStatement[];
};
export const {
  useApplyRuleMutation,
  useCheckMutation,
  useGetExercisesQuery,
  useCreateExerciseMutation,
  useGetExerciseQuery,
  useParseMutation,
  useAllRulesQuery,
} = injectedRtkApi;
