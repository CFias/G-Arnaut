// Lista central de UIDs com acesso administrativo.
//
// ⚠️ IMPORTANTE: isso protege apenas a INTERFACE (esconde links/telas
// para quem não está na lista). Não é segurança de dado de verdade —
// qualquer pessoa pode ler o bundle JS e ver esses UIDs. A proteção
// real dos dados tem que estar nas regras de segurança do Firestore
// (Firebase Console > Firestore > Regras), exigindo que escritas em
// "products" só sejam aceitas se request.auth.uid estiver numa lista
// equivalente guardada no servidor (ou, melhor ainda, usando Custom
// Claims do Firebase Auth). Trate isto aqui como conveniência de UI,
// não como o cadeado de verdade.
export const ADMIN_UIDS = [
  "SCQFrh1l7iVOKNbsInx0JGgT9ww1",
  "KduymIJGpXciGs7UlcN3uylAXBZ2",
];

export const isAdminUser = (currentUser) =>
  Boolean(currentUser && ADMIN_UIDS.includes(currentUser.uid));
