import "server-only";
import { putDoc, listDocs, getDoc, deleteDoc } from "./store";
import { hashPassword } from "./password";

/**
 * Hub users — the email-keyed identity foundation. Today: operators (Shana,
 * Collie). Extensible to external owners (role "owner") and multi-tenant
 * (tenant) WITHOUT changing the shape. Passwords are PBKDF2-hashed (see
 * ./password); lookups happen only at login (a Node route), never in the
 * edge proxy.
 */
export type Role = "operator" | "owner";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  tenant?: string;
  createdAt: string;
};

const COL = "users";

export async function listUsers(): Promise<User[]> {
  return listDocs<User>(COL);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const e = email.trim().toLowerCase();
  return (await listDocs<User>(COL)).find((u) => u.email === e) ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  role: Role;
  password: string;
  tenant?: string;
}): Promise<User> {
  const u: User = {
    id: `u_${Math.random().toString(36).slice(2, 10)}`,
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role: input.role,
    passwordHash: await hashPassword(input.password),
    tenant: input.tenant,
    createdAt: new Date().toISOString(),
  };
  await putDoc(COL, u.id, u);
  return u;
}

export async function setUserPassword(id: string, password: string): Promise<void> {
  const u = await getDoc<User>(COL, id);
  if (!u) return;
  u.passwordHash = await hashPassword(password);
  await putDoc(COL, id, u);
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(COL, id);
}
