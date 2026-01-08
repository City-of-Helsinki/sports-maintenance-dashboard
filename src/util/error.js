
export function CredentialError(message) {
  this.name = 'CredentialError';
  this.message = message;
  this.stack = (new Error(message)).stack;
}

CredentialError.prototype = new Error('CredentialError');
