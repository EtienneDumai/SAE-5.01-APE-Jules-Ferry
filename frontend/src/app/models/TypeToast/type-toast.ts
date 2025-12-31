import { TypeErreurToast } from "../../enums/TypeErreurToast/type-erreur-toast";

export interface TypeToast {
    message: string;
    type : TypeErreurToast;
}
