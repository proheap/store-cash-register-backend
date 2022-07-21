import * as bcrypt from 'bcryptjs';

export function hashData(data: string) {
  return bcrypt.hash(data, 10);
}

export function hashCompare(hash: string, data: string) {
  return bcrypt.compare(hash, data);
}
