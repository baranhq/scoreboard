"use client";
import {Button} from '../ui/ui';
export function PrivacyButton({label}:{label:string}){return <Button className="mt-4" onClick={()=>window.dispatchEvent(new Event('privacy-open'))}>{label}</Button>;}
