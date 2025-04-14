declare module '*.mp3' {
  const content: string;
  export default content;
}

declare module 'data:audio/*' {
  const content: string;
  export default content;
} 