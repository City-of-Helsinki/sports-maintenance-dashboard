
export function CredentialError(message) {
    this.name = 'CredentialError';
    this.message = message;
    this.stack = (new Error()).stack;
}

CredentialError.prototype = new Error;
