import {isAdmin} from '@/src/server/auth';
export async function getOwner(){return await isAdmin()?{userId:'museum-owner',email:'admin@local.invalid',displayName:'馆主',fullName:null}:null;}
