
export function CredentialError(message: string) {
  this.name = 'CredentialError';
  this.message = message;
  this.stack = (new Error(message)).stack;
}

CredentialError.prototype = new Error('CredentialError');
