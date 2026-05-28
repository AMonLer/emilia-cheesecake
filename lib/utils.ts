import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import genderDetection from 'gender-detection'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function germanGreeting(fullName: string): string {
  const firstName = fullName.trim().split(' ')[0]
  const gender = genderDetection.detect(firstName)
  return gender === 'female' ? `Liebe ${firstName}` : `Lieber ${firstName}`
}
