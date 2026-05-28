import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import genderDetection from 'gender-detection'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function detectFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName.trim()
}

export function detectGender(fullName: string): 'male' | 'female' {
  const first = detectFirstName(fullName)
  return genderDetection.detect(first) === 'female' ? 'female' : 'male'
}

export function germanGreeting(name: string, gender: 'male' | 'female'): string {
  return gender === 'female' ? `Liebe ${name}` : `Lieber ${name}`
}
