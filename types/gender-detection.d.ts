declare module 'gender-detection' {
  const genderDetection: {
    detect(name: string): 'male' | 'female' | 'unknown'
  }
  export default genderDetection
}
